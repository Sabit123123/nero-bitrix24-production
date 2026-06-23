import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'New Direction Stage Configurator',
  description: 'Простой 3D-конфигуратор для концертных площадок',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
