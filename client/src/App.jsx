
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditPicks from "./pages/EditPicks";
import Admin from "./pages/Admin";

const isAuthed = () => !!localStorage.getItem("token");

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={isAuthed() ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/edit" element={isAuthed() ? <EditPicks /> : <Navigate to="/" />} />
        <Route path="/admin" element={isAuthed() ? <Admin /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
