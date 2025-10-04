# RAG Enablement Plan for aiAgent-service

This document captures the staged approach for adding Retrieval Augmented Generation (RAG) to the AI Agent. It is based on the Spring AI samples located in `llm-apps-java-spring-ai`, primarily the `rag/rag-sequential/rag-advanced` module and the vector-store + ingestion utilities.

## Objectives
- Enrich travel itineraries and booking answers with curated domain knowledge (policies, destinations, partner catalogues).
- Keep the architecture aligned with Spring AI advisors so memory, tool calling, and RAG can compose cleanly.
- Ensure data governance: content provenance, refresh tooling, and tenant isolation.

## High Level Architecture
1. **Document hub** – curated markdown/HTML/CSV sources stored in S3/postgres bucket.
2. **Ingestion pipeline** – Spring Batch or Boot command that mirrors `IngestionPipeline` from the samples to chunk, embed, and upsert into the chosen vector store (likely PGVector already available in the stack).
3. **Vector Store** – PGVector schema managed by Liquibase; align embeddings with the production model (OpenAI text-embedding or local Ollama fallback).
4. **RAG Advisor** – Compose `RetrievalAugmentationAdvisor` with existing `MessageChatMemoryAdvisor` and MCP/tool callbacks. See `RagControllerMemory` for reference.
5. **Guardrails** – Use metadata filters (tenant, locale, product) and optional scoring thresholds before injecting passages.
6. **Observability** – Capture retrieved chunks, similarity scores, and model latency via Micrometer.

## Implementation Steps
1. **Set up schema & config**
   - Add Liquibase change set for `vector_store` tables mirroring Spring AI's expected schema.
   - Extend `application.yml` with vector store properties (datasource, `spring.ai.vectorstore.pgvector`).

2. **Build ingestion service**
   - Re-use `MarkdownDocumentReader` and `TokenTextSplitter` patterns from the samples.
   - Provide CLI or scheduled job to re-index partner content; emit metrics and logs for chunk counts.

3. **Embed model selection**
   - Start with OpenAI `text-embedding-3-large`; supply environment toggle for local Ollama (mistral) for dev parity.
   - Cache embedding responses to avoid duplicate costs (hash content).

4. **Advisor wiring**
   - Create `RagAdvisorFactory` that builds a `RetrievalAugmentationAdvisor` per request, filtering on tenant + product tags.
   - Update `LLMAiService` to optionally enable RAG via feature flag (e.g. request param or conversation preference) before invoking the chat client.

5. **Response shaping**
   - Append retrieved citations to the assistant reply (`source`, `title`, `url`); use Spring AI structured output if the client needs JSON bundling.
   - Consider summarising multiple chunks with the compression utilities from the sample (`CompressionDocumentPostProcessor`).

6. **Testing**
   - Unit tests for ingestion transformers and repository queries.
   - Contract / integration tests mocking the vector store to validate advisor composition alongside memory + MCP tools.

## Open Questions / Follow-ups
- **Data catalogue**: Identify actual document sources (booking policies, destination guides) and ownership for updates.
- **PGVector ops**: Confirm existing Postgres cluster sizing and whether embeddings live in dedicated schema.
- **Latency budget**: Target end-to-end SLA (< 2s) and whether caching retrieved answers is required.
- **Search diversification**: Evaluate adding web/MCP retrieval (e.g., Brave MCP) as a fallback when vector hits are low.
- **Access control**: Ensure vector metadata contains `tenantId` to prevent cross-tenant leakage.

## References
- `llm-apps-java-spring-ai/rag/rag-sequential/rag-advanced`
- `llm-apps-java-spring-ai/patterns/memory/memory-basics`
- Spring AI Reference Docs — Vector Stores & RAG Advisors
