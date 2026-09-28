import { getSession } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return <div className="dashboard-shell">{children}</div>;
}