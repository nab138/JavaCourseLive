import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function TeacherJoinPage({
  onConnect,
}: {
  onConnect: (password: string, cb?: (err?: string) => void) => void;
}) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleConnect() {
    onConnect(password, (err?: string) => {
      if (err) {
        toast.error(err);
      } else {
        navigate("/teacher/dashboard");
      }
    });
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
