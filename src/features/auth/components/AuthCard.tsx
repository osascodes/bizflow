import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AuthHeader from '@/components/common/AuthHeader';

export default function AuthCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-6 pt-10">
          <AuthHeader />
          <h2 className="text-2xl font-semibold text-center text-white">{title}</h2>
        </CardHeader>
        <CardContent className="pb-10">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}