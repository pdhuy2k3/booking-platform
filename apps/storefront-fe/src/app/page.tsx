import React from 'react';

export default function Index(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-6">
            <span className="text-blue-600">Hello there,</span> Welcome to BookingSmart Storefront 👋
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your travel booking platform for flights, hotels and more
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            This is your Next.js storefront application with Tailwind CSS configured and ready to use.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Get Started
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
