import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { TurnstileWidget } from "../../components/TurnstileWidget";


export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm, auth, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;
    
    // Get Turnstile site key from environment variables
    const turnstileSiteKey = (kcContext as any).properties?.TURNSTILE_SITE_KEY || "";

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username")}
            headerNode={msg("emailForgotTitle")}
        >
            <div className="bookingsmart-page-bg fade-in">
                <div className="bookingsmart-container">
                <form
                    id="kc-reset-password-form"
                    action={url.loginAction}
                    method="post"
                    className="bookingsmart-form space-y-6"
                >
                    <div className="space-y-6">
                        <div className="form-group-enhanced slide-up">
                            <label htmlFor="username" className="bookingsmart-label-enhanced">
                                {!realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                        ? msg("usernameOrEmail")
                                        : msg("email")}
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="bookingsmart-input-enhanced"
                                autoFocus
                                defaultValue={auth.attemptedUsername ?? ""}
                                placeholder={
                                    !realm.loginWithEmailAllowed
                                        ? msgStr("username")
                                        : !realm.registrationEmailAsUsername
                                            ? msgStr("usernameOrEmail")
                                            : msgStr("email")
                                }
                                aria-invalid={messagesPerField.existsError("username")}
                                aria-describedby={messagesPerField.existsError("username") ? "username-error" : undefined}
                            />
                            {messagesPerField.existsError("username") && (
                                <div id="username-error" className="bookingsmart-error-enhanced">
                                    {messagesPerField.get("username")}
                                </div>
                            )}
                        </div>

                        {turnstileSiteKey && (
                            <div className="form-group-enhanced slide-up">
                                <TurnstileWidget 
                                    siteKey={turnstileSiteKey} 
                                    onVerify={(token) => {
                                        // Add the token to a hidden input field in the form
                                        const form = document.getElementById('kc-reset-password-form') as HTMLFormElement;
                                        let tokenInput = document.getElementById('cf-turnstile-response') as HTMLInputElement;
                                        
                                        if (!tokenInput) {
                                            tokenInput = document.createElement('input');
                                            tokenInput.type = 'hidden';
                                            tokenInput.id = 'cf-turnstile-response';
                                            tokenInput.name = 'cf-turnstile-response';
                                            form.appendChild(tokenInput);
                                        }
                                        
                                        tokenInput.value = token;
                                    }}
                                    className="flex justify-center"
                                />
                            </div>
                        )}

                        <div className="pt-6 scale-in">
                            <input
                                className="bookingsmart-button-enhanced"
                                type="submit"
                                value={msgStr("doSubmit")}
                            />
                        </div>
                    </div>
                </form>

                <div className="bookingsmart-divider-enhanced fade-in">
                    <div className="text-center">
                        <span className="bookingsmart-subheader-enhanced">
                            <a
                                href={url.loginUrl}
                                className="bookingsmart-link-enhanced"
                            >
                                {msg("backToLogin")}
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </Template>
    );
}
