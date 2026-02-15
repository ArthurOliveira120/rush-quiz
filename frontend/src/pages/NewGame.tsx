import styles from "./NewGame.module.css";

import { useState, useRef, useEffect } from "react";
import { CircularProgress } from "@mui/material";

import { Button } from "../components/Button";
import { QuestionPage } from "../components/QuestionPage";
import { supabase } from "../services/supabase";

import { useSession } from "../hooks/useSession";

import { useNavigate, useParams } from "react-router-dom";

type Option = {
  id: string;
  text: string;
  is_correct: boolean;
  order: number;
};

type Question = {
  id: string;
  text: string;
  order: number;
  options: Option[];
  persisted: boolean;
};

type NewGameProps = {
  type: "create" | "edit";
};

export function NewGame({ type }: NewGameProps) {
  const { session } = useSession();

  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const gameNameInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [loading, setLoading] = useState(type === "edit");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    if (type === "create") {
      setQuestions([
        {
          id: `temp-${crypto.randomUUID()}`,
          text: "",
          order: 1,
          options: [
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 1,
            },
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 2,
            },
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 3,
            },
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 4,
            },
          ],
          persisted: false,
        },
      ]);
    } else {
      async function fetchGame(gameId?: string) {
        if (!gameId) return;
        const { data, error } = await supabase
          .from("games")
          .select("title")
          .eq("id", gameId)
          .single();

        if (error || !data) return;

        if (gameNameInputRef.current) {
          gameNameInputRef.current.value = data.title ?? "";
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select(
            `
              id,
              text,
              order,
              options (
                id,
                text,
                is_correct,
                order
              )
            `,
          )
          .eq("game_id", gameId)
          .order("order");

        if (questionsError || !questionsData) return;

        setQuestions(
          questionsData.map((q) => ({
            ...q,
            persisted: true,
          })),
        );
        setLoading(false);
      }

      fetchGame(gameId);
    }
  }, [type, gameId]);

  async function handleSaveGame() {
    if (!session) return;

    if (!gameNameInputRef.current?.value?.trim()) {
      alert("Insira o nome do jogo");
      return;
    }

    const hasEmptyFields = questions.some((q) => {
      if (!q.text.trim()) return true;

      return q.options.some((o) => !o.text.trim());
    });

    if (hasEmptyFields) {
      alert("Preencha todas as perguntas e opções.");
      return;
    }

    const hasNotCorrectOption = questions.some(
      (q) => !q.options.some((o) => o.is_correct),
    );

    if (hasNotCorrectOption) {
      alert("Cada questão deve ter uma alternativa correta.");
      return;
    }

    try {
      if (type === "create") {
        const { data: game, error } = await supabase
          .from("games")
          .insert({
            user_id: session.user.id,
            title: gameNameInputRef.current?.value,
            is_public: true,
          })
          .select("id")
          .single();

        if (error) throw error;

        const questionsToInsert = questions.map((q, index) => ({
          game_id: game.id,
          text: q.text,
          order: index + 1,
        }));

        const { data: insertedQuestions, error: questionsError } =
          await supabase
            .from("questions")
            .insert(questionsToInsert)
            .select("id, order");

        if (questionsError) throw questionsError;

        const optionsToInsert: any = [];

        for (const dbQuestion of insertedQuestions) {
          const originalQuestion = questions.find(
            (_, index) => index + 1 === dbQuestion.order,
          );

          if (!originalQuestion) continue;
          originalQuestion.options.forEach((opt, optIndex) => {
            optionsToInsert.push({
              question_id: dbQuestion.id,
              text: opt.text,
              is_correct: opt.is_correct,
              order: optIndex + 1,
            });
          });
        }

        const { error: optionsError } = await supabase
          .from("options")
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      } else {
        const { error } = await supabase
          .from("games")
          .update({
            user_id: session.user.id,
            title: gameNameInputRef.current?.value,
            is_public: true,
          })
          .eq("id", gameId);

        if (error) throw error;

        if (deletedQuestionIds.length > 0) {
          const { error: deleteError } = await supabase
            .from("questions")
            .delete()
            .in("id", deletedQuestionIds);

          if (deleteError) throw deleteError;
        }

        const formattedQuestions = questions.map((q, index) => ({
          game_id: gameId,
          text: q.text,
          order: index + 1,
        }));

        const { data: upsertedQuestions, error: upsertError } = await supabase
          .from("questions")
          .upsert(formattedQuestions, {
            onConflict: "game_id,order",
          })
          .select("id, order");

        if (upsertError) throw upsertError;
        if (!upsertedQuestions) return;

        const questionIdMap = new Map<number, number>();

        upsertedQuestions.forEach((dbQuestion) => {
          questionIdMap.set(dbQuestion.order, dbQuestion.id);
        });

        const realQuestionIds = upsertedQuestions.map((q) => q.id);

        const { error: deleteOptionsError } = await supabase
          .from("options")
          .delete()
          .in("question_id", realQuestionIds);

        if (deleteOptionsError) throw deleteOptionsError;

        const optionsToInsert: any[] = [];

        questions.forEach((question, index) => {
          const realQuestionId = questionIdMap.get(index + 1);
          if (!realQuestionId) return;

          question.options.forEach((opt, optIndex) => {
            optionsToInsert.push({
              question_id: realQuestionId,
              text: opt.text,
              is_correct: opt.is_correct,
              order: optIndex + 1,
            });
          });
        });

        if (optionsToInsert.length > 0) {
          const { error: insertOptionsError } = await supabase
            .from("options")
            .insert(optionsToInsert);

          if (insertOptionsError) throw insertOptionsError;
        }
      }

      navigate("/");
    } catch (error: any) {
      console.error("Error: ", error.message);
    }
  }

  function handleNextPage() {
    if (currentQuestion === questions.length) {
      setQuestions((prev) => [
        ...prev,
        {
          id: `temp-${crypto.randomUUID()}`,
          text: "",
          order: questions.length + 1,
          options: [
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 1,
            },
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 2,
            },
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 3,
            },
            {
              id: `temp-${crypto.randomUUID()}`,
              text: "",
              is_correct: false,
              order: 4,
            },
          ],
          persisted: false,
        },
      ]);
    }

    setCurrentQuestion((prev) => prev + 1);
  }

  function handlePrevPage() {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  function handleEditQuestion(updatedQuestion: Question) {
    setQuestions((prev) =>
      prev.map((o) =>
        o.id === updatedQuestion.id ? { ...updatedQuestion } : o,
      ),
    );
  }

  function handleDeleteQuestion(questionId: string) {
    if (questions.length === 1) return;

    const questionToDelete = questions.find((q) => q.id === questionId);

    if (!questionToDelete) return;

    if (type === "edit" && !questionToDelete.id.startsWith("temp-")) {
      setDeletedQuestionIds((prev) => [...prev, questionId]);
    }

    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setCurrentQuestion((prev) => prev - 1);
  }

  return (
    <>
      <div className={styles.mainContainer}>
        <Button
          variant="secondary"
          className={styles.pageButton}
          disabled={currentQuestion === 1}
          onClick={handlePrevPage}
        >
          Ant.
        </Button>
        <div className={styles.main}>
          <input
            type="text"
            className={styles.title}
            placeholder="Meu Jogo"
            ref={gameNameInputRef}
          ></input>
          <h5 className={styles.pageMarker}>
            Questão {currentQuestion}/{questions.length}
          </h5>
          <div className={styles.questionContainer}>
            {loading ? (
              <>
                <CircularProgress
                  thickness={5}
                  sx={{ color: "blue" }}
                  style={{ margin: "2rem auto", display: "block" }}
                />
                <p>Loading game...</p>
              </>
            ) : (
              <QuestionPage
                question={questions[currentQuestion - 1]}
                onChangeQuestion={handleEditQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
              />
            )}
          </div>
          <br></br>
          <Button onClick={handleSaveGame}>Salvar</Button>
        </div>
        <Button
          variant="secondary"
          className={styles.pageButton}
          onClick={handleNextPage}
        >
          Próx.
        </Button>
      </div>
    </>
  );
}
