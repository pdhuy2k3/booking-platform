import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm, auth, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username")}
            headerNode={msg("emailForgotTitle")}
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
                            {msg("emailForgotTitle")}
                        </div>
                    </div>

                <form
                    id="kc-reset-password-form"
                    action={url.loginAction}
                    method="post"
                    className="bookingsmart-form"
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="bookingsmart-label block mb-2">
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
                                className="bookingsmart-input"
                                autoFocus
                                defaultValue={auth.attemptedUsername ?? ""}
                                aria-invalid={messagesPerField.existsError("username")}
                            />
                            {messagesPerField.existsError("username") && (
                                <div className="bookingsmart-error">
                                    {messagesPerField.get("username")}
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <input
                                className="bookingsmart-button"
                                type="submit"
                                value={msgStr("doSubmit")}
                            />
                        </div>
                    </div>
                </form>

                <div className="bookingsmart-divider">
                    <div className="text-center">
                        <span className="bookingsmart-subheader">
                            <a
                                href={url.loginUrl}
                                className="bookingsmart-link"
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
