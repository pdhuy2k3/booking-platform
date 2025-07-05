import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

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
                        <ul className="space-y-2">
                            {social?.providers.map((p) => (
                                <li key={p.alias}>
                                    <a
                                        id={`social-${p.alias}`}
                                        className={`bookingsmart-button-secondary flex items-center justify-center space-x-2 ${kcClsx("kcFormSocialAccountListButtonClass")}`}
                                        type="button"
                                        href={p.loginUrl}
                                    >
                                        <span className="text-sm">{p.displayName}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null
            }
        >
            <div className="bookingsmart-page-bg">
                <div className="bookingsmart-container">
                    <div className="bookingsmart-brand-header">
                        <div className="bookingsmart-logo">
                            <img src="/BookingSmart.svg" alt="BookingSmart" />
                        </div>
                        <div className="bookingsmart-brand-text">
                            BookingSmart
                        </div>
                        <div className="bookingsmart-tagline">
                            {msg("loginAccountTitle")}
                        </div>
                    </div>

                <form
                    id="kc-form-login"
                    onSubmit={() => {
                        // Keycloak handles the submission
                    }}
                    action={url.loginAction}
                    method="post"
                    className="bookingsmart-form"
                >
                    <div className="space-y-4">
                        {!usernameHidden && (
                            <div>
                                <label htmlFor="username" className="bookingsmart-label block mb-2">
                                    {!realm.loginWithEmailAllowed
                                        ? msg("username")
                                        : !realm.registrationEmailAsUsername
                                            ? msg("usernameOrEmail")
                                            : msg("email")}
                                </label>
                                <input
                                    tabIndex={1}
                                    id="username"
                                    className="bookingsmart-input"
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
                                />
                                {messagesPerField.existsError("username") && (
                                    <div className="bookingsmart-error">
                                        {messagesPerField.get("username")}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="bookingsmart-label block mb-2">
                                {msg("password")}
                            </label>
                            <input
                                tabIndex={2}
                                id="password"
                                className="bookingsmart-input"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder={msgStr("password")}
                                aria-invalid={messagesPerField.existsError("username", "password")}
                            />
                            {messagesPerField.existsError("password") && (
                                <div className="bookingsmart-error">
                                    {messagesPerField.get("password")}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            {realm.rememberMe && !usernameHidden && (
                                <label className="flex items-center">
                                    <input
                                        tabIndex={3}
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        className="bookingsmart-checkbox mr-2"
                                        defaultChecked={!!login.rememberMe}
                                    />
                                    <span className="text-sm text-foreground">{msg("rememberMe")}</span>
                                </label>
                            )}
                            
                            {realm.resetPasswordAllowed && (
                                <a
                                    tabIndex={5}
                                    href={url.loginResetCredentialsUrl}
                                    className="bookingsmart-link text-sm"
                                >
                                    {msg("doForgotPassword")}
                                </a>
                            )}
                        </div>

                        <div className="pt-4">
                            <input
                                type="hidden"
                                id="id-hidden-input"
                                name="credentialId"
                                value={auth.selectedCredential}
                            />
                            <button
                                tabIndex={4}
                                className="bookingsmart-button"
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
                    <div className="bookingsmart-divider">
                        <div className="text-center">
                            <span className="bookingsmart-subheader">
                                {msg("noAccount")}
                                <a
                                    tabIndex={6}
                                    href={url.registrationUrl}
                                    className="bookingsmart-link ml-2"
                                >
                                    {msg("doRegister")}
                                </a>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </Template>
    );
}
