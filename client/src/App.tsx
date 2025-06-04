import { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import StudentPage from "./Student";
import TeacherPage from "./Teacher";
import TeacherJoinPage from "./TeacherJoinPage";
import { toast } from "sonner";

const WS_URL = "wss://javacourselive.onrender.com/";

type Role = "student" | "teacher";

type User = { userId: string; name: string; role: Role };

type CodeUpdate = { userId: string; code: string; name: string };

function JoinPage({ onConnect }: { onConnect: (name: string) => void }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function handleConnect() {
    onConnect(name);
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

export default function App() {
  const [connected, setConnected] = useState(false);
  const [teacherConnected, setTeacherConnected] = useState(false);
  const [name, setName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [studentCode, setStudentCode] = useState("");
  const [allCodes, setAllCodes] = useState<Record<string, CodeUpdate>>({});
  const ws = useRef<WebSocket | null>(null);

  // Student connection logic
  useEffect(() => {
    if (!connected || teacherConnected) return;
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "join", name, role: "student" }));
    };
    ws.current.onerror = (error) => {
      toast.error(
        `WebSocket error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "userList") {
        setUsers(data.users);
      } else if (data.type === "codeUpdate") {
        setAllCodes((prev) => ({ ...prev, [data.userId]: data }));
      } else if (data.type === "code") {
        setStudentCode(data.code);
      }
    };
    return () => ws.current?.close();
    // eslint-disable-next-line
  }, [connected, name, teacherConnected]);

  // Teacher connection logic
  function handleTeacherConnect(password: string, cb?: (err?: string) => void) {
    setTeacherConnected(true);
    setConnected(true);
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => {
      ws.current?.send(
        JSON.stringify({
          type: "join",
          name: "Teacher",
          role: "teacher",
          password,
        })
      );
    };
    ws.current.onerror = (error) => {
      toast.error(
        `WebSocket error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "joined") {
        if (cb) cb();
      } else if (data.type === "userList") {
        setUsers(data.users);
      } else if (data.type === "codeUpdate") {
        setAllCodes((prev) => ({ ...prev, [data.userId]: data }));
      } else if (data.type === "error") {
        setTeacherConnected(false);
        setConnected(false);
        if (cb) cb(data.message || "Invalid password");
      }
    };
  }

  function handleStudentChange(value: string | undefined) {
    setStudentCode(value || "");
    ws.current?.send(JSON.stringify({ type: "code", code: value || "" }));
  }

  function handleTeacherEdit(userId: string, value: string | undefined) {
    ws.current?.send(
      JSON.stringify({ type: "editForStudent", userId, code: value || "" })
    );
    setAllCodes((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], code: value || "" },
    }));
  }

  function handleConnect(name: string) {
    setName(name);
    setConnected(true);
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinPage onConnect={handleConnect} />} />
        <Route
          path="/student"
          element={
            connected && !teacherConnected ? (
              <StudentPage
                name={name}
                studentCode={studentCode}
                handleStudentChange={handleStudentChange}
              />
            ) : null
          }
        />
        <Route
          path="/teacher"
          element={
            !teacherConnected ? (
              <TeacherJoinPage onConnect={handleTeacherConnect} />
            ) : null
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            teacherConnected ? (
              <TeacherPage
                users={users}
                allCodes={allCodes}
                handleTeacherEdit={handleTeacherEdit}
              />
            ) : null
          }
        />
      </Routes>
    </Router>
  );
}
