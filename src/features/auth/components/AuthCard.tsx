import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AuthHeader from '@/components/common/AuthHeader';

export default function AuthCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen items-start justify-center overflow-y-auto bg-white px-4 py-6 sm:items-center">
      <Card className="w-full max-w-md border-zinc-200 bg-white/70">
        <CardHeader className="space-y-3 pt-6">
          <AuthHeader />
          <h2 className="text-center text-xl font-semibold text-zinc-950">{title}</h2>
        </CardHeader>
        <CardContent className="pb-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
