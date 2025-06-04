import MonacoEditor from "@monaco-editor/react";
import { defaultCode } from "./config";
import { useState } from "react";
import { toast } from "sonner";
import "./Student.css";

export default function StudentPage({
  studentCode,
  handleStudentChange,
}: {
  name: string;
  studentCode: string;
  handleStudentChange: (v: string | undefined) => void;
}) {
  const [result, setResult] = useState<string | null>(null);
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MonacoEditor
        height="100vh"
        theme="vs-dark"
        language="java"
        value={studentCode}
        onChange={handleStudentChange}
        options={{ fontSize: 16 }}
        defaultValue={defaultCode}
      />
      {result && (
        <div className="output-container">
          <h3>Output:</h3>
          <pre className="output">{result}</pre>
        </div>
      )}
      <button
        className="run-button"
        onClick={() => {
          // use piston api to run code
          let payload = {
            language: "java",
            version: "15.0.2",
            files: [
              {
                name: "Main.java",
                content: studentCode,
              },
            ],
          };
          fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.run) {
                setResult(data.run.output);
                if (data.run.output === "") {
                  toast.warning("No output generated.");
                }
              } else {
                toast.error(
                  `Error running code: ${data.error || "Unknown error"}`
                );
              }
            })
            .catch((error) => {
              toast.error(
                `Error running code: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
            });
        }}
      >
        Run Code
      </button>
    </div>
  );
}
