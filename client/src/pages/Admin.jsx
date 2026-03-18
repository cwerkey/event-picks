
import Navbar from "../components/Navbar";
import { useState } from "react";
import { apiFetch } from "../api";

export default function Admin() {
  const [json, setJson] = useState("");

  const upload = async () => {
    await apiFetch("/admin/upload-json", {
      method:"POST",
      body: json
    });
    alert("Uploaded");
  };

  const lock = async () => {
    await apiFetch("/settings", {
      method:"POST",
      body: JSON.stringify({ locked:true })
    });
    alert("Locked");
  };

  return (
    <div style={{background:"#111",color:"white",minHeight:"100vh"}}>
      <Navbar isAdmin={true} />
      <h1>Admin Panel</h1>

      <textarea
        rows={10}
        cols={50}
        onChange={e=>setJson(e.target.value)}
        placeholder="Paste JSON here"
      />

      <br/>
      <button onClick={upload}>Upload Categories</button>

      <br/><br/>
      <button onClick={lock}>Lock Event</button>
    </div>
  );
}
