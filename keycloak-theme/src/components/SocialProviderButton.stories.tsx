import type { Meta, StoryObj } from '@storybook/react';
import { SocialProviderButton } from './SocialProviderButton';

const meta: Meta<typeof SocialProviderButton> = {
    title: 'Components/SocialProviderButton',
    component: SocialProviderButton,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Google: Story = {
    args: {
        provider: {
            alias: "google",
            displayName: "Google",
            loginUrl: "https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=test"
        }
    }
};

export const Facebook: Story = {
    args: {
        provider: {
            alias: "facebook",
            displayName: "Facebook", 
            loginUrl: "https://www.facebook.com/v18.0/dialog/oauth?client_id=test&redirect_uri=test"
        }
    }
};

export const UnknownProvider: Story = {
    args: {
        provider: {
            alias: "github",
            displayName: "GitHub",
            loginUrl: "https://github.com/login/oauth/authorize?client_id=test&redirect_uri=test"
        }
    }
};
