// app/privacy-policy/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Parpra',
  description: 'Read our privacy policy for Parpra.',
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
