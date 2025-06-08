import { useState } from "react";
import { useNavigate } from "react-router";

export default function TeacherJoinPage() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleConnect() {
    localStorage.setItem("teacherPassword", password);
    navigate("/teacher/dashboard");
  }

  return (
    <div className="join">
      <h2>Teacher Login</h2>
      <input
        placeholder="Enter teacher password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "80%", marginBottom: 8 }}
      />
      <button disabled={!password} onClick={handleConnect}>
        Enter
      </button>
    </div>
  );
}
