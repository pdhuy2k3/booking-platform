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
            <div className="bookingsmart-page-bg">
                <div className="bookingsmart-container">


                <div className="bookingsmart-alert bookingsmart-alert-info">
                    <p className="text-sm">
                        {msg("emailVerifyInstruction1")}
                        <strong>{user?.email}</strong>
                        {msg("emailVerifyInstruction2")}
                    </p>
                </div>

                <div className="bookingsmart-divider">
                    <div className="text-center">
                        <span className="bookingsmart-subheader">
                            <a
                                href={url.loginAction}
                                className="bookingsmart-link"
                            >
                                {msg("doClickHere")} {msg("emailVerifyInstruction3")}
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </Template>
    );
}
