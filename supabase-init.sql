-- Supabase Schema-per-Service Migration Script
-- This script creates separate schemas for each service instead of separate databases
-- to work with Supabase's single database limitation

-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS keycloak_schema;
CREATE SCHEMA IF NOT EXISTS flight_schema;
CREATE SCHEMA IF NOT EXISTS hotel_schema;
CREATE SCHEMA IF NOT EXISTS booking_schema;
CREATE SCHEMA IF NOT EXISTS customer_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS transport_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
CREATE SCHEMA IF NOT EXISTS media_schema;

-- Grant permissions to the service user (replace 'service_user' with your actual service user)
-- You'll need to create service-specific users or use the same user with schema-level permissions

-- For Keycloak
GRANT USAGE ON SCHEMA keycloak_schema TO postgres;
GRANT CREATE ON SCHEMA keycloak_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA keycloak_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA keycloak_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA keycloak_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA keycloak_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Flight Service
GRANT USAGE ON SCHEMA flight_schema TO postgres;
GRANT CREATE ON SCHEMA flight_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA flight_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA flight_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA flight_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA flight_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Hotel Service
GRANT USAGE ON SCHEMA hotel_schema TO postgres;
GRANT CREATE ON SCHEMA hotel_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hotel_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hotel_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA hotel_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA hotel_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Booking Service
GRANT USAGE ON SCHEMA booking_schema TO postgres;
GRANT CREATE ON SCHEMA booking_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA booking_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA booking_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA booking_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA booking_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Customer Service
GRANT USAGE ON SCHEMA customer_schema TO postgres;
GRANT CREATE ON SCHEMA customer_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA customer_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA customer_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA customer_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA customer_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Payment Service
GRANT USAGE ON SCHEMA payment_schema TO postgres;
GRANT CREATE ON SCHEMA payment_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA payment_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA payment_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA payment_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA payment_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Transport Service
GRANT USAGE ON SCHEMA transport_schema TO postgres;
GRANT CREATE ON SCHEMA transport_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA transport_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA transport_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA transport_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA transport_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Notification Service
GRANT USAGE ON SCHEMA notification_schema TO postgres;
GRANT CREATE ON SCHEMA notification_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA notification_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA notification_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA notification_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA notification_schema GRANT ALL ON SEQUENCES TO postgres;

-- For Media Service
GRANT USAGE ON SCHEMA media_schema TO postgres;
GRANT CREATE ON SCHEMA media_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA media_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA media_schema TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA media_schema GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA media_schema GRANT ALL ON SEQUENCES TO postgres;

-- Set search_path for each service (this will be handled in application configurations)
-- Each service will use its own schema as the default search path

-- Create a view to monitor schema usage
CREATE OR REPLACE VIEW public.schema_table_count AS
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname IN (
    'keycloak_schema', 'flight_schema', 'hotel_schema', 'booking_schema',
    'customer_schema', 'payment_schema', 'transport_schema', 
    'notification_schema', 'media_schema'
)
GROUP BY schemaname
ORDER BY schemaname;

-- Create a function to switch between service schemas (useful for administration)
CREATE OR REPLACE FUNCTION switch_to_service_schema(service_name TEXT)
RETURNS TEXT AS $$
DECLARE
    schema_name TEXT;
BEGIN
    schema_name := service_name || '_schema';
    
    -- Validate schema exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = schema_name) THEN
        RAISE EXCEPTION 'Schema % does not exist', schema_name;
    END IF;
    
    -- Set search path
    EXECUTE format('SET search_path TO %I, public', schema_name);
    
    RETURN format('Switched to schema: %s', schema_name);
END;
$$ LANGUAGE plpgsql;

-- Usage example: SELECT switch_to_service_schema('booking');
