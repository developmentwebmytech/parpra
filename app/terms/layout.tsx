// app/privacy-policy/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Parpra',
  description: 'Read our terms and conditions policy for Parpra.',
};

export default function TermsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
