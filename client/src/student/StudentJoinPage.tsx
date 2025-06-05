import { useState } from "react";
import { useNavigate } from "react-router";

export default function StudentJoinPage({
  onConnect,
}: {
  onConnect: (name: string, onError: () => void) => void;
}) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function handleConnect() {
    onConnect(name, () => {
      navigate("/");
    });
    navigate("/student");
  }

  return (
    <div className="join">
      <div className="join-header">
        <h2>Welcome to 3044 Java Course Live Coding!</h2>
        <img
          src="./ox.webp"
          alt="3044 Logo"
          style={{ width: 60, height: 60 }}
        />
      </div>
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
