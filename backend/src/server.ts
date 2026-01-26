import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { createServer } from "http";
import { Server } from "socket.io";

import sessionsRoutes from "./routes/sessions";

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

import { supabase } from "./supabase";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/sessions", sessionsRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 Backend do Master Quiz rodando!",
  });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const playersByPin: Record<string, string[]> = {};

type GameState = {
  currentQuestion: number;
  started: boolean;
};

const gameStateByPin: Record<string, GameState> = {};

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("join_game", async ({ pin, name }) => {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("id, status")
      .eq("pin", pin)
      .single();

    if (error || !data) {
      socket.emit("join_error", {
        message: "PIN inválido ou sessão não existe",
      });
      return;
    }

    socket.join(pin);
    console.log(`👤 ${name} entrou na sala ${pin}`);

    if (!playersByPin[pin]) {
      playersByPin[pin] = [];
    }

    playersByPin[pin].push(name);

    io.to(pin).emit("players_update", playersByPin[pin]);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });

  socket.on("start_game", async ({ pin }) => {
    console.log(`▶️ Tentando iniciar jogo ${pin}`);

    const { data, error } = await supabase
      .from("game_sessions")
      .select("id, status")
      .eq("pin", pin)
      .single();

    if (error || !data) {
      socket.emit("start_error", {
        message: "Sessão não encontrada",
      });
      return;
    }

    if (data.status !== "waiting") {
      socket.emit("start_error", {
        message: "O jogo já foi iniciado",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({ status: "started" })
      .eq("pin", pin);

    if (updateError) {
      socket.emit("start_error", {
        message: "Erro ao iniciar o jogo",
      });
      return;
    }

    gameStateByPin[pin] = {
      currentQuestion: 0,
      started: true,
    };

    console.log(`🔥 Jogo ${pin} iniciado`);

    io.to(pin).emit("game_started", {
      currentQuestion: 0,
      players: playersByPin[pin] || [],
    });
  });

  socket.on("next_question", async ({ pin }) => {
    console.log(`➡️ Próxima pergunta do jogo ${pin}`);

    const gameState = gameStateByPin[pin];

    if (!gameState || !gameState.started) {
      socket.emit("next_question_error", {
        message: "Jogo não iniciado",
      });
      return;
    }

    const { data: session } = await supabase
      .from("game_sessions")
      .select("game_id")
      .eq("pin", pin)
      .single();

    if (!session) {
      socket.emit("next_question_error", {
        message: "Sessão inválida",
      });
      return;
    }

    const { data: question } = await supabase
      .from("questions")
      .select("*")
      .eq("game_id", session.game_id)
      .order("order", { ascending: true })
      .range(gameState.currentQuestion, gameState.currentQuestion)
      .single();

    if (!question) {
      io.to(pin).emit("game_finished");
      return;
    }

    const { data: options } = await supabase
      .from("options")
      .select("id, text, order")
      .eq("question_id", question.id)
      .order("order", { ascending: true });

    gameState.currentQuestion += 1;

    io.to(pin).emit("question", {
      id: question.id,
      text: question.text,
      options,
    });

    console.log(`📨 Pergunta enviada: ${question.text}`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
