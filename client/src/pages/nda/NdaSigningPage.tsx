import { Navigate, useSearchParams } from "react-router-dom";
import AuthPage, { safeNext } from "../auth/AuthPage";
import { useAuthenticateUser } from "@/auth/use-authenticate-user";
import { Loading } from "@/components/ui";
import { useLogout } from "../auth/hooks/use-auth-hooks";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Login entry from the NDA email: signed-in users go straight to ?next=
export default function NdaSigningPage() {
  const { data: user, isError, isPending } = useAuthenticateUser();
  const logout = useLogout();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();

  const company = user?.role === 'company';

  useEffect(() => {
    if (company) {
      logout.mutate(undefined, 
        { onSuccess: () => {
          queryClient.clear();
        }, 
        onError: (err) => {
          console.error('error while logging out company', err);
        },
      }
      );
    }
  }, [user, isError, isPending]);

  if (isPending) return <Loading />;
  if (isError || company) return <AuthPage studentNda />;
  return <Navigate to={safeNext(params.get('next')) ?? '/student'} replace />;
}
