// app/privacy-policy/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - Parpra',
  description: 'Browse and manage products for Parpra.',
};

export default function ProductsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
