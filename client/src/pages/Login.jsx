
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } else {
      alert("Login failed");
    }
  };

  return (
    <div style={{background:"#111",color:"white",height:"100vh",display:"flex",justifyContent:"center",alignItems:"center"}}>
      <div style={{background:"#222",padding:20,borderRadius:10}}>
        <h2>Login</h2>
        <input placeholder="Username" onChange={e=>setUsername(e.target.value)} /><br/>
        <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} /><br/>
        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}
