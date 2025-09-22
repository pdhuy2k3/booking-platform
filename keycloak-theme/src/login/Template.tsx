import { clsx } from "keycloakify/tools/clsx";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import { BookingSmartLogo } from "../components/BookingSmartLogo";
import { VideoBackground } from "../components/VideoBackground";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });
    const { msgStr } = i18n;
    const { realm, locale, message } = kcContext;

    return (
        <html className={kcClsx("kcHtmlClass")} lang={locale?.currentLanguageTag ?? "en"}>
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            
                <title>{documentTitle ?? msgStr("loginTitle", realm.displayName)}</title>
                
                {/* Favicon */}
                <link rel="icon" type="image/png" sizes="32x32" href="./assets/favicon-32x32.png" />
                <link rel="shortcut icon" href="./assets/favicon.ico" />
 
                {/* Link to our compiled CSS */}
                <link rel="stylesheet" href="./assets/index.css" />
            </head>

            <body className={clsx(bodyClassName, "bookingsmart-theme min-h-screen relative")}>
                {/* Video Background */}
                <VideoBackground />

                {/* Overlay for better readability */}
                <div className="fixed inset-0 bg-black/30 z-10"></div>

                {/* Main Content */}
                <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-lg">
                        {/* Main Content Card */}
                        <div className="bookingsmart-card-enhanced scale-in">
                            {/* Logo Header */}
                            <div className="text-center mb-6">
                                <BookingSmartLogo size="lg" className="mx-auto" />
                            </div>
                            {headerNode && <div className="text-xl font-semibold text-center mb-6 text-gray-900">{headerNode}</div>}

                            {/* Messages */}
                            {displayMessage && message !== undefined && (
                                <div
                                    className={clsx(
                                        "p-3 rounded-md mb-4 text-sm",
                                        message.type === "success" && "bg-green-50 text-green-800 border border-green-200",
                                        message.type === "warning" && "bg-yellow-50 text-yellow-800 border border-yellow-200",
                                        message.type === "error" && "bg-red-50 text-red-800 border border-red-200",
                                        message.type === "info" && "bg-blue-50 text-blue-800 border border-blue-200"
                                    )}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: message.summary }} />
                                </div>
                            )}

                            {/* Social Providers */}
                            {socialProvidersNode}

                            {/* Main Form Content */}
                            {children}

                            {/* Info Section */}
                            {displayInfo && infoNode && <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">{infoNode}</div>}

                            {/* Footer Links */}
                            {/* <div className="text-center mt-6 pt-6 border-t border-gray-200">
                                {kcContext.pageId !== "login.ftl" && (
                                    <a href={url.loginUrl} className="text-primary hover:text-primary/80 transition-colors text-sm">
                                        ← {msg("backToLogin")}
                                    </a>
                                )}
                                
                                {kcContext.pageId === "login.ftl" && (url as any).registrationUrl && (
                                    <a href={(url as any).registrationUrl} className="text-primary hover:text-primary/80 transition-colors text-sm">
                                        {msg("doRegister")}
                                    </a>
                                )}
                                
                                {kcContext.pageId === "login.ftl" && (url as any).loginResetCredentialsUrl && (
                                    <a href={(url as any).loginResetCredentialsUrl} className="text-primary hover:text-primary/80 transition-colors text-sm ml-4 pl-4 border-l border-gray-200">
                                        {msg("doForgotPassword")}
                                    </a>
                                )}
                            </div> */}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
