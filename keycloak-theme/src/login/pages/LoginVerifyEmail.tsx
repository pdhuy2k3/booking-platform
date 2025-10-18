import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, user } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={false}
            headerNode={msg("emailVerifyTitle")}
        >
            <div className="bookingsmart-page-bg fade-in">
                <div className="bookingsmart-container">
                <div className="bookingsmart-alert-enhanced bookingsmart-alert-info-enhanced slide-up">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{msg("emailVerifyTitle")}</h3>
                            <p className="text-sm leading-relaxed">
                                {msg("emailVerifyInstruction1")}
                                <strong className="text-primary font-semibold">{user?.email}</strong>
                                {msg("emailVerifyInstruction2")}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                {msg("emailVerifyInstruction3")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bookingsmart-divider-enhanced fade-in">
                    <div className="text-center">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href={url.loginAction}
                                className="bookingsmart-button-enhanced text-center"
                            >
                                {msg("doClickHere")}
                            </a>
                            <a
                                href={url.loginUrl}
                                className="bookingsmart-link-enhanced text-center"
                            >
                                {msg("backToLogin")}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </Template>
    );
}
