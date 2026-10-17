import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loading } from '@/components/ui';
import { useAuthenticateUser } from '../use-authenticate-user';

export function AuthProtection({ children }: { children?: ReactNode }) {
  const { isPending, isError } = useAuthenticateUser();

  if (isPending) return <Loading />;
  if (isError) return <Navigate to="/" replace />;
  return children ?? <Outlet />;
}

export default AuthProtection;
