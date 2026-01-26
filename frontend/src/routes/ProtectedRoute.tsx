import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "../hooks/useSession";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, sessionLoading } = useSession();

  if (sessionLoading) {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
