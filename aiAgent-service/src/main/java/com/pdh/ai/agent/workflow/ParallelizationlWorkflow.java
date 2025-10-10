package com.pdh.ai.agent.workflow;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

public class ParallelizationlWorkflow {
    private final ChatClient chatClient;

	public ParallelizationlWorkflow(ChatClient chatClient) {
		this.chatClient = chatClient;
	}

	/**
	 * Represents a single prompt execution task and how to map the response into a
	 * domain object.
	 */
	public static record PromptTask<T>(String prompt, Function<ChatClient.CallResponseSpec, T> extractor) {
		public PromptTask {
			Assert.hasText(prompt, "Prompt cannot be empty");
			Assert.notNull(extractor, "Extractor cannot be null");
		}
	}

	/**
	 * Processes multiple prompt tasks concurrently using a fixed thread pool. Maintains
	 * the original order of prompts in the returned responses.
	 *
	 * @param tasks          Prompt tasks containing the full prompt text and a mapper to
	 *                       convert the response into the desired type.
	 * @param nWorkers       Number of worker threads to execute prompts concurrently. Must be > 0.
	 * @param conversationId Optional conversation scope to preserve chat memory context across prompts.
	 * @param <T>            Type of the mapped response.
	 * @return Ordered list of mapped responses corresponding to the supplied tasks.
	 * @throws IllegalArgumentException if tasks is null/empty or nWorkers <= 0
	 * @throws RuntimeException if processing fails for any prompt, the exception includes the failing prompt
	 */
	public <T> List<T> parallelTasks(List<PromptTask<T>> tasks, int nWorkers, String conversationId) {
		Assert.notEmpty(tasks, "Prompt tasks list cannot be empty");
		Assert.isTrue(nWorkers > 0, "Number of workers must be greater than 0");

		ExecutorService executor = Executors.newFixedThreadPool(nWorkers);
		try {
			List<CompletableFuture<T>> futures = tasks.stream()
					.map(task -> CompletableFuture.supplyAsync(() -> {
						try {
							ChatClient.CallResponseSpec responseSpec = chatClient.prompt()
									.user(u -> u.text(task.prompt()))
									.advisors(advisor -> {
										if (StringUtils.hasText(conversationId)) {
											advisor.param(ChatMemory.CONVERSATION_ID, conversationId);
										}
									})
									.call();

							return task.extractor().apply(responseSpec);
						} catch (Exception e) {
							throw new RuntimeException("Failed to process prompt: " + task.prompt(), e);
						}
					}, executor))
					.collect(Collectors.toList());

			CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();

			return futures.stream()
					.map(CompletableFuture::join)
					.collect(Collectors.toList());

		} finally {
			executor.shutdown();
		}
	}

	public <T> List<T> parallelTasks(List<PromptTask<T>> tasks, int nWorkers) {
		return parallelTasks(tasks, nWorkers, null);
	}
	public List<String> parallel(List<String> prompts, int nWorkers, String conversationId) {
		Assert.notEmpty(prompts, "Prompts list cannot be empty");
		List<PromptTask<String>> tasks = prompts.stream()
				.map(prompt -> new PromptTask<>(prompt, ChatClient.CallResponseSpec::content))
				.collect(Collectors.toList());
		return parallelTasks(tasks, nWorkers, conversationId);
	}

	public List<String> parallel(List<String> prompts, int nWorkers) {
		return parallel(prompts, nWorkers, null);
	}
    
}
