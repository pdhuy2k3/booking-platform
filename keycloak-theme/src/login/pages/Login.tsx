import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { SocialProviderButton } from "../../components/SocialProviderButton";
import { TurnstileWidget } from "../../components/TurnstileWidget";


export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;
    
    // Get Turnstile site key from environment variables
    const turnstileSiteKey = (kcContext as any).properties?.TURNSTILE_SITE_KEY || "";

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("doLogIn")}
            socialProvidersNode={
                social?.providers !== undefined && social?.providers.length !== 0 ? (
                    <div id="kc-social-providers" className="bookingsmart-card mb-4">
                        <div className="space-y-3">
                            {social?.providers.map((p) => (
                                <SocialProviderButton 
                                    key={p.alias}
                                    provider={p}
                                    className={kcClsx("kcFormSocialAccountListButtonClass")}
                                />
                            ))}
                        </div>
                    </div>
                ) : null
            }
        >
            <div className="bookingsmart-page-bg fade-in"></div>
                <div className="bookingsmart-container">
                <form
                    id="kc-form-login"
                    onSubmit={() => {
                        // Keycloak handles the submission
                    }}
                    action={url.loginAction}
                    method="post"
                    className="bookingsmart-form space-y-6"
                >
                    <div className="space-y-4">
                        {!usernameHidden && (
                            <div className="form-group-enhanced slide-up">
                                <label htmlFor="username" className="bookingsmart-label-enhanced">
                                    {!realm.loginWithEmailAllowed
                                        ? msg("username")
                                        : !realm.registrationEmailAsUsername
                                            ? msg("usernameOrEmail")
                                            : msg("email")}
                                </label>
                                <input
                                    tabIndex={1}
                                    id="username"
                                    className="bookingsmart-input-enhanced"
                                    name="username"
                                    defaultValue={login.username ?? ""}
                                    type="text"
                                    autoFocus={true}
                                    autoComplete="off"
                                    placeholder={
                                        !realm.loginWithEmailAllowed
                                            ? msgStr("username")
                                            : !realm.registrationEmailAsUsername
                                                ? msgStr("usernameOrEmail")
                                                : msgStr("email")
                                    }
                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                    aria-describedby={messagesPerField.existsError("username") ? "username-error" : undefined}
                                />
                                {messagesPerField.existsError("username") && (
                                    <div id="username-error" className="bookingsmart-error-enhanced">
                                        {messagesPerField.get("username")}
                                    </div>
                                )}
                                {messagesPerField.existsError("username") && (
                                    <div className="bookingsmart-error-enhanced">
                                        {messagesPerField.get("username")}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group-enhanced slide-up">
                            <label htmlFor="password" className="bookingsmart-label-enhanced">
                                {msg("password")}
                            </label>
                            <input
                                tabIndex={2}
                                id="password"
                                className="bookingsmart-input-enhanced"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder={msgStr("password")}
                                aria-invalid={messagesPerField.existsError("username", "password")}
                                aria-describedby={messagesPerField.existsError("password") ? "password-error" : undefined}
                            />
                            {messagesPerField.existsError("password") && (
                                <div id="password-error" className="bookingsmart-error-enhanced">
                                    {messagesPerField.get("password")}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between slide-up">
                            {realm.rememberMe && !usernameHidden && (
                                <label className="flex items-center group cursor-pointer">
                                    <input
                                        tabIndex={3}
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        className="bookingsmart-checkbox-enhanced mr-3 group-hover:scale-110 transition-transform duration-200"
                                        defaultChecked={!!login.rememberMe}
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-primary transition-colors duration-200">{msg("rememberMe")}</span>
                                </label>
                            )}

                            {realm.resetPasswordAllowed && (
                                <a
                                    tabIndex={5}
                                    href={url.loginResetCredentialsUrl}
                                    className="bookingsmart-link-enhanced text-sm"
                                >
                                    {msg("doForgotPassword")}
                                </a>
                            )}
                        </div>

                        {turnstileSiteKey && (
                            <div className="form-group-enhanced slide-up">
                                <TurnstileWidget 
                                    siteKey={turnstileSiteKey} 
                                    onVerify={(token) => {
                                        // Add the token to a hidden input field in the form
                                        const form = document.getElementById('kc-form-login') as HTMLFormElement;
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
                                type="hidden"
                                id="id-hidden-input"
                                name="credentialId"
                                value={auth.selectedCredential}
                            />
                            <button
                                tabIndex={4}
                                className="bookingsmart-button-enhanced"
                                name="login"
                                id="kc-login"
                                type="submit"
                                value="true"
                            >
                                {msg("doLogIn")}
                            </button>
                        </div>
                    </div>
                </form>

                {realm.password && realm.registrationAllowed && !registrationDisabled && (
                    <div className="bookingsmart-divider-enhanced fade-in">
                        <div className="text-center">
                            <span className="bookingsmart-subheader-enhanced">
                                {msg("noAccount")}
                                <a
                                    href={url.registrationUrl}
                                    className="bookingsmart-link-enhanced ml-2"
                                >
                                    {msg("doRegister")}
                                </a>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Template>
    );
}
