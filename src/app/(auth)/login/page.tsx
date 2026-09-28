'use client';
import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/schema';
import { loginAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthCard from '@/features/auth/components/AuthCard';
import { useAuthForm } from '@/features/auth/hooks';

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { isPending, startTransition } = useAuthForm();
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);
        await loginAction(formData);
      } catch (error: unknown) {
        setErrorMessage(error instanceof Error ? error.message : 'Sign in failed.');
      }
    });
  };

  return (
    <AuthCard title="Welcome back">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage ? (
          <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input {...form.register('email')} type="email" placeholder="you@example.com" />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input {...form.register('password')} type="password" />
          {form.formState.errors.password ? (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-violet-400 hover:underline">Create one</Link>
      </div>
      <div className="text-center mt-4">
        <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-white">
          Forgot password?
        </Link>
      </div>
    </AuthCard>
  );
}
