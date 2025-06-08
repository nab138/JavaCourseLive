import { WebSocket } from "ws";

type StudentJoinData = {
  type: "join";
  name: string;
  role: "student";
};

type TeacherJoinData = {
  type: "join";
  name: string;
  role: "teacher";
  password: string;
};

type JoinData = StudentJoinData | TeacherJoinData;

type CodeData = {
  type: "code";
  code: string;
};

type EditForStudentData = {
  type: "editForStudent";
  userId: string;
  code: string;
};

type SetDefaultCodeData = {
  type: "setDefaultCode";
  code: string;
  forceOverwrite?: boolean;
};

type StudentCursorData = {
  type: "studentCursor";
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

type TeacherCursorData = {
  type: "teacherCursor";
  userId: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type IncomingMessageData =
  | JoinData
  | CodeData
  | EditForStudentData
  | SetDefaultCodeData
  | StudentCursorData
  | TeacherCursorData;

export type User = {
  name: string;
  role: "teacher" | "student";
  code?: string;
  ws: WebSocket;
};
