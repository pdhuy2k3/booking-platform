package com.pdh.ai.agent.workflow;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

/**
 * Implements the routing workflow pattern that classifies input and directs it to
 * specialized follow-up processes. Classification can be re-used independently of
 * executing the downstream prompts.
 */
public class RoutingWorkflow {

	private final ChatClient chatClient;

	public RoutingWorkflow(ChatClient chatClient) {
		this.chatClient = chatClient;
	}

	public static record RoutingResponse(String reasoning, String selection) {}

	public String classify(String input, Map<String, String> routeDescriptions, String conversationId) {
		Assert.hasText(input, "Input text cannot be empty");
		Assert.notEmpty(routeDescriptions, "Route descriptions cannot be empty");

		String options = routeDescriptions.entrySet().stream()
				.map(entry -> String.format("- %s: %s", entry.getKey(), entry.getValue()))
				.collect(Collectors.joining("\n"));

		String selectorPrompt = """
			Analyze the user input and select the most appropriate workflow option.
			Options (key: description):
			%s

			Return your reasoning and the selected option key in this JSON format:
			``` json
			{
			  "reasoning": "Why this option best addresses the request",
			  "selection": "The exact option key"
			}
            ```
			Input: %s
			""".formatted(options, input);

		RoutingResponse routingResponse = this.chatClient.prompt()
				.user(u -> u.text(selectorPrompt))
				.advisors(advisor -> {
					if (StringUtils.hasText(conversationId)) {
						advisor.param(ChatMemory.CONVERSATION_ID, conversationId);
					}
				})
				.call()
				.entity(RoutingResponse.class);

		System.out.println(String.format("Routing analysis: %s\nSelected route: %s",
				routingResponse.reasoning(), routingResponse.selection()));

		return routingResponse.selection();
	}

	public String classify(String input, Map<String, String> routeDescriptions) {
		return classify(input, routeDescriptions, null);
	}

	public String route(String input, Map<String, String> routes, String conversationId) {
		Assert.notNull(routes, "Routes map cannot be null");
		String routeKey = classify(input, routes, conversationId);
		String selectedPrompt = routes.get(routeKey);
		if (!StringUtils.hasText(selectedPrompt)) {
			throw new IllegalArgumentException("Selected route '" + routeKey + "' not found in routes map");
		}

		return this.chatClient.prompt()
				.user(selectedPrompt + "\nInput: " + input)
				.call()
				.content();
	}

	public String route(String input, Map<String, String> routes) {
		return route(input, routes, null);
	}
}
