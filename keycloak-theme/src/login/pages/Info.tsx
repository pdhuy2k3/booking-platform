import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Info(props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={false}
            headerNode={messageHeader !== undefined ? messageHeader : msg("loginTitle")}
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
                    </div>

                <div className="bookingsmart-alert bookingsmart-alert-info">
                    <p className="text-sm">
                        {message?.summary}
                    </p>
                </div>

                {requiredActions && (
                    <div className="bookingsmart-card mt-4">
                        <h3 className="bookingsmart-subheader mb-2">
                            Actions Required
                        </h3>
                        <ul className="space-y-1">
                            {requiredActions.map((action, index) => (
                                <li key={index} className="text-sm text-foreground">
                                    {action}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!skipLink && pageRedirectUri && (
                    <div className="bookingsmart-divider">
                        <div className="text-center">
                            <a
                                href={pageRedirectUri}
                                className="bookingsmart-link"
                            >
                                {msg("backToApplication")}
                            </a>
                        </div>
                    </div>
                )}

                {actionUri && (
                    <div className="bookingsmart-divider">
                        <div className="text-center">
                            <a
                                href={actionUri}
                                className="bookingsmart-button"
                            >
                                {msg("proceedWithAction")}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </Template>
    );
}
