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
                        <div>
                            <p className="text-sm leading-relaxed">
                                {msg("emailVerifyInstruction1")}
                                <strong className="text-primary font-semibold">{user?.email}</strong>
                                {msg("emailVerifyInstruction2")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bookingsmart-divider-enhanced fade-in">
                    <div className="text-center">
                        <span className="bookingsmart-subheader-enhanced">
                            <a
                                href={url.loginAction}
                                className="bookingsmart-link-enhanced inline-flex items-center space-x-2"
                            >
                                <span>{msg("doClickHere")}</span>
                                <span>{msg("emailVerifyInstruction3")}</span>
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </Template>
    );
}
