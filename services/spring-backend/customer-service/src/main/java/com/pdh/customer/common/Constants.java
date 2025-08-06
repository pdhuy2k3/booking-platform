package com.pdh.customer.common;

public final class Constants {

    public static final class ErrorCode {
        // User/Customer related errors
        public static final String USER_WITH_EMAIL_NOT_FOUND = "USER_WITH_EMAIL_NOT_FOUND";
        public static final String USER_WITH_USERNAME_NOT_FOUND = "USER_WITH_USERNAME_NOT_FOUND";
        public static final String WRONG_EMAIL_FORMAT = "WRONG_EMAIL_FORMAT";
        public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
        public static final String USER_ADDRESS_NOT_FOUND = "USER_ADDRESS_NOT_FOUND";
        public static final String UNAUTHENTICATED = "ACTION FAILED, PLEASE LOGIN";
        public static final String USERNAME_ALREADY_EXITED = "USERNAME_ALREADY_EXITED";
        public static final String USER_WITH_EMAIL_ALREADY_EXITED = "USER_WITH_EMAIL_ALREADY_EXITED";
        
        // Partner related errors
        public static final String PARTNER_NOT_FOUND = "PARTNER_NOT_FOUND";
        public static final String PARTNER_WITH_EMAIL_NOT_FOUND = "PARTNER_WITH_EMAIL_NOT_FOUND";
        public static final String PARTNER_WITH_EMAIL_ALREADY_EXISTS = "PARTNER_WITH_EMAIL_ALREADY_EXISTS";
        public static final String PARTNER_CONTACT_NOT_FOUND = "PARTNER_CONTACT_NOT_FOUND";
        public static final String PARTNER_CONTACT_ALREADY_PROCESSED = "PARTNER_CONTACT_ALREADY_PROCESSED";
        public static final String PARTNER_PROFILE_UPDATE_FAILED = "PARTNER_PROFILE_UPDATE_FAILED";
        public static final String PARTNER_SERVICE_TYPES_REQUIRED = "PARTNER_SERVICE_TYPES_REQUIRED";
        public static final String INVALID_SERVICE_TYPE = "INVALID_SERVICE_TYPE";
        public static final String PARTNER_REGISTRATION_FAILED = "PARTNER_REGISTRATION_FAILED";
        public static final String PARTNER_ACCOUNT_CREATION_FAILED = "PARTNER_ACCOUNT_CREATION_FAILED";
        public static final String PARTNER_ROLE_ASSIGNMENT_FAILED = "PARTNER_ROLE_ASSIGNMENT_FAILED";
        public static final String PARTNER_ATTRIBUTES_UPDATE_FAILED = "PARTNER_ATTRIBUTES_UPDATE_FAILED";
        public static final String INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS";
    }
    
 
    
}
