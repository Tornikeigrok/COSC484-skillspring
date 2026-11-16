import { Navigate, useSearchParams } from "react-router-dom";
import AuthPage, { safeNext } from "../auth/AuthPage";
import { useAuthenticateUser } from "@/auth/use-authenticate-user";
import { Loading } from "@/components/ui";

// Login entry from the NDA email: signed-in users go straight to ?next=
export default function NdaSigningPage() {
  const { isError, isPending } = useAuthenticateUser();
  const [params] = useSearchParams();

  if (isPending) return <Loading />;
  if (isError) return <AuthPage studentNda />;
  return <Navigate to={safeNext(params.get('next')) ?? '/student'} replace />;
}
