import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { WS_URL } from "../config";
import "./Teacher.css";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { FaCog } from "react-icons/fa";

type User = { userId: string; name: string; role: string };
type CodeUpdate = { userId: string; code: string; name: string };

export default function TeacherPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allCodes, setAllCodes] = useState<Record<string, CodeUpdate>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultCode, setDefaultCode] = useState<string>(`public class Main {
      public static void main(String[] args) {
          // Write your Java code here
      }
  }`);
  const [tmpCode, setTmpCode] = useState<string>(defaultCode);
  const ws = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const highlightCollections = useRef<
    Record<string, monaco.editor.IEditorDecorationsCollection | null>
  >({});

  useEffect(() => {
    const password = localStorage.getItem("teacherPassword");
    if (!password) {
      navigate("/teacher");
      return;
    }
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
      if (!import.meta.env.DEV) navigate("/teacher");
    };
    ws.current.onclose = (event) => {
      if (event.code !== 1000) {
        toast.error("WebSocket connection closed unexpectedly");
      }
      if (!import.meta.env.DEV) navigate("/teacher");
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "userList") {
        setUsers(data.users);
        for (const user of data.users) {
          if (user.code === undefined) continue;
          if (!allCodes[user.userId]) {
            setAllCodes((prev) => ({
              ...prev,
              [user.userId]: { userId: user.userId, code: user.code },
            }));
          }
        }
      } else if (data.type === "codeUpdate") {
        setAllCodes((prev) => ({ ...prev, [data.userId]: data }));
      } else if (data.type === "error") {
        toast.error(data.message || "Invalid password");
        localStorage.removeItem("teacherPassword");
        navigate("/teacher");
      } else if (data.type === "defaultCodeUpdated") {
        setDefaultCode(data.code);
        setTmpCode(data.code);
        if (!data.supressNotification)
          toast.success("Default code updated successfully!");
      } else if (data.type === "highlight") {
        if (highlightCollections.current[data.userId]) {
          highlightCollections.current[data.userId]!.set([
            {
              range: new monaco.Range(
                data.startLineNumber,
                data.startColumn,
                data.endLineNumber,
                data.endColumn
              ),
              options: {
                inlineClassName: "highlight",
              },
            },
          ]);
        }
      }
    };
    return () => ws.current?.close();
  }, [navigate]);

  function handleTeacherEdit(userId: string, value: string | undefined) {
    ws.current?.send(
      JSON.stringify({ type: "editForStudent", userId, code: value || "" })
    );
    setAllCodes((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], code: value || "" },
    }));
  }

  return (
    <div className="teacher-root">
      {users.filter((u) => u.role === "student").length === 0 && (
        <div className="loading">Waiting for students to join...</div>
      )}
      <div className="teacher-editors">
        {users
          .filter((u) => u.role === "student")
          .map((u) => (
            <div className="teacher-editor-card" key={u.userId}>
              <div className="teacher-editor-title">{u.name}</div>
              <div className="teacher-editor-monaco">
                <MonacoEditor
                  theme="vs-dark"
                  defaultValue={`// Please wait for your teacher to prepare your starting code...`}
                  language="java"
                  value={allCodes[u.userId]?.code || ""}
                  onChange={(v) => handleTeacherEdit(u.userId, v)}
                  options={{ fontSize: 14 }}
                  height="100%"
                  onMount={(editor) => {
                    if (!highlightCollections.current[u.userId]) {
                      highlightCollections.current[u.userId] =
                        editor.createDecorationsCollection();
                    }
                    editor.onDidChangeCursorSelection((e) => {
                      let selection = e.selection;
                      ws.current?.send(
                        JSON.stringify({
                          type: "teacherCursor",
                          userId: u.userId,
                          startLineNumber: selection.startLineNumber,
                          startColumn: selection.startColumn,
                          endLineNumber: selection.endLineNumber,
                          endColumn: selection.endColumn,
                        })
                      );
                      editor.revealRangeInCenter(selection, 0);
                    });
                  }}
                />
              </div>
            </div>
          ))}
      </div>
      <button
        className="teacher-settings-button"
        onClick={() => setSettingsOpen((old) => !old)}
      >
        <FaCog />
      </button>
      {settingsOpen && (
        <div className="teacher-settings">
          <h3>Settings</h3>
          <div className="teacher-settings-item">
            <label>Default Code:</label>
            <MonacoEditor
              theme="vs-dark"
              language="java"
              value={tmpCode}
              onChange={(v) => setTmpCode(v || "")}
              options={{ fontSize: 14 }}
              height="300px"
              width="70%"
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="teacher-settings-save"
                onClick={() => {
                  ws.current?.send(
                    JSON.stringify({
                      type: "setDefaultCode",
                      code: tmpCode,
                      forceOverwrite: false,
                    })
                  );
                }}
              >
                Save
              </button>
              <button
                className="teacher-settings-save"
                onClick={() => {
                  ws.current?.send(
                    JSON.stringify({
                      type: "setDefaultCode",
                      code: tmpCode,
                      forceOverwrite: true,
                    })
                  );
                }}
              >
                Save (Force)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
