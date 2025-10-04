# Implement Chat Memory with Spring Data JPA + Liquibase (Maven) — Instruction for Agent Codex

> **Goal**: Replace Spring AI’s default JDBC memory with a **JPA-backed** service layer, managed schema via **Liquibase**.
> **Stack**: Spring Boot, Spring AI, Spring Data JPA, Liquibase, PostgreSQL
> **Tables**: `chat_conversation`, `chat_message`
> **Ownership**: each `chat_conversation` belongs to one `userId`; `chat_message` references a conversation.
> **Deliverables**: `pom.xml` deps, Liquibase changelogs, Entities, Repos, Service (`ChatMemory` impl), Config, Controller sample.

---

## 0) Maven dependencies (`pom.xml`)

Add these (use latest stable compatible versions):

```xml
<dependencies>
  <!-- Spring Boot -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>

  <!-- JPA -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>

  <!-- Spring AI (choose your model starter; example: OpenAI) -->
  <dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-core</artifactId>
  </dependency>

  <!-- Liquibase -->
  <dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
  </dependency>

  <!-- PostgreSQL driver -->
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>

  <!-- Validation (optional but recommended) -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>

  <!-- Test (optional) -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>

<build>
  <plugins>
    <!-- Spring Boot plugin -->
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

> **Do NOT** add `spring-ai-starter-model-chat-memory-repository-jdbc` (we use our own JPA repository).

---

## 1) Configuration (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ai_chat
    username: ai
    password: ai

  jpa:
    hibernate:
      ddl-auto: validate         # use validate (Liquibase manages schema)
    properties:
      hibernate.format_sql: true
      hibernate.jdbc.lob.non_contextual_creation: true
      # optional: naming strategy to map camelCase -> snake_case
      hibernate.physical_naming_strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl

  liquibase:
    enabled: true
    change-log: classpath:/db/changelog/db.changelog-master.yaml

# Disable any Spring AI JDBC schema auto init (safety)
spring:
  ai:
    chat:
      memory:
        repository:
          jdbc:
            initialize-schema: never
```

> If you prefer automatic `snake_case`, use Spring Boot’s `SpringPhysicalNamingStrategy` instead of `StandardImpl`.

---

## 2) Liquibase changelogs

**Files**:

* `src/main/resources/db/changelog/db.changelog-master.yaml`
* `src/main/resources/db/changelog/001-create-chat-tables.yaml`

### 2.1 Master

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/001-create-chat-tables.yaml
```

### 2.2 Create tables (`001-create-chat-tables.yaml`)

```yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-chat-tables
      author: codex
      changes:
        - createTable:
            tableName: chat_conversation
            columns:
              - column:
                  name: id
                  type: UUID
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: user_id
                  type: VARCHAR(128)
                  constraints:
                    nullable: false
              - column:
                  name: title
                  type: VARCHAR(255)
              - column:
                  name: created_at
                  type: TIMESTAMP
                  defaultValueComputed: NOW()
                  constraints:
                    nullable: false

        - createIndex:
            tableName: chat_conversation
            indexName: ix_chat_conversation_user_id
            columns:
              - column:
                  name: user_id

        - createTable:
            tableName: chat_message
            columns:
              - column:
                  name: id
                  type: BIGSERIAL
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: conversation_id
                  type: UUID
                  constraints:
                    nullable: false
              - column:
                  name: role
                  type: VARCHAR(16)
                  constraints:
                    nullable: false
              - column:
                  name: content
                  type: TEXT
                  constraints:
                    nullable: false
              - column:
                  name: ts
                  type: TIMESTAMP
                  defaultValueComputed: NOW()
                  constraints:
                    nullable: false

        - addForeignKeyConstraint:
            baseTableName: chat_message
            baseColumnNames: conversation_id
            referencedTableName: chat_conversation
            referencedColumnNames: id
            onDelete: CASCADE
            constraintName: fk_chat_message_conversation

        - createIndex:
            tableName: chat_message
            indexName: ix_chat_message_conv_ts
            columns:
              - column:
                  name: conversation_id
              - column:
                  name: ts

      rollback:
        - dropTable:
            tableName: chat_message
            cascadeConstraints: true
        - dropTable:
            tableName: chat_conversation
            cascadeConstraints: true
