import { useTransition } from 'react';

export function useAuthForm() {
  const [isPending, startTransition] = useTransition();
  return { isPending, startTransition };
}