--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.5

-- Started on 2025-09-15 23:07:37

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 251 (class 1259 OID 19235)
-- Name: admin_event_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_event_entity (
    id character varying(36) NOT NULL,
    admin_event_time bigint,
    realm_id character varying(255),
    operation_type character varying(255),
    auth_realm_id character varying(255),
    auth_client_id character varying(255),
    auth_user_id character varying(255),
    ip_address character varying(255),
    resource_path character varying(2550),
    representation text,
    error character varying(255),
    resource_type character varying(64),
    details_json text
);


ALTER TABLE public.admin_event_entity OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 19678)
-- Name: associated_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.associated_policy (
    policy_id character varying(36) NOT NULL,
    associated_policy_id character varying(36) NOT NULL
);


ALTER TABLE public.associated_policy OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 19250)
-- Name: authentication_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_execution (
    id character varying(36) NOT NULL,
    alias character varying(255),
    authenticator character varying(36),
    realm_id character varying(36),
    flow_id character varying(36),
    requirement integer,
    priority integer,
    authenticator_flow boolean DEFAULT false NOT NULL,
    auth_flow_id character varying(36),
    auth_config character varying(36)
);


ALTER TABLE public.authentication_execution OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 19245)
-- Name: authentication_flow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_flow (
    id character varying(36) NOT NULL,
    alias character varying(255),
    description character varying(255),
    realm_id character varying(36),
    provider_id character varying(36) DEFAULT 'basic-flow'::character varying NOT NULL,
    top_level boolean DEFAULT false NOT NULL,
    built_in boolean DEFAULT false NOT NULL
);


ALTER TABLE public.authentication_flow OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 19240)
-- Name: authenticator_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authenticator_config (
    id character varying(36) NOT NULL,
    alias character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.authenticator_config OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 19255)
-- Name: authenticator_config_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authenticator_config_entry (
    authenticator_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.authenticator_config_entry OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 19693)
-- Name: broker_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broker_link (
    identity_provider character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL,
    broker_user_id character varying(255),
    broker_username character varying(255),
    token text,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.broker_link OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 18616)
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    full_scope_allowed boolean DEFAULT false NOT NULL,
    client_id character varying(255),
    not_before integer,
    public_client boolean DEFAULT false NOT NULL,
    secret character varying(255),
    base_url character varying(255),
    bearer_only boolean DEFAULT false NOT NULL,
    management_url character varying(255),
    surrogate_auth_required boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    protocol character varying(255),
    node_rereg_timeout integer DEFAULT 0,
    frontchannel_logout boolean DEFAULT false NOT NULL,
    consent_required boolean DEFAULT false NOT NULL,
    name character varying(255),
    service_accounts_enabled boolean DEFAULT false NOT NULL,
    client_authenticator_type character varying(255),
    root_url character varying(255),
    description character varying(255),
    registration_token character varying(255),
    standard_flow_enabled boolean DEFAULT true NOT NULL,
    implicit_flow_enabled boolean DEFAULT false NOT NULL,
    direct_access_grants_enabled boolean DEFAULT false NOT NULL,
    always_display_in_console boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 18974)
-- Name: client_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_attributes (
    client_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.client_attributes OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 19942)
-- Name: client_auth_flow_bindings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_auth_flow_bindings (
    client_id character varying(36) NOT NULL,
    flow_id character varying(36),
    binding_name character varying(255) NOT NULL
);


ALTER TABLE public.client_auth_flow_bindings OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 19817)
-- Name: client_initial_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_initial_access (
    id character varying(36) NOT NULL,
    realm_id character varying(36) NOT NULL,
    "timestamp" integer,
    expiration integer,
    count integer,
    remaining_count integer
);


ALTER TABLE public.client_initial_access OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 18984)
-- Name: client_node_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_node_registrations (
    client_id character varying(36) NOT NULL,
    value integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_node_registrations OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 19483)
-- Name: client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope (
    id character varying(36) NOT NULL,
    name character varying(255),
    realm_id character varying(36),
    description character varying(255),
    protocol character varying(255)
);


ALTER TABLE public.client_scope OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 19497)
-- Name: client_scope_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_attributes (
    scope_id character varying(36) NOT NULL,
    value character varying(2048),
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_scope_attributes OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 19983)
-- Name: client_scope_client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_client (
    client_id character varying(255) NOT NULL,
    scope_id character varying(255) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client_scope_client OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 19502)
-- Name: client_scope_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_role_mapping (
    scope_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.client_scope_role_mapping OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 19738)
-- Name: component; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_id character varying(36),
    provider_id character varying(36),
    provider_type character varying(255),
    realm_id character varying(36),
    sub_type character varying(255)
);


ALTER TABLE public.component OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 19733)
-- Name: component_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component_config (
    id character varying(36) NOT NULL,
    component_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.component_config OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18635)
-- Name: composite_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.composite_role (
    composite character varying(36) NOT NULL,
    child_role character varying(36) NOT NULL
);


ALTER TABLE public.composite_role OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18638)
-- Name: credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    user_id character varying(36),
    created_date bigint,
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer,
    version integer DEFAULT 0
);


ALTER TABLE public.credential OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 18608)
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 18603)
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 19999)
-- Name: default_client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.default_client_scope (
    realm_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.default_client_scope OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18643)
-- Name: event_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_entity (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    details_json character varying(2550),
    error character varying(255),
    ip_address character varying(255),
    realm_id character varying(255),
    session_id character varying(255),
    event_time bigint,
    type character varying(255),
    user_id character varying(255),
    details_json_long_value text
);


ALTER TABLE public.event_entity OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 19698)
-- Name: fed_user_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_attribute (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    value character varying(2024),
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.fed_user_attribute OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 19703)
-- Name: fed_user_consent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.fed_user_consent OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 20025)
-- Name: fed_user_consent_cl_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_consent_cl_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.fed_user_consent_cl_scope OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 19712)
-- Name: fed_user_credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    created_date bigint,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer
);


ALTER TABLE public.fed_user_credential OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 19721)
-- Name: fed_user_group_membership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_group_membership OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 19724)
-- Name: fed_user_required_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_required_action (
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_required_action OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 19730)
-- Name: fed_user_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_role_mapping (
    role_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_role_mapping OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 19020)
-- Name: federated_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_identity (
    identity_provider character varying(255) NOT NULL,
    realm_id character varying(36),
    federated_user_id character varying(255),
    federated_username character varying(255),
    token text,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_identity OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 19795)
-- Name: federated_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_user (
    id character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_user OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 19422)
-- Name: group_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_attribute OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 19419)
-- Name: group_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_role_mapping (
    role_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_role_mapping OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 19025)
-- Name: identity_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider (
    internal_id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    provider_alias character varying(255),
    provider_id character varying(255),
    store_token boolean DEFAULT false NOT NULL,
    authenticate_by_default boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    add_token_role boolean DEFAULT true NOT NULL,
    trust_email boolean DEFAULT false NOT NULL,
    first_broker_login_flow_id character varying(36),
    post_broker_login_flow_id character varying(36),
    provider_display_name character varying(255),
    link_only boolean DEFAULT false NOT NULL,
    organization_id character varying(255),
    hide_on_login boolean DEFAULT false
);


ALTER TABLE public.identity_provider OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 19034)
-- Name: identity_provider_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider_config (
    identity_provider_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.identity_provider_config OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 19138)
-- Name: identity_provider_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    idp_alias character varying(255) NOT NULL,
    idp_mapper_name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.identity_provider_mapper OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 19143)
-- Name: idp_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.idp_mapper_config (
    idp_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.idp_mapper_config OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 20227)
-- Name: jgroups_ping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jgroups_ping (
    address character varying(200) NOT NULL,
    name character varying(200),
    cluster_name character varying(200) NOT NULL,
    ip character varying(200) NOT NULL,
    coord boolean
);


ALTER TABLE public.jgroups_ping OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 19416)
-- Name: keycloak_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keycloak_group (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_group character varying(36) NOT NULL,
    realm_id character varying(36),
    type integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.keycloak_group OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18651)
-- Name: keycloak_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keycloak_role (
    id character varying(36) NOT NULL,
    client_realm_constraint character varying(255),
    client_role boolean DEFAULT false NOT NULL,
    description character varying(255),
    name character varying(255),
    realm_id character varying(255),
    client character varying(36),
    realm character varying(36)
);


ALTER TABLE public.keycloak_role OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 19135)
-- Name: migration_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migration_model (
    id character varying(36) NOT NULL,
    version character varying(36),
    update_time bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.migration_model OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 19407)
-- Name: offline_client_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_client_session (
    user_session_id character varying(36) NOT NULL,
    client_id character varying(255) NOT NULL,
    offline_flag character varying(4) NOT NULL,
    "timestamp" integer,
    data text,
    client_storage_provider character varying(36) DEFAULT 'local'::character varying NOT NULL,
    external_client_id character varying(255) DEFAULT 'local'::character varying NOT NULL,
    version integer DEFAULT 0
);


ALTER TABLE public.offline_client_session OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 19402)
-- Name: offline_user_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_user_session (
    user_session_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    created_on integer NOT NULL,
    offline_flag character varying(4) NOT NULL,
    data text,
    last_session_refresh integer DEFAULT 0 NOT NULL,
    broker_session_id character varying(1024),
    version integer DEFAULT 0
);


ALTER TABLE public.offline_user_session OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 20187)
-- Name: org; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org (
    id character varying(255) NOT NULL,
    enabled boolean NOT NULL,
    realm_id character varying(255) NOT NULL,
    group_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(4000),
    alias character varying(255) NOT NULL,
    redirect_url character varying(2048)
);


ALTER TABLE public.org OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 20198)
-- Name: org_domain; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_domain (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    verified boolean NOT NULL,
    org_id character varying(255) NOT NULL
);


ALTER TABLE public.org_domain OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 19621)
-- Name: policy_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policy_config (
    policy_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.policy_config OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 19009)
-- Name: protocol_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    protocol character varying(255) NOT NULL,
    protocol_mapper_name character varying(255) NOT NULL,
    client_id character varying(36),
    client_scope_id character varying(36)
);


ALTER TABLE public.protocol_mapper OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 19015)
-- Name: protocol_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol_mapper_config (
    protocol_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.protocol_mapper_config OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18657)
-- Name: realm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm (
    id character varying(36) NOT NULL,
    access_code_lifespan integer,
    user_action_lifespan integer,
    access_token_lifespan integer,
    account_theme character varying(255),
    admin_theme character varying(255),
    email_theme character varying(255),
    enabled boolean DEFAULT false NOT NULL,
    events_enabled boolean DEFAULT false NOT NULL,
    events_expiration bigint,
    login_theme character varying(255),
    name character varying(255),
    not_before integer,
    password_policy character varying(2550),
    registration_allowed boolean DEFAULT false NOT NULL,
    remember_me boolean DEFAULT false NOT NULL,
    reset_password_allowed boolean DEFAULT false NOT NULL,
    social boolean DEFAULT false NOT NULL,
    ssl_required character varying(255),
    sso_idle_timeout integer,
    sso_max_lifespan integer,
    update_profile_on_soc_login boolean DEFAULT false NOT NULL,
    verify_email boolean DEFAULT false NOT NULL,
    master_admin_client character varying(36),
    login_lifespan integer,
    internationalization_enabled boolean DEFAULT false NOT NULL,
    default_locale character varying(255),
    reg_email_as_username boolean DEFAULT false NOT NULL,
    admin_events_enabled boolean DEFAULT false NOT NULL,
    admin_events_details_enabled boolean DEFAULT false NOT NULL,
    edit_username_allowed boolean DEFAULT false NOT NULL,
    otp_policy_counter integer DEFAULT 0,
    otp_policy_window integer DEFAULT 1,
    otp_policy_period integer DEFAULT 30,
    otp_policy_digits integer DEFAULT 6,
    otp_policy_alg character varying(36) DEFAULT 'HmacSHA1'::character varying,
    otp_policy_type character varying(36) DEFAULT 'totp'::character varying,
    browser_flow character varying(36),
    registration_flow character varying(36),
    direct_grant_flow character varying(36),
    reset_credentials_flow character varying(36),
    client_auth_flow character varying(36),
    offline_session_idle_timeout integer DEFAULT 0,
    revoke_refresh_token boolean DEFAULT false NOT NULL,
    access_token_life_implicit integer DEFAULT 0,
    login_with_email_allowed boolean DEFAULT true NOT NULL,
    duplicate_emails_allowed boolean DEFAULT false NOT NULL,
    docker_auth_flow character varying(36),
    refresh_token_max_reuse integer DEFAULT 0,
    allow_user_managed_access boolean DEFAULT false NOT NULL,
    sso_max_lifespan_remember_me integer DEFAULT 0 NOT NULL,
    sso_idle_timeout_remember_me integer DEFAULT 0 NOT NULL,
    default_role character varying(255)
);


ALTER TABLE public.realm OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18674)
-- Name: realm_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_attribute (
    name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    value text
);


ALTER TABLE public.realm_attribute OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 19431)
-- Name: realm_default_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_default_groups (
    realm_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_default_groups OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 19127)
-- Name: realm_enabled_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_enabled_event_types (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_enabled_event_types OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18682)
-- Name: realm_events_listeners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_events_listeners (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_events_listeners OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 20133)
-- Name: realm_localizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_localizations (
    realm_id character varying(255) NOT NULL,
    locale character varying(255) NOT NULL,
    texts text NOT NULL
);


ALTER TABLE public.realm_localizations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18685)
-- Name: realm_required_credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_required_credential (
    type character varying(255) NOT NULL,
    form_label character varying(255),
    input boolean DEFAULT false NOT NULL,
    secret boolean DEFAULT false NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_required_credential OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18692)
-- Name: realm_smtp_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_smtp_config (
    realm_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.realm_smtp_config OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 19043)
-- Name: realm_supported_locales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_supported_locales (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_supported_locales OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 18702)
-- Name: redirect_uris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redirect_uris (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.redirect_uris OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 19366)
-- Name: required_action_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_action_config (
    required_action_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.required_action_config OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 19359)
-- Name: required_action_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_action_provider (
    id character varying(36) NOT NULL,
    alias character varying(255),
    name character varying(255),
    realm_id character varying(36),
    enabled boolean DEFAULT false NOT NULL,
    default_action boolean DEFAULT false NOT NULL,
    provider_id character varying(255),
    priority integer
);


ALTER TABLE public.required_action_provider OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 20064)
-- Name: resource_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    resource_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_attribute OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 19648)
-- Name: resource_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_policy (
    resource_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_policy OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 19633)
-- Name: resource_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_scope (
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_scope OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 19571)
-- Name: resource_server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server (
    id character varying(36) NOT NULL,
    allow_rs_remote_mgmt boolean DEFAULT false NOT NULL,
    policy_enforce_mode smallint NOT NULL,
    decision_strategy smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.resource_server OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 20040)
-- Name: resource_server_perm_ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_perm_ticket (
    id character varying(36) NOT NULL,
    owner character varying(255) NOT NULL,
    requester character varying(255) NOT NULL,
    created_timestamp bigint NOT NULL,
    granted_timestamp bigint,
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36),
    resource_server_id character varying(36) NOT NULL,
    policy_id character varying(36)
);


ALTER TABLE public.resource_server_perm_ticket OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 19607)
-- Name: resource_server_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_policy (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    type character varying(255) NOT NULL,
    decision_strategy smallint,
    logic smallint,
    resource_server_id character varying(36) NOT NULL,
    owner character varying(255)
);


ALTER TABLE public.resource_server_policy OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 19579)
-- Name: resource_server_resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_resource (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255),
    icon_uri character varying(255),
    owner character varying(255) NOT NULL,
    resource_server_id character varying(36) NOT NULL,
    owner_managed_access boolean DEFAULT false NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_resource OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 19593)
-- Name: resource_server_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_scope (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    icon_uri character varying(255),
    resource_server_id character varying(36) NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_scope OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 20082)
-- Name: resource_uris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_uris (
    resource_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.resource_uris OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 20215)
-- Name: revoked_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revoked_token (
    id character varying(255) NOT NULL,
    expire bigint NOT NULL
);


ALTER TABLE public.revoked_token OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 20092)
-- Name: role_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_attribute (
    id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255)
);


ALTER TABLE public.role_attribute OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18705)
-- Name: scope_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope_mapping (
    client_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_mapping OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 19663)
-- Name: scope_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope_policy (
    scope_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_policy OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 20234)
-- Name: server_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_config (
    server_config_key character varying(255) NOT NULL,
    value text NOT NULL,
    version integer DEFAULT 0
);


ALTER TABLE public.server_config OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 18711)
-- Name: user_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_attribute (
    name character varying(255) NOT NULL,
    value character varying(255),
    user_id character varying(36) NOT NULL,
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.user_attribute OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 19148)
-- Name: user_consent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(36) NOT NULL,
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.user_consent OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 20015)
-- Name: user_consent_client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_consent_client_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.user_consent_client_scope OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 18716)
-- Name: user_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_entity (
    id character varying(36) NOT NULL,
    email character varying(255),
    email_constraint character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    federation_link character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    realm_id character varying(255),
    username character varying(255),
    created_timestamp bigint,
    service_account_client_link character varying(255),
    not_before integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_entity OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 18724)
-- Name: user_federation_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_config (
    user_federation_provider_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_config OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 19260)
-- Name: user_federation_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    federation_provider_id character varying(36) NOT NULL,
    federation_mapper_type character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.user_federation_mapper OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 19265)
-- Name: user_federation_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_mapper_config (
    user_federation_mapper_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_mapper_config OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 18729)
-- Name: user_federation_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_provider (
    id character varying(36) NOT NULL,
    changed_sync_period integer,
    display_name character varying(255),
    full_sync_period integer,
    last_sync integer,
    priority integer,
    provider_name character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.user_federation_provider OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 19428)
-- Name: user_group_membership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    membership_type character varying(255) NOT NULL
);


ALTER TABLE public.user_group_membership OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 18734)
-- Name: user_required_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_required_action (
    user_id character varying(36) NOT NULL,
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL
);


ALTER TABLE public.user_required_action OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18737)
-- Name: user_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role_mapping (
    role_id character varying(255) NOT NULL,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.user_role_mapping OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 18751)
-- Name: web_origins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.web_origins (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.web_origins OWNER TO postgres;

--
-- TOC entry 4226 (class 0 OID 19235)
-- Dependencies: 251
-- Data for Name: admin_event_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_event_entity (id, admin_event_time, realm_id, operation_type, auth_realm_id, auth_client_id, auth_user_id, ip_address, resource_path, representation, error, resource_type, details_json) FROM stdin;
\.


--
-- TOC entry 4253 (class 0 OID 19678)
-- Dependencies: 278
-- Data for Name: associated_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.associated_policy (policy_id, associated_policy_id) FROM stdin;
e45f8d60-3beb-4fcf-b754-bfecfdef881c	cc3360af-6716-474a-82e1-642c6b33ed71
\.


--
-- TOC entry 4229 (class 0 OID 19250)
-- Dependencies: 254
-- Data for Name: authentication_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_execution (id, alias, authenticator, realm_id, flow_id, requirement, priority, authenticator_flow, auth_flow_id, auth_config) FROM stdin;
44bff2c8-c7ed-426e-b55b-5bab9badb58f	\N	auth-cookie	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	0bcaec5a-58b3-40f8-87ea-577a276e7edf	2	10	f	\N	\N
e08083aa-a901-47ea-8119-40d97f8b527c	\N	auth-spnego	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	0bcaec5a-58b3-40f8-87ea-577a276e7edf	3	20	f	\N	\N
c239acd5-9f2a-425d-8011-e2c3a6b45016	\N	identity-provider-redirector	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	0bcaec5a-58b3-40f8-87ea-577a276e7edf	2	25	f	\N	\N
4bf26978-d869-4da6-9b46-c391fbadc4e8	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	0bcaec5a-58b3-40f8-87ea-577a276e7edf	2	30	t	56450db7-fa15-40e9-9664-03bfe5906909	\N
0879c532-abc2-4679-9a69-ebd0b0a19519	\N	auth-username-password-form	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	56450db7-fa15-40e9-9664-03bfe5906909	0	10	f	\N	\N
65063773-267f-403d-8c13-31eb4930396c	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	56450db7-fa15-40e9-9664-03bfe5906909	1	20	t	8ea6b8c3-7f9a-40f4-9909-9f4fce5c23a5	\N
3cf0fb90-44a0-4c65-b596-4bb15b05ee5b	\N	conditional-user-configured	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	8ea6b8c3-7f9a-40f4-9909-9f4fce5c23a5	0	10	f	\N	\N
63133619-4f23-468a-b2d7-a1240ce9ae79	\N	auth-otp-form	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	8ea6b8c3-7f9a-40f4-9909-9f4fce5c23a5	0	20	f	\N	\N
124b8dc9-ecf4-4be1-a1a8-bf7efe267e97	\N	direct-grant-validate-username	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4dc2763b-9f87-43bf-a3eb-e9fa51b14617	0	10	f	\N	\N
a16c3bd8-6664-4241-98c8-611035f3b03c	\N	direct-grant-validate-password	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4dc2763b-9f87-43bf-a3eb-e9fa51b14617	0	20	f	\N	\N
8823b715-9fb4-4c19-b45f-99307a0dd35d	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4dc2763b-9f87-43bf-a3eb-e9fa51b14617	1	30	t	1a537dd7-3905-4f84-bc83-62932c7ac5bd	\N
5a6ad8d9-28db-4d2f-a223-ebbde8c8ab77	\N	conditional-user-configured	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	1a537dd7-3905-4f84-bc83-62932c7ac5bd	0	10	f	\N	\N
1f3d2d0e-e5d6-4809-b5b2-aa9e1aaabb18	\N	direct-grant-validate-otp	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	1a537dd7-3905-4f84-bc83-62932c7ac5bd	0	20	f	\N	\N
e5ac2985-8175-4a4f-abe3-4438276b6b54	\N	registration-page-form	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	e99439ce-9ada-4317-93a5-41cb2bc5b6b6	0	10	t	4e0167ab-5627-4a16-8d79-ad054c7b5b8b	\N
d28fa5d0-def0-4656-afc3-4ab77bd68d33	\N	registration-user-creation	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4e0167ab-5627-4a16-8d79-ad054c7b5b8b	0	20	f	\N	\N
74c63114-5ea5-4e8a-a9a4-66a07d42f168	\N	registration-password-action	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4e0167ab-5627-4a16-8d79-ad054c7b5b8b	0	50	f	\N	\N
69328a38-631d-481c-89cc-c295f09dd6dc	\N	registration-recaptcha-action	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4e0167ab-5627-4a16-8d79-ad054c7b5b8b	3	60	f	\N	\N
f1de5861-11a1-4c05-afb0-647c816a91d2	\N	registration-terms-and-conditions	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	4e0167ab-5627-4a16-8d79-ad054c7b5b8b	3	70	f	\N	\N
25822b0b-446c-496c-bc05-fb8671f080dd	\N	reset-credentials-choose-user	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	699639f1-4b4b-424c-88e4-4396c732ab8c	0	10	f	\N	\N
1af3793c-3746-4632-af87-24a94c3a1dcc	\N	reset-credential-email	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	699639f1-4b4b-424c-88e4-4396c732ab8c	0	20	f	\N	\N
1708a2d7-088a-4a13-a05a-0e564e900091	\N	reset-password	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	699639f1-4b4b-424c-88e4-4396c732ab8c	0	30	f	\N	\N
ee389989-771c-4f7c-9fe9-8f50dd619b4a	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	699639f1-4b4b-424c-88e4-4396c732ab8c	1	40	t	40e637e2-58c1-456b-a76b-f3fb445d58a1	\N
ed163aaf-1588-4d51-8af2-d066133316a3	\N	conditional-user-configured	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	40e637e2-58c1-456b-a76b-f3fb445d58a1	0	10	f	\N	\N
f5579b1c-231a-439f-8693-c067fc608fd1	\N	reset-otp	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	40e637e2-58c1-456b-a76b-f3fb445d58a1	0	20	f	\N	\N
7cb4318f-5c9a-41b0-a27d-232b49b1c234	\N	client-secret	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	cd1a566d-2f27-4775-a289-d5deefd76575	2	10	f	\N	\N
45d80ac8-70fb-4a20-894b-b4b8ee329812	\N	client-jwt	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	cd1a566d-2f27-4775-a289-d5deefd76575	2	20	f	\N	\N
37e61e42-5d29-48f1-bb90-1e06404d00b2	\N	client-secret-jwt	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	cd1a566d-2f27-4775-a289-d5deefd76575	2	30	f	\N	\N
e4af62e1-df1b-45f2-b44a-b0acdeb51f02	\N	client-x509	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	cd1a566d-2f27-4775-a289-d5deefd76575	2	40	f	\N	\N
290a42b2-105d-4b72-99ea-8ab123414d7c	\N	idp-review-profile	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	da969484-6f15-4dcd-9a2d-93cd99dcb234	0	10	f	\N	1044dc67-fa33-40a8-9edd-1b7607bce9be
ec1c989f-6f8d-485e-92a9-188b878b50d4	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	da969484-6f15-4dcd-9a2d-93cd99dcb234	0	20	t	76d046fd-de83-446c-b29a-1cafb1f65606	\N
68d536f5-7224-476f-9162-0aa20be2dd3b	\N	idp-create-user-if-unique	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	76d046fd-de83-446c-b29a-1cafb1f65606	2	10	f	\N	d9b55e04-221c-47f4-bd2a-36c5b3cbbfc4
c1681e6f-6625-4e91-91d1-9c6efa3aa63d	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	76d046fd-de83-446c-b29a-1cafb1f65606	2	20	t	90d7ed26-09b5-42b1-9b12-c14abe6f188c	\N
43eb7b50-b28b-4661-aa40-f1be53be6a80	\N	idp-confirm-link	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	90d7ed26-09b5-42b1-9b12-c14abe6f188c	0	10	f	\N	\N
3db7f9b2-2d1b-45f3-a7dc-02bc3f679350	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	90d7ed26-09b5-42b1-9b12-c14abe6f188c	0	20	t	bee1ee1a-3471-4204-991c-68b84d388c91	\N
829c7b3a-3174-4090-b4f2-7a42ae487743	\N	idp-email-verification	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	bee1ee1a-3471-4204-991c-68b84d388c91	2	10	f	\N	\N
018e29da-b6b7-43ab-87ae-02be8c5d4097	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	bee1ee1a-3471-4204-991c-68b84d388c91	2	20	t	730c9830-605b-477e-82b1-7a01a4216a70	\N
8c791e0f-9c73-4965-a954-9fabfcfc5749	\N	idp-username-password-form	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	730c9830-605b-477e-82b1-7a01a4216a70	0	10	f	\N	\N
0a0356d2-13e1-4f1a-b8a2-f07238ae1e40	\N	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	730c9830-605b-477e-82b1-7a01a4216a70	1	20	t	a32548b8-6b11-461b-b841-51ef5f75fae9	\N
d8e59533-0a8c-47b7-a916-a3d90f7930e4	\N	conditional-user-configured	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	a32548b8-6b11-461b-b841-51ef5f75fae9	0	10	f	\N	\N
29887d76-3f76-4522-a112-d0bdc86504fd	\N	auth-otp-form	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	a32548b8-6b11-461b-b841-51ef5f75fae9	0	20	f	\N	\N
3cd9c0bf-30b6-4dd3-a232-6927eedda6f0	\N	http-basic-authenticator	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f47b91fb-adcf-4b56-a1d3-e5ca78ce7c2c	0	10	f	\N	\N
e0b5f762-4970-4a1b-a2e3-19c75f2f9e4d	\N	docker-http-basic-authenticator	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f22b50c9-2cad-4b2d-aeaa-9394131ee4dc	0	10	f	\N	\N
bb1b28b9-32c7-4bc5-8904-2e9a16c235a9	\N	idp-email-verification	BookingSmart	3968cac9-c5d7-4aeb-bc30-7a7bd306f2d9	2	10	f	\N	\N
5abfcf1d-c09e-4f3b-9d2e-d1e4f2add71d	\N	\N	BookingSmart	3968cac9-c5d7-4aeb-bc30-7a7bd306f2d9	2	20	t	c8330ace-32dd-44f1-b961-272a67bb4d7f	\N
be20b6e3-3c4b-4879-a172-eaf0fafb3cf5	\N	conditional-user-configured	BookingSmart	2db7a0db-b050-4fa8-9bc9-8fa55df00658	0	10	f	\N	\N
156194e6-c245-4a5f-b72a-cb626491340b	\N	auth-otp-form	BookingSmart	2db7a0db-b050-4fa8-9bc9-8fa55df00658	0	20	f	\N	\N
39e1fe9b-2af0-4be9-b21b-7045373756e7	\N	conditional-user-configured	BookingSmart	3376df47-fa7f-4477-acb7-a4d65d9b1ab4	0	10	f	\N	\N
c565085a-2a2d-42ed-a1c8-48645adfb7e8	\N	direct-grant-validate-otp	BookingSmart	3376df47-fa7f-4477-acb7-a4d65d9b1ab4	0	20	f	\N	\N
e7b730e5-b7a2-46be-9c71-46041755b701	\N	conditional-user-configured	BookingSmart	66b8c353-ba08-4ce6-9c34-5e339056126a	0	10	f	\N	\N
b709990e-c950-4ec7-b8ca-2c276be469a6	\N	auth-otp-form	BookingSmart	66b8c353-ba08-4ce6-9c34-5e339056126a	0	20	f	\N	\N
15792ddf-50f6-4d50-be78-6547f00669e1	\N	idp-confirm-link	BookingSmart	5252711f-e965-4dd8-85e1-92fd9ec5200b	0	10	f	\N	\N
19711282-1563-46f6-a9bd-4bdf01713fba	\N	\N	BookingSmart	5252711f-e965-4dd8-85e1-92fd9ec5200b	0	20	t	3968cac9-c5d7-4aeb-bc30-7a7bd306f2d9	\N
9518bb92-aab9-4678-86e7-6c446a90d35c	\N	conditional-user-configured	BookingSmart	c5c52046-b8a1-4506-9588-1b8c7da900f3	0	10	f	\N	\N
48b2b1f4-53d5-4796-b044-71c924a098a6	\N	reset-otp	BookingSmart	c5c52046-b8a1-4506-9588-1b8c7da900f3	0	20	f	\N	\N
a286c671-ff73-4e15-902d-547c5be0884b	\N	idp-create-user-if-unique	BookingSmart	f7e8c77a-5036-48b8-951e-40613cdc7f6a	2	10	f	\N	66c9b2d1-fd8f-46a7-83a7-dd984164a29e
3eb4d09f-3e52-49ac-b1bd-f3de4be2a57d	\N	\N	BookingSmart	f7e8c77a-5036-48b8-951e-40613cdc7f6a	2	20	t	5252711f-e965-4dd8-85e1-92fd9ec5200b	\N
84f61902-4029-4d3b-a0b7-439ce8054958	\N	idp-username-password-form	BookingSmart	c8330ace-32dd-44f1-b961-272a67bb4d7f	0	10	f	\N	\N
9163a350-f24e-44d1-8812-8f4fb80f42d2	\N	\N	BookingSmart	c8330ace-32dd-44f1-b961-272a67bb4d7f	1	20	t	66b8c353-ba08-4ce6-9c34-5e339056126a	\N
9916860f-45f2-45a8-936e-2aa5ec70a6a3	\N	auth-cookie	BookingSmart	f78131ac-ccb1-4d0f-bf2d-796ecc29c15c	2	10	f	\N	\N
fc875d54-4c96-4b19-a977-758694adb21b	\N	auth-spnego	BookingSmart	f78131ac-ccb1-4d0f-bf2d-796ecc29c15c	3	20	f	\N	\N
8de19d11-da8f-4dc8-a2a4-b5d61a920633	\N	identity-provider-redirector	BookingSmart	f78131ac-ccb1-4d0f-bf2d-796ecc29c15c	2	25	f	\N	\N
5e0f3e19-536d-46f0-b560-0e0a5ef6e81a	\N	\N	BookingSmart	f78131ac-ccb1-4d0f-bf2d-796ecc29c15c	2	30	t	f81b88ab-ce22-47d3-a1d6-81fbe144b57b	\N
71b57f4c-6713-4f76-ab0a-f4c9173ecc6f	\N	client-secret	BookingSmart	40fd81ed-6597-4924-ab5d-3663f2392054	2	10	f	\N	\N
2e5ac255-b201-4fd9-a5be-89714967f4f0	\N	client-jwt	BookingSmart	40fd81ed-6597-4924-ab5d-3663f2392054	2	20	f	\N	\N
8ad0492c-0392-42b3-8421-84fa7249c97b	\N	client-secret-jwt	BookingSmart	40fd81ed-6597-4924-ab5d-3663f2392054	2	30	f	\N	\N
d22fb362-18f9-4ea3-97d2-56052a5f5b61	\N	client-x509	BookingSmart	40fd81ed-6597-4924-ab5d-3663f2392054	2	40	f	\N	\N
81de51a0-052b-41b3-8e1c-4b01f3629fbe	\N	direct-grant-validate-username	BookingSmart	a15373c0-16ea-41d0-b7b1-1d8d9c9cbf31	0	10	f	\N	\N
516edd69-797c-4c54-b971-765388eb024f	\N	direct-grant-validate-password	BookingSmart	a15373c0-16ea-41d0-b7b1-1d8d9c9cbf31	0	20	f	\N	\N
ba8223d1-f6f8-487d-9a9a-3ac885c52691	\N	\N	BookingSmart	a15373c0-16ea-41d0-b7b1-1d8d9c9cbf31	1	30	t	3376df47-fa7f-4477-acb7-a4d65d9b1ab4	\N
8775037b-8389-4a66-a3fa-7add854fb589	\N	docker-http-basic-authenticator	BookingSmart	a87d6099-36df-463c-988a-bf77a48078c1	0	10	f	\N	\N
254af76e-b74a-43b2-af96-de17e8f06893	\N	idp-review-profile	BookingSmart	2802f1e4-d20d-440a-9738-0d5aa36255d5	0	10	f	\N	6bc94049-dc44-481a-90c4-9b21663a3dc7
36d65c59-f0b3-4a2f-9815-b76bc28dc959	\N	\N	BookingSmart	2802f1e4-d20d-440a-9738-0d5aa36255d5	0	20	t	f7e8c77a-5036-48b8-951e-40613cdc7f6a	\N
20b6c63c-a347-4d1a-a425-c4b201db6462	\N	auth-username-password-form	BookingSmart	f81b88ab-ce22-47d3-a1d6-81fbe144b57b	0	10	f	\N	\N
329abb15-a867-4357-bfb6-9b5fb1bc0034	\N	\N	BookingSmart	f81b88ab-ce22-47d3-a1d6-81fbe144b57b	1	20	t	2db7a0db-b050-4fa8-9bc9-8fa55df00658	\N
201bba9e-ccee-4691-ab77-bc24a946707d	\N	registration-page-form	BookingSmart	8bfa1b0d-9e32-4786-9ade-e747b6a986a8	0	10	t	ea46b7d3-59c5-419b-8db2-28858df80168	\N
ab3306af-5ad0-4dc2-84c8-2272b9567d77	\N	registration-user-creation	BookingSmart	ea46b7d3-59c5-419b-8db2-28858df80168	0	20	f	\N	\N
c64aa701-2dc6-45a2-b07d-8cd74da4d4a5	\N	registration-password-action	BookingSmart	ea46b7d3-59c5-419b-8db2-28858df80168	0	50	f	\N	\N
db651dac-511e-431d-9537-7b9b07aa670e	\N	registration-recaptcha-action	BookingSmart	ea46b7d3-59c5-419b-8db2-28858df80168	3	60	f	\N	\N
b5001c56-c648-4cf0-8333-7829fea6fd8b	\N	reset-credentials-choose-user	BookingSmart	aed801c6-cf4a-4b53-9344-18a0f3d14e47	0	10	f	\N	\N
f66b38ab-e295-4a82-bd97-f0be8b45da19	\N	reset-credential-email	BookingSmart	aed801c6-cf4a-4b53-9344-18a0f3d14e47	0	20	f	\N	\N
fe8eb254-d3c7-4dba-8f41-dbd865f4d0ce	\N	reset-password	BookingSmart	aed801c6-cf4a-4b53-9344-18a0f3d14e47	0	30	f	\N	\N
305b85dc-674c-4de9-852c-54b48fdc8eb3	\N	\N	BookingSmart	aed801c6-cf4a-4b53-9344-18a0f3d14e47	1	40	t	c5c52046-b8a1-4506-9588-1b8c7da900f3	\N
1a8d43b7-4918-412c-958d-d0c27591252b	\N	http-basic-authenticator	BookingSmart	ed44cf3e-c077-4c78-8323-29a5417dd09e	0	10	f	\N	\N
\.


--
-- TOC entry 4228 (class 0 OID 19245)
-- Dependencies: 253
-- Data for Name: authentication_flow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_flow (id, alias, description, realm_id, provider_id, top_level, built_in) FROM stdin;
0bcaec5a-58b3-40f8-87ea-577a276e7edf	browser	Browser based authentication	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
56450db7-fa15-40e9-9664-03bfe5906909	forms	Username, password, otp and other auth forms.	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
8ea6b8c3-7f9a-40f4-9909-9f4fce5c23a5	Browser - Conditional OTP	Flow to determine if the OTP is required for the authentication	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
4dc2763b-9f87-43bf-a3eb-e9fa51b14617	direct grant	OpenID Connect Resource Owner Grant	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
1a537dd7-3905-4f84-bc83-62932c7ac5bd	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
e99439ce-9ada-4317-93a5-41cb2bc5b6b6	registration	Registration flow	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
4e0167ab-5627-4a16-8d79-ad054c7b5b8b	registration form	Registration form	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	form-flow	f	t
699639f1-4b4b-424c-88e4-4396c732ab8c	reset credentials	Reset credentials for a user if they forgot their password or something	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
40e637e2-58c1-456b-a76b-f3fb445d58a1	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
cd1a566d-2f27-4775-a289-d5deefd76575	clients	Base authentication for clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	client-flow	t	t
da969484-6f15-4dcd-9a2d-93cd99dcb234	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
76d046fd-de83-446c-b29a-1cafb1f65606	User creation or linking	Flow for the existing/non-existing user alternatives	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
90d7ed26-09b5-42b1-9b12-c14abe6f188c	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
bee1ee1a-3471-4204-991c-68b84d388c91	Account verification options	Method with which to verity the existing account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
730c9830-605b-477e-82b1-7a01a4216a70	Verify Existing Account by Re-authentication	Reauthentication of existing account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
a32548b8-6b11-461b-b841-51ef5f75fae9	First broker login - Conditional OTP	Flow to determine if the OTP is required for the authentication	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	f	t
f47b91fb-adcf-4b56-a1d3-e5ca78ce7c2c	saml ecp	SAML ECP Profile Authentication Flow	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
f22b50c9-2cad-4b2d-aeaa-9394131ee4dc	docker auth	Used by Docker clients to authenticate against the IDP	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	basic-flow	t	t
3968cac9-c5d7-4aeb-bc30-7a7bd306f2d9	Account verification options	Method with which to verity the existing account	BookingSmart	basic-flow	f	t
2db7a0db-b050-4fa8-9bc9-8fa55df00658	Browser - Conditional OTP	Flow to determine if the OTP is required for the authentication	BookingSmart	basic-flow	f	t
3376df47-fa7f-4477-acb7-a4d65d9b1ab4	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	BookingSmart	basic-flow	f	t
66b8c353-ba08-4ce6-9c34-5e339056126a	First broker login - Conditional OTP	Flow to determine if the OTP is required for the authentication	BookingSmart	basic-flow	f	t
5252711f-e965-4dd8-85e1-92fd9ec5200b	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	BookingSmart	basic-flow	f	t
c5c52046-b8a1-4506-9588-1b8c7da900f3	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	BookingSmart	basic-flow	f	t
f7e8c77a-5036-48b8-951e-40613cdc7f6a	User creation or linking	Flow for the existing/non-existing user alternatives	BookingSmart	basic-flow	f	t
c8330ace-32dd-44f1-b961-272a67bb4d7f	Verify Existing Account by Re-authentication	Reauthentication of existing account	BookingSmart	basic-flow	f	t
f78131ac-ccb1-4d0f-bf2d-796ecc29c15c	browser	browser based authentication	BookingSmart	basic-flow	t	t
40fd81ed-6597-4924-ab5d-3663f2392054	clients	Base authentication for clients	BookingSmart	client-flow	t	t
a15373c0-16ea-41d0-b7b1-1d8d9c9cbf31	direct grant	OpenID Connect Resource Owner Grant	BookingSmart	basic-flow	t	t
a87d6099-36df-463c-988a-bf77a48078c1	docker auth	Used by Docker clients to authenticate against the IDP	BookingSmart	basic-flow	t	t
2802f1e4-d20d-440a-9738-0d5aa36255d5	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	BookingSmart	basic-flow	t	t
f81b88ab-ce22-47d3-a1d6-81fbe144b57b	forms	Username, password, otp and other auth forms.	BookingSmart	basic-flow	f	t
8bfa1b0d-9e32-4786-9ade-e747b6a986a8	registration	registration flow	BookingSmart	basic-flow	t	t
ea46b7d3-59c5-419b-8db2-28858df80168	registration form	registration form	BookingSmart	form-flow	f	t
aed801c6-cf4a-4b53-9344-18a0f3d14e47	reset credentials	Reset credentials for a user if they forgot their password or something	BookingSmart	basic-flow	t	t
ed44cf3e-c077-4c78-8323-29a5417dd09e	saml ecp	SAML ECP Profile Authentication Flow	BookingSmart	basic-flow	t	t
\.


--
-- TOC entry 4227 (class 0 OID 19240)
-- Dependencies: 252
-- Data for Name: authenticator_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authenticator_config (id, alias, realm_id) FROM stdin;
1044dc67-fa33-40a8-9edd-1b7607bce9be	review profile config	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9
d9b55e04-221c-47f4-bd2a-36c5b3cbbfc4	create unique user config	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9
66c9b2d1-fd8f-46a7-83a7-dd984164a29e	create unique user config	BookingSmart
6bc94049-dc44-481a-90c4-9b21663a3dc7	review profile config	BookingSmart
\.


--
-- TOC entry 4230 (class 0 OID 19255)
-- Dependencies: 255
-- Data for Name: authenticator_config_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authenticator_config_entry (authenticator_id, value, name) FROM stdin;
1044dc67-fa33-40a8-9edd-1b7607bce9be	missing	update.profile.on.first.login
d9b55e04-221c-47f4-bd2a-36c5b3cbbfc4	false	require.password.update.after.registration
66c9b2d1-fd8f-46a7-83a7-dd984164a29e	false	require.password.update.after.registration
6bc94049-dc44-481a-90c4-9b21663a3dc7	missing	update.profile.on.first.login
\.


--
-- TOC entry 4254 (class 0 OID 19693)
-- Dependencies: 279
-- Data for Name: broker_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broker_link (identity_provider, storage_provider_id, realm_id, broker_user_id, broker_username, token, user_id) FROM stdin;
\.


--
-- TOC entry 4194 (class 0 OID 18616)
-- Dependencies: 219
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (id, enabled, full_scope_allowed, client_id, not_before, public_client, secret, base_url, bearer_only, management_url, surrogate_auth_required, realm_id, protocol, node_rereg_timeout, frontchannel_logout, consent_required, name, service_accounts_enabled, client_authenticator_type, root_url, description, registration_token, standard_flow_enabled, implicit_flow_enabled, direct_access_grants_enabled, always_display_in_console) FROM stdin;
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	f	master-realm	0	f	\N	\N	t	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	0	f	f	master Realm	f	client-secret	\N	\N	\N	t	f	f	f
36589292-38ed-4b75-8b05-9d0b11f09f0c	t	f	account	0	t	\N	/realms/master/account/	f	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
a35b84ae-8974-404d-a0d8-f875605c1237	t	f	account-console	0	t	\N	/realms/master/account/	f	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
d614e28a-2586-4719-9d43-6d6f684491e7	t	f	broker	0	f	\N	\N	t	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	t	t	security-admin-console	0	t	\N	/admin/master/console/	f	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
46e73c56-de99-42db-b502-d495a8de0d87	t	t	admin-cli	0	t	\N	\N	f	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
759eab66-3913-43ee-af17-50718d34c183	t	f	BookingSmart-realm	0	f	\N	\N	t	\N	f	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	0	f	f	BookingSmart Realm	f	client-secret	\N	\N	\N	t	f	f	f
63a551a9-12e6-465b-9b06-83747ff64c8d	t	f	account	0	t	\N	/realms/BookingSmart/account/	f	\N	f	BookingSmart	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
c9b985d8-1db7-43aa-aabe-35b103bce986	t	f	account-console	0	t	\N	/realms/BookingSmart/account/	f	\N	f	BookingSmart	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
2872ae9d-daf4-4ff9-9556-15870acbfaff	t	t	admin-cli	0	t	\N	\N	f	\N	f	BookingSmart	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
2705a11e-bac1-40dc-a67a-12894e2a2acd	t	f	broker	0	f	\N	\N	t	\N	f	BookingSmart	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
26490047-2a91-4938-9324-371523ad1e14	t	t	backoffice-bff	0	f	qhW4NC8pgPLdJDTd57sry5ON1fHK1d8i		f		f	BookingSmart	openid-connect	-1	f	f		f	client-secret			96b3dfc9-4c73-4f3f-b2bc-a1bdcccbb79b	t	f	t	f
cdd87e47-0556-4612-95ad-122de3a09b8f	t	f	realm-management	0	f	\N	\N	t	\N	f	BookingSmart	openid-connect	0	f	f	${client_realm-management}	f	client-secret	\N	\N	\N	t	f	f	f
60946636-ed9b-470c-b900-277f4d41ba80	t	t	customer-management	0	f	jOLr8rc6Oy8ARMDst3KKYaTzxzgy83hU	\N	f	\N	f	BookingSmart	openid-connect	-1	f	f	\N	t	client-secret	\N	\N	\N	t	f	t	f
36b9332d-e925-42e2-bef4-6e9271695118	t	t	security-admin-console	0	t	\N	/admin/BookingSmart/console/	f	\N	f	BookingSmart	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
4f64c142-0545-44bb-9446-2a18b9c9effd	t	t	storefront-bff	0	f	wYUpnvBO9kXw9Aa7M1fU9DakJQ5XNIvx		f		f	BookingSmart	openid-connect	-1	f	f		t	client-secret			\N	t	f	t	f
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	t	t	swagger-ui	0	t	\N		f		f	BookingSmart	openid-connect	-1	f	f		f	client-secret			\N	t	f	t	f
4fd70fcc-3453-45c0-b754-e42d60067c03	t	t	ai-agent	0	f	BW8SRNCLGCkjWyemgFXwLFWfeRfZ1U4n		f		f	BookingSmart	openid-connect	-1	t	f	Ai Agent	t	client-secret			\N	f	f	f	f
\.


--
-- TOC entry 4213 (class 0 OID 18974)
-- Dependencies: 238
-- Data for Name: client_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_attributes (client_id, name, value) FROM stdin;
36589292-38ed-4b75-8b05-9d0b11f09f0c	post.logout.redirect.uris	+
a35b84ae-8974-404d-a0d8-f875605c1237	post.logout.redirect.uris	+
a35b84ae-8974-404d-a0d8-f875605c1237	pkce.code.challenge.method	S256
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	post.logout.redirect.uris	+
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	pkce.code.challenge.method	S256
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	client.use.lightweight.access.token.enabled	true
46e73c56-de99-42db-b502-d495a8de0d87	client.use.lightweight.access.token.enabled	true
63a551a9-12e6-465b-9b06-83747ff64c8d	realm_client	false
63a551a9-12e6-465b-9b06-83747ff64c8d	post.logout.redirect.uris	+
c9b985d8-1db7-43aa-aabe-35b103bce986	realm_client	false
c9b985d8-1db7-43aa-aabe-35b103bce986	post.logout.redirect.uris	+
c9b985d8-1db7-43aa-aabe-35b103bce986	pkce.code.challenge.method	S256
2872ae9d-daf4-4ff9-9556-15870acbfaff	realm_client	false
2872ae9d-daf4-4ff9-9556-15870acbfaff	client.use.lightweight.access.token.enabled	true
2872ae9d-daf4-4ff9-9556-15870acbfaff	post.logout.redirect.uris	+
26490047-2a91-4938-9324-371523ad1e14	saml.multivalued.roles	false
26490047-2a91-4938-9324-371523ad1e14	saml.force.post.binding	false
26490047-2a91-4938-9324-371523ad1e14	post.logout.redirect.uris	+
26490047-2a91-4938-9324-371523ad1e14	oauth2.device.authorization.grant.enabled	false
26490047-2a91-4938-9324-371523ad1e14	backchannel.logout.revoke.offline.tokens	false
26490047-2a91-4938-9324-371523ad1e14	saml.server.signature.keyinfo.ext	false
26490047-2a91-4938-9324-371523ad1e14	use.refresh.tokens	true
26490047-2a91-4938-9324-371523ad1e14	realm_client	false
26490047-2a91-4938-9324-371523ad1e14	oidc.ciba.grant.enabled	false
26490047-2a91-4938-9324-371523ad1e14	backchannel.logout.session.required	true
26490047-2a91-4938-9324-371523ad1e14	client_credentials.use_refresh_token	false
26490047-2a91-4938-9324-371523ad1e14	saml.client.signature	false
26490047-2a91-4938-9324-371523ad1e14	require.pushed.authorization.requests	false
26490047-2a91-4938-9324-371523ad1e14	saml.assertion.signature	false
26490047-2a91-4938-9324-371523ad1e14	id.token.as.detached.signature	false
26490047-2a91-4938-9324-371523ad1e14	saml.encrypt	false
26490047-2a91-4938-9324-371523ad1e14	saml.server.signature	false
26490047-2a91-4938-9324-371523ad1e14	exclude.session.state.from.auth.response	false
26490047-2a91-4938-9324-371523ad1e14	saml.artifact.binding	false
26490047-2a91-4938-9324-371523ad1e14	saml_force_name_id_format	false
26490047-2a91-4938-9324-371523ad1e14	tls.client.certificate.bound.access.tokens	false
26490047-2a91-4938-9324-371523ad1e14	saml.authnstatement	false
26490047-2a91-4938-9324-371523ad1e14	display.on.consent.screen	false
26490047-2a91-4938-9324-371523ad1e14	saml.onetimeuse.condition	false
2705a11e-bac1-40dc-a67a-12894e2a2acd	realm_client	true
2705a11e-bac1-40dc-a67a-12894e2a2acd	post.logout.redirect.uris	+
60946636-ed9b-470c-b900-277f4d41ba80	access.token.lifespan	3600
60946636-ed9b-470c-b900-277f4d41ba80	saml.multivalued.roles	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.force.post.binding	false
60946636-ed9b-470c-b900-277f4d41ba80	post.logout.redirect.uris	+
60946636-ed9b-470c-b900-277f4d41ba80	oauth2.device.authorization.grant.enabled	false
60946636-ed9b-470c-b900-277f4d41ba80	backchannel.logout.revoke.offline.tokens	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.server.signature.keyinfo.ext	false
60946636-ed9b-470c-b900-277f4d41ba80	use.refresh.tokens	true
60946636-ed9b-470c-b900-277f4d41ba80	realm_client	false
60946636-ed9b-470c-b900-277f4d41ba80	oidc.ciba.grant.enabled	false
60946636-ed9b-470c-b900-277f4d41ba80	backchannel.logout.session.required	true
60946636-ed9b-470c-b900-277f4d41ba80	client_credentials.use_refresh_token	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.client.signature	false
60946636-ed9b-470c-b900-277f4d41ba80	require.pushed.authorization.requests	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.assertion.signature	false
60946636-ed9b-470c-b900-277f4d41ba80	id.token.as.detached.signature	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.encrypt	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.server.signature	false
60946636-ed9b-470c-b900-277f4d41ba80	exclude.session.state.from.auth.response	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.artifact.binding	false
60946636-ed9b-470c-b900-277f4d41ba80	saml_force_name_id_format	false
60946636-ed9b-470c-b900-277f4d41ba80	tls.client.certificate.bound.access.tokens	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.authnstatement	false
60946636-ed9b-470c-b900-277f4d41ba80	display.on.consent.screen	false
60946636-ed9b-470c-b900-277f4d41ba80	saml.onetimeuse.condition	false
cdd87e47-0556-4612-95ad-122de3a09b8f	realm_client	true
cdd87e47-0556-4612-95ad-122de3a09b8f	post.logout.redirect.uris	+
36b9332d-e925-42e2-bef4-6e9271695118	realm_client	false
36b9332d-e925-42e2-bef4-6e9271695118	client.use.lightweight.access.token.enabled	true
36b9332d-e925-42e2-bef4-6e9271695118	post.logout.redirect.uris	+
36b9332d-e925-42e2-bef4-6e9271695118	pkce.code.challenge.method	S256
4f64c142-0545-44bb-9446-2a18b9c9effd	id.token.as.detached.signature	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.assertion.signature	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.force.post.binding	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.multivalued.roles	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.encrypt	false
4f64c142-0545-44bb-9446-2a18b9c9effd	post.logout.redirect.uris	+
60946636-ed9b-470c-b900-277f4d41ba80	client.secret.creation.time	1752432344
4f64c142-0545-44bb-9446-2a18b9c9effd	oauth2.device.authorization.grant.enabled	false
4f64c142-0545-44bb-9446-2a18b9c9effd	backchannel.logout.revoke.offline.tokens	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.server.signature	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.server.signature.keyinfo.ext	false
4f64c142-0545-44bb-9446-2a18b9c9effd	use.refresh.tokens	true
4f64c142-0545-44bb-9446-2a18b9c9effd	exclude.session.state.from.auth.response	false
4f64c142-0545-44bb-9446-2a18b9c9effd	realm_client	false
4f64c142-0545-44bb-9446-2a18b9c9effd	oidc.ciba.grant.enabled	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.artifact.binding	false
4f64c142-0545-44bb-9446-2a18b9c9effd	backchannel.logout.session.required	true
4f64c142-0545-44bb-9446-2a18b9c9effd	client_credentials.use_refresh_token	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml_force_name_id_format	false
4f64c142-0545-44bb-9446-2a18b9c9effd	require.pushed.authorization.requests	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.client.signature	false
4f64c142-0545-44bb-9446-2a18b9c9effd	tls.client.certificate.bound.access.tokens	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.authnstatement	false
4f64c142-0545-44bb-9446-2a18b9c9effd	display.on.consent.screen	false
4f64c142-0545-44bb-9446-2a18b9c9effd	saml.onetimeuse.condition	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.force.post.binding	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.multivalued.roles	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	post.logout.redirect.uris	+
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	oauth2.device.authorization.grant.enabled	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	backchannel.logout.revoke.offline.tokens	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.server.signature.keyinfo.ext	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	use.refresh.tokens	true
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	realm_client	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	oidc.ciba.grant.enabled	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	backchannel.logout.session.required	true
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	client_credentials.use_refresh_token	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	require.pushed.authorization.requests	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.client.signature	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	id.token.as.detached.signature	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.assertion.signature	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	client.secret.creation.time	1694600852
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.encrypt	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.server.signature	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	exclude.session.state.from.auth.response	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.artifact.binding	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml_force_name_id_format	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	acr.loa.map	{}
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	tls.client.certificate.bound.access.tokens	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.authnstatement	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	display.on.consent.screen	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	token.response.type.bearer.lower-case	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	saml.onetimeuse.condition	false
26490047-2a91-4938-9324-371523ad1e14	client.secret.creation.time	1752060606
26490047-2a91-4938-9324-371523ad1e14	use.jwks.url	false
26490047-2a91-4938-9324-371523ad1e14	access.token.header.type.rfc9068	false
26490047-2a91-4938-9324-371523ad1e14	request.object.signature.alg	any
26490047-2a91-4938-9324-371523ad1e14	request.object.encryption.alg	any
26490047-2a91-4938-9324-371523ad1e14	request.object.encryption.enc	any
26490047-2a91-4938-9324-371523ad1e14	request.object.required	not required
26490047-2a91-4938-9324-371523ad1e14	token.response.type.bearer.lower-case	false
26490047-2a91-4938-9324-371523ad1e14	client.use.lightweight.access.token.enabled	false
26490047-2a91-4938-9324-371523ad1e14	client.introspection.response.allow.jwt.claim.enabled	false
26490047-2a91-4938-9324-371523ad1e14	standard.token.exchange.enabled	false
4f64c142-0545-44bb-9446-2a18b9c9effd	client.secret.creation.time	1752431217
26490047-2a91-4938-9324-371523ad1e14	login_theme	bookingsmart-keycloak-theme
4f64c142-0545-44bb-9446-2a18b9c9effd	standard.token.exchange.enabled	false
4f64c142-0545-44bb-9446-2a18b9c9effd	login_theme	bookingsmart-keycloak-theme
4fd70fcc-3453-45c0-b754-e42d60067c03	client.secret.creation.time	1756679762
4fd70fcc-3453-45c0-b754-e42d60067c03	standard.token.exchange.enabled	false
4fd70fcc-3453-45c0-b754-e42d60067c03	oauth2.device.authorization.grant.enabled	false
4fd70fcc-3453-45c0-b754-e42d60067c03	oidc.ciba.grant.enabled	false
4fd70fcc-3453-45c0-b754-e42d60067c03	backchannel.logout.session.required	true
4fd70fcc-3453-45c0-b754-e42d60067c03	backchannel.logout.revoke.offline.tokens	false
4fd70fcc-3453-45c0-b754-e42d60067c03	realm_client	false
4fd70fcc-3453-45c0-b754-e42d60067c03	display.on.consent.screen	false
4fd70fcc-3453-45c0-b754-e42d60067c03	frontchannel.logout.session.required	true
4fd70fcc-3453-45c0-b754-e42d60067c03	use.jwks.url	false
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	standard.token.exchange.enabled	false
\.


--
-- TOC entry 4265 (class 0 OID 19942)
-- Dependencies: 290
-- Data for Name: client_auth_flow_bindings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_auth_flow_bindings (client_id, flow_id, binding_name) FROM stdin;
\.


--
-- TOC entry 4264 (class 0 OID 19817)
-- Dependencies: 289
-- Data for Name: client_initial_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_initial_access (id, realm_id, "timestamp", expiration, count, remaining_count) FROM stdin;
\.


--
-- TOC entry 4214 (class 0 OID 18984)
-- Dependencies: 239
-- Data for Name: client_node_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_node_registrations (client_id, value, name) FROM stdin;
\.


--
-- TOC entry 4242 (class 0 OID 19483)
-- Dependencies: 267
-- Data for Name: client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope (id, name, realm_id, description, protocol) FROM stdin;
38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	offline_access	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect built-in scope: offline_access	openid-connect
9aaa1139-f272-4b26-b187-52803cce15d5	role_list	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	SAML role list	saml
99848d6e-9162-4408-98a7-5e25ebc2de65	saml_organization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	Organization Membership	saml
35f672af-755b-476f-9547-d9d7bc3d16f2	profile	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect built-in scope: profile	openid-connect
126145f5-69f7-4cbf-a41e-32167b138ff3	email	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect built-in scope: email	openid-connect
db047953-087f-4f21-a24e-7dec069f3f25	address	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect built-in scope: address	openid-connect
360c129b-3063-4ce9-8b84-6ec811b8a7b0	phone	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect built-in scope: phone	openid-connect
57c299a1-732b-4fec-b557-217d1c34b759	roles	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect scope for add user roles to the access token	openid-connect
ff7191d1-bd41-473b-95a6-561831e14f9a	web-origins	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect scope for add allowed web origins to the access token	openid-connect
725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	microprofile-jwt	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	Microprofile - JWT built-in scope	openid-connect
f35ebce8-cc56-40cd-877a-f7e9576237c4	acr	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	basic	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	OpenID Connect scope for add all basic claims to the token	openid-connect
bdc7a0da-37ee-47c8-878f-7e143fda55a9	service_account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	Specific scope for a client enabled for service accounts	openid-connect
29062bb5-3dc2-43b4-9bdf-9b032f13b2db	organization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	Additional claims about the organization a subject belongs to	openid-connect
65c94f63-6035-4d6c-af24-1f14e3b94a38	email	BookingSmart	OpenID Connect built-in scope: email	openid-connect
5a9f857f-66df-4d72-b1c9-74e50ff4bd18	service_account	BookingSmart	Specific scope for a client enabled for service accounts	openid-connect
d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	offline_access	BookingSmart	OpenID Connect built-in scope: offline_access	openid-connect
eea01d80-65da-4540-85c9-c22b6193479e	address	BookingSmart	OpenID Connect built-in scope: address	openid-connect
337c3515-30b8-4e7c-881a-109f1c94a011	web-origins	BookingSmart	OpenID Connect scope for add allowed web origins to the access token	openid-connect
b718c7ed-ede2-45f9-92d1-36acd43408d1	basic	BookingSmart	OpenID Connect scope for add all basic claims to the token	openid-connect
2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	phone	BookingSmart	OpenID Connect built-in scope: phone	openid-connect
51e71de7-0fa8-4ca8-9789-d1a240e7954c	role_list	BookingSmart	SAML role list	saml
215618ce-81df-4751-b38a-b64b011a7475	roles	BookingSmart	OpenID Connect scope for add user roles to the access token	openid-connect
571bd089-79c4-414f-811d-059110e90303	microprofile-jwt	BookingSmart	Microprofile - JWT built-in scope	openid-connect
19969f81-191a-4485-b659-4a5ebe01285c	profile	BookingSmart	OpenID Connect built-in scope: profile	openid-connect
0ddee3ba-73b6-43bc-b66a-cf8bf520e2a5	acr	BookingSmart	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
984fd7c3-9b32-402a-8e99-7054aaaf07b2	mcp	BookingSmart	For connect mcp server	openid-connect
\.


--
-- TOC entry 4243 (class 0 OID 19497)
-- Dependencies: 268
-- Data for Name: client_scope_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_attributes (scope_id, value, name) FROM stdin;
38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	true	display.on.consent.screen
38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	${offlineAccessScopeConsentText}	consent.screen.text
9aaa1139-f272-4b26-b187-52803cce15d5	true	display.on.consent.screen
9aaa1139-f272-4b26-b187-52803cce15d5	${samlRoleListScopeConsentText}	consent.screen.text
99848d6e-9162-4408-98a7-5e25ebc2de65	false	display.on.consent.screen
35f672af-755b-476f-9547-d9d7bc3d16f2	true	display.on.consent.screen
35f672af-755b-476f-9547-d9d7bc3d16f2	${profileScopeConsentText}	consent.screen.text
35f672af-755b-476f-9547-d9d7bc3d16f2	true	include.in.token.scope
126145f5-69f7-4cbf-a41e-32167b138ff3	true	display.on.consent.screen
126145f5-69f7-4cbf-a41e-32167b138ff3	${emailScopeConsentText}	consent.screen.text
126145f5-69f7-4cbf-a41e-32167b138ff3	true	include.in.token.scope
db047953-087f-4f21-a24e-7dec069f3f25	true	display.on.consent.screen
db047953-087f-4f21-a24e-7dec069f3f25	${addressScopeConsentText}	consent.screen.text
db047953-087f-4f21-a24e-7dec069f3f25	true	include.in.token.scope
360c129b-3063-4ce9-8b84-6ec811b8a7b0	true	display.on.consent.screen
360c129b-3063-4ce9-8b84-6ec811b8a7b0	${phoneScopeConsentText}	consent.screen.text
360c129b-3063-4ce9-8b84-6ec811b8a7b0	true	include.in.token.scope
57c299a1-732b-4fec-b557-217d1c34b759	true	display.on.consent.screen
57c299a1-732b-4fec-b557-217d1c34b759	${rolesScopeConsentText}	consent.screen.text
57c299a1-732b-4fec-b557-217d1c34b759	false	include.in.token.scope
ff7191d1-bd41-473b-95a6-561831e14f9a	false	display.on.consent.screen
ff7191d1-bd41-473b-95a6-561831e14f9a		consent.screen.text
ff7191d1-bd41-473b-95a6-561831e14f9a	false	include.in.token.scope
725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	false	display.on.consent.screen
725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	true	include.in.token.scope
f35ebce8-cc56-40cd-877a-f7e9576237c4	false	display.on.consent.screen
f35ebce8-cc56-40cd-877a-f7e9576237c4	false	include.in.token.scope
bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	false	display.on.consent.screen
bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	false	include.in.token.scope
bdc7a0da-37ee-47c8-878f-7e143fda55a9	false	display.on.consent.screen
bdc7a0da-37ee-47c8-878f-7e143fda55a9	false	include.in.token.scope
29062bb5-3dc2-43b4-9bdf-9b032f13b2db	true	display.on.consent.screen
29062bb5-3dc2-43b4-9bdf-9b032f13b2db	${organizationScopeConsentText}	consent.screen.text
29062bb5-3dc2-43b4-9bdf-9b032f13b2db	true	include.in.token.scope
65c94f63-6035-4d6c-af24-1f14e3b94a38	true	include.in.token.scope
65c94f63-6035-4d6c-af24-1f14e3b94a38	${emailScopeConsentText}	consent.screen.text
65c94f63-6035-4d6c-af24-1f14e3b94a38	true	display.on.consent.screen
5a9f857f-66df-4d72-b1c9-74e50ff4bd18	false	include.in.token.scope
5a9f857f-66df-4d72-b1c9-74e50ff4bd18	false	display.on.consent.screen
d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	${offlineAccessScopeConsentText}	consent.screen.text
d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	true	display.on.consent.screen
eea01d80-65da-4540-85c9-c22b6193479e	true	include.in.token.scope
eea01d80-65da-4540-85c9-c22b6193479e	${addressScopeConsentText}	consent.screen.text
eea01d80-65da-4540-85c9-c22b6193479e	true	display.on.consent.screen
337c3515-30b8-4e7c-881a-109f1c94a011	false	include.in.token.scope
337c3515-30b8-4e7c-881a-109f1c94a011		consent.screen.text
337c3515-30b8-4e7c-881a-109f1c94a011	false	display.on.consent.screen
b718c7ed-ede2-45f9-92d1-36acd43408d1	false	include.in.token.scope
b718c7ed-ede2-45f9-92d1-36acd43408d1	false	display.on.consent.screen
2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	true	include.in.token.scope
2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	${phoneScopeConsentText}	consent.screen.text
2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	true	display.on.consent.screen
51e71de7-0fa8-4ca8-9789-d1a240e7954c	${samlRoleListScopeConsentText}	consent.screen.text
51e71de7-0fa8-4ca8-9789-d1a240e7954c	true	display.on.consent.screen
215618ce-81df-4751-b38a-b64b011a7475	false	include.in.token.scope
215618ce-81df-4751-b38a-b64b011a7475	${rolesScopeConsentText}	consent.screen.text
215618ce-81df-4751-b38a-b64b011a7475	true	display.on.consent.screen
571bd089-79c4-414f-811d-059110e90303	true	include.in.token.scope
571bd089-79c4-414f-811d-059110e90303	false	display.on.consent.screen
19969f81-191a-4485-b659-4a5ebe01285c	true	include.in.token.scope
19969f81-191a-4485-b659-4a5ebe01285c	${profileScopeConsentText}	consent.screen.text
19969f81-191a-4485-b659-4a5ebe01285c	true	display.on.consent.screen
0ddee3ba-73b6-43bc-b66a-cf8bf520e2a5	false	include.in.token.scope
0ddee3ba-73b6-43bc-b66a-cf8bf520e2a5	false	display.on.consent.screen
984fd7c3-9b32-402a-8e99-7054aaaf07b2	true	display.on.consent.screen
984fd7c3-9b32-402a-8e99-7054aaaf07b2		consent.screen.text
984fd7c3-9b32-402a-8e99-7054aaaf07b2	false	include.in.token.scope
984fd7c3-9b32-402a-8e99-7054aaaf07b2		gui.order
\.


--
-- TOC entry 4266 (class 0 OID 19983)
-- Dependencies: 291
-- Data for Name: client_scope_client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_client (client_id, scope_id, default_scope) FROM stdin;
36589292-38ed-4b75-8b05-9d0b11f09f0c	35f672af-755b-476f-9547-d9d7bc3d16f2	t
36589292-38ed-4b75-8b05-9d0b11f09f0c	ff7191d1-bd41-473b-95a6-561831e14f9a	t
36589292-38ed-4b75-8b05-9d0b11f09f0c	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
36589292-38ed-4b75-8b05-9d0b11f09f0c	126145f5-69f7-4cbf-a41e-32167b138ff3	t
36589292-38ed-4b75-8b05-9d0b11f09f0c	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
36589292-38ed-4b75-8b05-9d0b11f09f0c	57c299a1-732b-4fec-b557-217d1c34b759	t
36589292-38ed-4b75-8b05-9d0b11f09f0c	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
36589292-38ed-4b75-8b05-9d0b11f09f0c	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
36589292-38ed-4b75-8b05-9d0b11f09f0c	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
36589292-38ed-4b75-8b05-9d0b11f09f0c	db047953-087f-4f21-a24e-7dec069f3f25	f
36589292-38ed-4b75-8b05-9d0b11f09f0c	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
a35b84ae-8974-404d-a0d8-f875605c1237	35f672af-755b-476f-9547-d9d7bc3d16f2	t
a35b84ae-8974-404d-a0d8-f875605c1237	ff7191d1-bd41-473b-95a6-561831e14f9a	t
a35b84ae-8974-404d-a0d8-f875605c1237	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
a35b84ae-8974-404d-a0d8-f875605c1237	126145f5-69f7-4cbf-a41e-32167b138ff3	t
a35b84ae-8974-404d-a0d8-f875605c1237	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
a35b84ae-8974-404d-a0d8-f875605c1237	57c299a1-732b-4fec-b557-217d1c34b759	t
a35b84ae-8974-404d-a0d8-f875605c1237	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
a35b84ae-8974-404d-a0d8-f875605c1237	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
a35b84ae-8974-404d-a0d8-f875605c1237	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
a35b84ae-8974-404d-a0d8-f875605c1237	db047953-087f-4f21-a24e-7dec069f3f25	f
a35b84ae-8974-404d-a0d8-f875605c1237	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
46e73c56-de99-42db-b502-d495a8de0d87	35f672af-755b-476f-9547-d9d7bc3d16f2	t
46e73c56-de99-42db-b502-d495a8de0d87	ff7191d1-bd41-473b-95a6-561831e14f9a	t
46e73c56-de99-42db-b502-d495a8de0d87	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
46e73c56-de99-42db-b502-d495a8de0d87	126145f5-69f7-4cbf-a41e-32167b138ff3	t
46e73c56-de99-42db-b502-d495a8de0d87	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
46e73c56-de99-42db-b502-d495a8de0d87	57c299a1-732b-4fec-b557-217d1c34b759	t
46e73c56-de99-42db-b502-d495a8de0d87	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
46e73c56-de99-42db-b502-d495a8de0d87	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
46e73c56-de99-42db-b502-d495a8de0d87	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
46e73c56-de99-42db-b502-d495a8de0d87	db047953-087f-4f21-a24e-7dec069f3f25	f
46e73c56-de99-42db-b502-d495a8de0d87	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
d614e28a-2586-4719-9d43-6d6f684491e7	35f672af-755b-476f-9547-d9d7bc3d16f2	t
d614e28a-2586-4719-9d43-6d6f684491e7	ff7191d1-bd41-473b-95a6-561831e14f9a	t
d614e28a-2586-4719-9d43-6d6f684491e7	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
d614e28a-2586-4719-9d43-6d6f684491e7	126145f5-69f7-4cbf-a41e-32167b138ff3	t
d614e28a-2586-4719-9d43-6d6f684491e7	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
d614e28a-2586-4719-9d43-6d6f684491e7	57c299a1-732b-4fec-b557-217d1c34b759	t
d614e28a-2586-4719-9d43-6d6f684491e7	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
d614e28a-2586-4719-9d43-6d6f684491e7	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
d614e28a-2586-4719-9d43-6d6f684491e7	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
d614e28a-2586-4719-9d43-6d6f684491e7	db047953-087f-4f21-a24e-7dec069f3f25	f
d614e28a-2586-4719-9d43-6d6f684491e7	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	35f672af-755b-476f-9547-d9d7bc3d16f2	t
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	ff7191d1-bd41-473b-95a6-561831e14f9a	t
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	126145f5-69f7-4cbf-a41e-32167b138ff3	t
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	57c299a1-732b-4fec-b557-217d1c34b759	t
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	db047953-087f-4f21-a24e-7dec069f3f25	f
ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	35f672af-755b-476f-9547-d9d7bc3d16f2	t
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	ff7191d1-bd41-473b-95a6-561831e14f9a	t
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	126145f5-69f7-4cbf-a41e-32167b138ff3	t
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	57c299a1-732b-4fec-b557-217d1c34b759	t
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	db047953-087f-4f21-a24e-7dec069f3f25	f
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
4f64c142-0545-44bb-9446-2a18b9c9effd	5a9f857f-66df-4d72-b1c9-74e50ff4bd18	t
4fd70fcc-3453-45c0-b754-e42d60067c03	337c3515-30b8-4e7c-881a-109f1c94a011	t
4fd70fcc-3453-45c0-b754-e42d60067c03	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
4fd70fcc-3453-45c0-b754-e42d60067c03	215618ce-81df-4751-b38a-b64b011a7475	t
4fd70fcc-3453-45c0-b754-e42d60067c03	19969f81-191a-4485-b659-4a5ebe01285c	t
4fd70fcc-3453-45c0-b754-e42d60067c03	0ddee3ba-73b6-43bc-b66a-cf8bf520e2a5	t
4fd70fcc-3453-45c0-b754-e42d60067c03	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
4fd70fcc-3453-45c0-b754-e42d60067c03	eea01d80-65da-4540-85c9-c22b6193479e	f
4fd70fcc-3453-45c0-b754-e42d60067c03	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
63a551a9-12e6-465b-9b06-83747ff64c8d	337c3515-30b8-4e7c-881a-109f1c94a011	t
63a551a9-12e6-465b-9b06-83747ff64c8d	215618ce-81df-4751-b38a-b64b011a7475	t
63a551a9-12e6-465b-9b06-83747ff64c8d	19969f81-191a-4485-b659-4a5ebe01285c	t
63a551a9-12e6-465b-9b06-83747ff64c8d	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
63a551a9-12e6-465b-9b06-83747ff64c8d	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
63a551a9-12e6-465b-9b06-83747ff64c8d	eea01d80-65da-4540-85c9-c22b6193479e	f
63a551a9-12e6-465b-9b06-83747ff64c8d	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
63a551a9-12e6-465b-9b06-83747ff64c8d	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
63a551a9-12e6-465b-9b06-83747ff64c8d	571bd089-79c4-414f-811d-059110e90303	f
4fd70fcc-3453-45c0-b754-e42d60067c03	571bd089-79c4-414f-811d-059110e90303	f
4fd70fcc-3453-45c0-b754-e42d60067c03	984fd7c3-9b32-402a-8e99-7054aaaf07b2	t
4fd70fcc-3453-45c0-b754-e42d60067c03	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
c9b985d8-1db7-43aa-aabe-35b103bce986	337c3515-30b8-4e7c-881a-109f1c94a011	t
c9b985d8-1db7-43aa-aabe-35b103bce986	215618ce-81df-4751-b38a-b64b011a7475	t
c9b985d8-1db7-43aa-aabe-35b103bce986	19969f81-191a-4485-b659-4a5ebe01285c	t
c9b985d8-1db7-43aa-aabe-35b103bce986	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
c9b985d8-1db7-43aa-aabe-35b103bce986	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
c9b985d8-1db7-43aa-aabe-35b103bce986	eea01d80-65da-4540-85c9-c22b6193479e	f
c9b985d8-1db7-43aa-aabe-35b103bce986	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
c9b985d8-1db7-43aa-aabe-35b103bce986	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
c9b985d8-1db7-43aa-aabe-35b103bce986	571bd089-79c4-414f-811d-059110e90303	f
2872ae9d-daf4-4ff9-9556-15870acbfaff	337c3515-30b8-4e7c-881a-109f1c94a011	t
2872ae9d-daf4-4ff9-9556-15870acbfaff	215618ce-81df-4751-b38a-b64b011a7475	t
2872ae9d-daf4-4ff9-9556-15870acbfaff	19969f81-191a-4485-b659-4a5ebe01285c	t
2872ae9d-daf4-4ff9-9556-15870acbfaff	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
2872ae9d-daf4-4ff9-9556-15870acbfaff	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
2872ae9d-daf4-4ff9-9556-15870acbfaff	eea01d80-65da-4540-85c9-c22b6193479e	f
2872ae9d-daf4-4ff9-9556-15870acbfaff	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
2872ae9d-daf4-4ff9-9556-15870acbfaff	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
2872ae9d-daf4-4ff9-9556-15870acbfaff	571bd089-79c4-414f-811d-059110e90303	f
26490047-2a91-4938-9324-371523ad1e14	337c3515-30b8-4e7c-881a-109f1c94a011	t
26490047-2a91-4938-9324-371523ad1e14	215618ce-81df-4751-b38a-b64b011a7475	t
26490047-2a91-4938-9324-371523ad1e14	19969f81-191a-4485-b659-4a5ebe01285c	t
26490047-2a91-4938-9324-371523ad1e14	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
26490047-2a91-4938-9324-371523ad1e14	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
26490047-2a91-4938-9324-371523ad1e14	eea01d80-65da-4540-85c9-c22b6193479e	f
26490047-2a91-4938-9324-371523ad1e14	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
26490047-2a91-4938-9324-371523ad1e14	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
26490047-2a91-4938-9324-371523ad1e14	571bd089-79c4-414f-811d-059110e90303	f
4fd70fcc-3453-45c0-b754-e42d60067c03	5a9f857f-66df-4d72-b1c9-74e50ff4bd18	t
2705a11e-bac1-40dc-a67a-12894e2a2acd	337c3515-30b8-4e7c-881a-109f1c94a011	t
2705a11e-bac1-40dc-a67a-12894e2a2acd	215618ce-81df-4751-b38a-b64b011a7475	t
2705a11e-bac1-40dc-a67a-12894e2a2acd	19969f81-191a-4485-b659-4a5ebe01285c	t
2705a11e-bac1-40dc-a67a-12894e2a2acd	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
2705a11e-bac1-40dc-a67a-12894e2a2acd	eea01d80-65da-4540-85c9-c22b6193479e	f
2705a11e-bac1-40dc-a67a-12894e2a2acd	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
2705a11e-bac1-40dc-a67a-12894e2a2acd	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
2705a11e-bac1-40dc-a67a-12894e2a2acd	571bd089-79c4-414f-811d-059110e90303	f
60946636-ed9b-470c-b900-277f4d41ba80	337c3515-30b8-4e7c-881a-109f1c94a011	t
60946636-ed9b-470c-b900-277f4d41ba80	215618ce-81df-4751-b38a-b64b011a7475	t
60946636-ed9b-470c-b900-277f4d41ba80	19969f81-191a-4485-b659-4a5ebe01285c	t
60946636-ed9b-470c-b900-277f4d41ba80	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
60946636-ed9b-470c-b900-277f4d41ba80	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
60946636-ed9b-470c-b900-277f4d41ba80	eea01d80-65da-4540-85c9-c22b6193479e	f
60946636-ed9b-470c-b900-277f4d41ba80	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
60946636-ed9b-470c-b900-277f4d41ba80	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
60946636-ed9b-470c-b900-277f4d41ba80	571bd089-79c4-414f-811d-059110e90303	f
cdd87e47-0556-4612-95ad-122de3a09b8f	337c3515-30b8-4e7c-881a-109f1c94a011	t
cdd87e47-0556-4612-95ad-122de3a09b8f	215618ce-81df-4751-b38a-b64b011a7475	t
cdd87e47-0556-4612-95ad-122de3a09b8f	19969f81-191a-4485-b659-4a5ebe01285c	t
cdd87e47-0556-4612-95ad-122de3a09b8f	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
cdd87e47-0556-4612-95ad-122de3a09b8f	eea01d80-65da-4540-85c9-c22b6193479e	f
cdd87e47-0556-4612-95ad-122de3a09b8f	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
cdd87e47-0556-4612-95ad-122de3a09b8f	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
cdd87e47-0556-4612-95ad-122de3a09b8f	571bd089-79c4-414f-811d-059110e90303	f
36b9332d-e925-42e2-bef4-6e9271695118	337c3515-30b8-4e7c-881a-109f1c94a011	t
36b9332d-e925-42e2-bef4-6e9271695118	215618ce-81df-4751-b38a-b64b011a7475	t
36b9332d-e925-42e2-bef4-6e9271695118	19969f81-191a-4485-b659-4a5ebe01285c	t
36b9332d-e925-42e2-bef4-6e9271695118	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
36b9332d-e925-42e2-bef4-6e9271695118	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
36b9332d-e925-42e2-bef4-6e9271695118	eea01d80-65da-4540-85c9-c22b6193479e	f
36b9332d-e925-42e2-bef4-6e9271695118	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
36b9332d-e925-42e2-bef4-6e9271695118	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
36b9332d-e925-42e2-bef4-6e9271695118	571bd089-79c4-414f-811d-059110e90303	f
4f64c142-0545-44bb-9446-2a18b9c9effd	337c3515-30b8-4e7c-881a-109f1c94a011	t
4f64c142-0545-44bb-9446-2a18b9c9effd	215618ce-81df-4751-b38a-b64b011a7475	t
4f64c142-0545-44bb-9446-2a18b9c9effd	19969f81-191a-4485-b659-4a5ebe01285c	t
4f64c142-0545-44bb-9446-2a18b9c9effd	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
4f64c142-0545-44bb-9446-2a18b9c9effd	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
4f64c142-0545-44bb-9446-2a18b9c9effd	eea01d80-65da-4540-85c9-c22b6193479e	f
4f64c142-0545-44bb-9446-2a18b9c9effd	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
4f64c142-0545-44bb-9446-2a18b9c9effd	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
4f64c142-0545-44bb-9446-2a18b9c9effd	571bd089-79c4-414f-811d-059110e90303	f
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	337c3515-30b8-4e7c-881a-109f1c94a011	t
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	215618ce-81df-4751-b38a-b64b011a7475	t
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	19969f81-191a-4485-b659-4a5ebe01285c	t
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	eea01d80-65da-4540-85c9-c22b6193479e	f
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	571bd089-79c4-414f-811d-059110e90303	f
\.


--
-- TOC entry 4244 (class 0 OID 19502)
-- Dependencies: 269
-- Data for Name: client_scope_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_role_mapping (scope_id, role_id) FROM stdin;
38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	89732194-ddc7-428d-9a03-c103e6c9831a
d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	514784fb-7137-4134-bad7-db373e7d398a
\.


--
-- TOC entry 4262 (class 0 OID 19738)
-- Dependencies: 287
-- Data for Name: component; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component (id, name, parent_id, provider_id, provider_type, realm_id, sub_type) FROM stdin;
9826067c-09e3-4ba1-a9a1-cdd7c40e764f	Trusted Hosts	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	anonymous
70f4f50f-1171-4f59-8aa3-7fd4b885554d	Consent Required	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	anonymous
19c2aa43-1386-4ced-a6c9-f89f7ab0216b	Full Scope Disabled	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	anonymous
b10ea2cd-8e10-419a-98ef-291150818534	Max Clients Limit	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	anonymous
d10a4d6d-9050-43f1-a9bb-75f68d9172b1	Allowed Protocol Mapper Types	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	anonymous
d65d21ed-273b-40eb-aaf5-b3165dba421f	Allowed Client Scopes	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	anonymous
5aa951ae-3760-41e9-83c2-2d5858187562	Allowed Protocol Mapper Types	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	authenticated
e6f03cf4-46ae-48a4-a6e2-b7f628278967	Allowed Client Scopes	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	authenticated
25d1109f-71fc-4fec-a50c-e67e39c11ba8	rsa-generated	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	rsa-generated	org.keycloak.keys.KeyProvider	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N
d02caf50-2b39-4d6d-9757-806293c2cbe9	rsa-enc-generated	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	rsa-enc-generated	org.keycloak.keys.KeyProvider	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N
afac4c92-3f00-4aee-8bf2-bec36946b480	hmac-generated-hs512	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	hmac-generated	org.keycloak.keys.KeyProvider	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N
eac7518a-9b90-499b-99e9-778db5adf7b9	aes-generated	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	aes-generated	org.keycloak.keys.KeyProvider	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N
00d71650-1338-4311-ad0f-7aa6c25fc3e5	\N	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	declarative-user-profile	org.keycloak.userprofile.UserProfileProvider	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N
32611d53-6e58-45ba-9f7b-72b590a538fe	Consent Required	BookingSmart	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	anonymous
f888a4c5-4512-46a3-96d2-8d6ad063a443	Allowed Protocol Mapper Types	BookingSmart	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	anonymous
2d3731aa-f5f7-42b6-bede-6f82d347913b	Allowed Client Scopes	BookingSmart	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	authenticated
d47cb88e-2a27-425f-b96b-1c4640d31522	Allowed Client Scopes	BookingSmart	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	anonymous
f1a4c9f9-a63f-4db9-b937-aa5f557d41e5	Trusted Hosts	BookingSmart	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	anonymous
126efd47-9cec-46e6-b528-5bceb453f893	Max Clients Limit	BookingSmart	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	anonymous
87a66d4a-9995-4a93-b1bb-5aa1383ccece	Full Scope Disabled	BookingSmart	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	anonymous
8d9b43e5-51cb-457f-a042-a0e4816f014d	Allowed Protocol Mapper Types	BookingSmart	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	BookingSmart	authenticated
3a02f25a-6b5a-490a-9ad8-e315ac1f600d	\N	BookingSmart	declarative-user-profile	org.keycloak.userprofile.UserProfileProvider	BookingSmart	\N
7b811bf0-3c37-4528-814e-54e03726c2ab	rsa-generated	BookingSmart	rsa-generated	org.keycloak.keys.KeyProvider	BookingSmart	\N
2a3bb174-df5a-494d-9fdb-23ecf4823d13	hmac-generated	BookingSmart	hmac-generated	org.keycloak.keys.KeyProvider	BookingSmart	\N
d61d5c4a-e654-4072-a792-9e107a6485e4	hmac-generated-hs512	BookingSmart	hmac-generated	org.keycloak.keys.KeyProvider	BookingSmart	\N
2ab9adec-59f0-4f5e-9f2f-8dc3bff23e5d	aes-generated	BookingSmart	aes-generated	org.keycloak.keys.KeyProvider	BookingSmart	\N
5662273c-09e8-4734-848d-617184a5988e	rsa-enc-generated	BookingSmart	rsa-enc-generated	org.keycloak.keys.KeyProvider	BookingSmart	\N
\.


--
-- TOC entry 4261 (class 0 OID 19733)
-- Dependencies: 286
-- Data for Name: component_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component_config (id, component_id, name, value) FROM stdin;
fc13bceb-8d58-4253-9997-f6d3d5e361d2	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
6eaa41a1-a6c5-4e20-b348-c5c14e0e1b7c	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	saml-role-list-mapper
4067c12f-cad7-43bb-9bb5-83d40815d8ee	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
007b5dd2-0bea-4881-9dac-bf004b7d9916	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	saml-user-property-mapper
e9529d5d-ec32-45ef-a8a0-3cebc947bb06	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	oidc-address-mapper
8a6740a0-6ed2-4978-9e04-d7bf9ee3271e	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	oidc-full-name-mapper
fe9fc01f-bea0-4d1e-b0b0-2c5293aa3085	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	saml-user-attribute-mapper
144b3bf1-5f71-419d-9917-a8b56e2b75e2	d10a4d6d-9050-43f1-a9bb-75f68d9172b1	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
8fcb24b7-b5c0-4a6c-a167-76af2a40cab4	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
77abd6a5-431b-49c4-a0e4-53c1ecd9f430	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	saml-user-attribute-mapper
24baae02-90c7-4a48-a7a0-96cee79cf1db	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
98929e67-42e6-428c-a255-af9702d2dbae	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
0c933adf-160c-42a1-8657-73c35c8137bc	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	saml-role-list-mapper
85d497f4-e4b5-4295-8c4f-d2c8b606698c	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	oidc-address-mapper
ace99943-af39-42ce-9a58-13473647c62e	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	saml-user-property-mapper
1c0acdf3-9999-4d7b-b5d1-4835bbc3c385	5aa951ae-3760-41e9-83c2-2d5858187562	allowed-protocol-mapper-types	oidc-full-name-mapper
6b31a6cc-59d7-4acb-b8ed-934bf31d3974	d65d21ed-273b-40eb-aaf5-b3165dba421f	allow-default-scopes	true
df059517-5fea-4ecd-8691-0b9074323b62	9826067c-09e3-4ba1-a9a1-cdd7c40e764f	host-sending-registration-request-must-match	true
b642f95b-bc97-4394-8a4b-c11c3d34c14b	9826067c-09e3-4ba1-a9a1-cdd7c40e764f	client-uris-must-match	true
9085eb64-3754-40b3-97cd-f07df20dabaf	e6f03cf4-46ae-48a4-a6e2-b7f628278967	allow-default-scopes	true
5c9b38ee-d3b5-4b55-ab7e-d8669c98f673	b10ea2cd-8e10-419a-98ef-291150818534	max-clients	200
17e831db-cad5-4df5-ac4a-e669a8cef7ff	eac7518a-9b90-499b-99e9-778db5adf7b9	priority	100
f456dd19-e4c6-4294-84b4-468e51809b3c	eac7518a-9b90-499b-99e9-778db5adf7b9	secret	zCa1c-2h7rHE5v1eEvv_Dw
47f3f4c7-dac8-4ea0-b88d-ed2881487828	eac7518a-9b90-499b-99e9-778db5adf7b9	kid	7cc2f784-df27-49d6-a1de-4b8f2e84ee92
7e0df4b5-ee33-4e55-b8de-1b2908a624fd	afac4c92-3f00-4aee-8bf2-bec36946b480	algorithm	HS512
f948b09d-8bef-4d81-a7e5-dcd021af0d45	afac4c92-3f00-4aee-8bf2-bec36946b480	secret	WauqVz_miSPIpAH42osUvP1jDx4zXtyS1Nl3nmYkPbMpD-CE3sDIfwMYiI0_TkzShq2OEsPFr7VsgpSsO-c0Gru3Xd7Z2L0-jSCBvK27F3leX7BCwBUJAiGCjSto0vnP-va0bq6SaHzD-hOw97zmXTNjs4MpyKG5O2KbmuWhJjc
4bbfd6e6-c678-4910-9c3b-efc706fb2112	afac4c92-3f00-4aee-8bf2-bec36946b480	priority	100
23b010ba-cd4e-48a3-84a2-9d175548be85	afac4c92-3f00-4aee-8bf2-bec36946b480	kid	abc1e5b3-b079-4913-90f2-39c1748c6bae
d799065d-9f59-4bc2-b69c-5bd90be36a22	25d1109f-71fc-4fec-a50c-e67e39c11ba8	privateKey	MIIEowIBAAKCAQEAsPnMVqw5GUa6uSMN9hIpKwVOLX802woWTZlCjuVyIjfw7nIXECzZ/6IwkqLmxWuUopGQ3fb07z4tX47a13sCIwXCifv8ec42klWKvzZER3HX4g0or9SIkYyWLvwCGL2M6/OsJfl8NISvlURrjZj3IfTmpNIF/E2pTloN8desHEdFyNI2J0Wa1CrP3Fud9+15NhUEMOD6AkHgwSAyx8Dko0BTYEtRQ0MYFf8pqnjWMX8fUXb+cNlCQMKiMUs+ULdmt0A1RPUKZAr+I9RnRAT6nrsS7sPGc40I2Uzm9oHrCn4QN5scoERC8byBoz48tTE6GClfI0bH7jmuhCCgw4tWwQIDAQABAoIBAAUKuVHt8DagepHrIhb4zosiEJeUi2XbAT6YxWYA+rvnhUfUSJScjAGDwkuvrBibUXvCDxcZRcIt/rS9cw3y9FkpRSEJbKB/XdP0f55l5EsnJszzBjXv7Yv8vfO4yJIiDpJzbcPjUijkf7R2W4RwO2hwZ8yh2oN9Fovvvixl4iqIJ8CR4SuaPkDb7WFN+jYcAvKysAuciqU1SE/kHSHu3IlGeF61nDW4YpSKeloAOc5zGDwuUgyXyUkILciINQk94noqBDqtmFGB8RRxSciMAWvUvcqLctsQyTSC3hl0XDoK1mvitHeKyC5c+65CCmIJ8lS/lZ4DTDpWzoz3lNzIb+ECgYEA47zdPc307pTi/wpv7atamne0UNisCd11qOMfEGqq7xecIEKhQNSRchyKUulDz56eBsmgaH7D1DLVOEQAv52yZqDDtQuPmMmin4sXRRFqoZVktQWse2gNffdPdKNR5xZY/epeugr8LcCpVpJpB/0THol+7b6NWMpqViEkGVpGFyECgYEAxvA/IbLzZZUKWTA9Fn2wZZpHAp0sv75RGRDwS9ilPZd3ZU3WBP1c0QiGwnB9QQ/g50UR9kYn1jCWVbILAdp63WIkipVuRVLRJR2b/pWKaJ78MNJT3OmWJ41Iof3FyyAyJ0mobpkRxe4Pf66Q/9WvKNFImACxFrfuxqsLzlRMa6ECgYA9VFI8X6eTTJMo3bWwypGWwZ/UmdUSvwn9llR6Rk+MHc6UvXzRia01jswNcfYqBmxGJaxGF8VC8wGKqn2NHLm7e5XYvqlIGxzpXDrDBeKyaxn4yfNeNHJVtvE11vmqgtEqaCBkd6rb42N3Bey1EwlAEwUUn1lPTQt/8GLZVP9FIQKBgE8NBGklrOY+tR//tSaMx114UqNNRYzj2WH2gyYAbpjs6TrOFS9iZlGB69qzzHHgF2SO47ZS5l2MbRCccRdJc+0opJCVFH5jjEwNWgFt9tPf6SKVUVHFWC9bSvNj3gb7QjKuaEmadZ+LG4mHGoMurC2yDACqtbPrXux+53ATu1JBAoGBAMeDCDdjPSfQ2V/AIOJbjWPTTF0k6tPaoEbDjmz3n+fFmiPD0wlSgManu/BZkjOd7FtoaFYvKex9/gjzmbmdqdMJDA62ppRoGUGkCBQ/kV2MV04UnXnH5MNEESjzyIP6tBiRwoK7isVj6FjEYNonoVzMFuDYLrVlRi7ZIqM8tHQj
a405a68d-d312-4c43-946e-05c80e0c361d	25d1109f-71fc-4fec-a50c-e67e39c11ba8	priority	100
403d5388-6f7c-40b8-81a1-719b43006a6b	25d1109f-71fc-4fec-a50c-e67e39c11ba8	certificate	MIICmzCCAYMCBgGX7smiNTANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjUwNzA5MTA0MzAxWhcNMzUwNzA5MTA0NDQxWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCw+cxWrDkZRrq5Iw32EikrBU4tfzTbChZNmUKO5XIiN/DuchcQLNn/ojCSoubFa5SikZDd9vTvPi1fjtrXewIjBcKJ+/x5zjaSVYq/NkRHcdfiDSiv1IiRjJYu/AIYvYzr86wl+Xw0hK+VRGuNmPch9Oak0gX8TalOWg3x16wcR0XI0jYnRZrUKs/cW5337Xk2FQQw4PoCQeDBIDLHwOSjQFNgS1FDQxgV/ymqeNYxfx9Rdv5w2UJAwqIxSz5Qt2a3QDVE9QpkCv4j1GdEBPqeuxLuw8ZzjQjZTOb2gesKfhA3mxygRELxvIGjPjy1MToYKV8jRsfuOa6EIKDDi1bBAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAC2A64zpCn5MwAH8IVYyKEMnjO3o9Ll6SIjvPr0kglETgLfhDCxi0gF2WvhI2Oi/RxyPmpLsWHm4+PsQJrPlOIPsnXCIj57U6DPVbx/1/6eBr33/MRvG+/Hk55ePrFyvzoSk3YLSv6AMLUpaxYv+/WCVgvQNyL7SssgwjRusx6aeLhNieNydQnFVMPtslkmZLVo2g5oiX3b9pQBHdm4LVHa+40VWIxYWiRjWuylIdc4tPNsHmTUdFEp5uKcDUYO1SBvFSPSS6dO8Egs7HQY+9V1mc4YzPG/NW/s42yyoCrNCDc3ike6K2nhUZJs0V5Ufo2aDopxOAaT8LLnpaWb4qDM=
8ac412ab-b3b3-4938-93ef-dbc648910200	25d1109f-71fc-4fec-a50c-e67e39c11ba8	keyUse	SIG
4b28362f-3758-4af8-b4b2-17e3b096c862	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
3e9fcc73-6a79-404a-a974-2ab804ce744d	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	oidc-full-name-mapper
09886b3b-3577-4649-9e4b-25a1eec51e5f	2d3731aa-f5f7-42b6-bede-6f82d347913b	allow-default-scopes	true
31d76dfe-dee7-4fd3-a3d7-903b865514fc	2a3bb174-df5a-494d-9fdb-23ecf4823d13	algorithm	HS256
53c323fc-b2a6-4984-91b7-688adb6d1b4a	2a3bb174-df5a-494d-9fdb-23ecf4823d13	secret	PJEawbOyUuusPyGZSeP_nrlPUVuW3xaEYhqVIfCXszs50C2bMuYdJ-oCediFCq4JVGObVlPND2kx8Sau8NMCpvoLhkB3UpI1SY6MHvNZWEznSf5JsPVoG8yby2bveeukugRpFlhlV9qCydirLBJt5Lez_E1O82GLn0T_kDSrwvg
5e4ee049-2899-4422-807e-32f15376960e	d02caf50-2b39-4d6d-9757-806293c2cbe9	certificate	MIICmzCCAYMCBgGX7smjFzANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjUwNzA5MTA0MzAxWhcNMzUwNzA5MTA0NDQxWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+WtGeIFjVHOwzxwznoZEcbN0PMH7cM/CK2qopoYkZRShSm02prE+z4AkC3BSlYf8n7oM7nbWdiP4ZGVwg5v2Xsda+Ac1YwZU2RmN85rwX5jxoEuYesHHab7MegU5T+3oqx+hO/GjkHa38PBvLU4PNStHoCjE7YDX5H6bUeBA/j+Y0viJeHBZsY9hv1p+J6jt98G1dmYvwA9Uu3+Duh/TFMqhu04i1ztlYxBoodoYDpLnie7P89Lqz4VBPN8mQXqC3M4AT1KGGKlFBuIIAqio3ORaJW6CaH0YsOO5c4X7H2bpHRuzeZhQ/bvHOcma6fRGrKzSP23egTwbOzR9vO3kxAgMBAAEwDQYJKoZIhvcNAQELBQADggEBACilysUgAz7APKfImhaXvWjyFeW2IVj1b+SFec1eY74M+vbfWVux4m0KpehsYwvJ24XfbnqrNhM5XEoQ+2bqJqLgb6XgaLj1Ya5vjC6U1uTYHhHZPwyMSUvXpQV6t6aLrsiK55qOBKoBlayjS5HbvdAf5zUQQtkgXmnh5xxry/EAkyYclmssGjlsgNySfi+15WuKbOc8R1k88bOn+hH4vfUw1Z8MSKRT5dUf4/iRoiLaHOOX7gcPGns6UWOLGZa9Ij9WVbfIOueh1+DJkvqFPZtDLXqVwfICnuDg5QsEGSkA8TvKoYNZumgwtPHpdL/zrOI4Dq1UybnQArCXvCxTBxI=
4a17b9a1-c9dc-4723-9ee6-adf41f979217	d02caf50-2b39-4d6d-9757-806293c2cbe9	priority	100
cc9cb7d8-3f9e-47d5-8f64-1f1e8aefea52	d02caf50-2b39-4d6d-9757-806293c2cbe9	keyUse	ENC
12a8fbb7-60d6-44ec-b043-9ce2d6db78ef	d02caf50-2b39-4d6d-9757-806293c2cbe9	privateKey	MIIEogIBAAKCAQEAvlrRniBY1RzsM8cM56GRHGzdDzB+3DPwitqqKaGJGUUoUptNqaxPs+AJAtwUpWH/J+6DO521nYj+GRlcIOb9l7HWvgHNWMGVNkZjfOa8F+Y8aBLmHrBx2m+zHoFOU/t6KsfoTvxo5B2t/Dwby1ODzUrR6AoxO2A1+R+m1HgQP4/mNL4iXhwWbGPYb9afieo7ffBtXZmL8APVLt/g7of0xTKobtOItc7ZWMQaKHaGA6S54nuz/PS6s+FQTzfJkF6gtzOAE9ShhipRQbiCAKoqNzkWiVugmh9GLDjuXOF+x9m6R0bs3mYUP27xznJmun0Rqys0j9t3oE8Gzs0fbzt5MQIDAQABAoIBACdZODAG8T36eNQaLy95fTjiQw73AB5OSUi2u0qYRvIXkuaCjnsGsMIWy14RNt5aA8fSHMQXzXlXXmk7TglKHn07SI/l6PgSKiE6SyoAOzz4fZ+o2nNZF2vnP6BMa+/d0crioIGlWRxgizzTAw7UgHARKZNc+gDTWkzZT1/nwroUjhUsCqBAeO4TRVx5fEoTSkmyuWhz3DFC92SmvmlkM17ZtRSm95n4dxS1dy5zA3O4V/ZoE2HDLJIIJzAaaVY/T05pjfZFNETvoAOZ0sBnixO2lwVjlaAuu74ZiOXJqfeiXf+4SHcRLLCiCZoh+vYgIKnZnR77Nm00AFMg3VIVAC0CgYEA7/ndF5aMQSxdSr/ufu5D0ENVmlSlviDuGISZK8FBn51KkD/LzIrOl9jEfh3Gk3OyCY0nDrACOLF/P0UVI5PZ3Ln5i78n1SQg2w2Tn5T39RECJPTnvPlQcIa72Tc8m0zxylSYAxMvdpYPQmTeMlGn7HgasELjz6ZlUrELdpfz7BUCgYEAyxC7abPCxoFEj1OW1nN0fJEltF3nFp7tlnaGUDCOUeLBxxmfuhJUdr96DIH/h1PuSrX/IwidhcVGpdjkoBtCz1eKqkXPO3vzg5Z7Q76WENzOh5GxF0qwNrLu5Lya3R2dkjCTELby1mmUGb3bcagmQlpcJaxKdYTBA3KHXldZ860CgYAmVn6x1AVYLCRDWuJZOOtwjDFS1I8eDti65gQqb1dyjoho/ygp50sWCzVpCIy+5c7do8VHnWrdb83qZ7j21BoMH1H0t3c/n+P32vVomz350tvK161mDVaCg6PjEeYG0YYXUuhuJVSB13tcmgy9cToolw98dVM7y1OIoGw6aBA5+QKBgE6H9QKm61+bZGlNeVsMIXN/Kqa7XgBIjDeRNNZUQOX4HNqj1Tq/lfyqhkfKColKczBffAEPduPh7DV9UMV+ZXMMNussvj0R7ZXpH1iOnzh8PD7/oA4S61zsDClXq0hyCJsdv/JJ3lX/VLAz1Wb6EXm9uj8zh0Q1h/OOWj2o6HetAoGADOgRct6MdyGK+n8cJ3RBdvRH0ZnMRrAWMzBZEIV9/2HgRWnM2plHOojq1RydNUWutU6q5PLJh3JpnMg3D4lzv0Fnhl5pdCNzA1mX69MaqPm0p2l/5b0AX5hwcLiQVRTU89ujAzYSPSdEwxp82f1PNb4QOCbxjbpmaxfih4dl9kY=
9ce1e51a-a130-4512-8fc5-1d6409fa1eb1	d02caf50-2b39-4d6d-9757-806293c2cbe9	algorithm	RSA-OAEP
d5f13aed-ffec-4548-a306-f1abf0e50115	00d71650-1338-4311-ad0f-7aa6c25fc3e5	kc.user.profile.config	{"attributes":[{"name":"username","displayName":"${username}","validations":{"length":{"min":3,"max":255},"username-prohibited-characters":{},"up-username-not-idn-homograph":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"email","displayName":"${email}","validations":{"email":{},"length":{"max":255}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"firstName","displayName":"${firstName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"lastName","displayName":"${lastName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false}],"groups":[{"name":"user-metadata","displayHeader":"User metadata","displayDescription":"Attributes, which refer to user metadata"}]}
ce5e1bc1-8abb-471a-b66c-7dac224be417	7b811bf0-3c37-4528-814e-54e03726c2ab	privateKey	MIIEowIBAAKCAQEAvkC/3TGuu0ulJo75hj2m+Bl8Z4D07XP1yAQRk6wzwb+gV01THI8q+s+oz1uQ/1X8KVJWJTm0VvITeBkUUJIp7KGw+kI0M8BaEtNa50N+Z5i89RHY0EpkIW6BX4dQTyU7RJRT8rIvNYB2tJBy/UJbjZCxCTDPnc6RvnOa20muFgvKzzrS1grE1+o6f0cXE2NIM8QZlqgncUYmXr7ymO4UNYAprj7fQwDtFhi+uJIAWCjPRDvAJUN5pKT09RPFQ9SrTNRxjta5mwFVD8+0CiM+Rxk6iyms4szqLmsaVU9gCEWQuhguaQmoiAr7q0iEU7zAn5PPqelzprJt8xKomRZIfwIDAQABAoIBAD9b7emarZ+3afkk3UmNB6mRR0JrCmZ3207wt+/Phe8Mw7e/SyH0NfKQLJ5d1rSKLK+QOZstE/dup/gzlfXdL3QcRwWY/ayMbxLc62WgLx0OG0OcXXHEjIMru48WT7MD6bCFm010dM9jCGVKw9i+/CFxodu3MzVRQW1FL7m+2GiDktBUU47c6iX65ZOLiNMQAqg+QvXu9DIkEB9F35emLtaaOkg4Sorni3hX90ZyGTTe6Py14jSMSGKODug8dfKRu8D093E/UaTbbT+yVWhJB8p8e5PLoj3hZGd3JQfd+pbV8FJOQ5sJWSrnNXdKBaWOauS32IcwdhYnSLGUnO5jzIkCgYEA4YRgjDEpIuMo8nHFtMGAjrSLeEQ6UPjtN1Z9xnb6xB+QhqqNUNacLOY70Sxx6IK2mfgUlzl/Iaer5UGR3VQfC/DyTFyGmoChfg0kyM/5gdtIixxGs4ku5iu6n8aXMTIWDPSC9/pFmJEDoyrmFUwckxqztkgrMrqYit0N3jwjoEkCgYEA1/geIEBj27B9R5QR08h3R92MzEXTqj/JAsrW6VbbyKeaS4aEPhqjfKT/2E50I2k6tNLuX3mm21X867ZCcSKB4t2AnFRcQD+MxKKG04bMO/XodcSmRiFrjW2OK5hU42O00si2rvphpnrB1Tzhx9IHBxMIbAPX9hHcDSw1BwoKsocCgYAt5Z0oqxCuMwEwZotQQFmDsab48RnVRPQyYP30GF7s72egoLFmFGdwk+L0rVD5ezDioSS/qkn/dXp8jB29p9MxwPXvKJ2UcD1txAsKe5lSHmjjNvwEqhTLb3bp8abvsjveoxzMjzj+1fShjqeJChZ+sd6FaKayClvlVxvtcNvnUQKBgQCbn85NnTiX4RiVkKw7+PODFLHVrOd2gdoeKf4tTIq5j5SOodL/UYDHW7qEqxvjPHuyO2DL6cSDvvWvALnl/mCsEsMPY3bKUUDlnNwc5sCa4HtvCZJrbL+svOo6nd1lsb5mOX3ynrfpGAI+300vCThJL7zc4PQo+/uefmGDvgexVwKBgCNGRndNGH6vqZXmehztFwyE6xXjYEpaRnXhxzpjd9g0oIIH/P83Q2pG7v8Gvd4UWJ5eDhXEKEvu/5Tu5FoiViVCt4VTP9Lzhn0/mb3+ttQJdYmuKU0aqmBmhmxD9Q+qL/jYt2muXOiE/MaiLX8W2V9Ms2/T5Zw1f/6BKGn0XA2t
84a23d48-2ee1-44f9-819a-27bc5a87ab1e	7b811bf0-3c37-4528-814e-54e03726c2ab	priority	100
d99cb88c-b616-458e-bfd9-29f1898b7af9	7b811bf0-3c37-4528-814e-54e03726c2ab	certificate	MIICpzCCAY8CBgGX7smsZDANBgkqhkiG9w0BAQsFADAXMRUwEwYDVQQDDAxCb29raW5nU21hcnQwHhcNMjUwNzA5MTA0MzAzWhcNMzUwNzA5MTA0NDQzWjAXMRUwEwYDVQQDDAxCb29raW5nU21hcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+QL/dMa67S6UmjvmGPab4GXxngPTtc/XIBBGTrDPBv6BXTVMcjyr6z6jPW5D/VfwpUlYlObRW8hN4GRRQkinsobD6QjQzwFoS01rnQ35nmLz1EdjQSmQhboFfh1BPJTtElFPysi81gHa0kHL9QluNkLEJMM+dzpG+c5rbSa4WC8rPOtLWCsTX6jp/RxcTY0gzxBmWqCdxRiZevvKY7hQ1gCmuPt9DAO0WGL64kgBYKM9EO8AlQ3mkpPT1E8VD1KtM1HGO1rmbAVUPz7QKIz5HGTqLKazizOouaxpVT2AIRZC6GC5pCaiICvurSIRTvMCfk8+p6XOmsm3zEqiZFkh/AgMBAAEwDQYJKoZIhvcNAQELBQADggEBAGqh3TzmPB1w/ahdHgPTeDmmC/gQl7hiD5PhnFkmur7nGTtzMxO4x3fluRUqAK4+54ic4TV8OMefqfI6t8VoZ9dlFqacEBicDY4atUKVcs2xRZ6Ul2NzSQp9rhkbw7aCRLrO/WzcUNiUArhOYNGEhzYi46glJcHSGFIBH0mWhULdA5mNXVuHNMvliZUylJ9MlpW0DCpRMBERzCsFqlaiV+0Hdt/rf5W2qXMWh9Rrn0yMdbqbBNG3feqt3aus0Uo6zXcDhofK+9G56WkovxRcsfksulMLhviEkzvSUMtmS23Ru9CNlmwokULAkXX1vowvHS5TtUfE0efdAeo24CSB8tM=
b604f695-a39a-4e09-a153-78bce4899a6d	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	saml-user-attribute-mapper
0d37881d-c571-4a91-b723-585f8dfde2bd	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
161f92f5-864c-4b55-8737-60865ddfa3a4	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	saml-user-property-mapper
80767af6-7591-4459-bc40-c823934ce01a	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	oidc-address-mapper
150bb4c3-c909-416e-901d-7a2a01958276	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	saml-role-list-mapper
0200e4d5-f41b-42e5-b3a4-a67b40ca2aa3	f888a4c5-4512-46a3-96d2-8d6ad063a443	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
75102af4-e050-4320-bd9e-7864f1c878f6	2a3bb174-df5a-494d-9fdb-23ecf4823d13	priority	100
ee313afc-0447-46ac-93ae-a86fd76199b9	2a3bb174-df5a-494d-9fdb-23ecf4823d13	kid	0401cd25-ae77-48c9-9896-f18da1406716
ca5d25b6-9e69-4f8e-81e4-473f313210d3	d47cb88e-2a27-425f-b96b-1c4640d31522	allow-default-scopes	true
e003ae80-1ed9-451b-aff2-c86e09664cfd	d61d5c4a-e654-4072-a792-9e107a6485e4	priority	100
9bdc9f40-c517-4b26-9745-bb8a22e5aeb3	d61d5c4a-e654-4072-a792-9e107a6485e4	algorithm	HS512
c9e0ef33-a2e1-47c7-92bb-b85b58550a96	d61d5c4a-e654-4072-a792-9e107a6485e4	kid	7ac42035-e543-4c19-81e2-aca8c9e0b55f
ae5b2c8e-a2ff-4f35-a0fa-709f4ea43a56	d61d5c4a-e654-4072-a792-9e107a6485e4	secret	LoRCAxQUfrAmzJKhA6YPSBFwz4R7wyLbDi9eOjV5hK8mI87TfHBbLStoQFd-bkBYhdJDVVyYAqPs1ZpFbkQPGSaQub3m7Hp2RAcZkOlzOdT2Icbjg7VDqnUMqXtyEK63ghBdncx7GrCm5kTgujFdUDiGIgn5IO6Oj5m5ZyNAQBM
cacb4053-0ade-4fa5-b211-f161d2943402	3a02f25a-6b5a-490a-9ad8-e315ac1f600d	kc.user.profile.config	{"attributes":[{"name":"username","displayName":"${username}","validations":{"length":{"min":3,"max":255},"username-prohibited-characters":{},"up-username-not-idn-homograph":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"email","displayName":"${email}","validations":{"email":{},"length":{"max":255}},"required":{"roles":["user"]},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"firstName","displayName":"${firstName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"required":{"roles":["user"]},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"lastName","displayName":"${lastName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"required":{"roles":["user"]},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false}],"groups":[{"name":"user-metadata","displayHeader":"User metadata","displayDescription":"Attributes, which refer to user metadata"}],"unmanagedAttributePolicy":"ENABLED"}
ab7e0c64-4468-420c-8105-55df9c7a65ec	f1a4c9f9-a63f-4db9-b937-aa5f557d41e5	client-uris-must-match	true
14688efb-c772-4a2c-9b15-aa26c68da9d0	f1a4c9f9-a63f-4db9-b937-aa5f557d41e5	host-sending-registration-request-must-match	true
448cc3ac-50e0-41d7-8d9f-687c77425ae9	126efd47-9cec-46e6-b528-5bceb453f893	max-clients	200
27270ebd-01dc-4801-8cd6-d5567782b7d9	2ab9adec-59f0-4f5e-9f2f-8dc3bff23e5d	secret	FetCaR-l4iZ3RsErTDZxMQ
3235610e-c876-4599-92c1-e41823fb25d8	2ab9adec-59f0-4f5e-9f2f-8dc3bff23e5d	kid	eb710efb-49eb-4c6c-b3a7-16255d0c95ab
177081c9-dd14-4439-b76c-12b39784d41a	2ab9adec-59f0-4f5e-9f2f-8dc3bff23e5d	priority	100
3cda8939-fdd6-44d6-b5fc-38f8d4483444	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	saml-user-attribute-mapper
ce33bd00-94d4-4171-841d-9606407d0ad6	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	oidc-address-mapper
a0280fd3-074e-471a-a279-cdd67e5ef15d	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	saml-user-property-mapper
b692a8c7-f6e9-4b49-9120-b05d7bb75aa5	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	oidc-full-name-mapper
31b41ad9-44cf-4cc3-9e34-14a2e4582b0a	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	saml-role-list-mapper
bff972a3-9c36-4d1c-ad29-7ff952a95e9f	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
234d944a-1647-4995-b830-22b2c3967095	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
9d2d2030-9097-4251-988e-7cd6a07c6aae	8d9b43e5-51cb-457f-a042-a0e4816f014d	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
d2595232-d423-423d-abb4-cd6d097fe14c	5662273c-09e8-4734-848d-617184a5988e	privateKey	MIIEpAIBAAKCAQEAmV0bvJNz6XeZujd2eilk0QMnOHxqeRyMKVZLm35hq/QLsV2ssK5pic1yW+HoNLw70LcQPfaJpVNowHPg2OAFGMlQSh1g5H+L53e/H4vfhskNmGJIqIPnTIdYhElefeKNZ7HtDs4qe01qPZrqWn49tZzlgrPIEzx0PZ2X4f7aqJH+m0WtJ/2Q8VrRaPoHkcN89mkFVZyWjtlmy9/kaVnIFMWXfC3PtMnYTlOl5h/1reiSr58yDcx8Brta6BDRVN4K7NpUdEKy4pImTeidOnYtqYMpYLvSbbgt5ln15AJOAWx/p8OrcUs79bBxMYK6UOr87uJh+J4VIbeDoqoqvGH9DQIDAQABAoIBAEMuo2jfWyaJ6wDFLRRkr7JT5El9TxMQ62FsWSCbo2O1O64N8AlRzg+8vPz9IECBuN48Y1QRfMi8miW8XWID+JecEJz286wFJ59VOJc0Kc4couT/IP8ZESjYHXGNxmP066biLYuPytJK3mBwTXso1BWLzoqMAPhUQkN/lro8b0LqS+QACF83soAs0s9shC1lbUxVohMJnq855oQ6OFxfl8d5E1dvmAnvQ6psj3OVr8Tpn+fp1CHfPFPrbrHLQiaSrwn87tMrkq2/nAoeHdxUbWuM5BisjBZn1ciw03B2OLaisaODGdOmYo+gtHY3VxnMBuWi2zfBfr9XB5VzHmBtyk0CgYEAzHU/o5/0Gf3C6Qu7d/USl7of9msDkVXPU/Cwk+x8gKmlcOstwoqrYhh9cC/NnCWhtpkG0Q2m9ezrBTCEgp6m78LTJ74S9pbybSZk4XFKQ/NfO/Yf8BAL1bGweTPxnkFTqRrQdQmxBFNjllOYUGs8dto8q13/V9C9NbLYjfcu5YMCgYEAwAZ5xwRLr27wtDTEVFULwQ+jZLXdbPlm5xA3iiPj67uMxWSBLyJCppjZjgjP7PPriquw36lF9BLXwdxygsn30PWT/p5SI4+hvYtCbNbNm7kZGKi/B00CBuUtx4s/6ORnV2sMuKG40Z0d9ZVFJqApxOwV9m1HhGi502l8Ync1ni8CgYEAmut0jwzSLyeCmobTQ6+kqObU9ShdCbCVaisEAPG93NeujgMFJ1VfSvL3iRwPlXNGN094RMstaUZdRg9fOIHyR9W9nW1+fO4fPulKoy/ub9JmpM53oLTn4sHCz/O17o3dUFMLBMOVJ4vv96Xb0YOPyxbNxaNxqR53X8rmH5veIvUCgYEAldy37403sCup6UoBKzvQV5Tn1PJmY+Tk3VH3tnS6LUCK5YbBl1Jqp/BEYagY9fmLiwbhnDxUXt7RyfdM2yvanxb5sE5JFn3DIdVsOtsNTgoQPwF7TKxZ952ms8PGVfDjggMGw5VbUyQGvKIJfNKkpo4FufOhTAIbfJYnwAT/MHsCgYBla8z1qsl+dTA5I52WyPn/XUSX4ge8+o1X4BW8iJ8fs0uc0EAmBgyqs5r6cfgci+zDfxRUSWrU1bwR51dxCHirexxV9yO61WX773r9hQR2I7cBDsKVetoRJlPM6hjkrBTXvALr02yiQ3FQ+r9RFs35uw8sd6S7PZZ46KXvrvFcsg==
a12e372d-0964-460f-8b15-80fb242690c5	5662273c-09e8-4734-848d-617184a5988e	certificate	MIICpzCCAY8CBgGX7sms4DANBgkqhkiG9w0BAQsFADAXMRUwEwYDVQQDDAxCb29raW5nU21hcnQwHhcNMjUwNzA5MTA0MzAzWhcNMzUwNzA5MTA0NDQzWjAXMRUwEwYDVQQDDAxCb29raW5nU21hcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCZXRu8k3Ppd5m6N3Z6KWTRAyc4fGp5HIwpVkubfmGr9AuxXaywrmmJzXJb4eg0vDvQtxA99omlU2jAc+DY4AUYyVBKHWDkf4vnd78fi9+GyQ2YYkiog+dMh1iESV594o1nse0Ozip7TWo9mupafj21nOWCs8gTPHQ9nZfh/tqokf6bRa0n/ZDxWtFo+geRw3z2aQVVnJaO2WbL3+RpWcgUxZd8Lc+0ydhOU6XmH/Wt6JKvnzINzHwGu1roENFU3grs2lR0QrLikiZN6J06di2pgylgu9JtuC3mWfXkAk4BbH+nw6txSzv1sHExgrpQ6vzu4mH4nhUht4Oiqiq8Yf0NAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAIkQUA7QgwZfPOuSaKkA5CyRgCv+Vr1uXHFCYRcz4Vc0smR9FavslLmlkVDHXv2txoeQ0xLhWqyaPOkAC8kJTqgFqdutIW1bRYy/dy+4MNNeYlzV3XxaL3dizxszMH30eAl/C+rZsVU2HqNStnV2rJMyUa9IQeIlCed6TmNPrw6U4/XWije7Lfzz6noLH5FwFhx7QpQ4lOAnKnTGpSOGVloJn4hrXAv36cCu48e18iIay/lcgk6CuCdwF/KOmoi143zlcpw6Iz4wAlBxbtHlAWOrELJu7ka63rm68wgawuMRjCUOSYkNdrTWaGVHlFS4pUAGdlhwKrcTe7+zfXntFx4=
c3bb80da-4c22-41f8-a7b1-82dfed022633	5662273c-09e8-4734-848d-617184a5988e	priority	100
0cca2789-8036-4f8a-9a55-4148b8aec139	5662273c-09e8-4734-848d-617184a5988e	algorithm	RSA-OAEP
\.


--
-- TOC entry 4195 (class 0 OID 18635)
-- Dependencies: 220
-- Data for Name: composite_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.composite_role (composite, child_role) FROM stdin;
ef07997d-6717-4f20-bfd2-050ba20c4c0b	0cda48fc-9249-4be6-b4fc-7d808a80e170
ef07997d-6717-4f20-bfd2-050ba20c4c0b	973e9029-292b-4c00-964b-576dad1926c5
ef07997d-6717-4f20-bfd2-050ba20c4c0b	3bd163be-2122-452d-a712-f99895cfd365
ef07997d-6717-4f20-bfd2-050ba20c4c0b	96f0d728-1f5b-4384-9349-0998087cb92e
ef07997d-6717-4f20-bfd2-050ba20c4c0b	a2ea2a3a-1ed1-40f3-9073-e84bde7d9528
ef07997d-6717-4f20-bfd2-050ba20c4c0b	9962a997-ae3e-4acc-8ae7-adfba4cde930
ef07997d-6717-4f20-bfd2-050ba20c4c0b	6f3ed210-a2e2-4319-8e96-4a567c94e622
ef07997d-6717-4f20-bfd2-050ba20c4c0b	39affc5a-a00d-4f04-94d7-6b9259c13616
ef07997d-6717-4f20-bfd2-050ba20c4c0b	e754a297-41ab-4513-93a9-6db0bbae6563
ef07997d-6717-4f20-bfd2-050ba20c4c0b	6bdc21cf-4323-42c2-8711-c10a93b30b42
ef07997d-6717-4f20-bfd2-050ba20c4c0b	726f3628-2db0-41a3-834e-b4fdc4e9f6a6
ef07997d-6717-4f20-bfd2-050ba20c4c0b	cce1cf8e-a51d-4753-8c15-cb16c480d8c8
ef07997d-6717-4f20-bfd2-050ba20c4c0b	2bb6097b-a7ad-450e-993d-aa7c60a71e22
ef07997d-6717-4f20-bfd2-050ba20c4c0b	9831b806-6830-4947-a85a-f1ddc9e8f3f6
ef07997d-6717-4f20-bfd2-050ba20c4c0b	ac78c5f9-fb62-413f-a719-9eae399d243d
ef07997d-6717-4f20-bfd2-050ba20c4c0b	0a8fd190-49ae-4966-ad68-c44808586097
ef07997d-6717-4f20-bfd2-050ba20c4c0b	1d2ad071-2e2d-49d8-9096-d3f5b72758ee
ef07997d-6717-4f20-bfd2-050ba20c4c0b	c36d9833-54fe-480a-8905-25e36157268f
18913614-be88-467a-b0f6-d92fcb30b15e	77cd327a-09eb-4595-b1bd-bc28714e5cb0
96f0d728-1f5b-4384-9349-0998087cb92e	c36d9833-54fe-480a-8905-25e36157268f
96f0d728-1f5b-4384-9349-0998087cb92e	ac78c5f9-fb62-413f-a719-9eae399d243d
a2ea2a3a-1ed1-40f3-9073-e84bde7d9528	0a8fd190-49ae-4966-ad68-c44808586097
18913614-be88-467a-b0f6-d92fcb30b15e	1ba9029c-b3c4-4e06-b616-f8a1247a02ee
1ba9029c-b3c4-4e06-b616-f8a1247a02ee	c05dfb22-27d3-4a6b-8053-506231fe31a8
7c4f78b2-4d61-433c-b9e7-75b8667444d4	24396601-6600-42e3-914c-c6ab9dc92268
ef07997d-6717-4f20-bfd2-050ba20c4c0b	3a65009e-b3d2-4ee9-b8c5-8eacb60c163f
18913614-be88-467a-b0f6-d92fcb30b15e	89732194-ddc7-428d-9a03-c103e6c9831a
18913614-be88-467a-b0f6-d92fcb30b15e	a358a71b-c810-4a3f-8e74-6c5d4154f586
ef07997d-6717-4f20-bfd2-050ba20c4c0b	186d4911-98ed-4b20-91fa-d382e4815b63
ef07997d-6717-4f20-bfd2-050ba20c4c0b	49098659-87d9-46d0-b259-020acd8a5374
ef07997d-6717-4f20-bfd2-050ba20c4c0b	9454c395-056b-46c6-aa07-449cd264cd46
ef07997d-6717-4f20-bfd2-050ba20c4c0b	baec00bd-33de-4776-b121-cecbda85061c
ef07997d-6717-4f20-bfd2-050ba20c4c0b	f8b8efd1-d871-410a-bc8e-30a6beece1ce
ef07997d-6717-4f20-bfd2-050ba20c4c0b	ca4b4ef9-b2ee-4140-ab43-e00a3f995b29
ef07997d-6717-4f20-bfd2-050ba20c4c0b	2bbc28cc-beb7-44eb-9f50-9446b3b154c7
ef07997d-6717-4f20-bfd2-050ba20c4c0b	91c6a786-2051-49a6-93a6-4320061e4738
ef07997d-6717-4f20-bfd2-050ba20c4c0b	a38683e0-1136-40e5-9a42-23463d77018c
ef07997d-6717-4f20-bfd2-050ba20c4c0b	0901b72b-aa1c-4cdd-abf1-431899890b08
ef07997d-6717-4f20-bfd2-050ba20c4c0b	93ce3ea0-5997-4893-9c30-cccfd8b750b7
ef07997d-6717-4f20-bfd2-050ba20c4c0b	55332a38-be28-4c22-bf49-47693be31adb
ef07997d-6717-4f20-bfd2-050ba20c4c0b	39b35bae-821a-4a90-a6c0-9fcb2770bc9c
ef07997d-6717-4f20-bfd2-050ba20c4c0b	6321ba5f-f19d-474c-9554-b4187009a878
ef07997d-6717-4f20-bfd2-050ba20c4c0b	775045ff-3bdf-4c67-bf15-f3db15632098
ef07997d-6717-4f20-bfd2-050ba20c4c0b	d94ec34a-4289-4268-bf44-a49c94549afd
ef07997d-6717-4f20-bfd2-050ba20c4c0b	0baefeb7-2ed4-44d0-81ea-a0ce813e9ddb
9454c395-056b-46c6-aa07-449cd264cd46	6321ba5f-f19d-474c-9554-b4187009a878
9454c395-056b-46c6-aa07-449cd264cd46	0baefeb7-2ed4-44d0-81ea-a0ce813e9ddb
baec00bd-33de-4776-b121-cecbda85061c	775045ff-3bdf-4c67-bf15-f3db15632098
2d591814-fb0b-4df2-b8fa-4d894bf2789a	b347faf1-614c-4560-b309-3963c8b8ed72
2d591814-fb0b-4df2-b8fa-4d894bf2789a	51a27561-fffb-40f1-a2b6-d7608bde9269
2d591814-fb0b-4df2-b8fa-4d894bf2789a	6ba0385a-dc94-4da0-8649-92d9d684263e
2d591814-fb0b-4df2-b8fa-4d894bf2789a	955f290e-e4d8-4af9-909c-09f776378031
2d591814-fb0b-4df2-b8fa-4d894bf2789a	76a7b8bd-3440-4ae2-b951-51626d3468ae
2d591814-fb0b-4df2-b8fa-4d894bf2789a	de9badf2-e26c-4193-80d4-a604c659ed4f
2d591814-fb0b-4df2-b8fa-4d894bf2789a	f00232df-6145-458e-9ce7-c7bc2334fa43
2d591814-fb0b-4df2-b8fa-4d894bf2789a	5abdaafd-95b9-4f8c-8328-78f991efbb00
2d591814-fb0b-4df2-b8fa-4d894bf2789a	f3048ffb-3023-4973-a25e-dfe42e83cc54
2d591814-fb0b-4df2-b8fa-4d894bf2789a	6c17291d-e469-4139-aa90-b5e3b1a44e46
2d591814-fb0b-4df2-b8fa-4d894bf2789a	48084127-c5e1-41be-ba71-2406823788ae
2d591814-fb0b-4df2-b8fa-4d894bf2789a	361537c1-1c9e-47dc-906c-c96b2eeb654d
2d591814-fb0b-4df2-b8fa-4d894bf2789a	0b754c52-b512-4c64-aa72-d358e18aabbc
2d591814-fb0b-4df2-b8fa-4d894bf2789a	95a46057-7254-452e-b6b9-f34178a84aa8
2d591814-fb0b-4df2-b8fa-4d894bf2789a	6ec2be44-3b2d-49aa-9706-1845559d986e
5abdaafd-95b9-4f8c-8328-78f991efbb00	f00232df-6145-458e-9ce7-c7bc2334fa43
6d01b738-8f9d-465b-9464-25389823c74f	b347faf1-614c-4560-b309-3963c8b8ed72
6d01b738-8f9d-465b-9464-25389823c74f	361537c1-1c9e-47dc-906c-c96b2eeb654d
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	2006cd24-9bfb-417d-8e0b-81ef33fac6cf
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	a4b40d5f-75d9-47d4-9119-eaf7db5a6c25
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	514784fb-7137-4134-bad7-db373e7d398a
ef07997d-6717-4f20-bfd2-050ba20c4c0b	ef9822dc-6691-4a5c-bdb5-f7bc6295bcf7
\.


--
-- TOC entry 4196 (class 0 OID 18638)
-- Dependencies: 221
-- Data for Name: credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credential (id, salt, type, user_id, created_date, user_label, secret_data, credential_data, priority, version) FROM stdin;
3aebf194-4c44-4f7f-862e-b20abb82be45	\N	password	6c7dc2f3-fc2f-413d-aa0e-92ecd5e7b1ad	1752516770126	\N	{"value":"k0a0LgL4kC2FmsjvuI2X9AFiz1maR/OKwJQQUilyqs4=","salt":"SKl86HMzapsIV0kFrPvX1w==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	0
e18d59ca-077f-4f8e-bdc9-b972e4d5f721	\N	password	7a5cb5ed-0b85-407c-bb9f-ca5997df8c3d	1753048592707	My password	{"value":"9smA+ERPrhTcLifOufkKbFCuNBAcYYG8ZILBw5jkhRg=","salt":"FkXjHiXA58Sh5A6CEKFRNA==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	1
f51e9e3b-af7b-40e3-adb3-c636f1e4d7b8	\N	password	1c544260-57c6-4e63-ba65-9a529f3783a2	1754223796706	My password	{"value":"z9D3+qDjo+CBNLqtNsTydpqnBn8R+hlR3JoJ0FQzdxY=","salt":"VOU9rz24I9h731MiyJBC2Q==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	1
c2f04d78-4687-4381-bf1f-a5f30d0ce737	\N	password	c18dacad-7f7b-49de-9893-6eff9151a8a6	1755329057645	\N	{"value":"EfURUeepgw5TwHzMWPw0m1mdiH88ydXdC10sWvhMVC0=","salt":"euSUDZ8JnPIdnbmAoZeCLQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	0
139f28a0-1c65-440f-830d-b60f724f176b	\N	password	28257e82-db3c-4e6a-bd90-76da234ca417	1755329138266	\N	{"value":"9lhhtO1b3lZhn4IgX4D7WEIYe0AZWE8j1lHm6SPpgGw=","salt":"Tml+TDSrV9GQg7DE62ON+A==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	0
d5a22173-78c5-40d8-8034-96e41a96cc7c	\N	password	c3039676-b94c-45b2-ace0-6e577993d61a	1755533799892	\N	{"value":"lSkoKYVhNzvyID9YibBwwtLCUxGEXFOH7XIfK+aVOLs=","salt":"eJVTdSjMJ+lYh2jWu1n3pA==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	0
\.


--
-- TOC entry 4193 (class 0 OID 18608)
-- Dependencies: 218
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/jpa-changelog-1.0.0.Final.xml	2025-07-09 10:41:29.497219	1	EXECUTED	9:6f1016664e21e16d26517a4418f5e3df	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.29.1	\N	\N	2057688905
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/db2-jpa-changelog-1.0.0.Final.xml	2025-07-09 10:41:29.527546	2	MARK_RAN	9:828775b1596a07d1200ba1d49e5e3941	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.29.1	\N	\N	2057688905
1.1.0.Beta1	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Beta1.xml	2025-07-09 10:41:29.599254	3	EXECUTED	9:5f090e44a7d595883c1fb61f4b41fd38	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=CLIENT_ATTRIBUTES; createTable tableName=CLIENT_SESSION_NOTE; createTable tableName=APP_NODE_REGISTRATIONS; addColumn table...		\N	4.29.1	\N	\N	2057688905
1.1.0.Final	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Final.xml	2025-07-09 10:41:29.614417	4	EXECUTED	9:c07e577387a3d2c04d1adc9aaad8730e	renameColumn newColumnName=EVENT_TIME, oldColumnName=TIME, tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	2057688905
1.2.0.Beta1	psilva@redhat.com	META-INF/jpa-changelog-1.2.0.Beta1.xml	2025-07-09 10:41:29.776934	5	EXECUTED	9:b68ce996c655922dbcd2fe6b6ae72686	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.29.1	\N	\N	2057688905
1.2.0.Beta1	psilva@redhat.com	META-INF/db2-jpa-changelog-1.2.0.Beta1.xml	2025-07-09 10:41:29.790811	6	MARK_RAN	9:543b5c9989f024fe35c6f6c5a97de88e	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.29.1	\N	\N	2057688905
1.2.0.RC1	bburke@redhat.com	META-INF/jpa-changelog-1.2.0.CR1.xml	2025-07-09 10:41:29.938279	7	EXECUTED	9:765afebbe21cf5bbca048e632df38336	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.29.1	\N	\N	2057688905
1.2.0.RC1	bburke@redhat.com	META-INF/db2-jpa-changelog-1.2.0.CR1.xml	2025-07-09 10:41:29.95162	8	MARK_RAN	9:db4a145ba11a6fdaefb397f6dbf829a1	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.29.1	\N	\N	2057688905
1.2.0.Final	keycloak	META-INF/jpa-changelog-1.2.0.Final.xml	2025-07-09 10:41:29.96704	9	EXECUTED	9:9d05c7be10cdb873f8bcb41bc3a8ab23	update tableName=CLIENT; update tableName=CLIENT; update tableName=CLIENT		\N	4.29.1	\N	\N	2057688905
1.3.0	bburke@redhat.com	META-INF/jpa-changelog-1.3.0.xml	2025-07-09 10:41:30.116334	10	EXECUTED	9:18593702353128d53111f9b1ff0b82b8	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=ADMI...		\N	4.29.1	\N	\N	2057688905
1.4.0	bburke@redhat.com	META-INF/jpa-changelog-1.4.0.xml	2025-07-09 10:41:30.197247	11	EXECUTED	9:6122efe5f090e41a85c0f1c9e52cbb62	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	2057688905
1.4.0	bburke@redhat.com	META-INF/db2-jpa-changelog-1.4.0.xml	2025-07-09 10:41:30.209913	12	MARK_RAN	9:e1ff28bf7568451453f844c5d54bb0b5	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	2057688905
1.5.0	bburke@redhat.com	META-INF/jpa-changelog-1.5.0.xml	2025-07-09 10:41:30.274763	13	EXECUTED	9:7af32cd8957fbc069f796b61217483fd	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	2057688905
1.6.1_from15	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-07-09 10:41:30.323624	14	EXECUTED	9:6005e15e84714cd83226bf7879f54190	addColumn tableName=REALM; addColumn tableName=KEYCLOAK_ROLE; addColumn tableName=CLIENT; createTable tableName=OFFLINE_USER_SESSION; createTable tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_US_SES_PK2, tableName=...		\N	4.29.1	\N	\N	2057688905
1.6.1_from16-pre	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-07-09 10:41:30.332128	15	MARK_RAN	9:bf656f5a2b055d07f314431cae76f06c	delete tableName=OFFLINE_CLIENT_SESSION; delete tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
1.6.1_from16	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-07-09 10:41:30.342823	16	MARK_RAN	9:f8dadc9284440469dcf71e25ca6ab99b	dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_US_SES_PK, tableName=OFFLINE_USER_SESSION; dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_CL_SES_PK, tableName=OFFLINE_CLIENT_SESSION; addColumn tableName=OFFLINE_USER_SESSION; update tableName=OF...		\N	4.29.1	\N	\N	2057688905
1.6.1	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-07-09 10:41:30.353845	17	EXECUTED	9:d41d8cd98f00b204e9800998ecf8427e	empty		\N	4.29.1	\N	\N	2057688905
1.7.0	bburke@redhat.com	META-INF/jpa-changelog-1.7.0.xml	2025-07-09 10:41:30.454921	18	EXECUTED	9:3368ff0be4c2855ee2dd9ca813b38d8e	createTable tableName=KEYCLOAK_GROUP; createTable tableName=GROUP_ROLE_MAPPING; createTable tableName=GROUP_ATTRIBUTE; createTable tableName=USER_GROUP_MEMBERSHIP; createTable tableName=REALM_DEFAULT_GROUPS; addColumn tableName=IDENTITY_PROVIDER; ...		\N	4.29.1	\N	\N	2057688905
1.8.0	mposolda@redhat.com	META-INF/jpa-changelog-1.8.0.xml	2025-07-09 10:41:30.546813	19	EXECUTED	9:8ac2fb5dd030b24c0570a763ed75ed20	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.29.1	\N	\N	2057688905
1.8.0-2	keycloak	META-INF/jpa-changelog-1.8.0.xml	2025-07-09 10:41:30.56596	20	EXECUTED	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.29.1	\N	\N	2057688905
26.0.0-33201-org-redirect-url	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:42.311846	144	EXECUTED	9:4d0e22b0ac68ebe9794fa9cb752ea660	addColumn tableName=ORG		\N	4.29.1	\N	\N	2057688905
1.8.0	mposolda@redhat.com	META-INF/db2-jpa-changelog-1.8.0.xml	2025-07-09 10:41:30.577244	21	MARK_RAN	9:831e82914316dc8a57dc09d755f23c51	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.29.1	\N	\N	2057688905
1.8.0-2	keycloak	META-INF/db2-jpa-changelog-1.8.0.xml	2025-07-09 10:41:30.587087	22	MARK_RAN	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.29.1	\N	\N	2057688905
1.9.0	mposolda@redhat.com	META-INF/jpa-changelog-1.9.0.xml	2025-07-09 10:41:30.798421	23	EXECUTED	9:bc3d0f9e823a69dc21e23e94c7a94bb1	update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=REALM; update tableName=REALM; customChange; dr...		\N	4.29.1	\N	\N	2057688905
1.9.1	keycloak	META-INF/jpa-changelog-1.9.1.xml	2025-07-09 10:41:30.822402	24	EXECUTED	9:c9999da42f543575ab790e76439a2679	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=PUBLIC_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.29.1	\N	\N	2057688905
1.9.1	keycloak	META-INF/db2-jpa-changelog-1.9.1.xml	2025-07-09 10:41:30.830551	25	MARK_RAN	9:0d6c65c6f58732d81569e77b10ba301d	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.29.1	\N	\N	2057688905
1.9.2	keycloak	META-INF/jpa-changelog-1.9.2.xml	2025-07-09 10:41:31.865429	26	EXECUTED	9:fc576660fc016ae53d2d4778d84d86d0	createIndex indexName=IDX_USER_EMAIL, tableName=USER_ENTITY; createIndex indexName=IDX_USER_ROLE_MAPPING, tableName=USER_ROLE_MAPPING; createIndex indexName=IDX_USER_GROUP_MAPPING, tableName=USER_GROUP_MEMBERSHIP; createIndex indexName=IDX_USER_CO...		\N	4.29.1	\N	\N	2057688905
authz-2.0.0	psilva@redhat.com	META-INF/jpa-changelog-authz-2.0.0.xml	2025-07-09 10:41:31.964733	27	EXECUTED	9:43ed6b0da89ff77206289e87eaa9c024	createTable tableName=RESOURCE_SERVER; addPrimaryKey constraintName=CONSTRAINT_FARS, tableName=RESOURCE_SERVER; addUniqueConstraint constraintName=UK_AU8TT6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER; createTable tableName=RESOURCE_SERVER_RESOU...		\N	4.29.1	\N	\N	2057688905
authz-2.5.1	psilva@redhat.com	META-INF/jpa-changelog-authz-2.5.1.xml	2025-07-09 10:41:31.973468	28	EXECUTED	9:44bae577f551b3738740281eceb4ea70	update tableName=RESOURCE_SERVER_POLICY		\N	4.29.1	\N	\N	2057688905
2.1.0-KEYCLOAK-5461	bburke@redhat.com	META-INF/jpa-changelog-2.1.0.xml	2025-07-09 10:41:32.036509	29	EXECUTED	9:bd88e1f833df0420b01e114533aee5e8	createTable tableName=BROKER_LINK; createTable tableName=FED_USER_ATTRIBUTE; createTable tableName=FED_USER_CONSENT; createTable tableName=FED_USER_CONSENT_ROLE; createTable tableName=FED_USER_CONSENT_PROT_MAPPER; createTable tableName=FED_USER_CR...		\N	4.29.1	\N	\N	2057688905
2.2.0	bburke@redhat.com	META-INF/jpa-changelog-2.2.0.xml	2025-07-09 10:41:32.064398	30	EXECUTED	9:a7022af5267f019d020edfe316ef4371	addColumn tableName=ADMIN_EVENT_ENTITY; createTable tableName=CREDENTIAL_ATTRIBUTE; createTable tableName=FED_CREDENTIAL_ATTRIBUTE; modifyDataType columnName=VALUE, tableName=CREDENTIAL; addForeignKeyConstraint baseTableName=FED_CREDENTIAL_ATTRIBU...		\N	4.29.1	\N	\N	2057688905
2.3.0	bburke@redhat.com	META-INF/jpa-changelog-2.3.0.xml	2025-07-09 10:41:32.109995	31	EXECUTED	9:fc155c394040654d6a79227e56f5e25a	createTable tableName=FEDERATED_USER; addPrimaryKey constraintName=CONSTR_FEDERATED_USER, tableName=FEDERATED_USER; dropDefaultValue columnName=TOTP, tableName=USER_ENTITY; dropColumn columnName=TOTP, tableName=USER_ENTITY; addColumn tableName=IDE...		\N	4.29.1	\N	\N	2057688905
2.4.0	bburke@redhat.com	META-INF/jpa-changelog-2.4.0.xml	2025-07-09 10:41:32.124295	32	EXECUTED	9:eac4ffb2a14795e5dc7b426063e54d88	customChange		\N	4.29.1	\N	\N	2057688905
2.5.0	bburke@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-07-09 10:41:32.144094	33	EXECUTED	9:54937c05672568c4c64fc9524c1e9462	customChange; modifyDataType columnName=USER_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
2.5.0-unicode-oracle	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-07-09 10:41:32.153431	34	MARK_RAN	9:3a32bace77c84d7678d035a7f5a8084e	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.29.1	\N	\N	2057688905
2.5.0-unicode-other-dbs	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-07-09 10:41:32.206994	35	EXECUTED	9:33d72168746f81f98ae3a1e8e0ca3554	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.29.1	\N	\N	2057688905
2.5.0-duplicate-email-support	slawomir@dabek.name	META-INF/jpa-changelog-2.5.0.xml	2025-07-09 10:41:32.225548	36	EXECUTED	9:61b6d3d7a4c0e0024b0c839da283da0c	addColumn tableName=REALM		\N	4.29.1	\N	\N	2057688905
2.5.0-unique-group-names	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-07-09 10:41:32.243893	37	EXECUTED	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2057688905
2.5.1	bburke@redhat.com	META-INF/jpa-changelog-2.5.1.xml	2025-07-09 10:41:32.261113	38	EXECUTED	9:a2b870802540cb3faa72098db5388af3	addColumn tableName=FED_USER_CONSENT		\N	4.29.1	\N	\N	2057688905
3.0.0	bburke@redhat.com	META-INF/jpa-changelog-3.0.0.xml	2025-07-09 10:41:32.276188	39	EXECUTED	9:132a67499ba24bcc54fb5cbdcfe7e4c0	addColumn tableName=IDENTITY_PROVIDER		\N	4.29.1	\N	\N	2057688905
3.2.0-fix	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-07-09 10:41:32.28277	40	MARK_RAN	9:938f894c032f5430f2b0fafb1a243462	addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS		\N	4.29.1	\N	\N	2057688905
3.2.0-fix-with-keycloak-5416	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-07-09 10:41:32.291128	41	MARK_RAN	9:845c332ff1874dc5d35974b0babf3006	dropIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS; addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS; createIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS		\N	4.29.1	\N	\N	2057688905
3.2.0-fix-offline-sessions	hmlnarik	META-INF/jpa-changelog-3.2.0.xml	2025-07-09 10:41:32.305814	42	EXECUTED	9:fc86359c079781adc577c5a217e4d04c	customChange		\N	4.29.1	\N	\N	2057688905
3.2.0-fixed	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-07-09 10:41:34.849148	43	EXECUTED	9:59a64800e3c0d09b825f8a3b444fa8f4	addColumn tableName=REALM; dropPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_PK2, tableName=OFFLINE_CLIENT_SESSION; dropColumn columnName=CLIENT_SESSION_ID, tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_P...		\N	4.29.1	\N	\N	2057688905
3.3.0	keycloak	META-INF/jpa-changelog-3.3.0.xml	2025-07-09 10:41:34.86603	44	EXECUTED	9:d48d6da5c6ccf667807f633fe489ce88	addColumn tableName=USER_ENTITY		\N	4.29.1	\N	\N	2057688905
authz-3.4.0.CR1-resource-server-pk-change-part1	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-07-09 10:41:34.880525	45	EXECUTED	9:dde36f7973e80d71fceee683bc5d2951	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_RESOURCE; addColumn tableName=RESOURCE_SERVER_SCOPE		\N	4.29.1	\N	\N	2057688905
authz-3.4.0.CR1-resource-server-pk-change-part2-KEYCLOAK-6095	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-07-09 10:41:34.89466	46	EXECUTED	9:b855e9b0a406b34fa323235a0cf4f640	customChange		\N	4.29.1	\N	\N	2057688905
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-07-09 10:41:34.89987	47	MARK_RAN	9:51abbacd7b416c50c4421a8cabf7927e	dropIndex indexName=IDX_RES_SERV_POL_RES_SERV, tableName=RESOURCE_SERVER_POLICY; dropIndex indexName=IDX_RES_SRV_RES_RES_SRV, tableName=RESOURCE_SERVER_RESOURCE; dropIndex indexName=IDX_RES_SRV_SCOPE_RES_SRV, tableName=RESOURCE_SERVER_SCOPE		\N	4.29.1	\N	\N	2057688905
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed-nodropindex	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-07-09 10:41:35.136084	48	EXECUTED	9:bdc99e567b3398bac83263d375aad143	addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_POLICY; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_RESOURCE; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, ...		\N	4.29.1	\N	\N	2057688905
authn-3.4.0.CR1-refresh-token-max-reuse	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-07-09 10:41:35.150822	49	EXECUTED	9:d198654156881c46bfba39abd7769e69	addColumn tableName=REALM		\N	4.29.1	\N	\N	2057688905
3.4.0	keycloak	META-INF/jpa-changelog-3.4.0.xml	2025-07-09 10:41:35.205444	50	EXECUTED	9:cfdd8736332ccdd72c5256ccb42335db	addPrimaryKey constraintName=CONSTRAINT_REALM_DEFAULT_ROLES, tableName=REALM_DEFAULT_ROLES; addPrimaryKey constraintName=CONSTRAINT_COMPOSITE_ROLE, tableName=COMPOSITE_ROLE; addPrimaryKey constraintName=CONSTR_REALM_DEFAULT_GROUPS, tableName=REALM...		\N	4.29.1	\N	\N	2057688905
3.4.0-KEYCLOAK-5230	hmlnarik@redhat.com	META-INF/jpa-changelog-3.4.0.xml	2025-07-09 10:41:35.913237	51	EXECUTED	9:7c84de3d9bd84d7f077607c1a4dcb714	createIndex indexName=IDX_FU_ATTRIBUTE, tableName=FED_USER_ATTRIBUTE; createIndex indexName=IDX_FU_CONSENT, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CONSENT_RU, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CREDENTIAL, t...		\N	4.29.1	\N	\N	2057688905
3.4.1	psilva@redhat.com	META-INF/jpa-changelog-3.4.1.xml	2025-07-09 10:41:35.927832	52	EXECUTED	9:5a6bb36cbefb6a9d6928452c0852af2d	modifyDataType columnName=VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
3.4.2	keycloak	META-INF/jpa-changelog-3.4.2.xml	2025-07-09 10:41:35.948121	53	EXECUTED	9:8f23e334dbc59f82e0a328373ca6ced0	update tableName=REALM		\N	4.29.1	\N	\N	2057688905
3.4.2-KEYCLOAK-5172	mkanis@redhat.com	META-INF/jpa-changelog-3.4.2.xml	2025-07-09 10:41:35.958204	54	EXECUTED	9:9156214268f09d970cdf0e1564d866af	update tableName=CLIENT		\N	4.29.1	\N	\N	2057688905
4.0.0-KEYCLOAK-6335	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-07-09 10:41:36.002229	55	EXECUTED	9:db806613b1ed154826c02610b7dbdf74	createTable tableName=CLIENT_AUTH_FLOW_BINDINGS; addPrimaryKey constraintName=C_CLI_FLOW_BIND, tableName=CLIENT_AUTH_FLOW_BINDINGS		\N	4.29.1	\N	\N	2057688905
4.0.0-CLEANUP-UNUSED-TABLE	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-07-09 10:41:36.024503	56	EXECUTED	9:229a041fb72d5beac76bb94a5fa709de	dropTable tableName=CLIENT_IDENTITY_PROV_MAPPING		\N	4.29.1	\N	\N	2057688905
4.0.0-KEYCLOAK-6228	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-07-09 10:41:35.415857	57	EXECUTED	9:079899dade9c1e683f26b2aa9ca6ff04	dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; dropNotNullConstraint columnName=CLIENT_ID, tableName=USER_CONSENT; addColumn tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHO...		\N	4.29.1	\N	\N	2057688905
4.0.0-KEYCLOAK-5579-fixed	mposolda@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-07-09 10:41:34.595363	58	EXECUTED	9:139b79bcbbfe903bb1c2d2a4dbf001d9	dropForeignKeyConstraint baseTableName=CLIENT_TEMPLATE_ATTRIBUTES, constraintName=FK_CL_TEMPL_ATTR_TEMPL; renameTable newTableName=CLIENT_SCOPE_ATTRIBUTES, oldTableName=CLIENT_TEMPLATE_ATTRIBUTES; renameColumn newColumnName=SCOPE_ID, oldColumnName...		\N	4.29.1	\N	\N	2057688905
authz-4.0.0.CR1	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.CR1.xml	2025-07-09 10:41:34.679035	59	EXECUTED	9:b55738ad889860c625ba2bf483495a04	createTable tableName=RESOURCE_SERVER_PERM_TICKET; addPrimaryKey constraintName=CONSTRAINT_FAPMT, tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRHO213XCX4WNKOG82SSPMT...		\N	4.29.1	\N	\N	2057688905
authz-4.0.0.Beta3	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.Beta3.xml	2025-07-09 10:41:34.697146	60	EXECUTED	9:e0057eac39aa8fc8e09ac6cfa4ae15fe	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRPO2128CX4WNKOG82SSRFY, referencedTableName=RESOURCE_SERVER_POLICY		\N	4.29.1	\N	\N	2057688905
authz-4.2.0.Final	mhajas@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2025-07-09 10:41:34.717737	61	EXECUTED	9:42a33806f3a0443fe0e7feeec821326c	createTable tableName=RESOURCE_URIS; addForeignKeyConstraint baseTableName=RESOURCE_URIS, constraintName=FK_RESOURCE_SERVER_URIS, referencedTableName=RESOURCE_SERVER_RESOURCE; customChange; dropColumn columnName=URI, tableName=RESOURCE_SERVER_RESO...		\N	4.29.1	\N	\N	2057688905
authz-4.2.0.Final-KEYCLOAK-9944	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2025-07-09 10:41:34.732333	62	EXECUTED	9:9968206fca46eecc1f51db9c024bfe56	addPrimaryKey constraintName=CONSTRAINT_RESOUR_URIS_PK, tableName=RESOURCE_URIS		\N	4.29.1	\N	\N	2057688905
4.2.0-KEYCLOAK-6313	wadahiro@gmail.com	META-INF/jpa-changelog-4.2.0.xml	2025-07-09 10:41:34.746703	63	EXECUTED	9:92143a6daea0a3f3b8f598c97ce55c3d	addColumn tableName=REQUIRED_ACTION_PROVIDER		\N	4.29.1	\N	\N	2057688905
4.3.0-KEYCLOAK-7984	wadahiro@gmail.com	META-INF/jpa-changelog-4.3.0.xml	2025-07-09 10:41:34.757577	64	EXECUTED	9:82bab26a27195d889fb0429003b18f40	update tableName=REQUIRED_ACTION_PROVIDER		\N	4.29.1	\N	\N	2057688905
4.6.0-KEYCLOAK-7950	psilva@redhat.com	META-INF/jpa-changelog-4.6.0.xml	2025-07-09 10:41:34.766426	65	EXECUTED	9:e590c88ddc0b38b0ae4249bbfcb5abc3	update tableName=RESOURCE_SERVER_RESOURCE		\N	4.29.1	\N	\N	2057688905
4.6.0-KEYCLOAK-8377	keycloak	META-INF/jpa-changelog-4.6.0.xml	2025-07-09 10:41:34.841553	66	EXECUTED	9:5c1f475536118dbdc38d5d7977950cc0	createTable tableName=ROLE_ATTRIBUTE; addPrimaryKey constraintName=CONSTRAINT_ROLE_ATTRIBUTE_PK, tableName=ROLE_ATTRIBUTE; addForeignKeyConstraint baseTableName=ROLE_ATTRIBUTE, constraintName=FK_ROLE_ATTRIBUTE_ID, referencedTableName=KEYCLOAK_ROLE...		\N	4.29.1	\N	\N	2057688905
4.6.0-KEYCLOAK-8555	gideonray@gmail.com	META-INF/jpa-changelog-4.6.0.xml	2025-07-09 10:41:34.905517	67	EXECUTED	9:e7c9f5f9c4d67ccbbcc215440c718a17	createIndex indexName=IDX_COMPONENT_PROVIDER_TYPE, tableName=COMPONENT		\N	4.29.1	\N	\N	2057688905
4.7.0-KEYCLOAK-1267	sguilhen@redhat.com	META-INF/jpa-changelog-4.7.0.xml	2025-07-09 10:41:34.922065	68	EXECUTED	9:88e0bfdda924690d6f4e430c53447dd5	addColumn tableName=REALM		\N	4.29.1	\N	\N	2057688905
4.7.0-KEYCLOAK-7275	keycloak	META-INF/jpa-changelog-4.7.0.xml	2025-07-09 10:41:34.995196	69	EXECUTED	9:f53177f137e1c46b6a88c59ec1cb5218	renameColumn newColumnName=CREATED_ON, oldColumnName=LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION; addNotNullConstraint columnName=CREATED_ON, tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_USER_SESSION; customChange; createIn...		\N	4.29.1	\N	\N	2057688905
4.8.0-KEYCLOAK-8835	sguilhen@redhat.com	META-INF/jpa-changelog-4.8.0.xml	2025-07-09 10:41:35.014502	70	EXECUTED	9:a74d33da4dc42a37ec27121580d1459f	addNotNullConstraint columnName=SSO_MAX_LIFESPAN_REMEMBER_ME, tableName=REALM; addNotNullConstraint columnName=SSO_IDLE_TIMEOUT_REMEMBER_ME, tableName=REALM		\N	4.29.1	\N	\N	2057688905
authz-7.0.0-KEYCLOAK-10443	psilva@redhat.com	META-INF/jpa-changelog-authz-7.0.0.xml	2025-07-09 10:41:35.049643	71	EXECUTED	9:fd4ade7b90c3b67fae0bfcfcb42dfb5f	addColumn tableName=RESOURCE_SERVER		\N	4.29.1	\N	\N	2057688905
8.0.0-adding-credential-columns	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-07-09 10:41:35.073863	72	EXECUTED	9:aa072ad090bbba210d8f18781b8cebf4	addColumn tableName=CREDENTIAL; addColumn tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	2057688905
8.0.0-updating-credential-data-not-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-07-09 10:41:35.095829	73	EXECUTED	9:1ae6be29bab7c2aa376f6983b932be37	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	2057688905
8.0.0-updating-credential-data-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-07-09 10:41:35.10367	74	MARK_RAN	9:14706f286953fc9a25286dbd8fb30d97	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	2057688905
8.0.0-credential-cleanup-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-07-09 10:41:35.155341	75	EXECUTED	9:2b9cc12779be32c5b40e2e67711a218b	dropDefaultValue columnName=COUNTER, tableName=CREDENTIAL; dropDefaultValue columnName=DIGITS, tableName=CREDENTIAL; dropDefaultValue columnName=PERIOD, tableName=CREDENTIAL; dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; dropColumn ...		\N	4.29.1	\N	\N	2057688905
8.0.0-resource-tag-support	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-07-09 10:41:35.226577	76	EXECUTED	9:91fa186ce7a5af127a2d7a91ee083cc5	addColumn tableName=MIGRATION_MODEL; createIndex indexName=IDX_UPDATE_TIME, tableName=MIGRATION_MODEL		\N	4.29.1	\N	\N	2057688905
9.0.0-always-display-client	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-07-09 10:41:35.286789	77	EXECUTED	9:6335e5c94e83a2639ccd68dd24e2e5ad	addColumn tableName=CLIENT		\N	4.29.1	\N	\N	2057688905
9.0.0-drop-constraints-for-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-07-09 10:41:35.293314	78	MARK_RAN	9:6bdb5658951e028bfe16fa0a8228b530	dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5PMT, tableName=RESOURCE_SERVER_PERM_TICKET; dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER_RESOURCE; dropPrimaryKey constraintName=CONSTRAINT_O...		\N	4.29.1	\N	\N	2057688905
9.0.0-increase-column-size-federated-fk	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-07-09 10:41:35.335338	79	EXECUTED	9:d5bc15a64117ccad481ce8792d4c608f	modifyDataType columnName=CLIENT_ID, tableName=FED_USER_CONSENT; modifyDataType columnName=CLIENT_REALM_CONSTRAINT, tableName=KEYCLOAK_ROLE; modifyDataType columnName=OWNER, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=CLIENT_ID, ta...		\N	4.29.1	\N	\N	2057688905
9.0.0-recreate-constraints-after-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-07-09 10:41:35.342064	80	MARK_RAN	9:077cba51999515f4d3e7ad5619ab592c	addNotNullConstraint columnName=CLIENT_ID, tableName=OFFLINE_CLIENT_SESSION; addNotNullConstraint columnName=OWNER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNullConstraint columnName=REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNull...		\N	4.29.1	\N	\N	2057688905
9.0.1-add-index-to-client.client_id	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-07-09 10:41:35.402427	81	EXECUTED	9:be969f08a163bf47c6b9e9ead8ac2afb	createIndex indexName=IDX_CLIENT_ID, tableName=CLIENT		\N	4.29.1	\N	\N	2057688905
9.0.1-KEYCLOAK-12579-drop-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-07-09 10:41:35.408987	82	MARK_RAN	9:6d3bb4408ba5a72f39bd8a0b301ec6e3	dropUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2057688905
9.0.1-KEYCLOAK-12579-add-not-null-constraint	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-07-09 10:41:35.425406	83	EXECUTED	9:966bda61e46bebf3cc39518fbed52fa7	addNotNullConstraint columnName=PARENT_GROUP, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2057688905
9.0.1-KEYCLOAK-12579-recreate-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-07-09 10:41:35.43191	84	MARK_RAN	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2057688905
9.0.1-add-index-to-events	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-07-09 10:41:35.501542	85	EXECUTED	9:7d93d602352a30c0c317e6a609b56599	createIndex indexName=IDX_EVENT_TIME, tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	2057688905
map-remove-ri	keycloak	META-INF/jpa-changelog-11.0.0.xml	2025-07-09 10:41:35.526797	86	EXECUTED	9:71c5969e6cdd8d7b6f47cebc86d37627	dropForeignKeyConstraint baseTableName=REALM, constraintName=FK_TRAF444KK6QRKMS7N56AIWQ5Y; dropForeignKeyConstraint baseTableName=KEYCLOAK_ROLE, constraintName=FK_KJHO5LE2C0RAL09FL8CM9WFW9		\N	4.29.1	\N	\N	2057688905
map-remove-ri	keycloak	META-INF/jpa-changelog-12.0.0.xml	2025-07-09 10:41:35.559652	87	EXECUTED	9:a9ba7d47f065f041b7da856a81762021	dropForeignKeyConstraint baseTableName=REALM_DEFAULT_GROUPS, constraintName=FK_DEF_GROUPS_GROUP; dropForeignKeyConstraint baseTableName=REALM_DEFAULT_ROLES, constraintName=FK_H4WPD7W4HSOOLNI3H0SW7BTJE; dropForeignKeyConstraint baseTableName=CLIENT...		\N	4.29.1	\N	\N	2057688905
12.1.0-add-realm-localization-table	keycloak	META-INF/jpa-changelog-12.0.0.xml	2025-07-09 10:41:35.584633	88	EXECUTED	9:fffabce2bc01e1a8f5110d5278500065	createTable tableName=REALM_LOCALIZATIONS; addPrimaryKey tableName=REALM_LOCALIZATIONS		\N	4.29.1	\N	\N	2057688905
default-roles	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.616876	89	EXECUTED	9:fa8a5b5445e3857f4b010bafb5009957	addColumn tableName=REALM; customChange		\N	4.29.1	\N	\N	2057688905
default-roles-cleanup	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.64401	90	EXECUTED	9:67ac3241df9a8582d591c5ed87125f39	dropTable tableName=REALM_DEFAULT_ROLES; dropTable tableName=CLIENT_DEFAULT_ROLES		\N	4.29.1	\N	\N	2057688905
13.0.0-KEYCLOAK-16844	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.717351	91	EXECUTED	9:ad1194d66c937e3ffc82386c050ba089	createIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
map-remove-ri-13.0.0	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.774921	92	EXECUTED	9:d9be619d94af5a2f5d07b9f003543b91	dropForeignKeyConstraint baseTableName=DEFAULT_CLIENT_SCOPE, constraintName=FK_R_DEF_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SCOPE_CLIENT, constraintName=FK_C_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SC...		\N	4.29.1	\N	\N	2057688905
13.0.0-KEYCLOAK-17992-drop-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.789019	93	MARK_RAN	9:544d201116a0fcc5a5da0925fbbc3bde	dropPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CLSCOPE_CL, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CL_CLSCOPE, tableName=CLIENT_SCOPE_CLIENT		\N	4.29.1	\N	\N	2057688905
13.0.0-increase-column-size-federated	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.814555	94	EXECUTED	9:43c0c1055b6761b4b3e89de76d612ccf	modifyDataType columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; modifyDataType columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT		\N	4.29.1	\N	\N	2057688905
13.0.0-KEYCLOAK-17992-recreate-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.821695	95	MARK_RAN	9:8bd711fd0330f4fe980494ca43ab1139	addNotNullConstraint columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; addNotNullConstraint columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT; addPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; createIndex indexName=...		\N	4.29.1	\N	\N	2057688905
json-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-07-09 10:41:35.839596	96	EXECUTED	9:e07d2bc0970c348bb06fb63b1f82ddbf	addColumn tableName=REALM_ATTRIBUTE; update tableName=REALM_ATTRIBUTE; dropColumn columnName=VALUE, tableName=REALM_ATTRIBUTE; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=REALM_ATTRIBUTE		\N	4.29.1	\N	\N	2057688905
14.0.0-KEYCLOAK-11019	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:36.009821	97	EXECUTED	9:24fb8611e97f29989bea412aa38d12b7	createIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USER, tableName=OFFLINE_USER_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
14.0.0-KEYCLOAK-18286	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:36.024486	98	MARK_RAN	9:259f89014ce2506ee84740cbf7163aa7	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
14.0.0-KEYCLOAK-18286-revert	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:36.306281	99	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
14.0.0-KEYCLOAK-18286-supported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:36.956542	100	EXECUTED	9:60ca84a0f8c94ec8c3504a5a3bc88ee8	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
14.0.0-KEYCLOAK-18286-unsupported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:36.962857	101	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
KEYCLOAK-17267-add-index-to-user-attributes	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:37.034922	102	EXECUTED	9:0b305d8d1277f3a89a0a53a659ad274c	createIndex indexName=IDX_USER_ATTRIBUTE_NAME, tableName=USER_ATTRIBUTE		\N	4.29.1	\N	\N	2057688905
KEYCLOAK-18146-add-saml-art-binding-identifier	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-07-09 10:41:37.046647	103	EXECUTED	9:2c374ad2cdfe20e2905a84c8fac48460	customChange		\N	4.29.1	\N	\N	2057688905
15.0.0-KEYCLOAK-18467	keycloak	META-INF/jpa-changelog-15.0.0.xml	2025-07-09 10:41:37.064798	104	EXECUTED	9:47a760639ac597360a8219f5b768b4de	addColumn tableName=REALM_LOCALIZATIONS; update tableName=REALM_LOCALIZATIONS; dropColumn columnName=TEXTS, tableName=REALM_LOCALIZATIONS; renameColumn newColumnName=TEXTS, oldColumnName=TEXTS_NEW, tableName=REALM_LOCALIZATIONS; addNotNullConstrai...		\N	4.29.1	\N	\N	2057688905
17.0.0-9562	keycloak	META-INF/jpa-changelog-17.0.0.xml	2025-07-09 10:41:37.130038	105	EXECUTED	9:a6272f0576727dd8cad2522335f5d99e	createIndex indexName=IDX_USER_SERVICE_ACCOUNT, tableName=USER_ENTITY		\N	4.29.1	\N	\N	2057688905
18.0.0-10625-IDX_ADMIN_EVENT_TIME	keycloak	META-INF/jpa-changelog-18.0.0.xml	2025-07-09 10:41:37.199661	106	EXECUTED	9:015479dbd691d9cc8669282f4828c41d	createIndex indexName=IDX_ADMIN_EVENT_TIME, tableName=ADMIN_EVENT_ENTITY		\N	4.29.1	\N	\N	2057688905
18.0.15-30992-index-consent	keycloak	META-INF/jpa-changelog-18.0.15.xml	2025-07-09 10:41:37.273057	107	EXECUTED	9:80071ede7a05604b1f4906f3bf3b00f0	createIndex indexName=IDX_USCONSENT_SCOPE_ID, tableName=USER_CONSENT_CLIENT_SCOPE		\N	4.29.1	\N	\N	2057688905
19.0.0-10135	keycloak	META-INF/jpa-changelog-19.0.0.xml	2025-07-09 10:41:37.282693	108	EXECUTED	9:9518e495fdd22f78ad6425cc30630221	customChange		\N	4.29.1	\N	\N	2057688905
20.0.0-12964-supported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-07-09 10:41:37.342909	109	EXECUTED	9:e5f243877199fd96bcc842f27a1656ac	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.29.1	\N	\N	2057688905
20.0.0-12964-unsupported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-07-09 10:41:37.351325	110	MARK_RAN	9:1a6fcaa85e20bdeae0a9ce49b41946a5	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.29.1	\N	\N	2057688905
client-attributes-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-07-09 10:41:37.369661	111	EXECUTED	9:3f332e13e90739ed0c35b0b25b7822ca	addColumn tableName=CLIENT_ATTRIBUTES; update tableName=CLIENT_ATTRIBUTES; dropColumn columnName=VALUE, tableName=CLIENT_ATTRIBUTES; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
21.0.2-17277	keycloak	META-INF/jpa-changelog-21.0.2.xml	2025-07-09 10:41:37.379992	112	EXECUTED	9:7ee1f7a3fb8f5588f171fb9a6ab623c0	customChange		\N	4.29.1	\N	\N	2057688905
21.1.0-19404	keycloak	META-INF/jpa-changelog-21.1.0.xml	2025-07-09 10:41:37.411996	113	EXECUTED	9:3d7e830b52f33676b9d64f7f2b2ea634	modifyDataType columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=LOGIC, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=POLICY_ENFORCE_MODE, tableName=RESOURCE_SERVER		\N	4.29.1	\N	\N	2057688905
21.1.0-19404-2	keycloak	META-INF/jpa-changelog-21.1.0.xml	2025-07-09 10:41:37.424198	114	MARK_RAN	9:627d032e3ef2c06c0e1f73d2ae25c26c	addColumn tableName=RESOURCE_SERVER_POLICY; update tableName=RESOURCE_SERVER_POLICY; dropColumn columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; renameColumn newColumnName=DECISION_STRATEGY, oldColumnName=DECISION_STRATEGY_NEW, tabl...		\N	4.29.1	\N	\N	2057688905
22.0.0-17484-updated	keycloak	META-INF/jpa-changelog-22.0.0.xml	2025-07-09 10:41:37.43621	115	EXECUTED	9:90af0bfd30cafc17b9f4d6eccd92b8b3	customChange		\N	4.29.1	\N	\N	2057688905
22.0.5-24031	keycloak	META-INF/jpa-changelog-22.0.0.xml	2025-07-09 10:41:37.442723	116	MARK_RAN	9:a60d2d7b315ec2d3eba9e2f145f9df28	customChange		\N	4.29.1	\N	\N	2057688905
23.0.0-12062	keycloak	META-INF/jpa-changelog-23.0.0.xml	2025-07-09 10:41:37.460915	117	EXECUTED	9:2168fbe728fec46ae9baf15bf80927b8	addColumn tableName=COMPONENT_CONFIG; update tableName=COMPONENT_CONFIG; dropColumn columnName=VALUE, tableName=COMPONENT_CONFIG; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=COMPONENT_CONFIG		\N	4.29.1	\N	\N	2057688905
23.0.0-17258	keycloak	META-INF/jpa-changelog-23.0.0.xml	2025-07-09 10:41:37.472907	118	EXECUTED	9:36506d679a83bbfda85a27ea1864dca8	addColumn tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	2057688905
24.0.0-9758	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-07-09 10:41:37.741574	119	EXECUTED	9:502c557a5189f600f0f445a9b49ebbce	addColumn tableName=USER_ATTRIBUTE; addColumn tableName=FED_USER_ATTRIBUTE; createIndex indexName=USER_ATTR_LONG_VALUES, tableName=USER_ATTRIBUTE; createIndex indexName=FED_USER_ATTR_LONG_VALUES, tableName=FED_USER_ATTRIBUTE; createIndex indexName...		\N	4.29.1	\N	\N	2057688905
24.0.0-9758-2	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-07-09 10:41:37.752208	120	EXECUTED	9:bf0fdee10afdf597a987adbf291db7b2	customChange		\N	4.29.1	\N	\N	2057688905
24.0.0-26618-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-07-09 10:41:37.764715	121	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
24.0.0-26618-reindex	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-07-09 10:41:38.080495	122	EXECUTED	9:08707c0f0db1cef6b352db03a60edc7f	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
24.0.2-27228	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-07-09 10:41:38.102087	123	EXECUTED	9:eaee11f6b8aa25d2cc6a84fb86fc6238	customChange		\N	4.29.1	\N	\N	2057688905
24.0.2-27967-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-07-09 10:41:38.117975	124	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
24.0.2-27967-reindex	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-07-09 10:41:38.134343	125	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2057688905
25.0.0-28265-tables	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.173141	126	EXECUTED	9:deda2df035df23388af95bbd36c17cef	addColumn tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	2057688905
25.0.0-28265-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.350156	127	EXECUTED	9:3e96709818458ae49f3c679ae58d263a	createIndex indexName=IDX_OFFLINE_USS_BY_LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
25.0.0-28265-index-cleanup	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.371934	128	EXECUTED	9:8c0cfa341a0474385b324f5c4b2dfcc1	dropIndex indexName=IDX_OFFLINE_USS_CREATEDON, tableName=OFFLINE_USER_SESSION; dropIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION; dropIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION; dropIndex ...		\N	4.29.1	\N	\N	2057688905
25.0.0-28265-index-2-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.378695	129	MARK_RAN	9:b7ef76036d3126bb83c2423bf4d449d6	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
25.0.0-28265-index-2-not-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.441204	130	EXECUTED	9:23396cf51ab8bc1ae6f0cac7f9f6fcf7	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057688905
25.0.0-org	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.470365	131	EXECUTED	9:5c859965c2c9b9c72136c360649af157	createTable tableName=ORG; addUniqueConstraint constraintName=UK_ORG_NAME, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_GROUP, tableName=ORG; createTable tableName=ORG_DOMAIN		\N	4.29.1	\N	\N	2057688905
unique-consentuser	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.492567	132	EXECUTED	9:5857626a2ea8767e9a6c66bf3a2cb32f	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.29.1	\N	\N	2057688905
unique-consentuser-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:38.498462	133	MARK_RAN	9:b79478aad5adaa1bc428e31563f55e8e	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.29.1	\N	\N	2057688905
25.0.0-28861-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:41:39.320743	134	EXECUTED	9:b9acb58ac958d9ada0fe12a5d4794ab1	createIndex indexName=IDX_PERM_TICKET_REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; createIndex indexName=IDX_PERM_TICKET_OWNER, tableName=RESOURCE_SERVER_PERM_TICKET		\N	4.29.1	\N	\N	2057688905
26.0.0-org-alias	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:39.367293	135	EXECUTED	9:6ef7d63e4412b3c2d66ed179159886a4	addColumn tableName=ORG; update tableName=ORG; addNotNullConstraint columnName=ALIAS, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_ALIAS, tableName=ORG		\N	4.29.1	\N	\N	2057688905
26.0.0-org-group	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:39.406712	136	EXECUTED	9:da8e8087d80ef2ace4f89d8c5b9ca223	addColumn tableName=KEYCLOAK_GROUP; update tableName=KEYCLOAK_GROUP; addNotNullConstraint columnName=TYPE, tableName=KEYCLOAK_GROUP; customChange		\N	4.29.1	\N	\N	2057688905
26.0.0-org-indexes	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:39.986374	137	EXECUTED	9:79b05dcd610a8c7f25ec05135eec0857	createIndex indexName=IDX_ORG_DOMAIN_ORG_ID, tableName=ORG_DOMAIN		\N	4.29.1	\N	\N	2057688905
26.0.0-org-group-membership	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:40.02347	138	EXECUTED	9:a6ace2ce583a421d89b01ba2a28dc2d4	addColumn tableName=USER_GROUP_MEMBERSHIP; update tableName=USER_GROUP_MEMBERSHIP; addNotNullConstraint columnName=MEMBERSHIP_TYPE, tableName=USER_GROUP_MEMBERSHIP		\N	4.29.1	\N	\N	2057688905
31296-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:40.061389	139	EXECUTED	9:64ef94489d42a358e8304b0e245f0ed4	createTable tableName=REVOKED_TOKEN; addPrimaryKey constraintName=CONSTRAINT_RT, tableName=REVOKED_TOKEN		\N	4.29.1	\N	\N	2057688905
31725-index-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:40.592498	140	EXECUTED	9:b994246ec2bf7c94da881e1d28782c7b	createIndex indexName=IDX_REV_TOKEN_ON_EXPIRE, tableName=REVOKED_TOKEN		\N	4.29.1	\N	\N	2057688905
26.0.0-idps-for-login	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:42.037379	141	EXECUTED	9:51f5fffadf986983d4bd59582c6c1604	addColumn tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_REALM_ORG, tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_FOR_LOGIN, tableName=IDENTITY_PROVIDER; customChange		\N	4.29.1	\N	\N	2057688905
26.0.0-32583-drop-redundant-index-on-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:42.205301	142	EXECUTED	9:24972d83bf27317a055d234187bb4af9	dropIndex indexName=IDX_US_SESS_ID_ON_CL_SESS, tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	2057688905
26.0.0.32582-remove-tables-user-session-user-session-note-and-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-07-09 10:41:42.283939	143	EXECUTED	9:febdc0f47f2ed241c59e60f58c3ceea5	dropTable tableName=CLIENT_SESSION_ROLE; dropTable tableName=CLIENT_SESSION_NOTE; dropTable tableName=CLIENT_SESSION_PROT_MAPPER; dropTable tableName=CLIENT_SESSION_AUTH_STATUS; dropTable tableName=CLIENT_USER_SESSION_NOTE; dropTable tableName=CLI...		\N	4.29.1	\N	\N	2057688905
25.0.0-28265-index-cleanup-uss-createdon	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:44:37.958565	145	MARK_RAN	9:78ab4fc129ed5e8265dbcc3485fba92f	dropIndex indexName=IDX_OFFLINE_USS_CREATEDON, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057877927
25.0.0-28265-index-cleanup-uss-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:44:37.984274	146	MARK_RAN	9:de5f7c1f7e10994ed8b62e621d20eaab	dropIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057877927
25.0.0-28265-index-cleanup-uss-by-usersess	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:44:38.001079	147	MARK_RAN	9:6eee220d024e38e89c799417ec33667f	dropIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2057877927
25.0.0-28265-index-cleanup-css-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-07-09 10:44:38.017956	148	MARK_RAN	9:5411d2fb2891d3e8d63ddb55dfa3c0c9	dropIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	2057877927
29399-jdbc-ping-default	keycloak	META-INF/jpa-changelog-26.1.0.xml	2025-07-09 10:44:38.04903	149	EXECUTED	9:007dbe99d7203fca403b89d4edfdf21e	createTable tableName=JGROUPS_PING; addPrimaryKey constraintName=CONSTRAINT_JGROUPS_PING, tableName=JGROUPS_PING		\N	4.29.1	\N	\N	2057877927
26.1.0-34013	keycloak	META-INF/jpa-changelog-26.1.0.xml	2025-07-09 10:44:38.070313	150	EXECUTED	9:e6b686a15759aef99a6d758a5c4c6a26	addColumn tableName=ADMIN_EVENT_ENTITY		\N	4.29.1	\N	\N	2057877927
26.1.0-34380	keycloak	META-INF/jpa-changelog-26.1.0.xml	2025-07-09 10:44:38.091444	151	EXECUTED	9:ac8b9edb7c2b6c17a1c7a11fcf5ccf01	dropTable tableName=USERNAME_LOGIN_FAILURE		\N	4.29.1	\N	\N	2057877927
26.2.0-36750	keycloak	META-INF/jpa-changelog-26.2.0.xml	2025-07-09 10:44:38.110695	152	EXECUTED	9:b49ce951c22f7eb16480ff085640a33a	createTable tableName=SERVER_CONFIG		\N	4.29.1	\N	\N	2057877927
26.2.0-26106	keycloak	META-INF/jpa-changelog-26.2.0.xml	2025-07-09 10:44:38.12655	153	EXECUTED	9:b5877d5dab7d10ff3a9d209d7beb6680	addColumn tableName=CREDENTIAL		\N	4.29.1	\N	\N	2057877927
\.


--
-- TOC entry 4192 (class 0 OID 18603)
-- Dependencies: 217
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
1000	f	\N	\N
\.


--
-- TOC entry 4267 (class 0 OID 19999)
-- Dependencies: 292
-- Data for Name: default_client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.default_client_scope (realm_id, scope_id, default_scope) FROM stdin;
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	38e59e90-36ad-4b0d-a8bb-9fa1c6c0b29d	f
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	9aaa1139-f272-4b26-b187-52803cce15d5	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	99848d6e-9162-4408-98a7-5e25ebc2de65	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	35f672af-755b-476f-9547-d9d7bc3d16f2	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	126145f5-69f7-4cbf-a41e-32167b138ff3	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	db047953-087f-4f21-a24e-7dec069f3f25	f
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	360c129b-3063-4ce9-8b84-6ec811b8a7b0	f
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	57c299a1-732b-4fec-b557-217d1c34b759	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ff7191d1-bd41-473b-95a6-561831e14f9a	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8	f
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f35ebce8-cc56-40cd-877a-f7e9576237c4	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b	t
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	29062bb5-3dc2-43b4-9bdf-9b032f13b2db	f
BookingSmart	51e71de7-0fa8-4ca8-9789-d1a240e7954c	t
BookingSmart	19969f81-191a-4485-b659-4a5ebe01285c	t
BookingSmart	65c94f63-6035-4d6c-af24-1f14e3b94a38	t
BookingSmart	215618ce-81df-4751-b38a-b64b011a7475	t
BookingSmart	337c3515-30b8-4e7c-881a-109f1c94a011	t
BookingSmart	0ddee3ba-73b6-43bc-b66a-cf8bf520e2a5	t
BookingSmart	b718c7ed-ede2-45f9-92d1-36acd43408d1	t
BookingSmart	d3087d0d-d3fd-4f43-8aca-17b1aa5be6a0	f
BookingSmart	eea01d80-65da-4540-85c9-c22b6193479e	f
BookingSmart	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998	f
BookingSmart	571bd089-79c4-414f-811d-059110e90303	f
BookingSmart	984fd7c3-9b32-402a-8e99-7054aaaf07b2	f
\.


--
-- TOC entry 4197 (class 0 OID 18643)
-- Dependencies: 222
-- Data for Name: event_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_entity (id, client_id, details_json, error, ip_address, realm_id, session_id, event_time, type, user_id, details_json_long_value) FROM stdin;
\.


--
-- TOC entry 4255 (class 0 OID 19698)
-- Dependencies: 280
-- Data for Name: fed_user_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_attribute (id, name, user_id, realm_id, storage_provider_id, value, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
\.


--
-- TOC entry 4256 (class 0 OID 19703)
-- Dependencies: 281
-- Data for Name: fed_user_consent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_consent (id, client_id, user_id, realm_id, storage_provider_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- TOC entry 4269 (class 0 OID 20025)
-- Dependencies: 294
-- Data for Name: fed_user_consent_cl_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_consent_cl_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- TOC entry 4257 (class 0 OID 19712)
-- Dependencies: 282
-- Data for Name: fed_user_credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_credential (id, salt, type, created_date, user_id, realm_id, storage_provider_id, user_label, secret_data, credential_data, priority) FROM stdin;
\.


--
-- TOC entry 4258 (class 0 OID 19721)
-- Dependencies: 283
-- Data for Name: fed_user_group_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_group_membership (group_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- TOC entry 4259 (class 0 OID 19724)
-- Dependencies: 284
-- Data for Name: fed_user_required_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_required_action (required_action, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- TOC entry 4260 (class 0 OID 19730)
-- Dependencies: 285
-- Data for Name: fed_user_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_role_mapping (role_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- TOC entry 4217 (class 0 OID 19020)
-- Dependencies: 242
-- Data for Name: federated_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_identity (identity_provider, realm_id, federated_user_id, federated_username, token, user_id) FROM stdin;
\.


--
-- TOC entry 4263 (class 0 OID 19795)
-- Dependencies: 288
-- Data for Name: federated_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_user (id, storage_provider_id, realm_id) FROM stdin;
\.


--
-- TOC entry 4239 (class 0 OID 19422)
-- Dependencies: 264
-- Data for Name: group_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_attribute (id, name, value, group_id) FROM stdin;
\.


--
-- TOC entry 4238 (class 0 OID 19419)
-- Dependencies: 263
-- Data for Name: group_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_role_mapping (role_id, group_id) FROM stdin;
\.


--
-- TOC entry 4218 (class 0 OID 19025)
-- Dependencies: 243
-- Data for Name: identity_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider (internal_id, enabled, provider_alias, provider_id, store_token, authenticate_by_default, realm_id, add_token_role, trust_email, first_broker_login_flow_id, post_broker_login_flow_id, provider_display_name, link_only, organization_id, hide_on_login) FROM stdin;
\.


--
-- TOC entry 4219 (class 0 OID 19034)
-- Dependencies: 244
-- Data for Name: identity_provider_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider_config (identity_provider_id, value, name) FROM stdin;
\.


--
-- TOC entry 4223 (class 0 OID 19138)
-- Dependencies: 248
-- Data for Name: identity_provider_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider_mapper (id, name, idp_alias, idp_mapper_name, realm_id) FROM stdin;
\.


--
-- TOC entry 4224 (class 0 OID 19143)
-- Dependencies: 249
-- Data for Name: idp_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.idp_mapper_config (idp_mapper_id, value, name) FROM stdin;
\.


--
-- TOC entry 4278 (class 0 OID 20227)
-- Dependencies: 303
-- Data for Name: jgroups_ping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jgroups_ping (address, name, cluster_name, ip, coord) FROM stdin;
\.


--
-- TOC entry 4237 (class 0 OID 19416)
-- Dependencies: 262
-- Data for Name: keycloak_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keycloak_group (id, name, parent_group, realm_id, type) FROM stdin;
\.


--
-- TOC entry 4198 (class 0 OID 18651)
-- Dependencies: 223
-- Data for Name: keycloak_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keycloak_role (id, client_realm_constraint, client_role, description, name, realm_id, client, realm) FROM stdin;
18913614-be88-467a-b0f6-d92fcb30b15e	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	${role_default-roles}	default-roles-master	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	\N
0cda48fc-9249-4be6-b4fc-7d808a80e170	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	${role_create-realm}	create-realm	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	\N
ef07997d-6717-4f20-bfd2-050ba20c4c0b	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	${role_admin}	admin	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	\N
973e9029-292b-4c00-964b-576dad1926c5	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_create-client}	create-client	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
3bd163be-2122-452d-a712-f99895cfd365	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_view-realm}	view-realm	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
96f0d728-1f5b-4384-9349-0998087cb92e	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_view-users}	view-users	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
a2ea2a3a-1ed1-40f3-9073-e84bde7d9528	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_view-clients}	view-clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
9962a997-ae3e-4acc-8ae7-adfba4cde930	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_view-events}	view-events	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
6f3ed210-a2e2-4319-8e96-4a567c94e622	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_view-identity-providers}	view-identity-providers	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
39affc5a-a00d-4f04-94d7-6b9259c13616	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_view-authorization}	view-authorization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
e754a297-41ab-4513-93a9-6db0bbae6563	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_manage-realm}	manage-realm	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
6bdc21cf-4323-42c2-8711-c10a93b30b42	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_manage-users}	manage-users	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
726f3628-2db0-41a3-834e-b4fdc4e9f6a6	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_manage-clients}	manage-clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
cce1cf8e-a51d-4753-8c15-cb16c480d8c8	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_manage-events}	manage-events	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
2bb6097b-a7ad-450e-993d-aa7c60a71e22	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_manage-identity-providers}	manage-identity-providers	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
9831b806-6830-4947-a85a-f1ddc9e8f3f6	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_manage-authorization}	manage-authorization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
ac78c5f9-fb62-413f-a719-9eae399d243d	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_query-users}	query-users	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
0a8fd190-49ae-4966-ad68-c44808586097	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_query-clients}	query-clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
1d2ad071-2e2d-49d8-9096-d3f5b72758ee	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_query-realms}	query-realms	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
4027792a-2e96-4a43-a83f-a392fc46060b	BookingSmart	f	Partner Role	PARTNER	BookingSmart	\N	\N
b682523b-5adc-4bd6-b89e-22c1cc65a788	4fd70fcc-3453-45c0-b754-e42d60067c03	t	\N	uma_protection	BookingSmart	4fd70fcc-3453-45c0-b754-e42d60067c03	\N
c36d9833-54fe-480a-8905-25e36157268f	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_query-groups}	query-groups	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
77cd327a-09eb-4595-b1bd-bc28714e5cb0	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_view-profile}	view-profile	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
1ba9029c-b3c4-4e06-b616-f8a1247a02ee	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_manage-account}	manage-account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
c05dfb22-27d3-4a6b-8053-506231fe31a8	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_manage-account-links}	manage-account-links	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
ddaf964b-9f4b-4531-8c14-5c79637960a1	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_view-applications}	view-applications	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
24396601-6600-42e3-914c-c6ab9dc92268	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_view-consent}	view-consent	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
7c4f78b2-4d61-433c-b9e7-75b8667444d4	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_manage-consent}	manage-consent	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
e4fb65de-7f7f-43ac-9b39-070a7118cacc	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_view-groups}	view-groups	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
7c1b6f55-607b-4bcb-af54-d32b1fc437f1	36589292-38ed-4b75-8b05-9d0b11f09f0c	t	${role_delete-account}	delete-account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	36589292-38ed-4b75-8b05-9d0b11f09f0c	\N
5732905e-594a-4acd-9b99-2aa6d54a5d49	d614e28a-2586-4719-9d43-6d6f684491e7	t	${role_read-token}	read-token	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	d614e28a-2586-4719-9d43-6d6f684491e7	\N
3a65009e-b3d2-4ee9-b8c5-8eacb60c163f	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	t	${role_impersonation}	impersonation	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	\N
89732194-ddc7-428d-9a03-c103e6c9831a	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	${role_offline-access}	offline_access	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	\N
a358a71b-c810-4a3f-8e74-6c5d4154f586	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	${role_uma_authorization}	uma_authorization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	\N	\N
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	BookingSmart	f	${role_default-roles}	default-roles-BookingSmart	BookingSmart	\N	\N
186d4911-98ed-4b20-91fa-d382e4815b63	759eab66-3913-43ee-af17-50718d34c183	t	${role_create-client}	create-client	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
49098659-87d9-46d0-b259-020acd8a5374	759eab66-3913-43ee-af17-50718d34c183	t	${role_view-realm}	view-realm	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
9454c395-056b-46c6-aa07-449cd264cd46	759eab66-3913-43ee-af17-50718d34c183	t	${role_view-users}	view-users	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
baec00bd-33de-4776-b121-cecbda85061c	759eab66-3913-43ee-af17-50718d34c183	t	${role_view-clients}	view-clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
f8b8efd1-d871-410a-bc8e-30a6beece1ce	759eab66-3913-43ee-af17-50718d34c183	t	${role_view-events}	view-events	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
ca4b4ef9-b2ee-4140-ab43-e00a3f995b29	759eab66-3913-43ee-af17-50718d34c183	t	${role_view-identity-providers}	view-identity-providers	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
2bbc28cc-beb7-44eb-9f50-9446b3b154c7	759eab66-3913-43ee-af17-50718d34c183	t	${role_view-authorization}	view-authorization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
91c6a786-2051-49a6-93a6-4320061e4738	759eab66-3913-43ee-af17-50718d34c183	t	${role_manage-realm}	manage-realm	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
a38683e0-1136-40e5-9a42-23463d77018c	759eab66-3913-43ee-af17-50718d34c183	t	${role_manage-users}	manage-users	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
0901b72b-aa1c-4cdd-abf1-431899890b08	759eab66-3913-43ee-af17-50718d34c183	t	${role_manage-clients}	manage-clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
93ce3ea0-5997-4893-9c30-cccfd8b750b7	759eab66-3913-43ee-af17-50718d34c183	t	${role_manage-events}	manage-events	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
55332a38-be28-4c22-bf49-47693be31adb	759eab66-3913-43ee-af17-50718d34c183	t	${role_manage-identity-providers}	manage-identity-providers	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
39b35bae-821a-4a90-a6c0-9fcb2770bc9c	759eab66-3913-43ee-af17-50718d34c183	t	${role_manage-authorization}	manage-authorization	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
6321ba5f-f19d-474c-9554-b4187009a878	759eab66-3913-43ee-af17-50718d34c183	t	${role_query-users}	query-users	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
775045ff-3bdf-4c67-bf15-f3db15632098	759eab66-3913-43ee-af17-50718d34c183	t	${role_query-clients}	query-clients	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
d94ec34a-4289-4268-bf44-a49c94549afd	759eab66-3913-43ee-af17-50718d34c183	t	${role_query-realms}	query-realms	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
0baefeb7-2ed4-44d0-81ea-a0ce813e9ddb	759eab66-3913-43ee-af17-50718d34c183	t	${role_query-groups}	query-groups	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
a4b40d5f-75d9-47d4-9119-eaf7db5a6c25	BookingSmart	f	${role_uma_authorization}	uma_authorization	BookingSmart	\N	\N
514784fb-7137-4134-bad7-db373e7d398a	BookingSmart	f	${role_offline-access}	offline_access	BookingSmart	\N	\N
eadee165-c7b4-4508-bf60-937580c5d987	BookingSmart	f	\N	ADMIN	BookingSmart	\N	\N
7cdd5ed7-4a2b-4b71-aa7a-f4b1085dd507	BookingSmart	f	\N	GUEST	BookingSmart	\N	\N
bbe55368-20f8-4787-b7c2-fc7e32073ad6	60946636-ed9b-470c-b900-277f4d41ba80	t	\N	uma_protection	BookingSmart	60946636-ed9b-470c-b900-277f4d41ba80	\N
b347faf1-614c-4560-b309-3963c8b8ed72	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_query-users}	query-users	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
6d01b738-8f9d-465b-9464-25389823c74f	cdd87e47-0556-4612-95ad-122de3a09b8f	t	\N	view-users	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
51a27561-fffb-40f1-a2b6-d7608bde9269	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_manage-events}	manage-events	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
6ba0385a-dc94-4da0-8649-92d9d684263e	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_impersonation}	impersonation	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
955f290e-e4d8-4af9-909c-09f776378031	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_manage-clients}	manage-clients	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
76a7b8bd-3440-4ae2-b951-51626d3468ae	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_manage-identity-providers}	manage-identity-providers	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
2006cd24-9bfb-417d-8e0b-81ef33fac6cf	BookingSmart	f		CUSTOMER	BookingSmart	\N	\N
de9badf2-e26c-4193-80d4-a604c659ed4f	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_create-client}	create-client	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
f00232df-6145-458e-9ce7-c7bc2334fa43	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_query-clients}	query-clients	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
41dbcfdb-d5fa-42ef-bbe9-af26f2c43bdb	cdd87e47-0556-4612-95ad-122de3a09b8f	t	\N	manage-users	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
5abdaafd-95b9-4f8c-8328-78f991efbb00	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_view-clients}	view-clients	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
f3048ffb-3023-4973-a25e-dfe42e83cc54	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_view-identity-providers}	view-identity-providers	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
6c17291d-e469-4139-aa90-b5e3b1a44e46	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_view-authorization}	view-authorization	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
e2b7165b-59d7-415b-a4b9-cd705eae95a3	cdd87e47-0556-4612-95ad-122de3a09b8f	t	\N	manage-realm	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
48084127-c5e1-41be-ba71-2406823788ae	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_view-events}	view-events	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
361537c1-1c9e-47dc-906c-c96b2eeb654d	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_query-groups}	query-groups	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
2d591814-fb0b-4df2-b8fa-4d894bf2789a	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_realm-admin}	realm-admin	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
0b754c52-b512-4c64-aa72-d358e18aabbc	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_query-realms}	query-realms	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
95a46057-7254-452e-b6b9-f34178a84aa8	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_manage-authorization}	manage-authorization	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
6ec2be44-3b2d-49aa-9706-1845559d986e	cdd87e47-0556-4612-95ad-122de3a09b8f	t	${role_view-realm}	view-realm	BookingSmart	cdd87e47-0556-4612-95ad-122de3a09b8f	\N
4e71f89c-cffc-4a7a-8bf3-51524e6db708	4f64c142-0545-44bb-9446-2a18b9c9effd	t	\N	uma_protection	BookingSmart	4f64c142-0545-44bb-9446-2a18b9c9effd	\N
84c2f82c-0d3c-4b44-ba9d-d38600a94f3d	63a551a9-12e6-465b-9b06-83747ff64c8d	t	${role_delete-account}	delete-account	BookingSmart	63a551a9-12e6-465b-9b06-83747ff64c8d	\N
4ce54078-8a93-4155-9ba8-cd7fab17c24c	63a551a9-12e6-465b-9b06-83747ff64c8d	t	${role_view-groups}	view-groups	BookingSmart	63a551a9-12e6-465b-9b06-83747ff64c8d	\N
ef9822dc-6691-4a5c-bdb5-f7bc6295bcf7	759eab66-3913-43ee-af17-50718d34c183	t	${role_impersonation}	impersonation	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	759eab66-3913-43ee-af17-50718d34c183	\N
\.


--
-- TOC entry 4222 (class 0 OID 19135)
-- Dependencies: 247
-- Data for Name: migration_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migration_model (id, version, update_time) FROM stdin;
n5pju	26.0.2	1752057706
6b7m7	26.2.4	1752057879
\.


--
-- TOC entry 4236 (class 0 OID 19407)
-- Dependencies: 261
-- Data for Name: offline_client_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_client_session (user_session_id, client_id, offline_flag, "timestamp", data, client_storage_provider, external_client_id, version) FROM stdin;
\.


--
-- TOC entry 4235 (class 0 OID 19402)
-- Dependencies: 260
-- Data for Name: offline_user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_user_session (user_session_id, user_id, realm_id, created_on, offline_flag, data, last_session_refresh, broker_session_id, version) FROM stdin;
\.


--
-- TOC entry 4275 (class 0 OID 20187)
-- Dependencies: 300
-- Data for Name: org; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org (id, enabled, realm_id, group_id, name, description, alias, redirect_url) FROM stdin;
\.


--
-- TOC entry 4276 (class 0 OID 20198)
-- Dependencies: 301
-- Data for Name: org_domain; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_domain (id, name, verified, org_id) FROM stdin;
\.


--
-- TOC entry 4249 (class 0 OID 19621)
-- Dependencies: 274
-- Data for Name: policy_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policy_config (policy_id, name, value) FROM stdin;
cc3360af-6716-474a-82e1-642c6b33ed71	code	// by default, grants any permission associated with this policy\n$evaluation.grant();\n
e45f8d60-3beb-4fcf-b754-bfecfdef881c	defaultResourceType	urn:ai-agent:resources:default
\.


--
-- TOC entry 4215 (class 0 OID 19009)
-- Dependencies: 240
-- Data for Name: protocol_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol_mapper (id, name, protocol, protocol_mapper_name, client_id, client_scope_id) FROM stdin;
1eb991fb-59b6-402e-a48d-12622f88345e	audience resolve	openid-connect	oidc-audience-resolve-mapper	a35b84ae-8974-404d-a0d8-f875605c1237	\N
c920aa8b-4c37-4842-b3d7-c695f5fb5455	locale	openid-connect	oidc-usermodel-attribute-mapper	38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	\N
5b034a0b-abde-46d5-8e01-c9ee6b044584	role list	saml	saml-role-list-mapper	\N	9aaa1139-f272-4b26-b187-52803cce15d5
ab660a64-3880-4b2c-910b-cd88d42e53fd	organization	saml	saml-organization-membership-mapper	\N	99848d6e-9162-4408-98a7-5e25ebc2de65
7899aeda-962c-4757-8cdb-665395df313d	full name	openid-connect	oidc-full-name-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
43e2b312-65e4-414e-b784-5716a84ddf5d	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
7997f56d-9174-4f72-9cc0-f7c9a6354f75	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
4f824417-bd42-4c9f-aaf5-93fac726a172	username	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
d54ead58-02ed-4885-9111-bfd6fde906d8	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
6f205a05-5138-4112-947b-44cc0595c5d1	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	website	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
5d14ec36-077a-4892-9675-6bc251306910	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
e65294f0-37b2-4986-ba43-9421c939ae0e	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	35f672af-755b-476f-9547-d9d7bc3d16f2
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	email	openid-connect	oidc-usermodel-attribute-mapper	\N	126145f5-69f7-4cbf-a41e-32167b138ff3
90daa162-581d-4529-896e-e56cec7c5e79	email verified	openid-connect	oidc-usermodel-property-mapper	\N	126145f5-69f7-4cbf-a41e-32167b138ff3
b76e963e-c57c-40d8-ae35-1992ba741a70	address	openid-connect	oidc-address-mapper	\N	db047953-087f-4f21-a24e-7dec069f3f25
0bec32fc-2b7a-4f01-8809-89b32895bf59	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	360c129b-3063-4ce9-8b84-6ec811b8a7b0
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	360c129b-3063-4ce9-8b84-6ec811b8a7b0
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	57c299a1-732b-4fec-b557-217d1c34b759
e916ee18-e43d-4264-8816-645b60e3d784	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	57c299a1-732b-4fec-b557-217d1c34b759
2f6816b3-2378-46c4-8832-a14b4e3498f7	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	57c299a1-732b-4fec-b557-217d1c34b759
3380bf6c-0408-487d-9f29-6858e6c801f6	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	ff7191d1-bd41-473b-95a6-561831e14f9a
abe95937-c1da-4bcd-b9c4-76416d43f7df	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8
9aae5974-f0fa-4493-8365-26a874cff869	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	725c2cf4-5b15-4b0f-8fb5-4e1e0faa6ed8
91e516d3-37fb-49a8-9185-174af82d0c33	acr loa level	openid-connect	oidc-acr-mapper	\N	f35ebce8-cc56-40cd-877a-f7e9576237c4
c91af22c-1925-45b5-8368-b1211c0b823d	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b
cc6fa3b4-f644-465d-99bc-d0c878ee8d7e	sub	openid-connect	oidc-sub-mapper	\N	bcb0d3dc-14e2-48ef-862d-3ff6a779eb1b
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	\N	bdc7a0da-37ee-47c8-878f-7e143fda55a9
6e035155-8b74-40a4-adfe-90ee9174a408	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	\N	bdc7a0da-37ee-47c8-878f-7e143fda55a9
84791fb3-f931-4e2f-b57d-1d3a83260e37	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	\N	bdc7a0da-37ee-47c8-878f-7e143fda55a9
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	organization	openid-connect	oidc-organization-membership-mapper	\N	29062bb5-3dc2-43b4-9bdf-9b032f13b2db
974d8ce9-735f-487a-a6a9-588e561e901f	email verified	openid-connect	oidc-usermodel-property-mapper	\N	65c94f63-6035-4d6c-af24-1f14e3b94a38
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	email	openid-connect	oidc-usermodel-property-mapper	\N	65c94f63-6035-4d6c-af24-1f14e3b94a38
5f266f3e-7913-4fd6-971c-d8db155a1d1f	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	\N	5a9f857f-66df-4d72-b1c9-74e50ff4bd18
c59f0e75-83e1-4d86-988f-b90af36a8b16	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	\N	5a9f857f-66df-4d72-b1c9-74e50ff4bd18
1c64f479-a61b-43d0-ba4d-da08238c8a24	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	\N	5a9f857f-66df-4d72-b1c9-74e50ff4bd18
d99969f9-1402-4d8b-a6ba-558a57caae9e	address	openid-connect	oidc-address-mapper	\N	eea01d80-65da-4540-85c9-c22b6193479e
fbffeaba-3e7b-432c-abbd-d4110f0fb8d2	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	337c3515-30b8-4e7c-881a-109f1c94a011
633c2dc7-4702-4755-8a53-456f87576ab8	sub	openid-connect	oidc-sub-mapper	\N	b718c7ed-ede2-45f9-92d1-36acd43408d1
19186ae0-0013-40a1-b5a9-73684c2c16d0	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	b718c7ed-ede2-45f9-92d1-36acd43408d1
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998
45412629-3241-42cc-9c31-e931a5ccfbd8	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	2cd6e0f6-a0dc-4eab-bbc2-792cb4f2f998
4a393c0d-069d-4012-be5d-c5157e0291e5	role list	saml	saml-role-list-mapper	\N	51e71de7-0fa8-4ca8-9789-d1a240e7954c
cf2078e3-4b15-44c9-ad07-7f8f87d8a057	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	215618ce-81df-4751-b38a-b64b011a7475
4aaee979-5114-4d48-9e9c-415ac0240dec	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	215618ce-81df-4751-b38a-b64b011a7475
acb14904-46e0-40be-bea8-130d04bf52d2	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	215618ce-81df-4751-b38a-b64b011a7475
071dc8d4-03af-4960-9211-a0313a902caa	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	571bd089-79c4-414f-811d-059110e90303
5fc63466-e78c-44ae-892e-cc1af3d9ff89	upn	openid-connect	oidc-usermodel-property-mapper	\N	571bd089-79c4-414f-811d-059110e90303
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
3912134c-627e-4e9f-8d3a-5120d799fb16	username	openid-connect	oidc-usermodel-property-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
2cfd41fc-61c3-468b-89ed-1b929c32568c	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
c7f24d2a-0740-4724-8008-45600c5e9742	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
77e47ece-29ac-4de2-a452-a4a1e2a9f130	website	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
06b7db1f-adfa-41c3-9286-9a945ca13cfa	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	given name	openid-connect	oidc-usermodel-property-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
0ca34d5e-f181-4c1a-8d72-41ba359cef57	full name	openid-connect	oidc-full-name-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
04bad41a-daf4-48d9-a6e1-80fd41ea223b	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	family name	openid-connect	oidc-usermodel-property-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	19969f81-191a-4485-b659-4a5ebe01285c
3f29f288-049e-4e95-a060-fa45809f8908	acr loa level	openid-connect	oidc-acr-mapper	\N	0ddee3ba-73b6-43bc-b66a-cf8bf520e2a5
667a0992-0916-45fc-aa7d-a70573b56ee9	audience resolve	openid-connect	oidc-audience-resolve-mapper	c9b985d8-1db7-43aa-aabe-35b103bce986	\N
bde88d27-ba50-4b7a-87b3-f610d7e93c2e	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	26490047-2a91-4938-9324-371523ad1e14	\N
00d85c6f-6a39-4ef6-a1a3-437da954a317	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	60946636-ed9b-470c-b900-277f4d41ba80	\N
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	60946636-ed9b-470c-b900-277f4d41ba80	\N
1727d303-0db0-4d37-a861-3c3f22029470	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	60946636-ed9b-470c-b900-277f4d41ba80	\N
bf597b1e-302a-4cac-92e7-72da275a9450	locale	openid-connect	oidc-usermodel-attribute-mapper	36b9332d-e925-42e2-bef4-6e9271695118	\N
e5b39176-5f85-48e6-8aba-6e0442eaa712	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	4f64c142-0545-44bb-9446-2a18b9c9effd	\N
4872f46c-4ebe-4820-ac83-3ae267d47441	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	4f64c142-0545-44bb-9446-2a18b9c9effd	\N
cba83ef5-0a89-44bb-81ac-62dac81c7773	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	4f64c142-0545-44bb-9446-2a18b9c9effd	\N
d3968f38-2a46-411f-849f-5342e7008e44	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	4f64c142-0545-44bb-9446-2a18b9c9effd	\N
\.


--
-- TOC entry 4216 (class 0 OID 19015)
-- Dependencies: 241
-- Data for Name: protocol_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol_mapper_config (protocol_mapper_id, value, name) FROM stdin;
c920aa8b-4c37-4842-b3d7-c695f5fb5455	true	introspection.token.claim
c920aa8b-4c37-4842-b3d7-c695f5fb5455	true	userinfo.token.claim
c920aa8b-4c37-4842-b3d7-c695f5fb5455	locale	user.attribute
c920aa8b-4c37-4842-b3d7-c695f5fb5455	true	id.token.claim
c920aa8b-4c37-4842-b3d7-c695f5fb5455	true	access.token.claim
c920aa8b-4c37-4842-b3d7-c695f5fb5455	locale	claim.name
c920aa8b-4c37-4842-b3d7-c695f5fb5455	String	jsonType.label
5b034a0b-abde-46d5-8e01-c9ee6b044584	false	single
5b034a0b-abde-46d5-8e01-c9ee6b044584	Basic	attribute.nameformat
5b034a0b-abde-46d5-8e01-c9ee6b044584	Role	attribute.name
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	true	introspection.token.claim
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	true	userinfo.token.claim
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	firstName	user.attribute
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	true	id.token.claim
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	true	access.token.claim
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	given_name	claim.name
0f4a1437-2cb4-48e2-9af0-34c4fa2cec51	String	jsonType.label
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	true	introspection.token.claim
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	true	userinfo.token.claim
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	updatedAt	user.attribute
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	true	id.token.claim
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	true	access.token.claim
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	updated_at	claim.name
2af7f37f-a4b5-4948-9b15-aa1c696d1d18	long	jsonType.label
43e2b312-65e4-414e-b784-5716a84ddf5d	true	introspection.token.claim
43e2b312-65e4-414e-b784-5716a84ddf5d	true	userinfo.token.claim
43e2b312-65e4-414e-b784-5716a84ddf5d	middleName	user.attribute
43e2b312-65e4-414e-b784-5716a84ddf5d	true	id.token.claim
43e2b312-65e4-414e-b784-5716a84ddf5d	true	access.token.claim
43e2b312-65e4-414e-b784-5716a84ddf5d	middle_name	claim.name
43e2b312-65e4-414e-b784-5716a84ddf5d	String	jsonType.label
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	true	introspection.token.claim
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	true	userinfo.token.claim
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	lastName	user.attribute
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	true	id.token.claim
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	true	access.token.claim
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	family_name	claim.name
4b367033-0a9e-4926-b2f3-06f2b0bd0c30	String	jsonType.label
4f824417-bd42-4c9f-aaf5-93fac726a172	true	introspection.token.claim
4f824417-bd42-4c9f-aaf5-93fac726a172	true	userinfo.token.claim
4f824417-bd42-4c9f-aaf5-93fac726a172	username	user.attribute
4f824417-bd42-4c9f-aaf5-93fac726a172	true	id.token.claim
4f824417-bd42-4c9f-aaf5-93fac726a172	true	access.token.claim
4f824417-bd42-4c9f-aaf5-93fac726a172	preferred_username	claim.name
4f824417-bd42-4c9f-aaf5-93fac726a172	String	jsonType.label
5d14ec36-077a-4892-9675-6bc251306910	true	introspection.token.claim
5d14ec36-077a-4892-9675-6bc251306910	true	userinfo.token.claim
5d14ec36-077a-4892-9675-6bc251306910	gender	user.attribute
5d14ec36-077a-4892-9675-6bc251306910	true	id.token.claim
5d14ec36-077a-4892-9675-6bc251306910	true	access.token.claim
5d14ec36-077a-4892-9675-6bc251306910	gender	claim.name
5d14ec36-077a-4892-9675-6bc251306910	String	jsonType.label
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	true	introspection.token.claim
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	true	userinfo.token.claim
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	zoneinfo	user.attribute
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	true	id.token.claim
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	true	access.token.claim
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	zoneinfo	claim.name
679f6aeb-62c2-4dbe-8456-6dd149c15bfe	String	jsonType.label
6f205a05-5138-4112-947b-44cc0595c5d1	true	introspection.token.claim
6f205a05-5138-4112-947b-44cc0595c5d1	true	userinfo.token.claim
6f205a05-5138-4112-947b-44cc0595c5d1	picture	user.attribute
6f205a05-5138-4112-947b-44cc0595c5d1	true	id.token.claim
6f205a05-5138-4112-947b-44cc0595c5d1	true	access.token.claim
6f205a05-5138-4112-947b-44cc0595c5d1	picture	claim.name
6f205a05-5138-4112-947b-44cc0595c5d1	String	jsonType.label
7899aeda-962c-4757-8cdb-665395df313d	true	introspection.token.claim
7899aeda-962c-4757-8cdb-665395df313d	true	userinfo.token.claim
7899aeda-962c-4757-8cdb-665395df313d	true	id.token.claim
7899aeda-962c-4757-8cdb-665395df313d	true	access.token.claim
7997f56d-9174-4f72-9cc0-f7c9a6354f75	true	introspection.token.claim
7997f56d-9174-4f72-9cc0-f7c9a6354f75	true	userinfo.token.claim
7997f56d-9174-4f72-9cc0-f7c9a6354f75	nickname	user.attribute
7997f56d-9174-4f72-9cc0-f7c9a6354f75	true	id.token.claim
7997f56d-9174-4f72-9cc0-f7c9a6354f75	true	access.token.claim
7997f56d-9174-4f72-9cc0-f7c9a6354f75	nickname	claim.name
7997f56d-9174-4f72-9cc0-f7c9a6354f75	String	jsonType.label
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	true	introspection.token.claim
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	true	userinfo.token.claim
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	birthdate	user.attribute
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	true	id.token.claim
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	true	access.token.claim
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	birthdate	claim.name
89a8c8a3-ad9e-4d7e-9f48-5693fee2e419	String	jsonType.label
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	true	introspection.token.claim
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	true	userinfo.token.claim
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	website	user.attribute
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	true	id.token.claim
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	true	access.token.claim
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	website	claim.name
a6377c3a-b8de-475b-bed3-9cfd5c7f28bf	String	jsonType.label
d54ead58-02ed-4885-9111-bfd6fde906d8	true	introspection.token.claim
d54ead58-02ed-4885-9111-bfd6fde906d8	true	userinfo.token.claim
d54ead58-02ed-4885-9111-bfd6fde906d8	profile	user.attribute
d54ead58-02ed-4885-9111-bfd6fde906d8	true	id.token.claim
d54ead58-02ed-4885-9111-bfd6fde906d8	true	access.token.claim
d54ead58-02ed-4885-9111-bfd6fde906d8	profile	claim.name
d54ead58-02ed-4885-9111-bfd6fde906d8	String	jsonType.label
e65294f0-37b2-4986-ba43-9421c939ae0e	true	introspection.token.claim
e65294f0-37b2-4986-ba43-9421c939ae0e	true	userinfo.token.claim
e65294f0-37b2-4986-ba43-9421c939ae0e	locale	user.attribute
e65294f0-37b2-4986-ba43-9421c939ae0e	true	id.token.claim
e65294f0-37b2-4986-ba43-9421c939ae0e	true	access.token.claim
e65294f0-37b2-4986-ba43-9421c939ae0e	locale	claim.name
e65294f0-37b2-4986-ba43-9421c939ae0e	String	jsonType.label
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	true	introspection.token.claim
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	true	userinfo.token.claim
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	email	user.attribute
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	true	id.token.claim
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	true	access.token.claim
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	email	claim.name
8a9a0c5c-2207-4f43-85bb-36b76aee23bc	String	jsonType.label
90daa162-581d-4529-896e-e56cec7c5e79	true	introspection.token.claim
90daa162-581d-4529-896e-e56cec7c5e79	true	userinfo.token.claim
90daa162-581d-4529-896e-e56cec7c5e79	emailVerified	user.attribute
90daa162-581d-4529-896e-e56cec7c5e79	true	id.token.claim
90daa162-581d-4529-896e-e56cec7c5e79	true	access.token.claim
90daa162-581d-4529-896e-e56cec7c5e79	email_verified	claim.name
90daa162-581d-4529-896e-e56cec7c5e79	boolean	jsonType.label
b76e963e-c57c-40d8-ae35-1992ba741a70	formatted	user.attribute.formatted
b76e963e-c57c-40d8-ae35-1992ba741a70	country	user.attribute.country
b76e963e-c57c-40d8-ae35-1992ba741a70	true	introspection.token.claim
b76e963e-c57c-40d8-ae35-1992ba741a70	postal_code	user.attribute.postal_code
b76e963e-c57c-40d8-ae35-1992ba741a70	true	userinfo.token.claim
b76e963e-c57c-40d8-ae35-1992ba741a70	street	user.attribute.street
b76e963e-c57c-40d8-ae35-1992ba741a70	true	id.token.claim
b76e963e-c57c-40d8-ae35-1992ba741a70	region	user.attribute.region
b76e963e-c57c-40d8-ae35-1992ba741a70	true	access.token.claim
b76e963e-c57c-40d8-ae35-1992ba741a70	locality	user.attribute.locality
0bec32fc-2b7a-4f01-8809-89b32895bf59	true	introspection.token.claim
0bec32fc-2b7a-4f01-8809-89b32895bf59	true	userinfo.token.claim
0bec32fc-2b7a-4f01-8809-89b32895bf59	phoneNumber	user.attribute
0bec32fc-2b7a-4f01-8809-89b32895bf59	true	id.token.claim
0bec32fc-2b7a-4f01-8809-89b32895bf59	true	access.token.claim
0bec32fc-2b7a-4f01-8809-89b32895bf59	phone_number	claim.name
0bec32fc-2b7a-4f01-8809-89b32895bf59	String	jsonType.label
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	true	introspection.token.claim
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	true	userinfo.token.claim
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	phoneNumberVerified	user.attribute
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	true	id.token.claim
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	true	access.token.claim
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	phone_number_verified	claim.name
bd6b497a-1eb6-4712-b6d9-e3ffde60f520	boolean	jsonType.label
2f6816b3-2378-46c4-8832-a14b4e3498f7	true	introspection.token.claim
2f6816b3-2378-46c4-8832-a14b4e3498f7	true	access.token.claim
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	true	introspection.token.claim
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	true	multivalued
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	foo	user.attribute
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	true	access.token.claim
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	realm_access.roles	claim.name
a8af5924-bf43-4d7b-8912-4e4b7b18f22d	String	jsonType.label
e916ee18-e43d-4264-8816-645b60e3d784	true	introspection.token.claim
e916ee18-e43d-4264-8816-645b60e3d784	true	multivalued
e916ee18-e43d-4264-8816-645b60e3d784	foo	user.attribute
e916ee18-e43d-4264-8816-645b60e3d784	true	access.token.claim
e916ee18-e43d-4264-8816-645b60e3d784	resource_access.${client_id}.roles	claim.name
e916ee18-e43d-4264-8816-645b60e3d784	String	jsonType.label
3380bf6c-0408-487d-9f29-6858e6c801f6	true	introspection.token.claim
3380bf6c-0408-487d-9f29-6858e6c801f6	true	access.token.claim
9aae5974-f0fa-4493-8365-26a874cff869	true	introspection.token.claim
9aae5974-f0fa-4493-8365-26a874cff869	true	multivalued
9aae5974-f0fa-4493-8365-26a874cff869	foo	user.attribute
9aae5974-f0fa-4493-8365-26a874cff869	true	id.token.claim
9aae5974-f0fa-4493-8365-26a874cff869	true	access.token.claim
9aae5974-f0fa-4493-8365-26a874cff869	groups	claim.name
9aae5974-f0fa-4493-8365-26a874cff869	String	jsonType.label
abe95937-c1da-4bcd-b9c4-76416d43f7df	true	introspection.token.claim
abe95937-c1da-4bcd-b9c4-76416d43f7df	true	userinfo.token.claim
abe95937-c1da-4bcd-b9c4-76416d43f7df	username	user.attribute
abe95937-c1da-4bcd-b9c4-76416d43f7df	true	id.token.claim
abe95937-c1da-4bcd-b9c4-76416d43f7df	true	access.token.claim
abe95937-c1da-4bcd-b9c4-76416d43f7df	upn	claim.name
abe95937-c1da-4bcd-b9c4-76416d43f7df	String	jsonType.label
91e516d3-37fb-49a8-9185-174af82d0c33	true	introspection.token.claim
91e516d3-37fb-49a8-9185-174af82d0c33	true	id.token.claim
91e516d3-37fb-49a8-9185-174af82d0c33	true	access.token.claim
c91af22c-1925-45b5-8368-b1211c0b823d	AUTH_TIME	user.session.note
c91af22c-1925-45b5-8368-b1211c0b823d	true	introspection.token.claim
c91af22c-1925-45b5-8368-b1211c0b823d	true	id.token.claim
c91af22c-1925-45b5-8368-b1211c0b823d	true	access.token.claim
c91af22c-1925-45b5-8368-b1211c0b823d	auth_time	claim.name
c91af22c-1925-45b5-8368-b1211c0b823d	long	jsonType.label
cc6fa3b4-f644-465d-99bc-d0c878ee8d7e	true	introspection.token.claim
cc6fa3b4-f644-465d-99bc-d0c878ee8d7e	true	access.token.claim
6e035155-8b74-40a4-adfe-90ee9174a408	clientHost	user.session.note
6e035155-8b74-40a4-adfe-90ee9174a408	true	introspection.token.claim
6e035155-8b74-40a4-adfe-90ee9174a408	true	id.token.claim
6e035155-8b74-40a4-adfe-90ee9174a408	true	access.token.claim
6e035155-8b74-40a4-adfe-90ee9174a408	clientHost	claim.name
6e035155-8b74-40a4-adfe-90ee9174a408	String	jsonType.label
84791fb3-f931-4e2f-b57d-1d3a83260e37	clientAddress	user.session.note
84791fb3-f931-4e2f-b57d-1d3a83260e37	true	introspection.token.claim
84791fb3-f931-4e2f-b57d-1d3a83260e37	true	id.token.claim
84791fb3-f931-4e2f-b57d-1d3a83260e37	true	access.token.claim
84791fb3-f931-4e2f-b57d-1d3a83260e37	clientAddress	claim.name
84791fb3-f931-4e2f-b57d-1d3a83260e37	String	jsonType.label
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	client_id	user.session.note
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	true	introspection.token.claim
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	true	id.token.claim
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	true	access.token.claim
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	client_id	claim.name
c41d4d80-eb27-41f3-95ff-0c0df5f7f51f	String	jsonType.label
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	true	introspection.token.claim
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	true	multivalued
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	true	id.token.claim
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	true	access.token.claim
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	organization	claim.name
31b96d7b-a0d8-4197-91a9-9aa532edc7ff	String	jsonType.label
974d8ce9-735f-487a-a6a9-588e561e901f	emailVerified	user.attribute
974d8ce9-735f-487a-a6a9-588e561e901f	true	id.token.claim
974d8ce9-735f-487a-a6a9-588e561e901f	true	access.token.claim
974d8ce9-735f-487a-a6a9-588e561e901f	email_verified	claim.name
974d8ce9-735f-487a-a6a9-588e561e901f	boolean	jsonType.label
974d8ce9-735f-487a-a6a9-588e561e901f	true	userinfo.token.claim
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	email	user.attribute
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	true	id.token.claim
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	true	access.token.claim
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	email	claim.name
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	String	jsonType.label
fb983e0f-34a1-4044-a3d6-53c0c2b62c00	true	userinfo.token.claim
1c64f479-a61b-43d0-ba4d-da08238c8a24	clientHost	user.session.note
1c64f479-a61b-43d0-ba4d-da08238c8a24	true	id.token.claim
1c64f479-a61b-43d0-ba4d-da08238c8a24	true	introspection.token.claim
1c64f479-a61b-43d0-ba4d-da08238c8a24	true	access.token.claim
1c64f479-a61b-43d0-ba4d-da08238c8a24	clientHost	claim.name
1c64f479-a61b-43d0-ba4d-da08238c8a24	String	jsonType.label
5f266f3e-7913-4fd6-971c-d8db155a1d1f	client_id	user.session.note
5f266f3e-7913-4fd6-971c-d8db155a1d1f	true	introspection.token.claim
5f266f3e-7913-4fd6-971c-d8db155a1d1f	true	userinfo.token.claim
5f266f3e-7913-4fd6-971c-d8db155a1d1f	true	id.token.claim
5f266f3e-7913-4fd6-971c-d8db155a1d1f	true	access.token.claim
5f266f3e-7913-4fd6-971c-d8db155a1d1f	client_id	claim.name
5f266f3e-7913-4fd6-971c-d8db155a1d1f	String	jsonType.label
c59f0e75-83e1-4d86-988f-b90af36a8b16	clientAddress	user.session.note
c59f0e75-83e1-4d86-988f-b90af36a8b16	true	id.token.claim
c59f0e75-83e1-4d86-988f-b90af36a8b16	true	introspection.token.claim
c59f0e75-83e1-4d86-988f-b90af36a8b16	true	access.token.claim
c59f0e75-83e1-4d86-988f-b90af36a8b16	clientAddress	claim.name
c59f0e75-83e1-4d86-988f-b90af36a8b16	String	jsonType.label
c59f0e75-83e1-4d86-988f-b90af36a8b16	true	userinfo.token.claim
1c64f479-a61b-43d0-ba4d-da08238c8a24	true	userinfo.token.claim
d99969f9-1402-4d8b-a6ba-558a57caae9e	formatted	user.attribute.formatted
d99969f9-1402-4d8b-a6ba-558a57caae9e	country	user.attribute.country
d99969f9-1402-4d8b-a6ba-558a57caae9e	postal_code	user.attribute.postal_code
d99969f9-1402-4d8b-a6ba-558a57caae9e	true	userinfo.token.claim
d99969f9-1402-4d8b-a6ba-558a57caae9e	street	user.attribute.street
d99969f9-1402-4d8b-a6ba-558a57caae9e	true	id.token.claim
d99969f9-1402-4d8b-a6ba-558a57caae9e	region	user.attribute.region
d99969f9-1402-4d8b-a6ba-558a57caae9e	true	access.token.claim
d99969f9-1402-4d8b-a6ba-558a57caae9e	locality	user.attribute.locality
19186ae0-0013-40a1-b5a9-73684c2c16d0	AUTH_TIME	user.session.note
19186ae0-0013-40a1-b5a9-73684c2c16d0	true	introspection.token.claim
19186ae0-0013-40a1-b5a9-73684c2c16d0	true	userinfo.token.claim
19186ae0-0013-40a1-b5a9-73684c2c16d0	true	id.token.claim
19186ae0-0013-40a1-b5a9-73684c2c16d0	true	access.token.claim
19186ae0-0013-40a1-b5a9-73684c2c16d0	auth_time	claim.name
19186ae0-0013-40a1-b5a9-73684c2c16d0	long	jsonType.label
633c2dc7-4702-4755-8a53-456f87576ab8	true	introspection.token.claim
633c2dc7-4702-4755-8a53-456f87576ab8	true	access.token.claim
45412629-3241-42cc-9c31-e931a5ccfbd8	phoneNumber	user.attribute
45412629-3241-42cc-9c31-e931a5ccfbd8	true	id.token.claim
45412629-3241-42cc-9c31-e931a5ccfbd8	true	access.token.claim
45412629-3241-42cc-9c31-e931a5ccfbd8	phone_number	claim.name
45412629-3241-42cc-9c31-e931a5ccfbd8	String	jsonType.label
45412629-3241-42cc-9c31-e931a5ccfbd8	true	userinfo.token.claim
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	phoneNumberVerified	user.attribute
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	true	id.token.claim
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	true	access.token.claim
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	phone_number_verified	claim.name
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	boolean	jsonType.label
effcf372-86b3-4be7-9fd5-bd4b27f81ad7	true	userinfo.token.claim
4a393c0d-069d-4012-be5d-c5157e0291e5	false	single
4a393c0d-069d-4012-be5d-c5157e0291e5	Basic	attribute.nameformat
4a393c0d-069d-4012-be5d-c5157e0291e5	Role	attribute.name
4aaee979-5114-4d48-9e9c-415ac0240dec	foo	user.attribute
4aaee979-5114-4d48-9e9c-415ac0240dec	true	access.token.claim
4aaee979-5114-4d48-9e9c-415ac0240dec	resource_access.${client_id}.roles	claim.name
4aaee979-5114-4d48-9e9c-415ac0240dec	String	jsonType.label
4aaee979-5114-4d48-9e9c-415ac0240dec	true	multivalued
cf2078e3-4b15-44c9-ad07-7f8f87d8a057	foo	user.attribute
cf2078e3-4b15-44c9-ad07-7f8f87d8a057	true	access.token.claim
cf2078e3-4b15-44c9-ad07-7f8f87d8a057	realm_access.roles	claim.name
cf2078e3-4b15-44c9-ad07-7f8f87d8a057	String	jsonType.label
cf2078e3-4b15-44c9-ad07-7f8f87d8a057	true	multivalued
071dc8d4-03af-4960-9211-a0313a902caa	true	multivalued
071dc8d4-03af-4960-9211-a0313a902caa	true	userinfo.token.claim
071dc8d4-03af-4960-9211-a0313a902caa	foo	user.attribute
071dc8d4-03af-4960-9211-a0313a902caa	true	id.token.claim
071dc8d4-03af-4960-9211-a0313a902caa	true	access.token.claim
071dc8d4-03af-4960-9211-a0313a902caa	groups	claim.name
071dc8d4-03af-4960-9211-a0313a902caa	String	jsonType.label
5fc63466-e78c-44ae-892e-cc1af3d9ff89	username	user.attribute
5fc63466-e78c-44ae-892e-cc1af3d9ff89	true	id.token.claim
5fc63466-e78c-44ae-892e-cc1af3d9ff89	true	access.token.claim
5fc63466-e78c-44ae-892e-cc1af3d9ff89	upn	claim.name
5fc63466-e78c-44ae-892e-cc1af3d9ff89	String	jsonType.label
5fc63466-e78c-44ae-892e-cc1af3d9ff89	true	userinfo.token.claim
04bad41a-daf4-48d9-a6e1-80fd41ea223b	gender	user.attribute
04bad41a-daf4-48d9-a6e1-80fd41ea223b	true	id.token.claim
04bad41a-daf4-48d9-a6e1-80fd41ea223b	true	access.token.claim
04bad41a-daf4-48d9-a6e1-80fd41ea223b	gender	claim.name
04bad41a-daf4-48d9-a6e1-80fd41ea223b	String	jsonType.label
04bad41a-daf4-48d9-a6e1-80fd41ea223b	true	userinfo.token.claim
06b7db1f-adfa-41c3-9286-9a945ca13cfa	birthdate	user.attribute
06b7db1f-adfa-41c3-9286-9a945ca13cfa	true	id.token.claim
06b7db1f-adfa-41c3-9286-9a945ca13cfa	true	access.token.claim
06b7db1f-adfa-41c3-9286-9a945ca13cfa	birthdate	claim.name
06b7db1f-adfa-41c3-9286-9a945ca13cfa	String	jsonType.label
06b7db1f-adfa-41c3-9286-9a945ca13cfa	true	userinfo.token.claim
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	middleName	user.attribute
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	true	id.token.claim
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	true	access.token.claim
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	middle_name	claim.name
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	String	jsonType.label
09ebd0bc-7811-46d0-aff0-f8d7adf5982f	true	userinfo.token.claim
0ca34d5e-f181-4c1a-8d72-41ba359cef57	true	id.token.claim
0ca34d5e-f181-4c1a-8d72-41ba359cef57	true	access.token.claim
0ca34d5e-f181-4c1a-8d72-41ba359cef57	true	userinfo.token.claim
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	nickname	user.attribute
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	true	id.token.claim
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	true	access.token.claim
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	nickname	claim.name
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	String	jsonType.label
153dbe4c-7205-4a42-86d7-c0ec6ac152f7	true	userinfo.token.claim
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	zoneinfo	user.attribute
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	true	id.token.claim
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	true	access.token.claim
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	zoneinfo	claim.name
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	String	jsonType.label
1b4331fe-334c-4ba4-9c2d-e0f073d3762e	true	userinfo.token.claim
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	profile	user.attribute
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	true	id.token.claim
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	true	access.token.claim
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	profile	claim.name
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	String	jsonType.label
2c2c19aa-e05b-4d61-ae0e-1d3086b90531	true	userinfo.token.claim
2cfd41fc-61c3-468b-89ed-1b929c32568c	picture	user.attribute
2cfd41fc-61c3-468b-89ed-1b929c32568c	true	id.token.claim
2cfd41fc-61c3-468b-89ed-1b929c32568c	true	access.token.claim
2cfd41fc-61c3-468b-89ed-1b929c32568c	picture	claim.name
2cfd41fc-61c3-468b-89ed-1b929c32568c	String	jsonType.label
2cfd41fc-61c3-468b-89ed-1b929c32568c	true	userinfo.token.claim
3912134c-627e-4e9f-8d3a-5120d799fb16	username	user.attribute
3912134c-627e-4e9f-8d3a-5120d799fb16	true	id.token.claim
3912134c-627e-4e9f-8d3a-5120d799fb16	true	access.token.claim
3912134c-627e-4e9f-8d3a-5120d799fb16	preferred_username	claim.name
3912134c-627e-4e9f-8d3a-5120d799fb16	String	jsonType.label
3912134c-627e-4e9f-8d3a-5120d799fb16	true	userinfo.token.claim
77e47ece-29ac-4de2-a452-a4a1e2a9f130	website	user.attribute
77e47ece-29ac-4de2-a452-a4a1e2a9f130	true	id.token.claim
77e47ece-29ac-4de2-a452-a4a1e2a9f130	true	access.token.claim
77e47ece-29ac-4de2-a452-a4a1e2a9f130	website	claim.name
77e47ece-29ac-4de2-a452-a4a1e2a9f130	String	jsonType.label
77e47ece-29ac-4de2-a452-a4a1e2a9f130	true	userinfo.token.claim
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	firstName	user.attribute
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	true	id.token.claim
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	true	access.token.claim
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	given_name	claim.name
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	String	jsonType.label
8a9fc6cc-995e-4b0b-bdad-f5af6b0abc73	true	userinfo.token.claim
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	lastName	user.attribute
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	true	id.token.claim
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	true	access.token.claim
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	family_name	claim.name
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	String	jsonType.label
8b7a8d0e-e674-4ab8-8c56-dbde99ba50a1	true	userinfo.token.claim
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	locale	user.attribute
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	true	id.token.claim
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	true	access.token.claim
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	locale	claim.name
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	String	jsonType.label
be3ce14c-f2a7-4b20-a79e-369f6c9fa22d	true	userinfo.token.claim
c7f24d2a-0740-4724-8008-45600c5e9742	updatedAt	user.attribute
c7f24d2a-0740-4724-8008-45600c5e9742	true	id.token.claim
c7f24d2a-0740-4724-8008-45600c5e9742	true	access.token.claim
c7f24d2a-0740-4724-8008-45600c5e9742	updated_at	claim.name
c7f24d2a-0740-4724-8008-45600c5e9742	String	jsonType.label
c7f24d2a-0740-4724-8008-45600c5e9742	true	userinfo.token.claim
3f29f288-049e-4e95-a060-fa45809f8908	true	id.token.claim
3f29f288-049e-4e95-a060-fa45809f8908	true	access.token.claim
3f29f288-049e-4e95-a060-fa45809f8908	true	userinfo.token.claim
bde88d27-ba50-4b7a-87b3-f610d7e93c2e	true	id.token.claim
bde88d27-ba50-4b7a-87b3-f610d7e93c2e	true	access.token.claim
bde88d27-ba50-4b7a-87b3-f610d7e93c2e	realm_access.roles	claim.name
bde88d27-ba50-4b7a-87b3-f610d7e93c2e	true	userinfo.token.claim
bde88d27-ba50-4b7a-87b3-f610d7e93c2e	true	multivalued
00d85c6f-6a39-4ef6-a1a3-437da954a317	clientHost	user.session.note
00d85c6f-6a39-4ef6-a1a3-437da954a317	true	id.token.claim
00d85c6f-6a39-4ef6-a1a3-437da954a317	true	access.token.claim
00d85c6f-6a39-4ef6-a1a3-437da954a317	clientHost	claim.name
00d85c6f-6a39-4ef6-a1a3-437da954a317	String	jsonType.label
00d85c6f-6a39-4ef6-a1a3-437da954a317	true	userinfo.token.claim
1727d303-0db0-4d37-a861-3c3f22029470	clientId	user.session.note
1727d303-0db0-4d37-a861-3c3f22029470	true	id.token.claim
1727d303-0db0-4d37-a861-3c3f22029470	true	access.token.claim
1727d303-0db0-4d37-a861-3c3f22029470	clientId	claim.name
1727d303-0db0-4d37-a861-3c3f22029470	String	jsonType.label
1727d303-0db0-4d37-a861-3c3f22029470	true	userinfo.token.claim
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	clientAddress	user.session.note
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	true	id.token.claim
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	true	access.token.claim
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	clientAddress	claim.name
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	String	jsonType.label
6b02f2b3-60ba-401a-ab8a-9644dc66d60a	true	userinfo.token.claim
bf597b1e-302a-4cac-92e7-72da275a9450	locale	user.attribute
bf597b1e-302a-4cac-92e7-72da275a9450	true	id.token.claim
bf597b1e-302a-4cac-92e7-72da275a9450	true	access.token.claim
bf597b1e-302a-4cac-92e7-72da275a9450	locale	claim.name
bf597b1e-302a-4cac-92e7-72da275a9450	String	jsonType.label
bf597b1e-302a-4cac-92e7-72da275a9450	true	userinfo.token.claim
4872f46c-4ebe-4820-ac83-3ae267d47441	clientHost	user.session.note
4872f46c-4ebe-4820-ac83-3ae267d47441	true	id.token.claim
4872f46c-4ebe-4820-ac83-3ae267d47441	true	access.token.claim
4872f46c-4ebe-4820-ac83-3ae267d47441	clientHost	claim.name
4872f46c-4ebe-4820-ac83-3ae267d47441	String	jsonType.label
4872f46c-4ebe-4820-ac83-3ae267d47441	true	userinfo.token.claim
cba83ef5-0a89-44bb-81ac-62dac81c7773	clientAddress	user.session.note
cba83ef5-0a89-44bb-81ac-62dac81c7773	true	id.token.claim
cba83ef5-0a89-44bb-81ac-62dac81c7773	true	access.token.claim
cba83ef5-0a89-44bb-81ac-62dac81c7773	clientAddress	claim.name
cba83ef5-0a89-44bb-81ac-62dac81c7773	String	jsonType.label
cba83ef5-0a89-44bb-81ac-62dac81c7773	true	userinfo.token.claim
d3968f38-2a46-411f-849f-5342e7008e44	true	id.token.claim
d3968f38-2a46-411f-849f-5342e7008e44	true	access.token.claim
d3968f38-2a46-411f-849f-5342e7008e44	realm_access.roles	claim.name
d3968f38-2a46-411f-849f-5342e7008e44	true	userinfo.token.claim
d3968f38-2a46-411f-849f-5342e7008e44	true	multivalued
e5b39176-5f85-48e6-8aba-6e0442eaa712	clientId	user.session.note
e5b39176-5f85-48e6-8aba-6e0442eaa712	true	id.token.claim
e5b39176-5f85-48e6-8aba-6e0442eaa712	true	access.token.claim
e5b39176-5f85-48e6-8aba-6e0442eaa712	clientId	claim.name
e5b39176-5f85-48e6-8aba-6e0442eaa712	String	jsonType.label
e5b39176-5f85-48e6-8aba-6e0442eaa712	true	userinfo.token.claim
\.


--
-- TOC entry 4199 (class 0 OID 18657)
-- Dependencies: 224
-- Data for Name: realm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm (id, access_code_lifespan, user_action_lifespan, access_token_lifespan, account_theme, admin_theme, email_theme, enabled, events_enabled, events_expiration, login_theme, name, not_before, password_policy, registration_allowed, remember_me, reset_password_allowed, social, ssl_required, sso_idle_timeout, sso_max_lifespan, update_profile_on_soc_login, verify_email, master_admin_client, login_lifespan, internationalization_enabled, default_locale, reg_email_as_username, admin_events_enabled, admin_events_details_enabled, edit_username_allowed, otp_policy_counter, otp_policy_window, otp_policy_period, otp_policy_digits, otp_policy_alg, otp_policy_type, browser_flow, registration_flow, direct_grant_flow, reset_credentials_flow, client_auth_flow, offline_session_idle_timeout, revoke_refresh_token, access_token_life_implicit, login_with_email_allowed, duplicate_emails_allowed, docker_auth_flow, refresh_token_max_reuse, allow_user_managed_access, sso_max_lifespan_remember_me, sso_idle_timeout_remember_me, default_role) FROM stdin;
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	60	300	60	\N	\N	\N	t	f	0	\N	master	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	ab7d6cc1-cbea-4e56-bf89-86d1dca78f19	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	0bcaec5a-58b3-40f8-87ea-577a276e7edf	e99439ce-9ada-4317-93a5-41cb2bc5b6b6	4dc2763b-9f87-43bf-a3eb-e9fa51b14617	699639f1-4b4b-424c-88e4-4396c732ab8c	cd1a566d-2f27-4775-a289-d5deefd76575	2592000	f	900	t	f	f22b50c9-2cad-4b2d-aeaa-9394131ee4dc	0	f	0	0	18913614-be88-467a-b0f6-d92fcb30b15e
BookingSmart	60	300	300				t	f	0	bookingsmart-keycloak-theme	BookingSmart	0	\N	t	f	f	f	NONE	1800	36000	f	f	759eab66-3913-43ee-af17-50718d34c183	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	f78131ac-ccb1-4d0f-bf2d-796ecc29c15c	8bfa1b0d-9e32-4786-9ade-e747b6a986a8	a15373c0-16ea-41d0-b7b1-1d8d9c9cbf31	aed801c6-cf4a-4b53-9344-18a0f3d14e47	40fd81ed-6597-4924-ab5d-3663f2392054	2592000	f	900	t	f	a87d6099-36df-463c-988a-bf77a48078c1	0	f	0	0	f2da71cd-654f-4beb-8ec8-fa78d6fc1219
\.


--
-- TOC entry 4200 (class 0 OID 18674)
-- Dependencies: 225
-- Data for Name: realm_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_attribute (name, realm_id, value) FROM stdin;
_browser_header.contentSecurityPolicyReportOnly	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	
_browser_header.xContentTypeOptions	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	nosniff
_browser_header.referrerPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	no-referrer
_browser_header.xRobotsTag	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	none
_browser_header.xFrameOptions	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	SAMEORIGIN
_browser_header.contentSecurityPolicy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.strictTransportSecurity	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	max-age=31536000; includeSubDomains
bruteForceProtected	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	false
permanentLockout	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	false
maxTemporaryLockouts	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	0
bruteForceStrategy	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	MULTIPLE
maxFailureWaitSeconds	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	900
minimumQuickLoginWaitSeconds	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	60
waitIncrementSeconds	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	60
quickLoginCheckMilliSeconds	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	1000
maxDeltaTimeSeconds	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	43200
failureFactor	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	30
realmReusableOtpCode	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	false
firstBrokerLoginFlowId	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	da969484-6f15-4dcd-9a2d-93cd99dcb234
displayName	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	Keycloak
displayNameHtml	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	<div class="kc-logo-text"><span>Keycloak</span></div>
defaultSignatureAlgorithm	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	RS256
offlineSessionMaxLifespanEnabled	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	false
offlineSessionMaxLifespan	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	5184000
_browser_header.contentSecurityPolicyReportOnly	BookingSmart	
_browser_header.xContentTypeOptions	BookingSmart	nosniff
_browser_header.referrerPolicy	BookingSmart	no-referrer
_browser_header.xRobotsTag	BookingSmart	none
_browser_header.xFrameOptions	BookingSmart	SAMEORIGIN
_browser_header.contentSecurityPolicy	BookingSmart	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.strictTransportSecurity	BookingSmart	max-age=31536000; includeSubDomains
bruteForceProtected	BookingSmart	false
permanentLockout	BookingSmart	false
maxTemporaryLockouts	BookingSmart	0
bruteForceStrategy	BookingSmart	MULTIPLE
maxFailureWaitSeconds	BookingSmart	900
minimumQuickLoginWaitSeconds	BookingSmart	60
waitIncrementSeconds	BookingSmart	60
quickLoginCheckMilliSeconds	BookingSmart	1000
maxDeltaTimeSeconds	BookingSmart	43200
failureFactor	BookingSmart	30
realmReusableOtpCode	BookingSmart	false
defaultSignatureAlgorithm	BookingSmart	RS256
offlineSessionMaxLifespanEnabled	BookingSmart	false
offlineSessionMaxLifespan	BookingSmart	5184000
clientSessionIdleTimeout	BookingSmart	0
clientSessionMaxLifespan	BookingSmart	0
clientOfflineSessionIdleTimeout	BookingSmart	0
clientOfflineSessionMaxLifespan	BookingSmart	0
actionTokenGeneratedByAdminLifespan	BookingSmart	43200
actionTokenGeneratedByUserLifespan	BookingSmart	300
oauth2DeviceCodeLifespan	BookingSmart	600
oauth2DevicePollingInterval	BookingSmart	5
organizationsEnabled	BookingSmart	false
adminPermissionsEnabled	BookingSmart	false
webAuthnPolicyRpEntityName	BookingSmart	keycloak
webAuthnPolicySignatureAlgorithms	BookingSmart	ES256
webAuthnPolicyRpId	BookingSmart	
webAuthnPolicyAttestationConveyancePreference	BookingSmart	not specified
webAuthnPolicyAuthenticatorAttachment	BookingSmart	not specified
webAuthnPolicyRequireResidentKey	BookingSmart	not specified
webAuthnPolicyUserVerificationRequirement	BookingSmart	not specified
webAuthnPolicyCreateTimeout	BookingSmart	0
webAuthnPolicyAvoidSameAuthenticatorRegister	BookingSmart	false
webAuthnPolicyRpEntityNamePasswordless	BookingSmart	keycloak
webAuthnPolicySignatureAlgorithmsPasswordless	BookingSmart	ES256
webAuthnPolicyRpIdPasswordless	BookingSmart	
webAuthnPolicyAttestationConveyancePreferencePasswordless	BookingSmart	not specified
webAuthnPolicyAuthenticatorAttachmentPasswordless	BookingSmart	not specified
webAuthnPolicyRequireResidentKeyPasswordless	BookingSmart	not specified
webAuthnPolicyUserVerificationRequirementPasswordless	BookingSmart	not specified
webAuthnPolicyCreateTimeoutPasswordless	BookingSmart	0
webAuthnPolicyAvoidSameAuthenticatorRegisterPasswordless	BookingSmart	false
cibaBackchannelTokenDeliveryMode	BookingSmart	poll
cibaExpiresIn	BookingSmart	120
cibaInterval	BookingSmart	5
cibaAuthRequestedUserHint	BookingSmart	login_hint
parRequestUriLifespan	BookingSmart	60
firstBrokerLoginFlowId	BookingSmart	2802f1e4-d20d-440a-9738-0d5aa36255d5
_browser_header.xXSSProtection	BookingSmart	1; mode=block
verifiableCredentialsEnabled	BookingSmart	false
client-policies.profiles	BookingSmart	{"profiles":[]}
client-policies.policies	BookingSmart	{"policies":[]}
darkMode	BookingSmart	true
\.


--
-- TOC entry 4241 (class 0 OID 19431)
-- Dependencies: 266
-- Data for Name: realm_default_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_default_groups (realm_id, group_id) FROM stdin;
\.


--
-- TOC entry 4221 (class 0 OID 19127)
-- Dependencies: 246
-- Data for Name: realm_enabled_event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_enabled_event_types (realm_id, value) FROM stdin;
\.


--
-- TOC entry 4201 (class 0 OID 18682)
-- Dependencies: 226
-- Data for Name: realm_events_listeners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_events_listeners (realm_id, value) FROM stdin;
f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	jboss-logging
BookingSmart	jboss-logging
\.


--
-- TOC entry 4274 (class 0 OID 20133)
-- Dependencies: 299
-- Data for Name: realm_localizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_localizations (realm_id, locale, texts) FROM stdin;
\.


--
-- TOC entry 4202 (class 0 OID 18685)
-- Dependencies: 227
-- Data for Name: realm_required_credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_required_credential (type, form_label, input, secret, realm_id) FROM stdin;
password	password	t	t	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9
password	password	t	t	BookingSmart
\.


--
-- TOC entry 4203 (class 0 OID 18692)
-- Dependencies: 228
-- Data for Name: realm_smtp_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_smtp_config (realm_id, value, name) FROM stdin;
\.


--
-- TOC entry 4220 (class 0 OID 19043)
-- Dependencies: 245
-- Data for Name: realm_supported_locales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_supported_locales (realm_id, value) FROM stdin;
\.


--
-- TOC entry 4204 (class 0 OID 18702)
-- Dependencies: 229
-- Data for Name: redirect_uris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redirect_uris (client_id, value) FROM stdin;
36589292-38ed-4b75-8b05-9d0b11f09f0c	/realms/master/account/*
a35b84ae-8974-404d-a0d8-f875605c1237	/realms/master/account/*
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	/admin/master/console/*
63a551a9-12e6-465b-9b06-83747ff64c8d	/realms/BookingSmart/account/*
c9b985d8-1db7-43aa-aabe-35b103bce986	/realms/BookingSmart/account/*
60946636-ed9b-470c-b900-277f4d41ba80	
36b9332d-e925-42e2-bef4-6e9271695118	/admin/BookingSmart/console/*
4f64c142-0545-44bb-9446-2a18b9c9effd	http://bookingsmart.huypd.dev/*
26490047-2a91-4938-9324-371523ad1e14	http://localhost:8080/*
26490047-2a91-4938-9324-371523ad1e14	http://backoffice/*
26490047-2a91-4938-9324-371523ad1e14	http://admin-bookingsmart.huypd.dev/*
4fd70fcc-3453-45c0-b754-e42d60067c03	/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://api.BookingSmart.local/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8081/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8080/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8091/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8083/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8082/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8093/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8090/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8089/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8088/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8085/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8084/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8086/*
\.


--
-- TOC entry 4234 (class 0 OID 19366)
-- Dependencies: 259
-- Data for Name: required_action_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_action_config (required_action_id, value, name) FROM stdin;
\.


--
-- TOC entry 4233 (class 0 OID 19359)
-- Dependencies: 258
-- Data for Name: required_action_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_action_provider (id, alias, name, realm_id, enabled, default_action, provider_id, priority) FROM stdin;
c9d66bca-711a-4aaf-a618-cd7fbef4df07	VERIFY_EMAIL	Verify Email	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	VERIFY_EMAIL	50
6660932b-9595-476d-8d4b-264d14c68ec8	UPDATE_PROFILE	Update Profile	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	UPDATE_PROFILE	40
82feed6a-8bc2-4274-8c86-b62493957c02	CONFIGURE_TOTP	Configure OTP	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	CONFIGURE_TOTP	10
9c0fc6d5-d6d2-4de3-b488-0cdc4bbf0786	UPDATE_PASSWORD	Update Password	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	UPDATE_PASSWORD	30
09bde7f0-ce17-4ba1-b51c-ba0ee0fed6d9	TERMS_AND_CONDITIONS	Terms and Conditions	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	f	TERMS_AND_CONDITIONS	20
a9f627b1-c426-4178-adba-f0830e63325c	delete_account	Delete Account	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	f	f	delete_account	60
a4149849-7cba-4bc5-a6c3-6edcb45ae4f7	delete_credential	Delete Credential	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	delete_credential	100
232a3ab1-3c08-41f1-a61a-84fed27ca853	update_user_locale	Update User Locale	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	update_user_locale	1000
ab4b83c0-9217-48f5-ac1a-ba81d4281c8b	webauthn-register	Webauthn Register	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	webauthn-register	70
8930c792-9292-4cfd-a3e8-593866b63162	webauthn-register-passwordless	Webauthn Register Passwordless	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	webauthn-register-passwordless	80
9236b4bc-dfb0-43bf-b8f9-20019793a043	VERIFY_PROFILE	Verify Profile	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	t	f	VERIFY_PROFILE	90
e26f97e0-3aff-4026-8a6a-bb6d35a1859d	CONFIGURE_TOTP	Configure OTP	BookingSmart	t	f	CONFIGURE_TOTP	10
3152dc4a-a941-412b-b571-cd2bcd81e4e1	TERMS_AND_CONDITIONS	Terms and Conditions	BookingSmart	f	f	TERMS_AND_CONDITIONS	20
a7e72ce1-c609-4a02-b3e2-174531a0b6ea	UPDATE_PASSWORD	Update Password	BookingSmart	t	f	UPDATE_PASSWORD	30
04bc5feb-93f4-4f62-beb2-45bd31090b36	UPDATE_PROFILE	Update Profile	BookingSmart	t	f	UPDATE_PROFILE	40
1dbcc5db-bf26-4110-b54a-a3569082921e	VERIFY_EMAIL	Verify Email	BookingSmart	t	f	VERIFY_EMAIL	50
74cb90db-5205-45dc-a91f-82b7efabd528	delete_account	Delete Account	BookingSmart	f	f	delete_account	60
a8b964ef-6523-4179-93b7-b8ff05f127c9	delete_credential	Delete Credential	BookingSmart	t	f	delete_credential	100
9ea2de3d-82b5-46f5-bd3a-3115728ea8d6	idp_link	Linking Identity Provider	BookingSmart	t	f	idp_link	110
89300182-2c15-4487-a11d-229092050274	update_user_locale	Update User Locale	BookingSmart	t	f	update_user_locale	1000
\.


--
-- TOC entry 4271 (class 0 OID 20064)
-- Dependencies: 296
-- Data for Name: resource_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_attribute (id, name, value, resource_id) FROM stdin;
\.


--
-- TOC entry 4251 (class 0 OID 19648)
-- Dependencies: 276
-- Data for Name: resource_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_policy (resource_id, policy_id) FROM stdin;
\.


--
-- TOC entry 4250 (class 0 OID 19633)
-- Dependencies: 275
-- Data for Name: resource_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_scope (resource_id, scope_id) FROM stdin;
\.


--
-- TOC entry 4245 (class 0 OID 19571)
-- Dependencies: 270
-- Data for Name: resource_server; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server (id, allow_rs_remote_mgmt, policy_enforce_mode, decision_strategy) FROM stdin;
60946636-ed9b-470c-b900-277f4d41ba80	t	0	1
4fd70fcc-3453-45c0-b754-e42d60067c03	t	0	1
\.


--
-- TOC entry 4270 (class 0 OID 20040)
-- Dependencies: 295
-- Data for Name: resource_server_perm_ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_perm_ticket (id, owner, requester, created_timestamp, granted_timestamp, resource_id, scope_id, resource_server_id, policy_id) FROM stdin;
\.


--
-- TOC entry 4248 (class 0 OID 19607)
-- Dependencies: 273
-- Data for Name: resource_server_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_policy (id, name, description, type, decision_strategy, logic, resource_server_id, owner) FROM stdin;
cc3360af-6716-474a-82e1-642c6b33ed71	Default Policy	A policy that grants access only for users within this realm	js	0	0	4fd70fcc-3453-45c0-b754-e42d60067c03	\N
e45f8d60-3beb-4fcf-b754-bfecfdef881c	Default Permission	A permission that applies to the default resource type	resource	1	0	4fd70fcc-3453-45c0-b754-e42d60067c03	\N
\.


--
-- TOC entry 4246 (class 0 OID 19579)
-- Dependencies: 271
-- Data for Name: resource_server_resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_resource (id, name, type, icon_uri, owner, resource_server_id, owner_managed_access, display_name) FROM stdin;
6f873a48-d025-4b51-a613-8abffbd16be1	Default Resource	urn:ai-agent:resources:default	\N	4fd70fcc-3453-45c0-b754-e42d60067c03	4fd70fcc-3453-45c0-b754-e42d60067c03	f	\N
\.


--
-- TOC entry 4247 (class 0 OID 19593)
-- Dependencies: 272
-- Data for Name: resource_server_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_scope (id, name, icon_uri, resource_server_id, display_name) FROM stdin;
\.


--
-- TOC entry 4272 (class 0 OID 20082)
-- Dependencies: 297
-- Data for Name: resource_uris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_uris (resource_id, value) FROM stdin;
6f873a48-d025-4b51-a613-8abffbd16be1	/*
\.


--
-- TOC entry 4277 (class 0 OID 20215)
-- Dependencies: 302
-- Data for Name: revoked_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revoked_token (id, expire) FROM stdin;
\.


--
-- TOC entry 4273 (class 0 OID 20092)
-- Dependencies: 298
-- Data for Name: role_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_attribute (id, role_id, name, value) FROM stdin;
f6196abc-a419-4b77-9425-ffec075d5fbd	2006cd24-9bfb-417d-8e0b-81ef33fac6cf	Company	asdsad
0b06eac3-f351-464a-b768-3de817153ab7	2006cd24-9bfb-417d-8e0b-81ef33fac6cf	Adress	asdsad
df2af488-e868-42f0-bbbb-296d312262bd	4027792a-2e96-4a43-a83f-a392fc46060b	partner_type	hotel
51d4c30e-9e8f-41bd-8962-d751660cd897	4027792a-2e96-4a43-a83f-a392fc46060b	partner_type	transport
67d2b11c-7559-472c-b537-c0b325d37ff4	4027792a-2e96-4a43-a83f-a392fc46060b	partner_type	flight
514b3444-1cb8-4a01-b6c6-41a24165dad3	4027792a-2e96-4a43-a83f-a392fc46060b	partner_type	activity
dc555738-af2b-42ec-b967-0da7538f92f1	4027792a-2e96-4a43-a83f-a392fc46060b	approval_status	pending
21230e65-22e9-4b90-9210-e297b660d895	4027792a-2e96-4a43-a83f-a392fc46060b	approval_status	approved
cf09d60f-6802-4134-8671-e75b8e11439f	4027792a-2e96-4a43-a83f-a392fc46060b	approval_status	rejected
00bd1506-ec59-4238-aa52-0a329d2fc2b4	4027792a-2e96-4a43-a83f-a392fc46060b	approval_status	suspended
b0fc6392-cacd-4929-bcb4-100660dbd169	4027792a-2e96-4a43-a83f-a392fc46060b	onboarding_status	incomplete
d7e2d1c6-4694-4ab8-bd16-696294413c70	4027792a-2e96-4a43-a83f-a392fc46060b	onboarding_status	pending_review
ba42d4ec-3398-49d4-a5ca-657f4b56b1ed	4027792a-2e96-4a43-a83f-a392fc46060b	onboarding_status	approved
34bb67d9-8c66-4e7c-aee5-6f7908d86e66	4027792a-2e96-4a43-a83f-a392fc46060b	onboarding_status	active
\.


--
-- TOC entry 4205 (class 0 OID 18705)
-- Dependencies: 230
-- Data for Name: scope_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope_mapping (client_id, role_id) FROM stdin;
a35b84ae-8974-404d-a0d8-f875605c1237	e4fb65de-7f7f-43ac-9b39-070a7118cacc
a35b84ae-8974-404d-a0d8-f875605c1237	1ba9029c-b3c4-4e06-b616-f8a1247a02ee
c9b985d8-1db7-43aa-aabe-35b103bce986	4ce54078-8a93-4155-9ba8-cd7fab17c24c
\.


--
-- TOC entry 4252 (class 0 OID 19663)
-- Dependencies: 277
-- Data for Name: scope_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope_policy (scope_id, policy_id) FROM stdin;
\.


--
-- TOC entry 4279 (class 0 OID 20234)
-- Dependencies: 304
-- Data for Name: server_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.server_config (server_config_key, value, version) FROM stdin;
crt_jgroups	{"prvKey":"MIIEogIBAAKCAQEAoKFU5QTBt0UWtx+YwxN/e1wBI55FPPUP4XT2YJATh9Ec4QIT/IgRmP8JAwG9X2f81jBC7NAwu4DDr8ejvyXXomKt/15WkKtWFN0wsZ/cEQvwuZ8tywunSp6K1cOB7bb6B0mEo5C8S4zUC9I/lmdqSofbpGHCRbqnk3LJYbvrcXqOh3iJTZUix6VjUv+Bj8KDi16u9sH8vtd0vuqQcoU0bgo1k1xP3qqZbpBcLcZ8TzTkeD795aVyj0HMJGA6EqnqLJe7dHqrkC5w64Wh3MFC63D5zq/VIeYx4i2/wYVu/x0yXMSBfDEwCa6YOTqaxI8gY1a6rHKcUa6vbYSUzDO+TwIDAQABAoIBADxasgvFIEZM2s6evCbcHiPLO5BXCRvw1nE3odVBfV0kSM4QmlLiC36poQi0sCN3boxKIPNa/FyPcreK8y9AuEeG/Wq81xjPj+4R+BhdgPIUwvPz5+Bpdge3D2JnbdvUSxjO2lwc52sZtJjmfEb2f30WlAQtSTIrAokH8bvbwIjn019ubbeHapq1yb52cYOAhUpe4Nzg3LQJ9JvhLXorUMXLdVLqBKEITJf6lKJK4iuJV82W+ECTM0rztYZUM/cr/ni2LqyoFrUvAtAI+/ppY8ZC3OBVcD2kJkefwIJUg5DW/XCWIE+G0A3PPFWwP7w6RN8+pZk8XwwLbU46kl9hJY0CgYEA2+cyf1vdC1rf37SS0cArBH/A6T+1RlNqdk/jrgSS2wy5Ftl2ww8T+caWmv90LRzzndRw1n3e/aOcsyGT5O3V8OWTmZKxQyuoFOCS83+Ey+h1UIDPuj/q/Oy9Sft7BVqI3/RLNt0UhYY3xLnDZiNPXBS9Ql6H4M2yzz3lGB3mxbsCgYEAuv9b3TBxYXWyn/NxPD4fkDCT+19BzLcXrSSJFl1zPGunSDacTF6tMUBYT8aep2ST0V3mE72XOndvzVTuOzuV6um5hTazJAEEDI2mhiMrfG0tpQTZfgZZIGMaTkcbz8wG6RrNsEIGCGZfavB94XX+8MrBXJGTTERpZUFQNcuTdn0CgYASpjrcHjhS3DQcTr4c18VOLl936JVBD5X5zrCqc2zY8u1HiM3PoRm6lyLypjN+F/R5MCkZp7cfn56Meo6GXb1FHtMztQMfhTZN/vW3fNsQR/ibCTGUxBLzvEgZXCCExbbR92/hiUJSSJ22K2Ls6JW0Y3XhiQ7Q++DsPn2NXAvUPQKBgDOMRTSaMAcfvNfe8e4bafQDkCeRQMBAEKTIF4o0xJl5S6nadAeRacjT5gRHymB2l1D1w4DZmKCjYAyIRwvJBzC0sVGJnKRmK0mSmr8LXudz6Us+JP5anaMR7qR5ca88nQMRQnY+HQ+fuNnv5aOLNXYHTnpIHwS9LxicgpHxxnq5AoGAMIuI4qmDuSKmSC2J6IuoHAMlDfgFCiEAaUFHmpSRxiQOfh17o1jGNE7ZzTKI+R/wKV0OxoDgKjAUfBMV2yJc6yiiZ+MIp5droxlG+LCqh37zBZIoLWoGGhvnt/kaqaGI4yaqJAPUC7hqW9rvjXanZN/e6G3hmSExzjO9SqZpHWk=","pubKey":"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoKFU5QTBt0UWtx+YwxN/e1wBI55FPPUP4XT2YJATh9Ec4QIT/IgRmP8JAwG9X2f81jBC7NAwu4DDr8ejvyXXomKt/15WkKtWFN0wsZ/cEQvwuZ8tywunSp6K1cOB7bb6B0mEo5C8S4zUC9I/lmdqSofbpGHCRbqnk3LJYbvrcXqOh3iJTZUix6VjUv+Bj8KDi16u9sH8vtd0vuqQcoU0bgo1k1xP3qqZbpBcLcZ8TzTkeD795aVyj0HMJGA6EqnqLJe7dHqrkC5w64Wh3MFC63D5zq/VIeYx4i2/wYVu/x0yXMSBfDEwCa6YOTqaxI8gY1a6rHKcUa6vbYSUzDO+TwIDAQAB","crt":"MIICnTCCAYUCBgGYw7bCuzANBgkqhkiG9w0BAQsFADASMRAwDgYDVQQDDAdqZ3JvdXBzMB4XDTI1MDgxOTE5MDEzMVoXDTI1MTAxODE5MDMxMVowEjEQMA4GA1UEAwwHamdyb3VwczCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKChVOUEwbdFFrcfmMMTf3tcASOeRTz1D+F09mCQE4fRHOECE/yIEZj/CQMBvV9n/NYwQuzQMLuAw6/Ho78l16Jirf9eVpCrVhTdMLGf3BEL8LmfLcsLp0qeitXDge22+gdJhKOQvEuM1AvSP5ZnakqH26RhwkW6p5NyyWG763F6jod4iU2VIselY1L/gY/Cg4tervbB/L7XdL7qkHKFNG4KNZNcT96qmW6QXC3GfE805Hg+/eWlco9BzCRgOhKp6iyXu3R6q5AucOuFodzBQutw+c6v1SHmMeItv8GFbv8dMlzEgXwxMAmumDk6msSPIGNWuqxynFGur22ElMwzvk8CAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAQAQZK/mM8i6H62oIpAFOHdsChrqNp1yfLGNdrrs+ynZhrgsq3A+z/2FwnNdUvMQPnwYqEK2JrLVrPjOSkvGxrAnnsfs7kjBwPvq7df2KfArlmDscV/ytrABdUR0F8UIBMOiEVIk7g5+0C0TLDJXzRt/hxgrfyjOzDGIcKqfhTRKS8KXdWRjBPJyrt7cLt/x3Ni68svXOfZzFRFfPuCk9yvKIes5DcUH9CRjTmxzWF6P/iaaZnDrhcbgczthfjG14xjNOo71ghMh9O60igDlMCFWkEc8wxIWoUhO48E/QSVQ0Yra/QynIcOZpUmiOKlTMNk9TT4yImVs1EGVxFt9+uA==","alias":"d82ece54-b3c0-40d2-a855-eed78ff8813f","generatedMillis":1755630191380}	1
\.


--
-- TOC entry 4206 (class 0 OID 18711)
-- Dependencies: 231
-- Data for Name: user_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_attribute (name, value, user_id, id, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
\.


--
-- TOC entry 4225 (class 0 OID 19148)
-- Dependencies: 250
-- Data for Name: user_consent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_consent (id, client_id, user_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- TOC entry 4268 (class 0 OID 20015)
-- Dependencies: 293
-- Data for Name: user_consent_client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_consent_client_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- TOC entry 4207 (class 0 OID 18716)
-- Dependencies: 232
-- Data for Name: user_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_entity (id, email, email_constraint, email_verified, enabled, federation_link, first_name, last_name, realm_id, username, created_timestamp, service_account_client_link, not_before) FROM stdin;
6249ae7e-844e-4ed7-9b66-02013a98ba2e	\N	e0b6f281-5783-41f8-a6c2-502834a4d2d7	f	t	\N	\N	\N	BookingSmart	service-account-customer-management	1663154002788	60946636-ed9b-470c-b900-277f4d41ba80	0
338216c3-c4a7-4d4f-b394-72d7a79c579e	\N	6e03e0cd-1bb5-47aa-b6a0-6ac7972852e6	f	t	\N	\N	\N	BookingSmart	service-account-storefront-bff	1678087360744	4f64c142-0545-44bb-9446-2a18b9c9effd	0
1c544260-57c6-4e63-ba65-9a529f3783a2	huypd.dev@gmail.com	huypd.dev@gmail.com	f	t	\N	Huy	Phạm	BookingSmart	phamduyhuy	1752063700982	\N	0
6c7dc2f3-fc2f-413d-aa0e-92ecd5e7b1ad	huyeptrai821@gmail.com	huyeptrai821@gmail.com	f	t	\N	Huy	Phạm	BookingSmart	huyeptrai821@gmail.com	1752516769783	\N	0
7a5cb5ed-0b85-407c-bb9f-ca5997df8c3d	huypd.dev@gmail.com	huypd.dev@gmail.com	f	t	\N	Huy	Duy Pham	f4e65b23-ee2f-45a5-bbf6-8e7ab8220df9	phamduyhuy	1753048536109	\N	0
28257e82-db3c-4e6a-bd90-76da234ca417	pduyhuy231@gmail.com	pduyhuy231@gmail.com	f	t	\N	Huy	Phạm	BookingSmart	phamduyhuy312	1755329138235	\N	0
c18dacad-7f7b-49de-9893-6eff9151a8a6	pduyhuy23@gmail.com	pduyhuy23@gmail.com	f	f	\N	Huy	Phạm	BookingSmart	phamduyhuy321	1755329057487	\N	0
c3039676-b94c-45b2-ace0-6e577993d61a	123qwe@gmail.com	123qwe@gmail.com	f	t	\N	Huy	Pham5	BookingSmart	huypd23	1755533799826	\N	0
e118b863-f072-46d3-9eaf-21c29a03c05e	\N	384e570e-8a0a-49d3-8cc0-e8fa8a500db0	f	t	\N	\N	\N	BookingSmart	service-account-ai-agent	1756682116791	4fd70fcc-3453-45c0-b754-e42d60067c03	0
\.


--
-- TOC entry 4208 (class 0 OID 18724)
-- Dependencies: 233
-- Data for Name: user_federation_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_config (user_federation_provider_id, value, name) FROM stdin;
\.


--
-- TOC entry 4231 (class 0 OID 19260)
-- Dependencies: 256
-- Data for Name: user_federation_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_mapper (id, name, federation_provider_id, federation_mapper_type, realm_id) FROM stdin;
\.


--
-- TOC entry 4232 (class 0 OID 19265)
-- Dependencies: 257
-- Data for Name: user_federation_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_mapper_config (user_federation_mapper_id, value, name) FROM stdin;
\.


--
-- TOC entry 4209 (class 0 OID 18729)
-- Dependencies: 234
-- Data for Name: user_federation_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_provider (id, changed_sync_period, display_name, full_sync_period, last_sync, priority, provider_name, realm_id) FROM stdin;
\.


--
-- TOC entry 4240 (class 0 OID 19428)
-- Dependencies: 265
-- Data for Name: user_group_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_group_membership (group_id, user_id, membership_type) FROM stdin;
\.


--
-- TOC entry 4210 (class 0 OID 18734)
-- Dependencies: 235
-- Data for Name: user_required_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_required_action (user_id, required_action) FROM stdin;
\.


--
-- TOC entry 4211 (class 0 OID 18737)
-- Dependencies: 236
-- Data for Name: user_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role_mapping (role_id, user_id) FROM stdin;
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	6249ae7e-844e-4ed7-9b66-02013a98ba2e
6d01b738-8f9d-465b-9464-25389823c74f	6249ae7e-844e-4ed7-9b66-02013a98ba2e
e2b7165b-59d7-415b-a4b9-cd705eae95a3	6249ae7e-844e-4ed7-9b66-02013a98ba2e
41dbcfdb-d5fa-42ef-bbe9-af26f2c43bdb	6249ae7e-844e-4ed7-9b66-02013a98ba2e
bbe55368-20f8-4787-b7c2-fc7e32073ad6	6249ae7e-844e-4ed7-9b66-02013a98ba2e
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	338216c3-c4a7-4d4f-b394-72d7a79c579e
4e71f89c-cffc-4a7a-8bf3-51524e6db708	338216c3-c4a7-4d4f-b394-72d7a79c579e
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	1c544260-57c6-4e63-ba65-9a529f3783a2
eadee165-c7b4-4508-bf60-937580c5d987	1c544260-57c6-4e63-ba65-9a529f3783a2
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	6c7dc2f3-fc2f-413d-aa0e-92ecd5e7b1ad
18913614-be88-467a-b0f6-d92fcb30b15e	7a5cb5ed-0b85-407c-bb9f-ca5997df8c3d
ef07997d-6717-4f20-bfd2-050ba20c4c0b	7a5cb5ed-0b85-407c-bb9f-ca5997df8c3d
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	c18dacad-7f7b-49de-9893-6eff9151a8a6
eadee165-c7b4-4508-bf60-937580c5d987	c18dacad-7f7b-49de-9893-6eff9151a8a6
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	28257e82-db3c-4e6a-bd90-76da234ca417
2006cd24-9bfb-417d-8e0b-81ef33fac6cf	28257e82-db3c-4e6a-bd90-76da234ca417
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	c3039676-b94c-45b2-ace0-6e577993d61a
2006cd24-9bfb-417d-8e0b-81ef33fac6cf	c3039676-b94c-45b2-ace0-6e577993d61a
f2da71cd-654f-4beb-8ec8-fa78d6fc1219	e118b863-f072-46d3-9eaf-21c29a03c05e
b682523b-5adc-4bd6-b89e-22c1cc65a788	e118b863-f072-46d3-9eaf-21c29a03c05e
\.


--
-- TOC entry 4212 (class 0 OID 18751)
-- Dependencies: 237
-- Data for Name: web_origins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.web_origins (client_id, value) FROM stdin;
38aee2a3-a8c4-4419-a40a-8ac8a7d7cc6a	+
36b9332d-e925-42e2-bef4-6e9271695118	+
4fd70fcc-3453-45c0-b754-e42d60067c03	/*
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://api.BookingSmart.local
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8088
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8089
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8084
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8083
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8086
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8085
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8080
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8091
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8090
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8093
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8081
ce61ec4b-d4c5-477b-91c0-ebf1fd189bbd	http://localhost:8092
\.


--
-- TOC entry 3971 (class 2606 OID 20204)
-- Name: org_domain ORG_DOMAIN_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_domain
    ADD CONSTRAINT "ORG_DOMAIN_pkey" PRIMARY KEY (id, name);


--
-- TOC entry 3963 (class 2606 OID 20193)
-- Name: org ORG_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT "ORG_pkey" PRIMARY KEY (id);


--
-- TOC entry 3979 (class 2606 OID 20241)
-- Name: server_config SERVER_CONFIG_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_config
    ADD CONSTRAINT "SERVER_CONFIG_pkey" PRIMARY KEY (server_config_key);


--
-- TOC entry 3697 (class 2606 OID 20116)
-- Name: keycloak_role UK_J3RWUVD56ONTGSUHOGM184WW2-2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT "UK_J3RWUVD56ONTGSUHOGM184WW2-2" UNIQUE (name, client_realm_constraint);


--
-- TOC entry 3932 (class 2606 OID 19946)
-- Name: client_auth_flow_bindings c_cli_flow_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_auth_flow_bindings
    ADD CONSTRAINT c_cli_flow_bind PRIMARY KEY (client_id, binding_name);


--
-- TOC entry 3934 (class 2606 OID 20145)
-- Name: client_scope_client c_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_client
    ADD CONSTRAINT c_cli_scope_bind PRIMARY KEY (client_id, scope_id);


--
-- TOC entry 3929 (class 2606 OID 19821)
-- Name: client_initial_access cnstr_client_init_acc_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT cnstr_client_init_acc_pk PRIMARY KEY (id);


--
-- TOC entry 3844 (class 2606 OID 19469)
-- Name: realm_default_groups con_group_id_def_groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT con_group_id_def_groups UNIQUE (group_id);


--
-- TOC entry 3892 (class 2606 OID 19744)
-- Name: broker_link constr_broker_link_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broker_link
    ADD CONSTRAINT constr_broker_link_pk PRIMARY KEY (identity_provider, user_id);


--
-- TOC entry 3920 (class 2606 OID 19764)
-- Name: component_config constr_component_config_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT constr_component_config_pk PRIMARY KEY (id);


--
-- TOC entry 3923 (class 2606 OID 19762)
-- Name: component constr_component_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT constr_component_pk PRIMARY KEY (id);


--
-- TOC entry 3912 (class 2606 OID 19760)
-- Name: fed_user_required_action constr_fed_required_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_required_action
    ADD CONSTRAINT constr_fed_required_action PRIMARY KEY (required_action, user_id);


--
-- TOC entry 3894 (class 2606 OID 19746)
-- Name: fed_user_attribute constr_fed_user_attr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_attribute
    ADD CONSTRAINT constr_fed_user_attr_pk PRIMARY KEY (id);


--
-- TOC entry 3899 (class 2606 OID 19748)
-- Name: fed_user_consent constr_fed_user_consent_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_consent
    ADD CONSTRAINT constr_fed_user_consent_pk PRIMARY KEY (id);


--
-- TOC entry 3904 (class 2606 OID 19754)
-- Name: fed_user_credential constr_fed_user_cred_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_credential
    ADD CONSTRAINT constr_fed_user_cred_pk PRIMARY KEY (id);


--
-- TOC entry 3908 (class 2606 OID 19756)
-- Name: fed_user_group_membership constr_fed_user_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_group_membership
    ADD CONSTRAINT constr_fed_user_group PRIMARY KEY (group_id, user_id);


--
-- TOC entry 3916 (class 2606 OID 19758)
-- Name: fed_user_role_mapping constr_fed_user_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_role_mapping
    ADD CONSTRAINT constr_fed_user_role PRIMARY KEY (role_id, user_id);


--
-- TOC entry 3927 (class 2606 OID 19801)
-- Name: federated_user constr_federated_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_user
    ADD CONSTRAINT constr_federated_user PRIMARY KEY (id);


--
-- TOC entry 3846 (class 2606 OID 19905)
-- Name: realm_default_groups constr_realm_default_groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT constr_realm_default_groups PRIMARY KEY (realm_id, group_id);


--
-- TOC entry 3779 (class 2606 OID 19922)
-- Name: realm_enabled_event_types constr_realm_enabl_event_types; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT constr_realm_enabl_event_types PRIMARY KEY (realm_id, value);


--
-- TOC entry 3711 (class 2606 OID 19924)
-- Name: realm_events_listeners constr_realm_events_listeners; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT constr_realm_events_listeners PRIMARY KEY (realm_id, value);


--
-- TOC entry 3776 (class 2606 OID 19926)
-- Name: realm_supported_locales constr_realm_supported_locales; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT constr_realm_supported_locales PRIMARY KEY (realm_id, value);


--
-- TOC entry 3767 (class 2606 OID 19055)
-- Name: identity_provider constraint_2b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT constraint_2b PRIMARY KEY (internal_id);


--
-- TOC entry 3752 (class 2606 OID 18989)
-- Name: client_attributes constraint_3c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT constraint_3c PRIMARY KEY (client_id, name);


--
-- TOC entry 3694 (class 2606 OID 18763)
-- Name: event_entity constraint_4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_entity
    ADD CONSTRAINT constraint_4 PRIMARY KEY (id);


--
-- TOC entry 3763 (class 2606 OID 19057)
-- Name: federated_identity constraint_40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT constraint_40 PRIMARY KEY (identity_provider, user_id);


--
-- TOC entry 3703 (class 2606 OID 18765)
-- Name: realm constraint_4a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT constraint_4a PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 18771)
-- Name: user_federation_provider constraint_5c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT constraint_5c PRIMARY KEY (id);


--
-- TOC entry 3682 (class 2606 OID 18775)
-- Name: client constraint_7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT constraint_7 PRIMARY KEY (id);


--
-- TOC entry 3721 (class 2606 OID 18779)
-- Name: scope_mapping constraint_81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT constraint_81 PRIMARY KEY (client_id, role_id);


--
-- TOC entry 3755 (class 2606 OID 18993)
-- Name: client_node_registrations constraint_84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT constraint_84 PRIMARY KEY (client_id, name);


--
-- TOC entry 3708 (class 2606 OID 18781)
-- Name: realm_attribute constraint_9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT constraint_9 PRIMARY KEY (name, realm_id);


--
-- TOC entry 3714 (class 2606 OID 18783)
-- Name: realm_required_credential constraint_92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT constraint_92 PRIMARY KEY (realm_id, type);


--
-- TOC entry 3699 (class 2606 OID 18785)
-- Name: keycloak_role constraint_a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT constraint_a PRIMARY KEY (id);


--
-- TOC entry 3797 (class 2606 OID 19909)
-- Name: admin_event_entity constraint_admin_event_entity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_event_entity
    ADD CONSTRAINT constraint_admin_event_entity PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 19286)
-- Name: authenticator_config_entry constraint_auth_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config_entry
    ADD CONSTRAINT constraint_auth_cfg_pk PRIMARY KEY (authenticator_id, name);


--
-- TOC entry 3806 (class 2606 OID 19284)
-- Name: authentication_execution constraint_auth_exec_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT constraint_auth_exec_pk PRIMARY KEY (id);


--
-- TOC entry 3803 (class 2606 OID 19282)
-- Name: authentication_flow constraint_auth_flow_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT constraint_auth_flow_pk PRIMARY KEY (id);


--
-- TOC entry 3800 (class 2606 OID 19280)
-- Name: authenticator_config constraint_auth_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT constraint_auth_pk PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 18787)
-- Name: user_role_mapping constraint_c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT constraint_c PRIMARY KEY (role_id, user_id);


--
-- TOC entry 3687 (class 2606 OID 19903)
-- Name: composite_role constraint_composite_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT constraint_composite_role PRIMARY KEY (composite, child_role);


--
-- TOC entry 3774 (class 2606 OID 19059)
-- Name: identity_provider_config constraint_d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT constraint_d PRIMARY KEY (identity_provider_id, name);


--
-- TOC entry 3878 (class 2606 OID 19627)
-- Name: policy_config constraint_dpc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT constraint_dpc PRIMARY KEY (policy_id, name);


--
-- TOC entry 3716 (class 2606 OID 18789)
-- Name: realm_smtp_config constraint_e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT constraint_e PRIMARY KEY (realm_id, name);


--
-- TOC entry 3691 (class 2606 OID 18791)
-- Name: credential constraint_f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT constraint_f PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 18793)
-- Name: user_federation_config constraint_f9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT constraint_f9 PRIMARY KEY (user_federation_provider_id, name);


--
-- TOC entry 3948 (class 2606 OID 20044)
-- Name: resource_server_perm_ticket constraint_fapmt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT constraint_fapmt PRIMARY KEY (id);


--
-- TOC entry 3863 (class 2606 OID 19585)
-- Name: resource_server_resource constraint_farsr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT constraint_farsr PRIMARY KEY (id);


--
-- TOC entry 3873 (class 2606 OID 19613)
-- Name: resource_server_policy constraint_farsrp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT constraint_farsrp PRIMARY KEY (id);


--
-- TOC entry 3889 (class 2606 OID 19682)
-- Name: associated_policy constraint_farsrpap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT constraint_farsrpap PRIMARY KEY (policy_id, associated_policy_id);


--
-- TOC entry 3883 (class 2606 OID 19652)
-- Name: resource_policy constraint_farsrpp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT constraint_farsrpp PRIMARY KEY (resource_id, policy_id);


--
-- TOC entry 3868 (class 2606 OID 19599)
-- Name: resource_server_scope constraint_farsrs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT constraint_farsrs PRIMARY KEY (id);


--
-- TOC entry 3880 (class 2606 OID 19637)
-- Name: resource_scope constraint_farsrsp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT constraint_farsrsp PRIMARY KEY (resource_id, scope_id);


--
-- TOC entry 3886 (class 2606 OID 19667)
-- Name: scope_policy constraint_farsrsps; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT constraint_farsrsps PRIMARY KEY (scope_id, policy_id);


--
-- TOC entry 3730 (class 2606 OID 18795)
-- Name: user_entity constraint_fb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT constraint_fb PRIMARY KEY (id);


--
-- TOC entry 3816 (class 2606 OID 19294)
-- Name: user_federation_mapper_config constraint_fedmapper_cfg_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT constraint_fedmapper_cfg_pm PRIMARY KEY (user_federation_mapper_id, name);


--
-- TOC entry 3812 (class 2606 OID 19292)
-- Name: user_federation_mapper constraint_fedmapperpm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT constraint_fedmapperpm PRIMARY KEY (id);


--
-- TOC entry 3946 (class 2606 OID 20029)
-- Name: fed_user_consent_cl_scope constraint_fgrntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_consent_cl_scope
    ADD CONSTRAINT constraint_fgrntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- TOC entry 3942 (class 2606 OID 20019)
-- Name: user_consent_client_scope constraint_grntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT constraint_grntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- TOC entry 3790 (class 2606 OID 19167)
-- Name: user_consent constraint_grntcsnt_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT constraint_grntcsnt_pm PRIMARY KEY (id);


--
-- TOC entry 3830 (class 2606 OID 19436)
-- Name: keycloak_group constraint_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT constraint_group PRIMARY KEY (id);


--
-- TOC entry 3837 (class 2606 OID 19443)
-- Name: group_attribute constraint_group_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT constraint_group_attribute_pk PRIMARY KEY (id);


--
-- TOC entry 3834 (class 2606 OID 19457)
-- Name: group_role_mapping constraint_group_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT constraint_group_role PRIMARY KEY (role_id, group_id);


--
-- TOC entry 3785 (class 2606 OID 19163)
-- Name: identity_provider_mapper constraint_idpm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT constraint_idpm PRIMARY KEY (id);


--
-- TOC entry 3788 (class 2606 OID 19343)
-- Name: idp_mapper_config constraint_idpmconfig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT constraint_idpmconfig PRIMARY KEY (idp_mapper_id, name);


--
-- TOC entry 3977 (class 2606 OID 20233)
-- Name: jgroups_ping constraint_jgroups_ping; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jgroups_ping
    ADD CONSTRAINT constraint_jgroups_ping PRIMARY KEY (address);


--
-- TOC entry 3782 (class 2606 OID 19161)
-- Name: migration_model constraint_migmod; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_model
    ADD CONSTRAINT constraint_migmod PRIMARY KEY (id);


--
-- TOC entry 3828 (class 2606 OID 20122)
-- Name: offline_client_session constraint_offl_cl_ses_pk3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_client_session
    ADD CONSTRAINT constraint_offl_cl_ses_pk3 PRIMARY KEY (user_session_id, client_id, client_storage_provider, external_client_id, offline_flag);


--
-- TOC entry 3823 (class 2606 OID 19413)
-- Name: offline_user_session constraint_offl_us_ses_pk2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_user_session
    ADD CONSTRAINT constraint_offl_us_ses_pk2 PRIMARY KEY (user_session_id, offline_flag);


--
-- TOC entry 3757 (class 2606 OID 19053)
-- Name: protocol_mapper constraint_pcm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT constraint_pcm PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 19336)
-- Name: protocol_mapper_config constraint_pmconfig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT constraint_pmconfig PRIMARY KEY (protocol_mapper_id, name);


--
-- TOC entry 3718 (class 2606 OID 19928)
-- Name: redirect_uris constraint_redirect_uris; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT constraint_redirect_uris PRIMARY KEY (client_id, value);


--
-- TOC entry 3821 (class 2606 OID 19376)
-- Name: required_action_config constraint_req_act_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_config
    ADD CONSTRAINT constraint_req_act_cfg_pk PRIMARY KEY (required_action_id, name);


--
-- TOC entry 3818 (class 2606 OID 19374)
-- Name: required_action_provider constraint_req_act_prv_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT constraint_req_act_prv_pk PRIMARY KEY (id);


--
-- TOC entry 3743 (class 2606 OID 19288)
-- Name: user_required_action constraint_required_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT constraint_required_action PRIMARY KEY (required_action, user_id);


--
-- TOC entry 3956 (class 2606 OID 20091)
-- Name: resource_uris constraint_resour_uris_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT constraint_resour_uris_pk PRIMARY KEY (resource_id, value);


--
-- TOC entry 3958 (class 2606 OID 20098)
-- Name: role_attribute constraint_role_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT constraint_role_attribute_pk PRIMARY KEY (id);


--
-- TOC entry 3974 (class 2606 OID 20219)
-- Name: revoked_token constraint_rt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revoked_token
    ADD CONSTRAINT constraint_rt PRIMARY KEY (id);


--
-- TOC entry 3724 (class 2606 OID 19372)
-- Name: user_attribute constraint_user_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT constraint_user_attribute_pk PRIMARY KEY (id);


--
-- TOC entry 3841 (class 2606 OID 19450)
-- Name: user_group_membership constraint_user_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT constraint_user_group PRIMARY KEY (group_id, user_id);


--
-- TOC entry 3749 (class 2606 OID 19930)
-- Name: web_origins constraint_web_origins; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT constraint_web_origins PRIMARY KEY (client_id, value);


--
-- TOC entry 3680 (class 2606 OID 18607)
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- TOC entry 3855 (class 2606 OID 19553)
-- Name: client_scope_attributes pk_cl_tmpl_attr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT pk_cl_tmpl_attr PRIMARY KEY (scope_id, name);


--
-- TOC entry 3850 (class 2606 OID 19512)
-- Name: client_scope pk_cli_template; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT pk_cli_template PRIMARY KEY (id);


--
-- TOC entry 3861 (class 2606 OID 19883)
-- Name: resource_server pk_resource_server; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server
    ADD CONSTRAINT pk_resource_server PRIMARY KEY (id);


--
-- TOC entry 3859 (class 2606 OID 19541)
-- Name: client_scope_role_mapping pk_template_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT pk_template_scope PRIMARY KEY (scope_id, role_id);


--
-- TOC entry 3940 (class 2606 OID 20004)
-- Name: default_client_scope r_def_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT r_def_cli_scope_bind PRIMARY KEY (realm_id, scope_id);


--
-- TOC entry 3961 (class 2606 OID 20139)
-- Name: realm_localizations realm_localizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_localizations
    ADD CONSTRAINT realm_localizations_pkey PRIMARY KEY (realm_id, locale);


--
-- TOC entry 3954 (class 2606 OID 20071)
-- Name: resource_attribute res_attr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT res_attr_pk PRIMARY KEY (id);


--
-- TOC entry 3832 (class 2606 OID 19813)
-- Name: keycloak_group sibling_names; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT sibling_names UNIQUE (realm_id, parent_group, name);


--
-- TOC entry 3772 (class 2606 OID 19110)
-- Name: identity_provider uk_2daelwnibji49avxsrtuf6xj33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT uk_2daelwnibji49avxsrtuf6xj33 UNIQUE (provider_alias, realm_id);


--
-- TOC entry 3685 (class 2606 OID 18799)
-- Name: client uk_b71cjlbenv945rb6gcon438at; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT uk_b71cjlbenv945rb6gcon438at UNIQUE (realm_id, client_id);


--
-- TOC entry 3852 (class 2606 OID 19957)
-- Name: client_scope uk_cli_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT uk_cli_scope UNIQUE (realm_id, name);


--
-- TOC entry 3734 (class 2606 OID 18803)
-- Name: user_entity uk_dykn684sl8up1crfei6eckhd7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_dykn684sl8up1crfei6eckhd7 UNIQUE (realm_id, email_constraint);


--
-- TOC entry 3793 (class 2606 OID 20208)
-- Name: user_consent uk_external_consent; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_external_consent UNIQUE (client_storage_provider, external_client_id, user_id);


--
-- TOC entry 3866 (class 2606 OID 20130)
-- Name: resource_server_resource uk_frsr6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5ha6 UNIQUE (name, owner, resource_server_id);


--
-- TOC entry 3952 (class 2606 OID 20126)
-- Name: resource_server_perm_ticket uk_frsr6t700s9v50bu18ws5pmt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5pmt UNIQUE (owner, requester, resource_server_id, resource_id, scope_id);


--
-- TOC entry 3876 (class 2606 OID 19874)
-- Name: resource_server_policy uk_frsrpt700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT uk_frsrpt700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- TOC entry 3871 (class 2606 OID 19878)
-- Name: resource_server_scope uk_frsrst700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT uk_frsrst700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- TOC entry 3795 (class 2606 OID 20206)
-- Name: user_consent uk_local_consent; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_local_consent UNIQUE (client_id, user_id);


--
-- TOC entry 3965 (class 2606 OID 20212)
-- Name: org uk_org_alias; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_alias UNIQUE (realm_id, alias);


--
-- TOC entry 3967 (class 2606 OID 20197)
-- Name: org uk_org_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_group UNIQUE (group_id);


--
-- TOC entry 3969 (class 2606 OID 20195)
-- Name: org uk_org_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_name UNIQUE (realm_id, name);


--
-- TOC entry 3706 (class 2606 OID 18811)
-- Name: realm uk_orvsdmla56612eaefiq6wl5oi; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT uk_orvsdmla56612eaefiq6wl5oi UNIQUE (name);


--
-- TOC entry 3736 (class 2606 OID 19803)
-- Name: user_entity uk_ru8tt6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_ru8tt6t700s9v50bu18ws5ha6 UNIQUE (realm_id, username);


--
-- TOC entry 3895 (class 1259 OID 20179)
-- Name: fed_user_attr_long_values; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fed_user_attr_long_values ON public.fed_user_attribute USING btree (long_value_hash, name);


--
-- TOC entry 3896 (class 1259 OID 20181)
-- Name: fed_user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fed_user_attr_long_values_lower_case ON public.fed_user_attribute USING btree (long_value_hash_lower_case, name);


--
-- TOC entry 3798 (class 1259 OID 20155)
-- Name: idx_admin_event_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_event_time ON public.admin_event_entity USING btree (realm_id, admin_event_time);


--
-- TOC entry 3890 (class 1259 OID 19827)
-- Name: idx_assoc_pol_assoc_pol_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assoc_pol_assoc_pol_id ON public.associated_policy USING btree (associated_policy_id);


--
-- TOC entry 3801 (class 1259 OID 19831)
-- Name: idx_auth_config_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_config_realm ON public.authenticator_config USING btree (realm_id);


--
-- TOC entry 3807 (class 1259 OID 19829)
-- Name: idx_auth_exec_flow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_exec_flow ON public.authentication_execution USING btree (flow_id);


--
-- TOC entry 3808 (class 1259 OID 19828)
-- Name: idx_auth_exec_realm_flow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_exec_realm_flow ON public.authentication_execution USING btree (realm_id, flow_id);


--
-- TOC entry 3804 (class 1259 OID 19830)
-- Name: idx_auth_flow_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_flow_realm ON public.authentication_flow USING btree (realm_id);


--
-- TOC entry 3935 (class 1259 OID 20146)
-- Name: idx_cl_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cl_clscope ON public.client_scope_client USING btree (scope_id);


--
-- TOC entry 3753 (class 1259 OID 20182)
-- Name: idx_client_att_by_name_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_att_by_name_value ON public.client_attributes USING btree (name, substr(value, 1, 255));


--
-- TOC entry 3683 (class 1259 OID 20131)
-- Name: idx_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_id ON public.client USING btree (client_id);


--
-- TOC entry 3930 (class 1259 OID 19871)
-- Name: idx_client_init_acc_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_init_acc_realm ON public.client_initial_access USING btree (realm_id);


--
-- TOC entry 3853 (class 1259 OID 20034)
-- Name: idx_clscope_attrs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_attrs ON public.client_scope_attributes USING btree (scope_id);


--
-- TOC entry 3936 (class 1259 OID 20143)
-- Name: idx_clscope_cl; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_cl ON public.client_scope_client USING btree (client_id);


--
-- TOC entry 3758 (class 1259 OID 20031)
-- Name: idx_clscope_protmap; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_protmap ON public.protocol_mapper USING btree (client_scope_id);


--
-- TOC entry 3856 (class 1259 OID 20032)
-- Name: idx_clscope_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_role ON public.client_scope_role_mapping USING btree (scope_id);


--
-- TOC entry 3921 (class 1259 OID 19837)
-- Name: idx_compo_config_compo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compo_config_compo ON public.component_config USING btree (component_id);


--
-- TOC entry 3924 (class 1259 OID 20105)
-- Name: idx_component_provider_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_provider_type ON public.component USING btree (provider_type);


--
-- TOC entry 3925 (class 1259 OID 19836)
-- Name: idx_component_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_realm ON public.component USING btree (realm_id);


--
-- TOC entry 3688 (class 1259 OID 19838)
-- Name: idx_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_composite ON public.composite_role USING btree (composite);


--
-- TOC entry 3689 (class 1259 OID 19839)
-- Name: idx_composite_child; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_composite_child ON public.composite_role USING btree (child_role);


--
-- TOC entry 3937 (class 1259 OID 20037)
-- Name: idx_defcls_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_defcls_realm ON public.default_client_scope USING btree (realm_id);


--
-- TOC entry 3938 (class 1259 OID 20038)
-- Name: idx_defcls_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_defcls_scope ON public.default_client_scope USING btree (scope_id);


--
-- TOC entry 3695 (class 1259 OID 20132)
-- Name: idx_event_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_time ON public.event_entity USING btree (realm_id, event_time);


--
-- TOC entry 3764 (class 1259 OID 19570)
-- Name: idx_fedidentity_feduser; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fedidentity_feduser ON public.federated_identity USING btree (federated_user_id);


--
-- TOC entry 3765 (class 1259 OID 19569)
-- Name: idx_fedidentity_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fedidentity_user ON public.federated_identity USING btree (user_id);


--
-- TOC entry 3897 (class 1259 OID 19931)
-- Name: idx_fu_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_attribute ON public.fed_user_attribute USING btree (user_id, realm_id, name);


--
-- TOC entry 3900 (class 1259 OID 19951)
-- Name: idx_fu_cnsnt_ext; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_cnsnt_ext ON public.fed_user_consent USING btree (user_id, client_storage_provider, external_client_id);


--
-- TOC entry 3901 (class 1259 OID 20114)
-- Name: idx_fu_consent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_consent ON public.fed_user_consent USING btree (user_id, client_id);


--
-- TOC entry 3902 (class 1259 OID 19933)
-- Name: idx_fu_consent_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_consent_ru ON public.fed_user_consent USING btree (realm_id, user_id);


--
-- TOC entry 3905 (class 1259 OID 19934)
-- Name: idx_fu_credential; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_credential ON public.fed_user_credential USING btree (user_id, type);


--
-- TOC entry 3906 (class 1259 OID 19935)
-- Name: idx_fu_credential_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_credential_ru ON public.fed_user_credential USING btree (realm_id, user_id);


--
-- TOC entry 3909 (class 1259 OID 19936)
-- Name: idx_fu_group_membership; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_group_membership ON public.fed_user_group_membership USING btree (user_id, group_id);


--
-- TOC entry 3910 (class 1259 OID 19937)
-- Name: idx_fu_group_membership_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_group_membership_ru ON public.fed_user_group_membership USING btree (realm_id, user_id);


--
-- TOC entry 3913 (class 1259 OID 19938)
-- Name: idx_fu_required_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_required_action ON public.fed_user_required_action USING btree (user_id, required_action);


--
-- TOC entry 3914 (class 1259 OID 19939)
-- Name: idx_fu_required_action_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_required_action_ru ON public.fed_user_required_action USING btree (realm_id, user_id);


--
-- TOC entry 3917 (class 1259 OID 19940)
-- Name: idx_fu_role_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_role_mapping ON public.fed_user_role_mapping USING btree (user_id, role_id);


--
-- TOC entry 3918 (class 1259 OID 19941)
-- Name: idx_fu_role_mapping_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_role_mapping_ru ON public.fed_user_role_mapping USING btree (realm_id, user_id);


--
-- TOC entry 3838 (class 1259 OID 20157)
-- Name: idx_group_att_by_name_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_att_by_name_value ON public.group_attribute USING btree (name, ((value)::character varying(250)));


--
-- TOC entry 3839 (class 1259 OID 19842)
-- Name: idx_group_attr_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_attr_group ON public.group_attribute USING btree (group_id);


--
-- TOC entry 3835 (class 1259 OID 19843)
-- Name: idx_group_role_mapp_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_role_mapp_group ON public.group_role_mapping USING btree (group_id);


--
-- TOC entry 3786 (class 1259 OID 19845)
-- Name: idx_id_prov_mapp_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_id_prov_mapp_realm ON public.identity_provider_mapper USING btree (realm_id);


--
-- TOC entry 3768 (class 1259 OID 19844)
-- Name: idx_ident_prov_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ident_prov_realm ON public.identity_provider USING btree (realm_id);


--
-- TOC entry 3769 (class 1259 OID 20223)
-- Name: idx_idp_for_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idp_for_login ON public.identity_provider USING btree (realm_id, enabled, link_only, hide_on_login, organization_id);


--
-- TOC entry 3770 (class 1259 OID 20222)
-- Name: idx_idp_realm_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idp_realm_org ON public.identity_provider USING btree (realm_id, organization_id);


--
-- TOC entry 3700 (class 1259 OID 19846)
-- Name: idx_keycloak_role_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keycloak_role_client ON public.keycloak_role USING btree (client);


--
-- TOC entry 3701 (class 1259 OID 19847)
-- Name: idx_keycloak_role_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keycloak_role_realm ON public.keycloak_role USING btree (realm);


--
-- TOC entry 3824 (class 1259 OID 20186)
-- Name: idx_offline_uss_by_broker_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_broker_session_id ON public.offline_user_session USING btree (broker_session_id, realm_id);


--
-- TOC entry 3825 (class 1259 OID 20185)
-- Name: idx_offline_uss_by_last_session_refresh; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_last_session_refresh ON public.offline_user_session USING btree (realm_id, offline_flag, last_session_refresh);


--
-- TOC entry 3826 (class 1259 OID 20150)
-- Name: idx_offline_uss_by_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_user ON public.offline_user_session USING btree (user_id, realm_id, offline_flag);


--
-- TOC entry 3972 (class 1259 OID 20214)
-- Name: idx_org_domain_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_domain_org_id ON public.org_domain USING btree (org_id);


--
-- TOC entry 3949 (class 1259 OID 20210)
-- Name: idx_perm_ticket_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perm_ticket_owner ON public.resource_server_perm_ticket USING btree (owner);


--
-- TOC entry 3950 (class 1259 OID 20209)
-- Name: idx_perm_ticket_requester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perm_ticket_requester ON public.resource_server_perm_ticket USING btree (requester);


--
-- TOC entry 3759 (class 1259 OID 19848)
-- Name: idx_protocol_mapper_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_protocol_mapper_client ON public.protocol_mapper USING btree (client_id);


--
-- TOC entry 3709 (class 1259 OID 19851)
-- Name: idx_realm_attr_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_attr_realm ON public.realm_attribute USING btree (realm_id);


--
-- TOC entry 3848 (class 1259 OID 20030)
-- Name: idx_realm_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_clscope ON public.client_scope USING btree (realm_id);


--
-- TOC entry 3847 (class 1259 OID 19852)
-- Name: idx_realm_def_grp_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_def_grp_realm ON public.realm_default_groups USING btree (realm_id);


--
-- TOC entry 3712 (class 1259 OID 19855)
-- Name: idx_realm_evt_list_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_evt_list_realm ON public.realm_events_listeners USING btree (realm_id);


--
-- TOC entry 3780 (class 1259 OID 19854)
-- Name: idx_realm_evt_types_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_evt_types_realm ON public.realm_enabled_event_types USING btree (realm_id);


--
-- TOC entry 3704 (class 1259 OID 19850)
-- Name: idx_realm_master_adm_cli; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_master_adm_cli ON public.realm USING btree (master_admin_client);


--
-- TOC entry 3777 (class 1259 OID 19856)
-- Name: idx_realm_supp_local_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_supp_local_realm ON public.realm_supported_locales USING btree (realm_id);


--
-- TOC entry 3719 (class 1259 OID 19857)
-- Name: idx_redir_uri_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redir_uri_client ON public.redirect_uris USING btree (client_id);


--
-- TOC entry 3819 (class 1259 OID 19858)
-- Name: idx_req_act_prov_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_req_act_prov_realm ON public.required_action_provider USING btree (realm_id);


--
-- TOC entry 3884 (class 1259 OID 19859)
-- Name: idx_res_policy_policy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_policy_policy ON public.resource_policy USING btree (policy_id);


--
-- TOC entry 3881 (class 1259 OID 19860)
-- Name: idx_res_scope_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_scope_scope ON public.resource_scope USING btree (scope_id);


--
-- TOC entry 3874 (class 1259 OID 19879)
-- Name: idx_res_serv_pol_res_serv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_serv_pol_res_serv ON public.resource_server_policy USING btree (resource_server_id);


--
-- TOC entry 3864 (class 1259 OID 19880)
-- Name: idx_res_srv_res_res_srv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_srv_res_res_srv ON public.resource_server_resource USING btree (resource_server_id);


--
-- TOC entry 3869 (class 1259 OID 19881)
-- Name: idx_res_srv_scope_res_srv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_srv_scope_res_srv ON public.resource_server_scope USING btree (resource_server_id);


--
-- TOC entry 3975 (class 1259 OID 20220)
-- Name: idx_rev_token_on_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rev_token_on_expire ON public.revoked_token USING btree (expire);


--
-- TOC entry 3959 (class 1259 OID 20104)
-- Name: idx_role_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_attribute ON public.role_attribute USING btree (role_id);


--
-- TOC entry 3857 (class 1259 OID 20033)
-- Name: idx_role_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_clscope ON public.client_scope_role_mapping USING btree (role_id);


--
-- TOC entry 3722 (class 1259 OID 19864)
-- Name: idx_scope_mapping_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scope_mapping_role ON public.scope_mapping USING btree (role_id);


--
-- TOC entry 3887 (class 1259 OID 19865)
-- Name: idx_scope_policy_policy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scope_policy_policy ON public.scope_policy USING btree (policy_id);


--
-- TOC entry 3783 (class 1259 OID 20112)
-- Name: idx_update_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_update_time ON public.migration_model USING btree (update_time);


--
-- TOC entry 3943 (class 1259 OID 20039)
-- Name: idx_usconsent_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usconsent_clscope ON public.user_consent_client_scope USING btree (user_consent_id);


--
-- TOC entry 3944 (class 1259 OID 20156)
-- Name: idx_usconsent_scope_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usconsent_scope_id ON public.user_consent_client_scope USING btree (scope_id);


--
-- TOC entry 3725 (class 1259 OID 19566)
-- Name: idx_user_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_attribute ON public.user_attribute USING btree (user_id);


--
-- TOC entry 3726 (class 1259 OID 20153)
-- Name: idx_user_attribute_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_attribute_name ON public.user_attribute USING btree (name, value);


--
-- TOC entry 3791 (class 1259 OID 19563)
-- Name: idx_user_consent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_consent ON public.user_consent USING btree (user_id);


--
-- TOC entry 3692 (class 1259 OID 19567)
-- Name: idx_user_credential; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_credential ON public.credential USING btree (user_id);


--
-- TOC entry 3731 (class 1259 OID 19560)
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_email ON public.user_entity USING btree (email);


--
-- TOC entry 3842 (class 1259 OID 19562)
-- Name: idx_user_group_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_group_mapping ON public.user_group_membership USING btree (user_id);


--
-- TOC entry 3744 (class 1259 OID 19568)
-- Name: idx_user_reqactions; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_reqactions ON public.user_required_action USING btree (user_id);


--
-- TOC entry 3747 (class 1259 OID 19561)
-- Name: idx_user_role_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_role_mapping ON public.user_role_mapping USING btree (user_id);


--
-- TOC entry 3732 (class 1259 OID 20154)
-- Name: idx_user_service_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_service_account ON public.user_entity USING btree (realm_id, service_account_client_link);


--
-- TOC entry 3813 (class 1259 OID 19867)
-- Name: idx_usr_fed_map_fed_prv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_map_fed_prv ON public.user_federation_mapper USING btree (federation_provider_id);


--
-- TOC entry 3814 (class 1259 OID 19868)
-- Name: idx_usr_fed_map_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_map_realm ON public.user_federation_mapper USING btree (realm_id);


--
-- TOC entry 3741 (class 1259 OID 19869)
-- Name: idx_usr_fed_prv_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_prv_realm ON public.user_federation_provider USING btree (realm_id);


--
-- TOC entry 3750 (class 1259 OID 19870)
-- Name: idx_web_orig_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_web_orig_client ON public.web_origins USING btree (client_id);


--
-- TOC entry 3727 (class 1259 OID 20178)
-- Name: user_attr_long_values; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_attr_long_values ON public.user_attribute USING btree (long_value_hash, name);


--
-- TOC entry 3728 (class 1259 OID 20180)
-- Name: user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_attr_long_values_lower_case ON public.user_attribute USING btree (long_value_hash_lower_case, name);


--
-- TOC entry 4002 (class 2606 OID 19064)
-- Name: identity_provider fk2b4ebc52ae5c3b34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT fk2b4ebc52ae5c3b34 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3996 (class 2606 OID 18994)
-- Name: client_attributes fk3c47c64beacca966; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT fk3c47c64beacca966 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 4001 (class 2606 OID 19074)
-- Name: federated_identity fk404288b92ef007a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT fk404288b92ef007a6 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 3997 (class 2606 OID 19221)
-- Name: client_node_registrations fk4129723ba992f594; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT fk4129723ba992f594 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3988 (class 2606 OID 18819)
-- Name: redirect_uris fk_1burs8pb4ouj97h5wuppahv9f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT fk_1burs8pb4ouj97h5wuppahv9f FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3992 (class 2606 OID 18824)
-- Name: user_federation_provider fk_1fj32f6ptolw2qy60cd8n01e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT fk_1fj32f6ptolw2qy60cd8n01e8 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3986 (class 2606 OID 18834)
-- Name: realm_required_credential fk_5hg65lybevavkqfki3kponh9v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT fk_5hg65lybevavkqfki3kponh9v FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4044 (class 2606 OID 20072)
-- Name: resource_attribute fk_5hrm2vlf9ql5fu022kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu022kqepovbr FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 3990 (class 2606 OID 18839)
-- Name: user_attribute fk_5hrm2vlf9ql5fu043kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu043kqepovbr FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 3993 (class 2606 OID 18849)
-- Name: user_required_action fk_6qj3w1jw9cvafhe19bwsiuvmd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT fk_6qj3w1jw9cvafhe19bwsiuvmd FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 3983 (class 2606 OID 18854)
-- Name: keycloak_role fk_6vyqfe4cn4wlq8r6kt5vdsj5c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT fk_6vyqfe4cn4wlq8r6kt5vdsj5c FOREIGN KEY (realm) REFERENCES public.realm(id);


--
-- TOC entry 3987 (class 2606 OID 18859)
-- Name: realm_smtp_config fk_70ej8xdxgxd0b9hh6180irr0o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT fk_70ej8xdxgxd0b9hh6180irr0o FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3984 (class 2606 OID 18874)
-- Name: realm_attribute fk_8shxd6l3e9atqukacxgpffptw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT fk_8shxd6l3e9atqukacxgpffptw FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3980 (class 2606 OID 18879)
-- Name: composite_role fk_a63wvekftu8jo1pnj81e7mce2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_a63wvekftu8jo1pnj81e7mce2 FOREIGN KEY (composite) REFERENCES public.keycloak_role(id);


--
-- TOC entry 4011 (class 2606 OID 19315)
-- Name: authentication_execution fk_auth_exec_flow; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_flow FOREIGN KEY (flow_id) REFERENCES public.authentication_flow(id);


--
-- TOC entry 4012 (class 2606 OID 19310)
-- Name: authentication_execution fk_auth_exec_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4010 (class 2606 OID 19305)
-- Name: authentication_flow fk_auth_flow_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT fk_auth_flow_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4009 (class 2606 OID 19300)
-- Name: authenticator_config fk_auth_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT fk_auth_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3994 (class 2606 OID 18889)
-- Name: user_role_mapping fk_c4fqv34p1mbylloxang7b1q3l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT fk_c4fqv34p1mbylloxang7b1q3l FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4021 (class 2606 OID 19978)
-- Name: client_scope_attributes fk_cl_scope_attr_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT fk_cl_scope_attr_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- TOC entry 4022 (class 2606 OID 19968)
-- Name: client_scope_role_mapping fk_cl_scope_rm_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT fk_cl_scope_rm_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- TOC entry 3998 (class 2606 OID 19963)
-- Name: protocol_mapper fk_cli_scope_mapper; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_cli_scope_mapper FOREIGN KEY (client_scope_id) REFERENCES public.client_scope(id);


--
-- TOC entry 4037 (class 2606 OID 19822)
-- Name: client_initial_access fk_client_init_acc_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT fk_client_init_acc_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4035 (class 2606 OID 19770)
-- Name: component_config fk_component_config; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT fk_component_config FOREIGN KEY (component_id) REFERENCES public.component(id);


--
-- TOC entry 4036 (class 2606 OID 19765)
-- Name: component fk_component_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT fk_component_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4020 (class 2606 OID 19470)
-- Name: realm_default_groups fk_def_groups_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT fk_def_groups_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4015 (class 2606 OID 19330)
-- Name: user_federation_mapper_config fk_fedmapper_cfg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT fk_fedmapper_cfg FOREIGN KEY (user_federation_mapper_id) REFERENCES public.user_federation_mapper(id);


--
-- TOC entry 4013 (class 2606 OID 19325)
-- Name: user_federation_mapper fk_fedmapperpm_fedprv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_fedprv FOREIGN KEY (federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- TOC entry 4014 (class 2606 OID 19320)
-- Name: user_federation_mapper fk_fedmapperpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4033 (class 2606 OID 19688)
-- Name: associated_policy fk_frsr5s213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsr5s213xcx4wnkog82ssrfy FOREIGN KEY (associated_policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4031 (class 2606 OID 19673)
-- Name: scope_policy fk_frsrasp13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrasp13xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4040 (class 2606 OID 20045)
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog82sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82sspmt FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 4023 (class 2606 OID 19889)
-- Name: resource_server_resource fk_frsrho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 4041 (class 2606 OID 20050)
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog83sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog83sspmt FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4042 (class 2606 OID 20055)
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog84sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog84sspmt FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- TOC entry 4034 (class 2606 OID 19683)
-- Name: associated_policy fk_frsrpas14xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsrpas14xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4032 (class 2606 OID 19668)
-- Name: scope_policy fk_frsrpass3xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrpass3xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- TOC entry 4043 (class 2606 OID 20077)
-- Name: resource_server_perm_ticket fk_frsrpo2128cx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrpo2128cx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4025 (class 2606 OID 19884)
-- Name: resource_server_policy fk_frsrpo213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT fk_frsrpo213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 4027 (class 2606 OID 19638)
-- Name: resource_scope fk_frsrpos13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrpos13xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4029 (class 2606 OID 19653)
-- Name: resource_policy fk_frsrpos53xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpos53xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4030 (class 2606 OID 19658)
-- Name: resource_policy fk_frsrpp213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpp213xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4028 (class 2606 OID 19643)
-- Name: resource_scope fk_frsrps213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrps213xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- TOC entry 4024 (class 2606 OID 19894)
-- Name: resource_server_scope fk_frsrso213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT fk_frsrso213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 3981 (class 2606 OID 18904)
-- Name: composite_role fk_gr7thllb9lu8q4vqa4524jjy8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_gr7thllb9lu8q4vqa4524jjy8 FOREIGN KEY (child_role) REFERENCES public.keycloak_role(id);


--
-- TOC entry 4039 (class 2606 OID 20020)
-- Name: user_consent_client_scope fk_grntcsnt_clsc_usc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT fk_grntcsnt_clsc_usc FOREIGN KEY (user_consent_id) REFERENCES public.user_consent(id);


--
-- TOC entry 4008 (class 2606 OID 19184)
-- Name: user_consent fk_grntcsnt_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT fk_grntcsnt_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4018 (class 2606 OID 19444)
-- Name: group_attribute fk_group_attribute_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT fk_group_attribute_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- TOC entry 4017 (class 2606 OID 19458)
-- Name: group_role_mapping fk_group_role_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT fk_group_role_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- TOC entry 4005 (class 2606 OID 19130)
-- Name: realm_enabled_event_types fk_h846o4h0w8epx5nwedrf5y69j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT fk_h846o4h0w8epx5nwedrf5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3985 (class 2606 OID 18914)
-- Name: realm_events_listeners fk_h846o4h0w8epx5nxev9f5y69j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT fk_h846o4h0w8epx5nxev9f5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4006 (class 2606 OID 19174)
-- Name: identity_provider_mapper fk_idpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT fk_idpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4007 (class 2606 OID 19344)
-- Name: idp_mapper_config fk_idpmconfig; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT fk_idpmconfig FOREIGN KEY (idp_mapper_id) REFERENCES public.identity_provider_mapper(id);


--
-- TOC entry 3995 (class 2606 OID 18924)
-- Name: web_origins fk_lojpho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT fk_lojpho213xcx4wnkog82ssrfy FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3989 (class 2606 OID 18934)
-- Name: scope_mapping fk_ouse064plmlr732lxjcn1q5f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT fk_ouse064plmlr732lxjcn1q5f1 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3999 (class 2606 OID 19069)
-- Name: protocol_mapper fk_pcm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_pcm_realm FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3982 (class 2606 OID 18949)
-- Name: credential fk_pfyr0glasqyl0dei3kl69r6v0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT fk_pfyr0glasqyl0dei3kl69r6v0 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4000 (class 2606 OID 19337)
-- Name: protocol_mapper_config fk_pmconfig; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT fk_pmconfig FOREIGN KEY (protocol_mapper_id) REFERENCES public.protocol_mapper(id);


--
-- TOC entry 4038 (class 2606 OID 20005)
-- Name: default_client_scope fk_r_def_cli_scope_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT fk_r_def_cli_scope_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4016 (class 2606 OID 19379)
-- Name: required_action_provider fk_req_act_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT fk_req_act_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4045 (class 2606 OID 20085)
-- Name: resource_uris fk_resource_server_uris; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT fk_resource_server_uris FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4046 (class 2606 OID 20099)
-- Name: role_attribute fk_role_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT fk_role_attribute_id FOREIGN KEY (role_id) REFERENCES public.keycloak_role(id);


--
-- TOC entry 4004 (class 2606 OID 19099)
-- Name: realm_supported_locales fk_supported_locales_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT fk_supported_locales_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3991 (class 2606 OID 18969)
-- Name: user_federation_config fk_t13hpu1j94r2ebpekr39x5eu5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT fk_t13hpu1j94r2ebpekr39x5eu5 FOREIGN KEY (user_federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- TOC entry 4019 (class 2606 OID 19451)
-- Name: user_group_membership fk_user_group_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4026 (class 2606 OID 19628)
-- Name: policy_config fkdc34197cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT fkdc34197cf864c4e43 FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4003 (class 2606 OID 19079)
-- Name: identity_provider_config fkdc4897cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT fkdc4897cf864c4e43 FOREIGN KEY (identity_provider_id) REFERENCES public.identity_provider(internal_id);


-- Completed on 2025-09-15 23:07:38

--
-- PostgreSQL database dump complete
--

