'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/features/auth/schema';
import { registerAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthCard from '@/features/auth/components/AuthCard';
import PasswordInput from '@/features/auth/components/PasswordInput';
import { useAuthForm } from '@/features/auth/hooks';
import { z } from 'zod';
import { useState } from 'react';

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { isPending, startTransition } = useAuthForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    setSuccessMessage('');

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('full_name', data.full_name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('password', data.password);
        await registerAction(formData);
        setSuccessMessage('Account created. Redirecting...');
      } catch (error: unknown) {
        setErrorMessage(error instanceof Error ? error.message : 'Registration failed.');
      }
    });
  };

  return (
    <AuthCard title="Create your business account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {errorMessage ? (
          <div className="rounded-md border border-red-500 bg-red-500/10 p-2 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : null}
        {successMessage ? (
          <div className="rounded-md border border-green-500 bg-green-500/10 p-2 text-sm text-green-400">
            {successMessage}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="full_name" className="text-zinc-300">Full name</Label>
          <Input {...form.register('full_name')} placeholder="Ada Okafor" autoComplete="name" />
          {form.formState.errors.full_name ? (
            <p className="text-xs text-red-400">{form.formState.errors.full_name.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input {...form.register('email')} type="email" placeholder="you@email.com" autoComplete="email" />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-zinc-300">Phone</Label>
            <Input {...form.register('phone')} type="tel" placeholder="0801 234 5678" autoComplete="tel" />
            {form.formState.errors.phone ? (
              <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <PasswordInput {...form.register('password')} placeholder="At least 8 characters" autoComplete="new-password" />
            {form.formState.errors.password ? (
              <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className="text-zinc-300">Confirm</Label>
            <PasswordInput {...form.register('confirm_password')} placeholder="Repeat password" autoComplete="new-password" />
            {form.formState.errors.confirm_password ? (
              <p className="text-xs text-red-400">{form.formState.errors.confirm_password.message}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-violet-400 hover:underline">
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
