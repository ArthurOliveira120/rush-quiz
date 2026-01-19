import "./styles/global.css";
import "./styles/theme.css";

import { Routes, Route } from "react-router-dom";

import { Index } from "./pages/Index";
import { Login } from "./pages/Login";
import { Games } from "./pages/Games";
import { Host } from "./pages/Host";
import { Play } from "./pages/Play";
import { NewGame } from "./pages/NewGame";
import { EditGame } from "./pages/EditGame";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />}></Route>
        <Route path="/login" element={<Login />} />

        <Route path="/games" element={<Games />} />
        <Route path="/games/new" element={<NewGame />} />
        <Route path="/games/:id/edit" element={<EditGame />} />

        <Route path="/host/:pin" element={<Host />} />
        <Route path="/play/:pin" element={<Play />} />
      </Routes>
    </>
  )
}

export default App
