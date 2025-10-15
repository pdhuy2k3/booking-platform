package com.pdh.ai.agent;

import java.util.List;
import java.util.stream.Collectors;

import com.pdh.ai.util.CurlyBracketEscaper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.pdh.ai.agent.advisor.CustomMessageChatMemoryAdvisor;
import com.pdh.ai.agent.tools.CurrentDateTimeZoneTool;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.ai.mistralai.MistralAiChatOptions;
import org.springframework.ai.mistralai.api.MistralAiApi;
import org.springframework.ai.mistralai.api.MistralAiApi.ChatCompletionRequest.ResponseFormat;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.preretrieval.query.transformation.CompressionQueryTransformer;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.service.JpaChatMemory;
import reactor.core.publisher.Mono;

import static com.pdh.ai.agent.advisor.CustomMessageChatMemoryAdvisor.ADD_USER_MESSAGE;
import static org.springframework.ai.chat.memory.ChatMemory.CONVERSATION_ID;

@Component

public class CoreAgent {

    private static final Logger logger = LoggerFactory.getLogger(CoreAgent.class);
    private static final String ERROR_MESSAGE = "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.";
    private static final String MODIFICATION_NOT_IMPLEMENTED = "Tính năng thay đổi đặt chỗ đang được phát triển. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp.";
    private static final String SYSTEM_PROMPT = """
            You are BookingSmart AI Travel Assistant - a professional, friendly travel booking assistant.
            Your main role is to analyze the user request to understand their needs and return task descriptions that can be processed by specialized workers.
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
    private final JpaChatMemory chatMemory;
    private final MistralAiChatModel mistraModel;
    private final ChatClient chatClient;
    private final ToolCallbackProvider toolCallbackProvider;
    private final VectorStore vectorStore;
    CustomMessageChatMemoryAdvisor memoryAdvisor;
    RetrievalAugmentationAdvisor retrievalAugmentationAdvisor;
    QuestionAnswerAdvisor questionAnswerAdvisor;
    BeanOutputConverter<StructuredChatPayload> outputConverter;

    public CoreAgent(MistralAiChatModel mistralAiChatModel,
                     ToolCallbackProvider toolCallbackProvider,
                     VectorStore vectorStore,
                     JpaChatMemory chatMemory) {
        this.chatMemory = chatMemory;
        this.mistraModel = mistralAiChatModel;
        this.toolCallbackProvider = toolCallbackProvider;
        this.vectorStore = vectorStore;
        // Advisors
        // questionAnswerAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
        //         .build();
        memoryAdvisor = CustomMessageChatMemoryAdvisor.builder(chatMemory)
                .build();
        outputConverter = new BeanOutputConverter<>(StructuredChatPayload.class);


        // retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
        //         .queryTransformers(
        //                 CompressionQueryTransformer.builder()
        //                         .chatClientBuilder(ChatClient.builder(mistraModel))
        //                         .promptTemplate(COMPRESSION_PROMPT_TEMPLATE)
        //                         .build()
        //         )
        //         .documentRetriever(VectorStoreDocumentRetriever.builder()
        //                 .vectorStore(vectorStore)
        //                 .build())
        //         .build();
        this.chatClient = ChatClient.builder(mistraModel)
                .defaultAdvisors(memoryAdvisor)
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultTools(new CurrentDateTimeZoneTool())
                .build();

    }


    public ChatClient.ChatClientRequestSpec input(OrchestratorWorkers.FinalResponse finalResponse, String userRequest) {
        String systemPrompt = """
                This is analyzed user request:
                {analysis}
                The response contains multiple parts, each part is generated to address a specific aspect of the user's request.
                Your task is to combine these parts into a single, coherent response that addresses the user's needs.
                Ensure the final response is well-structured, clear, and provides a comprehensive answer to the user's request.
                If any part of the response is unclear or seems irrelevant, use your best judgment to refine it.
                Provide the final response in a friendly and professional tone, suitable for a travel booking assistant.
                Here are responses from workers:
                {workerResponses}
                """;

        Prompt prompt=Prompt.builder()

        .chatOptions(MistralAiChatOptions
                .builder()
                .responseFormat(
                        new ResponseFormat("json_object",outputConverter.getJsonSchemaMap()))
                .build())
        .build();
        prompt.augmentSystemMessage(systemPrompt).augmentUserMessage(userRequest);
        return chatClient.prompt(prompt)
                .system(s -> s
                        .param("analysis", finalResponse.analysis())
                        .param("workerResponses",
                                finalResponse.workerResponses().stream().collect(Collectors.joining("\n")))
                );
    }

    public Flux<String> stream(OrchestratorWorkers.FinalResponse finalResponse, String userRequest) {
        return input(finalResponse, userRequest)
                .stream().content();
    }


    public Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId) {
        OrchestratorWorkers workers = new OrchestratorWorkers(chatClient);
        OrchestratorWorkers.FinalResponse finalAnalysis = workers.process(message,conversationId);

        Flux<String> contentStream = stream(finalAnalysis, message);

        return contentStream.scan("", (accumulator, newChunk) -> accumulator + newChunk)
                .flatMap(accumulatedText -> {
                    try {
                        StructuredChatPayload fullPayload = outputConverter.convert(accumulatedText);
                        return Mono.just(fullPayload);
                    } catch (Exception e) {

                        String messageSoFar = extractMessageFromPartialJson(accumulatedText);
                        return Mono.just(StructuredChatPayload.builder()
                                .message(messageSoFar)
                                .results(List.of())
                                .nextRequestSuggestions(new String[0])
                                .build());
                    }
                })
                // Ensure we don't send duplicate payloads if only whitespace is added.
                .distinctUntilChanged();
    }

    /**
     * A helper method to perform a best-effort extraction of the 'message' field
     * from a potentially incomplete JSON string.
     * @param partialJson The partial JSON string.
     * @return The extracted message content, or an empty string if extraction fails.
     */
    private String extractMessageFromPartialJson(String partialJson) {
        try {
            final String messageKey = "\"message\":\"";
            int start = partialJson.indexOf(messageKey);
            if (start != -1) {
                start += messageKey.length();
                int end = partialJson.indexOf("\"", start);
                if (end != -1) {
                    // Found a closing quote for the message
                    return partialJson.substring(start, end);
                } else {
                    // No closing quote yet, just return the rest of the string
                    return partialJson.substring(start);
                }
            }
        } catch (Exception e) {
            // Fallback on any error
        }
        return "";
    }

}