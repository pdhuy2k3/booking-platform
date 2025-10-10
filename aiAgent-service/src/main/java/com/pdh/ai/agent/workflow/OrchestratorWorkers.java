package com.pdh.ai.agent.workflow;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.StructuredResultItem;

/**
 * Implements the orchestrator-workers workflow pattern where the primary LLM breaks
 * down a task into subtasks and delegates them to specialized worker prompts. The
 * worker executions are parallelized via {@link ParallelizationlWorkflow} to reduce
 * latency while maintaining ordered aggregation of results.
 */
public class OrchestratorWorkers {

	private final ChatClient chatClient;
	private final String orchestratorPrompt;
	private final String workerPrompt;
	private final ParallelizationlWorkflow parallelWorkflow;
	private final String workerSchemaInstruction;

	public static final String DEFAULT_ORCHESTRATOR_PROMPT = """
			Analyze this task and break it down into 2-3 specialized subtasks.

			Task: {task}

			Return your response in this JSON format:
			\\{
			"analysis": "Explain your understanding of the task and why these subtasks are required.",
			"tasks": [
				\\{
				"type": "formal",
				"description": "Write a precise, technical version that emphasizes specifications"
				\\},
				\\{
				"type": "conversational",
				"description": "Write an engaging, friendly version that connects with readers"
				\\}
			]
			\\}
			""";

	public static final String DEFAULT_WORKER_PROMPT = """
			You are a specialized assistant focusing on a single aspect of the broader task.

			Original task: {original_task}
			Subtask objective: {task_description}
			Preferred tone: {task_type}

			Respond ONLY with a JSON object that matches this schema:
			{schema}

			Requirements:
			- Always set `type`, `title`, and `subtitle`.
			- Provide a concise paragraph in `description` tailored to your subtask.
			- Populate `metadata` with any supporting key details and include:
			  * "worker_type": "{task_type}"
			  * "workflow": "orchestrator_parallel"
			- Leave `imageUrl` empty if none is available.
			- Do not include any text outside of the JSON object.
			""";

	/**
	 * Represents a subtask identified by the orchestrator that needs to be executed
	 * by a worker.
	 */
	public static record Task(String type, String description) {}

	/**
	 * Response from the orchestrator containing the overall analysis and the subtasks
	 * that should be executed by workers.
	 */
	public static record OrchestratorResponse(String analysis, List<Task> tasks) {}

	public OrchestratorWorkers(ChatClient chatClient) {
		this(chatClient, DEFAULT_ORCHESTRATOR_PROMPT, DEFAULT_WORKER_PROMPT);
	}

	public OrchestratorWorkers(ChatClient chatClient, String orchestratorPrompt, String workerPrompt) {
		Assert.notNull(chatClient, "ChatClient must not be null");
		Assert.hasText(orchestratorPrompt, "Orchestrator prompt must not be empty");
		Assert.hasText(workerPrompt, "Worker prompt must not be empty");

		this.chatClient = chatClient;
		this.orchestratorPrompt = orchestratorPrompt;
		this.workerPrompt = workerPrompt;
		this.parallelWorkflow = new ParallelizationlWorkflow(chatClient);
		this.workerSchemaInstruction = new BeanOutputConverter<>(StructuredResultItem.class).getFormat();
	}

	public StructuredChatPayload process(String taskDescription, String conversationId) {
		Assert.hasText(taskDescription, "Task description must not be empty");

		OrchestratorResponse orchestratorResponse = this.chatClient.prompt()
				.user(u -> u.text(this.orchestratorPrompt).param("task", taskDescription))
				.advisors(advisor -> {
					if (StringUtils.hasText(conversationId)) {
						advisor.param(ChatMemory.CONVERSATION_ID, conversationId);
					}
				})
				.call()
				.entity(OrchestratorResponse.class);

		System.out.println(String.format("\n=== ORCHESTRATOR OUTPUT ===\nANALYSIS: %s\n\nTASKS: %s\n",
				orchestratorResponse.analysis(), orchestratorResponse.tasks()));

		List<Task> tasks = orchestratorResponse.tasks();
		if (tasks == null || tasks.isEmpty()) {
			return buildPayload(orchestratorResponse.analysis(), List.of(), conversationId);
		}

		List<ParallelizationlWorkflow.PromptTask<StructuredResultItem>> workerTasks = tasks.stream()
				.map(task -> renderWorkerPrompt(taskDescription, task))
				.map(prompt -> new ParallelizationlWorkflow.PromptTask<>(prompt,
						response -> response.entity(StructuredResultItem.class)))
				.collect(Collectors.toList());

		int workerCount = Math.min(workerTasks.size(), Math.max(1, Runtime.getRuntime().availableProcessors()));
		List<StructuredResultItem> workerResponses = parallelWorkflow.parallelTasks(workerTasks, workerCount, null)
				.stream()
				.filter(Objects::nonNull)
				.collect(Collectors.toList());

		System.out.println("\n=== WORKER OUTPUT ===\n" + workerResponses);

		return buildPayload(orchestratorResponse.analysis(), workerResponses, conversationId);
	}

	private StructuredChatPayload buildPayload(String analysis, List<StructuredResultItem> workerResponses,
			String conversationId) {
		String resolvedAnalysis = StringUtils.hasText(analysis) ? analysis
				: "Tôi đã xử lý yêu cầu của bạn và chuẩn bị các kết quả phù hợp.";

		List<StructuredResultItem> results;
		if (workerResponses.isEmpty()) {
			Map<String, Object> metadata = new HashMap<>();
			metadata.put("workflow", "orchestrator_parallel");
			if (StringUtils.hasText(conversationId)) {
				metadata.put("conversationId", conversationId);
			}
			results = List.of(StructuredResultItem.builder()
					.type("info")
					.title("Thông tin tóm tắt")
					.subtitle("Không có kết quả chi tiết từ các tác vụ phụ")
					.description(resolvedAnalysis)
					.metadata(metadata)
					.build());
		} else {
			results = workerResponses;
		}

		String[] suggestions = results.stream()
				.limit(3)
				.map(item -> String.format(Locale.ROOT, "Yêu cầu thêm chi tiết về %s", item.getTitle()))
				.filter(StringUtils::hasText)
				.toArray(String[]::new);

		if (suggestions.length == 0) {
			suggestions = new String[] { "Bạn muốn tôi hỗ trợ thêm điều gì?" };
		}

		return StructuredChatPayload.builder()
				.message(resolvedAnalysis)
				.nextRequestSuggesstions(suggestions)
				.results(results)
				.build();
	}

	private String renderWorkerPrompt(String originalTask, Task task) {
		return this.workerPrompt
				.replace("{original_task}", originalTask)
				.replace("{task_type}", task.type())
				.replace("{task_description}", task.description())
				.replace("{schema}", this.workerSchemaInstruction);
	}
}
