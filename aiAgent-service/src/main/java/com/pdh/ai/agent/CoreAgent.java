package com.pdh.ai.agent;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.pdh.ai.agent.advisor.CustomMessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.preretrieval.query.transformation.CompressionQueryTransformer;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.service.JpaChatMemory;

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
    public CoreAgent(MistralAiChatModel mistralAiChatModel,
            ToolCallbackProvider toolCallbackProvider,
            VectorStore vectorStore,
            JpaChatMemory chatMemory) {
        this.chatMemory = chatMemory;
        this.mistraModel = mistralAiChatModel;
        this.toolCallbackProvider = toolCallbackProvider;
        this.vectorStore = vectorStore;
        // Advisors
        questionAnswerAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
                .build();
        memoryAdvisor = CustomMessageChatMemoryAdvisor.builder(chatMemory)
                .build();


        retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
                .queryTransformers(
                        CompressionQueryTransformer.builder()
                                .chatClientBuilder(ChatClient.builder(mistraModel))
                                .promptTemplate(COMPRESSION_PROMPT_TEMPLATE)
                                .build()
                )
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .vectorStore(vectorStore)
                        .build())
                .build();
        this.chatClient = ChatClient.builder(mistraModel)
                .defaultAdvisors(memoryAdvisor,memoryAdvisor,retrievalAugmentationAdvisor)
                .defaultToolCallbacks(toolCallbackProvider)
                .build();

    }


    public ChatClient.ChatClientRequestSpec input(String userInput, String conversationId) {
        return chatClient.prompt()
                .advisors(spec -> spec.param(CONVERSATION_ID, conversationId))
                .user(userInput);
    }
    public Flux<String> stream(String userInput, String conversationId) {
        return input(userInput, conversationId)
                .stream().content();
    }
    
    /**
     * Process a message with structured output in a streaming way.
     * This method returns a single StructuredChatPayload when the full response is available,
     * but it can be modified later to return partial responses as they arrive.
     */
    public Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId) {


        OrchestratorWorkers workers = new OrchestratorWorkers(chatClient);
        workers.process()
        Flux<String> chatResponse = stream(message, conversationId);
        String generationTextFromStream = chatResponse.collectList()
                .block()
                .stream()
                .collect(Collectors.joining());

    }


    

}