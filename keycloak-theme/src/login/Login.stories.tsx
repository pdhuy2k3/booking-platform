import type { Meta, StoryObj } from '@storybook/react';
import { createKcPageStory } from './KcPageStory';

const { KcPageStory } = createKcPageStory({ pageId: "login.ftl" });

const meta: Meta<typeof KcPageStory> = {
    title: 'Login/Login Page',
    component: KcPageStory,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        kcContext: {
            social: {
                providers: [
                    {
                        alias: "google",
                        displayName: "Google",
                        loginUrl: "https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=test"
                    },
                    {
                        alias: "facebook", 
                        displayName: "Facebook",
                        loginUrl: "https://www.facebook.com/v18.0/dialog/oauth?client_id=test&redirect_uri=test"
                    }
                ]
            },
            realm: {
                loginWithEmailAllowed: true,
                registrationEmailAsUsername: false,
                rememberMe: true,
                resetPasswordAllowed: true,
                password: true,
                registrationAllowed: true
            },
            registrationDisabled: false,
            usernameHidden: false,
            login: {
                username: "",
                rememberMe: false
            },
            auth: {
                selectedCredential: ""
            },
            messagesPerField: {
                existsError: () => false,
                get: () => ""
            }
        }
    }
};

export const WithGoogleOnly: Story = {
    args: {
        kcContext: {
            social: {
                providers: [
                    {
                        alias: "google",
                        displayName: "Google", 
                        loginUrl: "https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=test"
                    }
                ]
            }
        }
    }
};

export const WithFacebookOnly: Story = {
    args: {
        kcContext: {
            social: {
                providers: [
                    {
                        alias: "facebook",
                        displayName: "Facebook",
                        loginUrl: "https://www.facebook.com/v18.0/dialog/oauth?client_id=test&redirect_uri=test"
                    }
                ]
            }
        }
    }
};

export const NoSocialProviders: Story = {
    args: {
        kcContext: {
            social: {
                providers: []
            },
            realm: {
                loginWithEmailAllowed: true,
                registrationEmailAsUsername: false,
                rememberMe: true,
                resetPasswordAllowed: true,
                password: true,
                registrationAllowed: true
            },
            registrationDisabled: false,
            usernameHidden: false,
            login: {
                username: "",
                rememberMe: false
            },
            auth: {
                selectedCredential: ""
            },
            messagesPerField: {
                existsError: () => false,
                get: () => ""
            }
        }
    }
};

export const WithErrors: Story = {
    args: {
        kcContext: {
            social: {
                providers: []
            },
            realm: {
                loginWithEmailAllowed: true,
                registrationEmailAsUsername: false,
                rememberMe: true,
                resetPasswordAllowed: true,
                password: true,
                registrationAllowed: true
            },
            registrationDisabled: false,
            usernameHidden: false,
            login: {
                username: "test@example.com",
                rememberMe: false
            },
            auth: {
                selectedCredential: ""
            },
            messagesPerField: {
                existsError: (field: string) => field === "password",
                get: (field: string) => field === "password" ? "Invalid password" : ""
            }
        }
    }
};

export const EmailOnly: Story = {
    args: {
        kcContext: {
            social: {
                providers: []
            },
            realm: {
                loginWithEmailAllowed: true,
                registrationEmailAsUsername: true,
                rememberMe: false,
                resetPasswordAllowed: false,
                password: true,
                registrationAllowed: false
            },
            registrationDisabled: true,
            usernameHidden: false,
            login: {
                username: "",
                rememberMe: false
            },
            auth: {
                selectedCredential: ""
            },
            messagesPerField: {
                existsError: () => false,
                get: () => ""
            }
        }
    }
};
