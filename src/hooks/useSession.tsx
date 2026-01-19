import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Session = {
  id: string;
  role: "guest" | "user";
};

type SessionContextType = {
  session: Session;
  login: (id: string) => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

function generateGuestSession(): Session {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role: "guest",
  };
}

function getStoredSession(): Session | null {
  try {
    const stored = localStorage.getItem("session");
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    // Validar se tem os campos obrigatórios
    if (parsed?.id && parsed?.role) {
      return parsed as Session;
    }
  } catch (error) {
    console.error("Erro ao recuperar sessão:", error);
  }
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => {
    const stored = getStoredSession();
    return stored || generateGuestSession();
  });

  useEffect(() => {
    try {
      localStorage.setItem("session", JSON.stringify(session));
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  }, [session]);

  function login(id: string) {
    setSession({ id, role: "user" });
  }

  return (
    <SessionContext.Provider value={{ session, login }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return ctx;
}
