
export default function Navbar({ isAdmin }) {
  return (
    <div style={{display:"flex",gap:10,background:"#222",padding:10}}>
      <button onClick={()=>window.location.href="/dashboard"}>Dashboard</button>
      <button onClick={()=>window.location.href="/edit"}>Edit Picks</button>

      {isAdmin && (
        <button onClick={()=>window.location.href="/admin"}>Admin</button>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}
