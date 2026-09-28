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
import { useAuthForm } from '@/features/auth/hooks';
import { z } from 'zod';
import { useState } from 'react';

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { isPending, startTransition } = useAuthForm();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

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
        
        setSuccessMessage("Account created successfully! Redirecting...");
      } catch (error: any) {
        setErrorMessage(error.message || "Registration failed. Please try again.");
      }
    });
  };

  return (
    <AuthCard title="Create your business account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            {...form.register('full_name')}
            type="text"
            placeholder="John Doe"
            autoComplete="name"
          />
          {form.formState.errors.full_name && (
            <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            {...form.register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            {...form.register('phone')}
            type="tel"
            placeholder="+234 801 234 5678"
            autoComplete="tel"
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            {...form.register('password')}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input
            {...form.register('confirm_password')}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {form.formState.errors.confirm_password && (
            <p className="text-sm text-red-500">{form.formState.errors.confirm_password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          size="lg"
        >
          {isPending ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-400 hover:underline font-medium">
          Sign in
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        By creating an account, you agree to our Terms and Privacy Policy.
      </p>
    </AuthCard>
  );
}