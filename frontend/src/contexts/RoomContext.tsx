import { createContext, useEffect, useState, type ReactNode } from "react";

import type { Question, QuestionResult, Ranking } from "../types/game";
import { useSocket } from "../hooks/useSocket";
import { useParams } from "react-router-dom";

type RoomContextType = {
  pin: string | undefined;
  question: Question | null;
  result: QuestionResult | null;
  ranking: Ranking;
  role: "player" | "host" | null;
  roomState: "lobby" | "question" | "results" | "ranking" | "finished";
  players: string[];
  emitHostJoin: () => void;
  emitPlayerJoin: (name: string) => void;
  emitStartGame: () => void;
  emitNextQuestion: () => void;
  emitFinishQuestion: () => void;
  emitSubmitAnswer: (props: AnswerProps) => void;
};

type RoomProviderProps = {
  children: ReactNode;
};

type AnswerProps = {
  playerId: string | null;
  playerName: string;
  optionId: string;
};

export const RoomContext = createContext<RoomContextType>({
  pin: undefined,
  question: null,
  result: null,
  ranking: [],
  role: null,
  roomState: "lobby",
  players: [],
  emitHostJoin: () => {},
  emitPlayerJoin: () => {},
  emitStartGame: () => {},
  emitNextQuestion: () => {},
  emitFinishQuestion: () => {},
  emitSubmitAnswer: () => {},
});

export function RoomProvider({ children }: RoomProviderProps) {
  const socket = useSocket();
  const { pin } = useParams<{ pin: string }>();

  const [question, setQuestion] = useState<Question | null>(null);
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [ranking, setRanking] = useState<Ranking>([]);
  const [role, setRole] = useState<"player" | "host" | null>(null);
  const [roomState, setRoomState] = useState<
    "lobby" | "question" | "results" | "ranking" | "finished"
  >("lobby");

  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket.connected) {
      alert("Socket não conectado");
      return;
    }

    function onQuestion(question: Question) {
      setQuestion(question);
      setResult(null);
      setRoomState("question");
    }

    function onQuestionResult({
      correctOptionId,
      resultsEndTime,
    }: QuestionResult) {
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              options: prev.options.map((opt) => ({
                ...opt,
                is_correct: opt.id === correctOptionId,
              })),
            }
          : prev,
      );
      setResult({ correctOptionId, resultsEndTime });
      setRoomState("results");
    }

    function onRanking(ranking: Ranking) {
      setRanking(ranking);
      setRoomState("ranking");
    }

    socket.on("room_joined", ({ role }) => setRole(role));
    socket.on("players_update", setPlayers);
    socket.on("question", onQuestion);
    socket.on("question_result", onQuestionResult);
    socket.on("game_finished", onRanking);

    return () => {
      socket.off("room_joined");
      socket.off("players_update");
      socket.off("question");
      socket.off("question_result");
      socket.off("game_finished");
    };
  }, [socket, pin, role]);

  function emitHostJoin() {
    if (!pin) return;

    socket.emit("host_join", { pin });
  }

  function emitPlayerJoin(name: string) {
    if (!pin) return;

    socket.emit("player_join", { pin, name });
  }

  function emitStartGame() {
    if (!pin || role !== "host") return;

    socket.emit("start_game", { pin });
  }

  function emitNextQuestion() {
    if (role !== "host") return;

    socket.emit("next_question", { pin });
  }

  function emitFinishQuestion() {
    if (role !== "host") return;

    socket.emit("finish_question", { pin });
  }

  function emitSubmitAnswer({ playerId, playerName, optionId }: AnswerProps) {
    if (!question || !pin || roomState !== "question" || role !== "player")
      return;

    socket.emit("submit_answer", {
      pin,
      playerId,
      playerName,
      questionId: question.id,
      optionId,
    });
  }

  return (
    <RoomContext.Provider
      value={{
        pin,
        question,
        result,
        ranking,
        role,
        roomState,
        players,
        emitHostJoin,
        emitPlayerJoin,
        emitStartGame,
        emitNextQuestion,
        emitFinishQuestion,
        emitSubmitAnswer,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}
