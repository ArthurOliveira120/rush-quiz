import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import { Index } from "../pages/Index";
import { GamesList } from "../pages/GamesList";
import { NewGame } from "../pages/NewGame";
import { Host } from "../pages/Host";
import { Play } from "../pages/Play";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route
        path="/play/:pin"
        element={
            <Play />
        }
      />
      <Route
        path="/host/:pin"
        element={
          <ProtectedRoute>
            <Host />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <GamesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/new"
        element={
          <ProtectedRoute>
            <NewGame type="create"/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/:gameId/edit"
        element={
          <ProtectedRoute>
            <NewGame type="edit" />
          </ProtectedRoute>
        }
      />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
