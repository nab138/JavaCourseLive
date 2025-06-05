import { useState, useRef, useEffect } from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import StudentPage from "./student/Student";
import TeacherPage from "./teacher/Teacher";
import TeacherJoinPage from "./teacher/TeacherJoinPage";
import { toast } from "sonner";
import StudentJoinPage from "./student/StudentJoinPage";
import Redirect from "./Redirect";

const PROD_WS_URL = "wss://javacourselive.onrender.com/";
const DEV_WS_URL = "ws://localhost:3001/";
const WS_URL = import.meta.env.DEV ? DEV_WS_URL : PROD_WS_URL;

type Role = "student" | "teacher";

type User = { userId: string; name: string; role: Role };

type CodeUpdate = { userId: string; code: string; name: string };

export default function App() {
  const [connected, setConnected] = useState(false);
  const [teacherConnected, setTeacherConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [studentCode, setStudentCode] = useState("");
  const [allCodes, setAllCodes] = useState<Record<string, CodeUpdate>>({});

  const ws = useRef<WebSocket | null>(null);
  const onErrorRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!connected || teacherConnected) return;
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "join", name, role: "student" }));
      setLoading(false);
    };
    ws.current.onerror = (error) => {
      toast.error(
        `WebSocket error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setConnected(false);
      setLoading(false);
      if (onErrorRef.current) {
        onErrorRef.current();
      }
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
  }, [connected, name, teacherConnected]);

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
      setTeacherConnected(false);
      setConnected(false);
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

  function handleConnect(name: string, onError: () => void) {
    setName(name);
    setConnected(true);
    setLoading(true);
    onErrorRef.current = onError;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<StudentJoinPage onConnect={handleConnect} />}
        />
        <Route
          path="/student"
          element={
            connected && !teacherConnected ? (
              <StudentPage
                loading={loading}
                studentCode={studentCode}
                handleStudentChange={handleStudentChange}
              />
            ) : (
              <Redirect to="/" />
            )
          }
        />
        <Route
          path="/teacher"
          element={
            !teacherConnected ? (
              <TeacherJoinPage onConnect={handleTeacherConnect} />
            ) : (
              <Redirect to="/teacher/dashboard" />
            )
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
            ) : (
              <Redirect to="/teacher" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
