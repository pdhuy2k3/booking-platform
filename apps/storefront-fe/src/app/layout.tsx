import './globals.css';

export const metadata = {
  title: 'BookingSmart Storefront',
  description: 'Travel booking platform for flights, hotels and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
