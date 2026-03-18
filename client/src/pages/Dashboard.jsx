
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [settings, setSettings] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const s = await apiFetch("/settings");
    setSettings(s);

    const lb = await apiFetch("/picks/leaderboard");
    setLeaderboard(lb);

    const my = await apiFetch("/picks/mine");
    setPicks(my);
  };

  const statusColor = (p) => {
    if (!p.correct_option_id) return "gray";
    if (p.option_id === p.correct_option_id) return "green";
    return "red";
  };

  return (
    <div style={{background:"#111",color:"white",minHeight:"100vh"}}>
      <Navbar isAdmin={true} />

      <h1>Dashboard</h1>

      {!settings.locked && (
        <h2>Event Countdown Active</h2>
      )}

      {settings.locked && (
        <div>
          <h2>Leaderboard</h2>
          {leaderboard.slice(0,3).map((u,i)=>(
            <div key={i}>{u.username} - {u.score}</div>
          ))}
        </div>
      )}

      <h2>My Picks</h2>
      {picks.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:10}}>
          <span>Category {p.category_id}</span>
          <span style={{
            background: statusColor(p),
            padding:"5px 10px"
          }}>
            {p.option_id}
          </span>
        </div>
      ))}
    </div>
  );
}
