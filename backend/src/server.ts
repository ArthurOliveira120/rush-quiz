import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { supabase } from "./supabase";
import sessionsRoutes from "./routes/sessions";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/sessions", sessionsRoutes);

app.get("/", (_, res) => res.json({ status: "ok" }));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

type Player = { name: string; socketId: string };
type GameState = { started: boolean; currentQuestion: number };
type Answer = { playerName: string; optionId: number };
type QuestionState = {
  questionId: number;
  answers: Answer[];
  endTime: number;
  finished: boolean;
};

const playersByPin: Record<string, Player[]> = {};
const gameStateByPin: Record<string, GameState> = {};
const hostByPin: Record<string, string> = {};
const socketToPlayer: Record<string, { pin: string; name: string }> = {};
const answersByPin: Record<string, QuestionState | null> = {};
const scoreByPin: Record<string, Record<string, number>> = {};

async function finishQuestion(pin: string) {
  const state = answersByPin[pin];
  if (!state || state.finished) return;

  state.finished = true;

  const { data: correct } = await supabase
    .from("options")
    .select("id")
    .eq("question_id", state.questionId)
    .eq("is_correct", true)
    .single();

  if (!correct) return;

  scoreByPin[pin] ??= {};

  for (const answer of state.answers) {
    scoreByPin[pin][answer.playerName] ??= 0;

    if (answer.optionId === correct.id) {
      scoreByPin[pin][answer.playerName] += 1;
    }
  }

  const resultsEndTime = Date.now() + 10000;

  io.to(pin).emit("question_result", {
    correctOptionId: correct.id,
    resultsEndTime,
  });

  answersByPin[pin] = null;
}

io.on("connection", (socket) => {
  console.log("🟢 Conectado:", socket.id);

  socket.on("host_join", ({ pin }) => {
    if (!pin) return;

    socket.join(pin);
    hostByPin[pin] = socket.id;
  });

  socket.on("player_join", ({ pin, name }) => {
    if (!pin || !name) return;

    socket.join(pin);

    playersByPin[pin] ??= [];

    const exists = playersByPin[pin].find((p) => p.name === name);
    if (exists) exists.socketId = socket.id;
    else playersByPin[pin].push({ name, socketId: socket.id });

    socketToPlayer[socket.id] = { pin, name };

    io.to(pin).emit(
      "players_update",
      playersByPin[pin].map((p) => p.name),
    );
  });

  socket.on("start_game", ({ pin }) => {
    if (hostByPin[pin] !== socket.id) return;

    gameStateByPin[pin] = { started: true, currentQuestion: 0 };
    scoreByPin[pin] = {};

    io.to(pin).emit("game_started");
  });

  socket.on("next_question", async ({ pin }) => {
    if (hostByPin[pin] !== socket.id) return;

    const game = gameStateByPin[pin];
    if (!game?.started) return;

    const { data: session } = await supabase
      .from("game_sessions")
      .select("game_id")
      .eq("pin", pin)
      .single();

    if (!session) return;

    const { data: question } = await supabase
      .from("questions")
      .select("*")
      .eq("game_id", session.game_id)
      .order("order")
      .range(game.currentQuestion, game.currentQuestion)
      .single();

    if (!question) {
      io.to(pin).emit("game_finished");
      return;
    }

    const { data: options } = await supabase
      .from("options")
      .select("id, text, order")
      .eq("question_id", question.id)
      .order("order");

    const duration = 15000;
    const endTime = Date.now() + duration;

    answersByPin[pin] = {
      questionId: question.id,
      answers: [],
      endTime,
      finished: false,
    };

    game.currentQuestion++;

    io.to(pin).emit("question", {
      id: question.id,
      text: question.text,
      options,
      endTime,
    });

    setTimeout(() => {
      finishQuestion(pin);
    }, duration);
  });

  socket.on(
    "submit_answer",
    async ({ pin, playerId, playerName, questionId, optionId }) => {
      const state = answersByPin[pin];
      if (!state) return;

      if (state.finished) return;
      if (Date.now() > state.endTime) return;
      if (state.questionId !== questionId) return;
      if (state.answers.some((a) => a.playerName === playerName)) return;

      state.answers.push({ playerName, optionId });

      await supabase.from("answers").insert({
        pin,
        player_id: playerId,
        player_name: playerName,
        question_id: questionId,
        option_id: optionId,
      });
    },
  );

  socket.on("finish_question", ({ pin }) => {
    if (hostByPin[pin] !== socket.id) return;
    finishQuestion(pin);
  });

  socket.on("show_ranking", ({ pin }) => {
    if (hostByPin[pin] !== socket.id) return;

    const scores = scoreByPin[pin] || {};

    const ranking = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    io.to(pin).emit("ranking", ranking);
  });

  socket.on("disconnect", () => {
    const player = socketToPlayer[socket.id];
    if (!player) return;

    playersByPin[player.pin] = playersByPin[player.pin]?.filter(
      (p) => p.socketId !== socket.id,
    );

    io.to(player.pin).emit(
      "players_update",
      playersByPin[player.pin]?.map((p) => p.name) ?? [],
    );

    delete socketToPlayer[socket.id];
  });
});

httpServer.listen(3001, () =>
  console.log("🚀 Backend rodando na porta 3001"),
);
