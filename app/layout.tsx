import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RC · Nova A3',
  description: 'Requisições de Compra - Nova A3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