```

> We generate `UUID` in the application (Java) for `chat_conversation.id`—no DB extension required.

---

## 3) Entities

### 3.1 `ChatConversation.java`

```java
package com.example.chatmemory.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_conversation")
public class ChatConversation {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "title")
    private String title;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public ChatConversation() {}

    public ChatConversation(UUID id, String userId, String title) {
        this.id = id;
        this.userId = userId;
        this.title = title;
    }

    // getters and setters...
}
```

### 3.2 `ChatMessage.java`

```java
package com.example.chatmemory.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_message")
public class ChatMessage {

    public enum Role { USER, ASSISTANT, SYSTEM, TOOL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 16)
    private Role role;

    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "ts", nullable = false)
    private Instant timestamp = Instant.now();

    public ChatMessage() {}

    public ChatMessage(UUID conversationId, Role role, String content, Instant timestamp) {
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.timestamp = (timestamp == null) ? Instant.now() : timestamp;
    }

    // getters and setters...
}
```

---

## 4) Repositories

```java
package com.example.chatmemory.repo;

import com.example.chatmemory.domain.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {
    List<ChatConversation> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<ChatConversation> findByIdAndUserId(UUID id, String userId);
}
```

```java
package com.example.chatmemory.repo;

import com.example.chatmemory.domain.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByTimestampAsc(UUID conversationId);
    List<ChatMessage> findByConversationIdOrderByTimestampDesc(UUID conversationId, Pageable pageable);
    long deleteByConversationId(UUID conversationId);
}
```
---

## 5) Service — JPA-backed `ChatMemory` impl

```java
package com.example.chatmemory.service;

