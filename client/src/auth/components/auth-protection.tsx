import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loading } from '@/components/ui';
import { useAuthenticateUser } from '../use-authenticate-user';

export function AuthProtection({ children }: { children?: ReactNode }) {
  const { isPending, isError } = useAuthenticateUser();
  const location = useLocation();

  if (isPending) return <Loading />;
  if (isError) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children ?? <Outlet />;
}

export default AuthProtection;
