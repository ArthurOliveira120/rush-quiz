import { createContext, useState, useEffect, type ReactNode } from "react";

import { supabase } from "../services/supabase";
import { useSession } from "../hooks/useSession";

import type { Game } from "../types/game";

type GameContextType = {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: () => void;
};

type GameProviderProps = {
  children: ReactNode;
};

export const GameContext = createContext<GameContextType>({
  games: [],
  loading: false,
  error: null,
  fetchGames: () => {}
});

export function GameProvider({ children }: GameProviderProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { session } = useSession();

  async function fetchGames() {
    if (!session) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;

      if (data) {
        setGames(data);
      }
    } catch (error: any) {
      setError(error.message ?? "Erro ao buscar jogos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, [session]);

  return (
    <GameContext.Provider value={{ games, loading, error, fetchGames }}>
      {children}
    </GameContext.Provider>
  );
}
