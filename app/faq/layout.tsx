// app/privacy-policy/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Faq - Parpra',
  description: 'Read our faq Section for Parpra.',
};

export default function FAQPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
