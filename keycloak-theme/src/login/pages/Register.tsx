import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Register(props: PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { realm, url, messagesPerField, passwordRequired, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("firstName", "lastName", "email", "username", "password", "password-confirm")}
            headerNode={msg("registerTitle")}
        >
            <div className="bookingsmart-page-bg fade-in">
                <div className="bookingsmart-container">
                <form
                    id="kc-register-form"
                    action={url.registrationAction}
                    method="post"
                    className="bookingsmart-form space-y-6"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group-enhanced slide-up">
                                <label htmlFor="firstName" className="bookingsmart-label-enhanced">
                                    {msg("firstName")}
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className="bookingsmart-input-enhanced"
                                    name="firstName"
                                    defaultValue=""
                                    aria-invalid={messagesPerField.existsError("firstName")}
                                />
                                {messagesPerField.existsError("firstName") && (
                                    <div className="bookingsmart-error-enhanced">
                                        {messagesPerField.get("firstName")}
                                    </div>
                                )}
                            </div>

                            <div className="form-group-enhanced slide-up">
                                <label htmlFor="lastName" className="bookingsmart-label-enhanced">
                                    {msg("lastName")}
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className="bookingsmart-input-enhanced"
                                    name="lastName"
                                    defaultValue=""
                                    aria-invalid={messagesPerField.existsError("lastName")}
                                />
                                {messagesPerField.existsError("lastName") && (
                                    <div className="bookingsmart-error-enhanced">
                                        {messagesPerField.get("lastName")}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group-enhanced slide-up">
                            <label htmlFor="email" className="bookingsmart-label-enhanced">
                                {msg("email")}
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="bookingsmart-input-enhanced"
                                name="email"
                                defaultValue=""
                                autoComplete="email"
                                aria-invalid={messagesPerField.existsError("email")}
                            />
                            {messagesPerField.existsError("email") && (
                                <div className="bookingsmart-error-enhanced">
                                    {messagesPerField.get("email")}
                                </div>
                            )}
                        </div>

                        {!realm.registrationEmailAsUsername && (
                            <div className="form-group-enhanced slide-up">
                                <label htmlFor="username" className="bookingsmart-label-enhanced">
                                    {msg("username")}
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    className="bookingsmart-input-enhanced"
                                    name="username"
                                    defaultValue=""
                                    autoComplete="username"
                                    aria-invalid={messagesPerField.existsError("username")}
                                />
                                {messagesPerField.existsError("username") && (
                                    <div className="bookingsmart-error-enhanced">
                                        {messagesPerField.get("username")}
                                    </div>
                                )}
                            </div>
                        )}

                        {passwordRequired && (
                            <div className="space-y-6">
                                <div className="form-group-enhanced slide-up">
                                    <label htmlFor="password" className="bookingsmart-label-enhanced">
                                        {msg("password")}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="bookingsmart-input-enhanced"
                                        name="password"
                                        autoComplete="new-password"
                                        aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                                    />
                                    {messagesPerField.existsError("password") && (
                                        <div className="bookingsmart-error-enhanced">
                                            {messagesPerField.get("password")}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group-enhanced slide-up">
                                    <label htmlFor="password-confirm" className="bookingsmart-label-enhanced">
                                        {msg("passwordConfirm")}
                                    </label>
                                    <input
                                        type="password"
                                        id="password-confirm"
                                        className="bookingsmart-input-enhanced"
                                        name="password-confirm"
                                        autoComplete="new-password"
                                        aria-invalid={messagesPerField.existsError("password-confirm")}
                                    />
                                    {messagesPerField.existsError("password-confirm") && (
                                        <div className="bookingsmart-error-enhanced">
                                            {messagesPerField.get("password-confirm")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {recaptchaRequired && (
                            <div className="g-recaptcha slide-up" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                        )}

                        <div className="pt-6 scale-in">
                            <input
                                className="bookingsmart-button-enhanced"
                                type="submit"
                                value={msgStr("doRegister")}
                            />
                        </div>
                    </div>
                </form>

                <div className="bookingsmart-divider-enhanced fade-in">
                    <div className="text-center">
                        <span className="bookingsmart-subheader-enhanced">
                            {msg("backToLogin")}
                            <a
                                href={url.loginUrl}
                                className="bookingsmart-link-enhanced ml-2"
                            >
                                {msg("doLogIn")}
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </Template>
    );
}
