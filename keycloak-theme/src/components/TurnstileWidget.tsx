import { useEffect, useRef, useState } from "react";

type TurnstileWidgetProps = {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    resetOnVerify?: boolean;
    className?: string;
};

export function TurnstileWidget({
    siteKey,
    onVerify,
    onError,
    onExpire,
    resetOnVerify = true,
    className = ""
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetId, setWidgetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current || !window.turnstile) {
            setIsLoading(false);
            return;
        }

        if (containerRef.current && !widgetId) {
            const id = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => {
                    onVerify(token);
                    if (resetOnVerify) {
                        reset();
                    }
                },
                'error-callback': () => {
                    onError?.();
                },
                'expired-callback': () => {
                    onExpire?.();
                },
                theme: 'auto' // Use system theme (light/dark)
            });

            setWidgetId(id);
            setIsLoading(false);
        }
    }, [siteKey, onVerify, onError, onExpire, resetOnVerify, widgetId]);

    const reset = () => {
        if (widgetId && window.turnstile) {
            window.turnstile.reset(widgetId);
        }
    };

    return (
        <div className={`${className}`}>
            <div ref={containerRef} />
            {isLoading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}

// Declare window.turnstile interface
declare global {
    interface Window {
        turnstile: {
            render: (container: HTMLElement, options: any) => string;
            reset: (widgetId: string) => void;
            getResponse: (widgetId: string) => string | null;
        };
    }
}