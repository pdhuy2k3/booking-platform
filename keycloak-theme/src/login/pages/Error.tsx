import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { message, client } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={false}
            headerNode={msg("errorTitle")}
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

                <div className="bookingsmart-alert bookingsmart-alert-error">
                    <p className="text-sm">
                        {message?.summary}
                    </p>
                </div>

                {client && client.baseUrl && (
                    <div className="bookingsmart-divider">
                        <div className="text-center">
                            <a
                                href={client.baseUrl}
                                className="bookingsmart-link"
                            >
                                {msg("backToApplication")}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </Template>
    );
}
