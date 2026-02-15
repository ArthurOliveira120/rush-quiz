import styles from "./Play.module.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useSocket } from "../hooks/useSocket";
import { useSession } from "../hooks/useSession";

type Option = {
  id: number;
  text: string;
  is_correct: boolean;
};

type Question = {
  id: number;
  text: string;
  options: Option[];
};

type QuestionResult = {
  correctOptionId: number;
};

type Ranking = {
  name: string;
  score: number;
}[];

export function Play() {
  const { pin } = useParams<{ pin: string }>();
  const { session } = useSession();
  const socket = useSocket();

  const joinedRef = useRef(false);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [ranking, setRanking] = useState<{ name: string; score: number }[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const playerName = session
    ? session.user.user_metadata.username
    : localStorage.getItem("player_name") || `Jogador ${socket.id}`;

  useEffect(() => {
    if (session) {
      setPlayerId(session.user.id);
    } else {
      setPlayerId(null);
    }
  }, [session]);

  useEffect(() => {
    if (!pin || !socket.connected || joinedRef.current) return;

    socket.emit("player_join", {
      pin,
      name: playerName,
    });

    joinedRef.current = true;
  }, [pin, socket.connected]);

  useEffect(() => {
    function onQuestion(data: Question) {
      setQuestion(data);
      setSelectedOption(null);
      setResult(null);
    }

    function onQuestionResult({ correctOptionId }: QuestionResult) {
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              options: prev.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === correctOptionId,
              })),
            }
          : prev,
      );
      setResult({ correctOptionId: correctOptionId })
    }

    function onRanking(ranking: Ranking) {
      setRanking(ranking);
    }

    socket.on("question", onQuestion);
    socket.on("question_result", onQuestionResult);
    socket.on("ranking", onRanking);

    return () => {
      socket.off("question");
      socket.off("question_result");
      socket.off("ranking");
    };
  }, [socket]);

  function handleAnswer(optionId: number) {
    if (!question || !pin || selectedOption) return;

    setSelectedOption(optionId);

    socket.emit("submit_answer", {
      pin,
      playerId: playerId,
      playerName,
      questionId: question.id,
      optionId,
    });
  }

  return (
    <div className={styles.container}>
      {ranking.length > 0 ? (
        <div className={styles.container}>
          <h1 className={styles.rankingTitle}>🏆 Ranking Final</h1>

          <ul className={styles.ranking}>
            {ranking.map((p, i) => (
              <li
                key={i}
                className={`${styles.rankingItem} ${
                  i === 0
                    ? styles.first
                    : i === 1
                      ? styles.second
                      : i === 2
                        ? styles.third
                        : ""
                }`}
              >
                <span className={styles.position}>{i + 1}º</span>
                <span className={styles.playerName}>{p.name}</span>
                <span className={styles.score}>{p.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!question ? (
        <div className={styles.waiting}>
          <h1>Sala {pin}</h1>
          <p>Aguardando o host iniciar o jogo…</p>
        </div>
      ) : (
        <>
          <div className={styles.question}>
            <h1>{question.text}</h1>
          </div>

          {result ? (
            <div className={styles.result}>
              {result.correctOptionId === selectedOption ? (
                <p className={styles.correct}>✅ Você acertou!</p>
              ) : (
                <p className={styles.wrong}>❌ Você errou</p>
              )}
            </div>
          ) : (
            <div className={styles.options}>
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;

                return (
                  <button
                    key={opt.id}
                    className={`${styles.opt} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => handleAnswer(opt.id)}
                    disabled={!!selectedOption}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
