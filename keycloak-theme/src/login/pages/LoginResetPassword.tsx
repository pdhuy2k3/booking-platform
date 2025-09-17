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
                                aria-invalid={messagesPerField.existsError("username")}
                            />
                            {messagesPerField.existsError("username") && (
                                <div className="bookingsmart-error-enhanced">
                                    {messagesPerField.get("username")}
                                </div>
                            )}
                        </div>

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
