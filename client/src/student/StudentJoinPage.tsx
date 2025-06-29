import { useState } from "react";
import { useNavigate } from "react-router";

export default function StudentJoinPage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function handleConnect() {
    localStorage.setItem("studentName", name);
    navigate("/student");
  }

  return (
    <div className="join">
      <div className="join-header">
        <h2 style={{ marginBottom: 0 }}>
          Welcome to 3044 Java Course Live Coding!
        </h2>
        <img
          src="./ox.webp"
          alt="3044 Logo"
          style={{ width: 60, height: 60 }}
        />
      </div>

      <p style={{ marginTop: 0 }}>
        Please note this software is in beta. If you see any issues, let the
        teacher know!
      </p>
      <input
        placeholder="Enter your name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "80%", marginBottom: 8 }}
      />
      <button disabled={!name} onClick={handleConnect}>
        Connect
      </button>
    </div>
  );
}
