
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Navbar from "../components/Navbar";

export default function EditPicks() {
  const [categories, setCategories] = useState([]);
  const [choices, setChoices] = useState({});

  useEffect(()=>{
    load();
  },[]);

  const load = async () => {
    const cats = await apiFetch("/admin/categories"); // you'll add later
    setCategories(cats);
  };

  const submit = async () => {
    const picks = Object.entries(choices).map(([cat, opt]) => ({
      category_id: cat,
      option_id: opt
    }));

    await apiFetch("/picks/submit", {
      method:"POST",
      body: JSON.stringify({ picks })
    });

    alert("Saved");
  };

  return (
    <div style={{background:"#111",color:"white",minHeight:"100vh"}}>
      <Navbar isAdmin={true} />
      <h1>Edit Picks</h1>

      {categories.map(c=>(
        <div key={c.id}>
          <h3>{c.name}</h3>

          <select
            onChange={e=>setChoices({...choices,[c.id]:e.target.value})}
          >
            <option value="">Choose One</option>
            {c.options.map(o=>(
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={submit}>Submit Picks</button>
    </div>
  );
}
