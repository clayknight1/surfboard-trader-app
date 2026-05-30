import { Redirect } from 'expo-router';
import { useAuth } from './auth';

export function useRequireAuth() {
  const { session, loading } = useAuth();
  if (loading) return { ready: false, userId: null } as const;
  if (!session?.user?.id) {
    return {
      ready: false,
      userId: null,
      redirect: <Redirect href='/auth/login' />,
    } as const;
  }
  return { ready: true, userId: session.user.id } as const;
}
