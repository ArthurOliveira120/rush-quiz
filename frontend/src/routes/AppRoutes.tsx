import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import { Index } from "../pages/Index";
import { Games } from "../pages/Games";
import { NewGame } from "../pages/NewGame";
import { EditGame } from "../pages/EditGame";
import { Host } from "../pages/Host";
import { Play } from "../pages/Play";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/play/:pin" element={<Play />} />
      <Route path="/host/:pin" element={<Host />} />

      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <Games />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/new"
        element={
          <ProtectedRoute>
            <NewGame />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/:id/edit"
        element={
          <ProtectedRoute>
            <EditGame />
          </ProtectedRoute>
        }
      />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
