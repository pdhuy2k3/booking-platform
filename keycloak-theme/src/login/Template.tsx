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
                
                {/* Cloudflare Turnstile */}
                <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
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
                                        "p-4 rounded-xl mb-6 text-sm flex items-start space-x-3 transition-all duration-300",
                                        message.type === "success" && "bg-green-50/80 text-green-800 border border-green-200/50",
                                        message.type === "warning" && "bg-yellow-50/80 text-yellow-800 border border-yellow-200/50",
                                        message.type === "error" && "bg-red-50/80 text-red-800 border border-red-200/50",
                                        message.type === "info" && "bg-blue-50/80 text-blue-800 border border-blue-200/50"
                                    )}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {message.type === "success" && (
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {message.type === "warning" && (
                                            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        )}
                                        {message.type === "error" && (
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {message.type === "info" && (
                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: message.summary }} />
                                </div>
                            )}

                            {/* Social Providers */}
                            {socialProvidersNode}

                            {/* Main Form Content */}
                            {children}

                            {/* Info Section */}
                            {displayInfo && infoNode && <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">{infoNode}</div>}


                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
