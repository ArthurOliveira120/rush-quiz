import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

type SessionContextType = {
  session: Session | null;
  sessionLoading: boolean;
  sessionMessage: string | null;
  sessionError: string | null;
  handleSignUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
};

type SessionProviderProps = {
  children: ReactNode;
};

export const SessionContext = createContext<SessionContextType>({
  session: null,
  sessionLoading: false,
  sessionMessage: null,
  sessionError: null,
  handleSignUp: async () => {},
  handleSignIn: async () => {},
  handleSignOut: async () => {},
});

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setSessionLoading(false);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignUp(
    email: string,
    password: string,
    username: string,
  ): Promise<void> {
    setSessionLoading(true);
    setSessionMessage(null);
    setSessionError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/signin`,
          data: {
            username,
            admin: false,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setSessionMessage("Cadastro realizado! Verifique seu email.");
        window.location.href = "/signin";
      }
    } catch (error: any) {
      setSessionError(error.message ?? "Erro ao cadastrar.");
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSignIn(email: string, password: string): Promise<void> {
    setSessionLoading(true);
    setSessionMessage(null);
    setSessionError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setSessionMessage("Login realizado com sucesso.");
      }
    } catch (error: any) {
      setSessionError(error.message ?? "Erro ao fazer login.");
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    setSessionLoading(true);
    setSessionMessage(null);
    setSessionError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      window.location.href = "/";
    } catch (error: any) {
      setSessionError(error.message ?? "Erro ao sair.");
    } finally {
      setSessionLoading(false);
    }
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionLoading,
        sessionMessage,
        sessionError,
        handleSignUp,
        handleSignIn,
        handleSignOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
