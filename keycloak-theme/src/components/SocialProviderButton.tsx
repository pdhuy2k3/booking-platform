import React from 'react';
import googleLogoUrl from '../login/assets/google-logo.svg';
import facebookLogoUrl from '../login/assets/facebook-logo.svg';

interface SocialProvider {
    alias: string;
    displayName: string;
    loginUrl: string;
}

interface SocialProviderButtonProps {
    provider: SocialProvider;
    className?: string;
}

const getProviderLogo = (alias: string): string => {
    switch (alias.toLowerCase()) {
        case 'google':
            return googleLogoUrl;
        case 'facebook':
            return facebookLogoUrl;
        default:
            return '';
    }
};

const getProviderStyles = (alias: string): string => {
    switch (alias.toLowerCase()) {
        case 'google':
            return 'social-provider-google';
        case 'facebook':
            return 'social-provider-facebook';
        default:
            return 'hover:bg-gray-50 border-gray-200 hover:border-gray-300';
    }
};

export const SocialProviderButton: React.FC<SocialProviderButtonProps> = ({ 
    provider, 
    className = '' 
}) => {
    const logoPath = getProviderLogo(provider.alias);
    const providerStyles = getProviderStyles(provider.alias);

    return (
        <a
            id={`social-${provider.alias}`}
            className={`
                social-provider-enhanced
                bookingsmart-button-secondary-enhanced
                flex items-center justify-center space-x-3 
                transition-all duration-300
                ${providerStyles}
                ${className}
            `}
            type="button"
            href={provider.loginUrl}
        >
            {logoPath && (
                <img 
                    src={logoPath} 
                    alt={`${provider.displayName} logo`}
                    className="w-5 h-5"
                />
            )}
            <span className="text-sm font-medium">
                Continue with {provider.displayName}
            </span>
        </a>
    );
};
