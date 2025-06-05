import MonacoEditor from "@monaco-editor/react";
import { defaultCode } from "../config";
import "./Teacher.css";

type User = { userId: string; name: string; role: string };
type CodeUpdate = { userId: string; code: string; name: string };

export default function TeacherPage({
  users,
  allCodes,
  handleTeacherEdit,
}: {
  users: User[];
  allCodes: Record<string, CodeUpdate>;
  handleTeacherEdit: (userId: string, v: string | undefined) => void;
}) {
  return (
    <div className="teacher-root">
      <div className="teacher-editors">
        {users
          .filter((u) => u.role === "student")
          .map((u) => (
            <div className="teacher-editor-card" key={u.userId}>
              <div className="teacher-editor-title">{u.name}</div>
              <div className="teacher-editor-monaco">
                <MonacoEditor
                  theme="vs-dark"
                  defaultValue={defaultCode}
                  language="java"
                  value={allCodes[u.userId]?.code || ""}
                  onChange={(v) => handleTeacherEdit(u.userId, v)}
                  options={{ fontSize: 14 }}
                  height="100%"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
