package com.pdh.ai.agent;

import static com.pdh.ai.agent.advisor.CustomMessageChatMemoryAdvisor.ADD_USER_MESSAGE;
import static org.springframework.ai.chat.memory.ChatMemory.CONVERSATION_ID;
import org.springframework.ai.rag.preretrieval.query.transformation.CompressionQueryTransformer;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.List;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.util.Assert;

import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.StructuredResultItem;

public class OrchestratorWorkers {
        private final ChatClient chatClient;
        private final String orchestratorPrompt;
        private final String workerPrompt;
        private final ChatModel chatModel;
        private final VectorStore vectorStore;
        public static final String DEFAULT_ORCHESTRATOR_PROMPT = """
                        Analyze this task and break it down into 2-3 distinct approaches using the BookingSmart tools and following the critical rules:
                        ## AVAILABLE TOOLS
                        - Use date/time tool for current date/time when user not specify (search for next 30 days if user not specify, make sure get date from current_date_time_zone tool)
                        - Flights: Use `search_flights` tool only
                        - Hotels: Use `search_hotels` tool only
                        - Weather: Use `weather` tool only
                        - Maps/Locations: Use mapbox tools only
                        - Images: Use `brave_image_search` for destination photos
                        - Bookings: Use `create_booking`, `get_booking_status`, `get_user_booking_history`

                        ## CRITICAL RULES
                        **ALWAYS use tools - NEVER generate fake data**
                        **Operations requiring explicit user confirmation:** Creating bookings, Cancelling bookings
                        Task: {task}
                        """;

        public static final String DEFAULT_WORKER_PROMPT = """
                        Generate content based on:
                        Task: {original_task}
                        Style: {task_type}
                        Guidelines: {task_description}

                        """;
        public static final String WORKER_SYSTEM_PRM_STRINGPT = """
                        You are BookingSmart AI Assistant
                        From the task description, identify the key information needed to fulfill the user's request.
                        Use the tools available to gather accurate and up-to-date information.

                        ## Output Format
                        Respond ONLY with JSON below matching the StructuredResultItem schema:
                        {format}

                        """;
        private static final PromptTemplate COMPRESSION_PROMPT_TEMPLATE = new PromptTemplate("""
            Given the following conversation history and a follow-up query, your task is to synthesize
            a concise, standalone query that incorporates the context from the history.
            Ensure the standalone query is clear, specific, and maintains the user's intent.
            Return the standalone query as the response only without any other irrelevant content.
            Conversation history:
            {history}

            Follow-up query:
            {query}

            Standalone query:
            """);
        /**
         * Represents a subtask identified by the orchestrator that needs to be executed
         * by a worker.
         *
         * @param type        The type or category of the task (e.g., "formal",
         *                    "conversational")
         * @param description Detailed description of what the worker should accomplish
         */
        public static record Task(String type, String description) {
        }

        /**
         * Response from the orchestrator containing task analysis and breakdown into
         * subtasks.
         *
         * @param analysis Detailed explanation of the task and how different approaches
         *                 serve its aspects
         * @param tasks    List of subtasks identified by the orchestrator to be
         *                 executed by workers
         */
        public static record OrchestratorResponse(String analysis, List<Task> tasks) {
        }

        /**
         * Final response containing the orchestrator's analysis and combined worker
         * outputs.
         *
         * @param analysis        The orchestrator's understanding and breakdown of the
         *                        original task
         * @param workerResponses List of responses from workers, each handling a
         *                        specific subtask
         */
        public static record FinalResponse(String analysis, List<String> workerResponses) {
        }

        // /**
        //  * Creates a new OrchestratorWorkers with default prompts.
        //  *
        //  * @param chatClient The ChatClient to use for LLM interactions
        //  */
        // public OrchestratorWorkers(ChatClient chatClient) {
        //         this(chatClient, DEFAULT_ORCHESTRATOR_PROMPT, DEFAULT_WORKER_PROMPT);
        // }
        public OrchestratorWorkers(ChatClient chatClient,ChatModel chatModel,VectorStore vectorStore) {
                this(chatClient, DEFAULT_ORCHESTRATOR_PROMPT, DEFAULT_WORKER_PROMPT,chatModel,vectorStore);
        }
        // /**
        //  * Creates a new OrchestratorWorkers with custom prompts.
        //  *
        //  * @param chatClient         The ChatClient to use for LLM interactions
        //  * @param orchestratorPrompt Custom prompt for the orchestrator LLM
        //  * @param workerPrompt       Custom prompt for the worker LLMs
        //  */
        // public OrchestratorWorkers(ChatClient chatClient, String orchestratorPrompt, String workerPrompt) {
        //         Assert.notNull(chatClient, "ChatClient must not be null");
        //         Assert.hasText(orchestratorPrompt, "Orchestrator prompt must not be empty");
        //         Assert.hasText(workerPrompt, "Worker prompt must not be empty");

