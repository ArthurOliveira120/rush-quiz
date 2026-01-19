import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* =====================
   Tipos
===================== */
type Session = {
  id: string;
  role: "guest" | "user";
};

type SessionContextType = {
  session: Session;
  login: (id: string) => void;
};

/* =====================
   Utils
===================== */
function generateGuestSession(): Session {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role: "guest",
  };
}

function loadSession(): Session {
  try {
    const stored = localStorage.getItem("session");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed?.id === "string" &&
        (parsed.role === "guest" || parsed.role === "user")
      ) {
        return parsed as Session;
      }
    }
  } catch {
    // ignora erro e recria
  }
  return generateGuestSession();
}

/* =====================
   Context (NUNCA null)
===================== */
const SessionContext = createContext<SessionContextType>({
  session: {
    id: "boot",
    role: "guest",
  },
  login: () => {},
});

/* =====================
   Provider
===================== */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => loadSession());

  useEffect(() => {
    localStorage.setItem("session", JSON.stringify(session));
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

/* =====================
   Hook
===================== */
export function useSession() {
  return useContext(SessionContext);
}
