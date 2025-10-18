-- liquibase formatted sql

-- changeset PhamDuyHuy:1760458517215-4
ALTER TABLE chat_message DROP CONSTRAINT fk_chat_message_conversation;

-- changeset PhamDuyHuy:1760458517215-3
CREATE INDEX idx_conversation_id ON chat_message (conversation_id);

-- changeset PhamDuyHuy:1760458517215-5
DROP TABLE chat_conversation CASCADE;

-- changeset PhamDuyHuy:1760458517215-1
ALTER TABLE chat_message DROP COLUMN conversation_id;

-- changeset PhamDuyHuy:1760458517215-2
ALTER TABLE chat_message
    ADD conversation_id VARCHAR(255) NOT NULL;