        //         this.chatClient = chatClient;
        //         this.orchestratorPrompt = orchestratorPrompt;
        //         this.workerPrompt = workerPrompt;
        // }
        public OrchestratorWorkers(ChatClient chatClient, String orchestratorPrompt, String workerPrompt,ChatModel chatModel,VectorStore vectorStore) {
                Assert.notNull(chatClient, "ChatClient must not be null");
                Assert.hasText(orchestratorPrompt, "Orchestrator prompt must not be empty");
                Assert.hasText(workerPrompt, "Worker prompt must not be empty");

                this.chatClient = chatClient;
                this.orchestratorPrompt = orchestratorPrompt;
                this.workerPrompt = workerPrompt;
                this.chatModel = chatModel;
                this.vectorStore = vectorStore;
        }
        /**
         * Processes a task using the orchestrator-workers pattern.
         * First, the orchestrator analyzes the task and breaks it down into subtasks.
         * Then, workers execute each subtask in parallel.
         * Finally, the results are combined into a single response.
         *
         * @param taskDescription Description of the task to be processed
         * @return WorkerResponse containing the orchestrator's analysis and combined
         *         worker outputs
         * @throws IllegalArgumentException if taskDescription is null or empty
         */
        @SuppressWarnings("null")
        public StructuredChatPayload process(String taskDescription, String conversationId) {
                Assert.hasText(taskDescription, "Task description must not be empty");
                BeanOutputConverter<OrchestratorResponse> outputConverter = new BeanOutputConverter<>(
                                OrchestratorResponse.class);
                // Step 1: Get orchestrator response

                BeanOutputConverter<StructuredResultItem> resultItemConverter = new BeanOutputConverter<>(
                                StructuredResultItem.class);

                OrchestratorResponse orchestratorResponse = this.chatClient.prompt()
                                .advisors(spec -> spec.param(CONVERSATION_ID, conversationId)
                                                .param(ADD_USER_MESSAGE, false))
                                .user(u -> u.text(this.orchestratorPrompt)
                                                .param("task", taskDescription))
                                .call()
                                .entity(OrchestratorResponse.class);
                System.out.println(String.format("\n=== ORCHESTRATOR OUTPUT ===\nANALYSIS: %s\n\nTASKS: %s\n",
                                orchestratorResponse.analysis(), orchestratorResponse.tasks()));
                RetrievalAugmentationAdvisor  retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
                        .queryTransformers(
                        CompressionQueryTransformer.builder()
                        .chatClientBuilder(ChatClient.builder(this.chatModel))
                        .promptTemplate(COMPRESSION_PROMPT_TEMPLATE)
                        .build()
                        )
                        .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .vectorStore(vectorStore)
                        .build())
                        .build();
                // Step 2: Process each task
                // for each process need to hold 1second to avoid concurrency limit api
                // use MultiThreading or parallelStream to process each task concurrently
                List<StructuredResultItem> workerResponses = orchestratorResponse.tasks().stream()
                                .map(task -> {

                                        return this.chatClient.prompt()
                                                        .advisors(retrievalAugmentationAdvisor)
                                                        .system(s -> s.text(WORKER_SYSTEM_PRM_STRINGPT)
                                                        .param("format", resultItemConverter.getJsonSchema())
                                                        )
                                                        .user(u -> u.text(this.workerPrompt)
                                                                        .param("original_task", taskDescription)
                                                                        .param("task_type", task.type())
                                                                        .param("task_description", task.description()))
                                                        .call().entity(resultItemConverter);
                                })
                                .toList();
                System.out.println("\n=== WORKER OUTPUT ===\n" + workerResponses);

                return StructuredChatPayload.builder().message(orchestratorResponse.analysis()).results(workerResponses)
                                .build();
        }
}