import com.example.chatmemory.domain.ChatMessage;
import com.example.chatmemory.domain.ChatMessage.Role;
import com.example.chatmemory.repo.ChatMessageRepository;
import org.springframework.ai.chat.messages.*;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JpaChatMemory implements ChatMemory {

    private final ChatMessageRepository messageRepo;

    public JpaChatMemory(ChatMessageRepository messageRepo) {
        this.messageRepo = messageRepo;
    }

    @Override
    @Transactional
    public void add(String conversationId, List<Message> messages) {
        UUID cid = UUID.fromString(conversationId);
        List<ChatMessage> batch = messages.stream()
                .map(m -> new ChatMessage(cid, mapRole(m), m.getContent(), Instant.now()))
                .collect(Collectors.toList());
        messageRepo.saveAll(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> get(String conversationId, int lastN) {
        UUID cid = UUID.fromString(conversationId);
        if (lastN > 0) {
            var latestDesc = messageRepo.findByConversationIdOrderByTimestampDesc(
                    cid, PageRequest.of(0, lastN));
            Collections.reverse(latestDesc); // chronological
            return latestDesc.stream().map(this::toSpringAi).toList();
        } else {
            return messageRepo.findByConversationIdOrderByTimestampAsc(cid)
                    .stream().map(this::toSpringAi).toList();
        }
    }

    @Override
    @Transactional
    public void clear(String conversationId) {
        messageRepo.deleteByConversationId(UUID.fromString(conversationId));
    }

    private Role mapRole(Message m) {
        if (m instanceof UserMessage) return Role.USER;
        if (m instanceof AssistantMessage) return Role.ASSISTANT;
        if (m instanceof SystemMessage) return Role.SYSTEM;
        if (m instanceof ToolMessage) return Role.TOOL;
        return Role.USER;
    }

    private Message toSpringAi(ChatMessage em) {
        return switch (em.getRole()) {
            case USER -> new UserMessage(em.getContent());
            case ASSISTANT -> new AssistantMessage(em.getContent());
            case SYSTEM -> new SystemMessage(em.getContent());
            case TOOL -> new ToolMessage(em.getContent());
        };
    }
}
```

---

## 6) Conversation management service

```java
package com.example.chatmemory.service;

import com.example.chatmemory.domain.ChatConversation;
import com.example.chatmemory.repo.ChatConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ConversationService {

    private final ChatConversationRepository conversationRepo;

    public ConversationService(ChatConversationRepository conversationRepo) {
        this.conversationRepo = conversationRepo;
    }

    @Transactional
    public UUID createConversation(String userId, String title) {
        UUID id = UUID.randomUUID();
        conversationRepo.save(new ChatConversation(id, userId, title));
        return id;
    }

    @Transactional(readOnly = true)
    public boolean belongsToUser(UUID conversationId, String userId) {
        return conversationRepo.findByIdAndUserId(conversationId, userId).isPresent();
    }
}
```

---

## 7) Wire `ChatClient` + use per-request `conversationId`

```java
package com.example.chatmemory.config;

import com.example.chatmemory.service.JpaChatMemory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel; // or other model
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Bean
    public ChatClient chatClient(OpenAiChatModel model, JpaChatMemory chatMemory) {
        return ChatClient.builder(model)
                .defaultChatMemory(chatMemory)
                .build();
    }
}
```

Sample controller:

```java
package com.example.chatmemory.web;

import com.example.chatmemory.service.ConversationService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private final ChatClient chatClient;
    private final ConversationService convService;

    public ChatController(ChatClient chatClient, ConversationService convService) {
        this.chatClient = chatClient;
        this.convService = convService;
    }

    @PostMapping("/ask")
    public Map<String, Object> ask(
            @RequestParam String userId,
            @RequestParam(required = false) UUID conversationId,
            @RequestBody String userInput) {

        UUID cid = (conversationId == null)
                ? convService.createConversation(userId, "New Chat")
                : conversationId;

        String answer = chatClient.prompt()
                .user(userInput)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, cid.toString()))
                .call()
                .content();

        return Map.of("conversationId", cid, "answer", answer);
    }
}
``

**Security check** (recommended): verify `convService.belongsToUser(cid, userId)` before read/write.
---
## 8) Liquibase tips
* Run automatically at app start (recommended for dev) or via Maven:
  ```bash
  ./mvnw liquibase:update
  ```
* Keep `spring.jpa.hibernate.ddl-auto=validate` to ensure entities match Liquibase schema.
* Add future changes as new changeSets (never edit applied changeSets).
---
## 9) Optional: migrating old `SPRING_AI_CHAT_MEMORY`
If you previously used the default table and want to migrate:
1. Create a `chat_conversation` row for each distinct `conversation_id` you had, attaching a `user_id` you determine.
2. Copy rows into `chat_message`:
   * `type` → `role` (same set: USER/ASSISTANT/SYSTEM/TOOL)
   * `"timestamp"` → `ts`
   * `conversation_id` unchanged
3. Then stop creating/using the old table.
(Implement as ad-hoc SQL or Liquibase changeSet with `sql` blocks.)
---
## 10) Retention & windowing
* Use `lastN` in `JpaChatMemory.get()` for memory window (e.g., `PageRequest.of(0, 50)`).
* Add a scheduled cleanup (e.g., keep last 200 msgs per conversation) if needed.
---
## 11) Indexing & perf

* `(conversation_id, ts)` index already added.
* Add `user_id` index (done) for user dashboards.
* Prefer batch `saveAll()` (already implemented).
---
## 12) Notes
* If you want automatic database UUID generation instead of `UUID.randomUUID()` in Java, create an extension and default:

  * Liquibase changeSet to `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  * Column default: `defaultValueComputed: uuid_generate_v4()`
  * Then adapt entity mapping (`@GeneratedValue` with custom generator) — optional.