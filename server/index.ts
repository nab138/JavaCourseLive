import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import type { IncomingMessageData, User } from "./types";

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const users = new Map<string, User>();

let defaultCode = `public class Main {
    public static void main(String[] args) {
        // Write your Java code here
    }
}`;

wss.on("connection", (ws) => {
  let userId: string | null = null;
  let isTeacher = false;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString()) as IncomingMessageData;
      if (data.type === "join") {
        if (data.role === "teacher") {
          const correctPassword = process.env.TEACHER_PASSWORD;
          if (data.password !== correctPassword) {
            ws.send(
              JSON.stringify({ type: "error", message: "Invalid password" })
            );
            ws.close();
            return;
          }
          ws.send(
            JSON.stringify({
              type: "defaultCodeUpdated",
              code: defaultCode,
              supressNotification: true,
            })
          );
          isTeacher = true;
        } else {
          ws.send(
            JSON.stringify({
              type: "code",
              code: defaultCode,
            })
          );
        }
        userId = Math.random().toString(36).slice(2);
        users.set(userId, {
          name: data.name,
          role: data.role,
          ws,
          code: defaultCode,
        });
        ws.send(JSON.stringify({ type: "joined", userId }));
        broadcastUserList();
      } else if (data.type === "code") {
        if (userId && users.has(userId)) {
          users.get(userId)!.code = data.code;
          broadcastToTeachers({
            type: "codeUpdate",
            userId,
            code: data.code,
            name: users.get(userId)!.name,
          });
        }
      } else if (data.type === "editForStudent") {
        const student = users.get(data.userId);
        student!.code = data.code;
        if (student && student.ws) {
          student.ws.send(JSON.stringify({ type: "code", code: data.code }));
        }
      } else if (data.type === "setDefaultCode") {
        if (!isTeacher) return;
        defaultCode = data.code;
        broadcastToTeachers({
          type: "defaultCodeUpdated",
          code: defaultCode,
        });
        if (!data.forceOverwrite) return;
        for (const user of users.values()) {
          if (user.role === "student") {
            user.ws.send(JSON.stringify({ type: "code", code: defaultCode }));
          }
        }
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    if (userId) {
      users.delete(userId);
      broadcastUserList();
    }
  });
});

function broadcastUserList() {
  const userList = Array.from(users.entries()).map(([id, u]) => ({
    userId: id,
    name: u.name,
    role: u.role,
    code: u.code,
  }));
  for (const u of users.values()) {
    if (u.role === "teacher") {
      u.ws.send(JSON.stringify({ type: "userList", users: userList }));
    }
  }
}

function broadcastToTeachers(msg: any) {
  for (const u of users.values()) {
    if (u.role === "teacher") {
      u.ws.send(JSON.stringify(msg));
    }
  }
}

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
