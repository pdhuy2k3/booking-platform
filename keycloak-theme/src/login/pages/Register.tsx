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
                            {msg("registerTitle")}
                        </div>
                    </div>

                <form
                    id="kc-register-form"
                    action={url.registrationAction}
                    method="post"
                    className="bookingsmart-form"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="bookingsmart-label block mb-2">
                                    {msg("firstName")}
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className="bookingsmart-input"
                                    name="firstName"
                                    defaultValue=""
                                    aria-invalid={messagesPerField.existsError("firstName")}
                                />
                                {messagesPerField.existsError("firstName") && (
                                    <div className="bookingsmart-error">
                                        {messagesPerField.get("firstName")}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="lastName" className="bookingsmart-label block mb-2">
                                    {msg("lastName")}
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className="bookingsmart-input"
                                    name="lastName"
                                    defaultValue=""
                                    aria-invalid={messagesPerField.existsError("lastName")}
                                />
                                {messagesPerField.existsError("lastName") && (
                                    <div className="bookingsmart-error">
                                        {messagesPerField.get("lastName")}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="bookingsmart-label block mb-2">
                                {msg("email")}
                            </label>
                            <input
                                type="text"
                                id="email"
                                className="bookingsmart-input"
                                name="email"
                                defaultValue=""
                                autoComplete="email"
                                aria-invalid={messagesPerField.existsError("email")}
                            />
                            {messagesPerField.existsError("email") && (
                                <div className="bookingsmart-error">
                                    {messagesPerField.get("email")}
                                </div>
                            )}
                        </div>

                        {!realm.registrationEmailAsUsername && (
                            <div>
                                <label htmlFor="username" className="bookingsmart-label block mb-2">
                                    {msg("username")}
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    className="bookingsmart-input"
                                    name="username"
                                    defaultValue=""
                                    autoComplete="username"
                                    aria-invalid={messagesPerField.existsError("username")}
                                />
                                {messagesPerField.existsError("username") && (
                                    <div className="bookingsmart-error">
                                        {messagesPerField.get("username")}
                                    </div>
                                )}
                            </div>
                        )}

                        {passwordRequired && (
                            <>
                                <div>
                                    <label htmlFor="password" className="bookingsmart-label block mb-2">
                                        {msg("password")}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="bookingsmart-input"
                                        name="password"
                                        autoComplete="new-password"
                                        aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                                    />
                                    {messagesPerField.existsError("password") && (
                                        <div className="bookingsmart-error">
                                            {messagesPerField.get("password")}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password-confirm" className="bookingsmart-label block mb-2">
                                        {msg("passwordConfirm")}
                                    </label>
                                    <input
                                        type="password"
                                        id="password-confirm"
                                        className="bookingsmart-input"
                                        name="password-confirm"
                                        autoComplete="new-password"
                                        aria-invalid={messagesPerField.existsError("password-confirm")}
                                    />
                                    {messagesPerField.existsError("password-confirm") && (
                                        <div className="bookingsmart-error">
                                            {messagesPerField.get("password-confirm")}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {recaptchaRequired && (
                            <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                        )}

                        <div className="pt-4">
                            <input
                                className="bookingsmart-button"
                                type="submit"
                                value={msgStr("doRegister")}
                            />
                        </div>
                    </div>
                </form>

                <div className="bookingsmart-divider">
                    <div className="text-center">
                        <span className="bookingsmart-subheader">
                            {msg("backToLogin")}
                            <a
                                href={url.loginUrl}
                                className="bookingsmart-link ml-2"
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
