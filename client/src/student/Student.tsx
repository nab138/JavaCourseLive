import MonacoEditor from "@monaco-editor/react";
import { WS_URL } from "../config";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import "./Student.css";
import { useNavigate } from "react-router-dom";
import runJava from "./piston";
import { FaPlay } from "react-icons/fa";

export default function StudentPage() {
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => {
      const name = localStorage.getItem("studentName") || "Student";
      ws.current?.send(JSON.stringify({ type: "join", name, role: "student" }));
      setLoading(false);
      toast.success("Connected successfully!");
    };
    ws.current.onerror = (event) => {
      toast.error(
        `WebSocket error: ${
          event instanceof Error ? event.message : "Unknown error"
        }`
      );
      navigate("/");
    };
    ws.current.onclose = (event) => {
      setLoading(false);
      if (event.code !== 1000) {
        toast.error("WebSocket connection closed unexpectedly");
      }
      navigate("/");
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "code") {
        setStudentCode(data.code);
      }
    };
    return () => ws.current?.close();
  }, []);

  function handleStudentChange(value: string | undefined) {
    setStudentCode(value || "");
    ws.current?.send(JSON.stringify({ type: "code", code: value || "" }));
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MonacoEditor
        height="100vh"
        theme="vs-dark"
        language="java"
        value={studentCode}
        onChange={handleStudentChange}
        options={{ fontSize: 16 }}
        defaultValue={`// Please wait for your teacher to prepare your starting code...`}
      />
      {
        <div className="output-container">
          <div className="output-header">
            <h3>Program Output</h3>
            <button
              className="run-button"
              onClick={() => {
                toast.promise(runJava(studentCode, setResult), {
                  loading: "Running your code...",
                  success: "Code executed successfully!",
                  error: (error) => {
                    return {
                      type:
                        error === "No output generated." ? "warning" : "error",
                      message: error instanceof Error ? error.message : error,
                    };
                  },
                });
              }}
            >
              <FaPlay />
              Run
            </button>
          </div>
          {result && <pre className="output">{result}</pre>}
        </div>
      }
    </div>
  );
}
