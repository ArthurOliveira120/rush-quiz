import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/", async (req, res) => {
  const { gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: "gameId é obrigatório" });
  }

  const pin = generatePin();

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      game_id: gameId,
      pin,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ pin, sessionId: data.id });
});

export default router;
