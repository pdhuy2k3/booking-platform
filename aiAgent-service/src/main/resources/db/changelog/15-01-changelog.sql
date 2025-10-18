-- liquibase formatted sql

-- changeset PhamDuyHuy:1760536349141-1
ALTER TABLE chat_message
    ADD parent_message_id BIGINT;
ALTER TABLE chat_message
    ADD title VARCHAR(120);

-- changeset PhamDuyHuy:1760536349141-3
CREATE INDEX idx_conversation_id ON chat_message (conversation_id);

-- changeset PhamDuyHuy:1760536349141-4
CREATE INDEX idx_conversation_id_timestamp ON chat_message (conversation_id, ts);

-- changeset PhamDuyHuy:1760536349141-5
ALTER TABLE chat_message
    ADD CONSTRAINT FK_CHAT_MESSAGE_ON_PARENT_MESSAGE FOREIGN KEY (parent_message_id) REFERENCES chat_message (id);

