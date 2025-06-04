import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track users and their code
const users = new Map(); // id -> { name, role, ws, code }

wss.on("connection", (ws) => {
  let userId: string | null = null;
  let isTeacher = false;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "join") {
        if (data.role === "teacher") {
          // Simple password check (from .env)
          const correctPassword = process.env.TEACHER_PASSWORD || "secret";
          if (data.password !== correctPassword) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid password" }));
            ws.close();
            return;
          }
          isTeacher = true;
        }
        userId = Math.random().toString(36).slice(2);
        users.set(userId, { name: data.name, role: data.role, ws, code: "" });
        ws.send(JSON.stringify({ type: "joined", userId }));
        broadcastUserList();
      } else if (data.type === "code") {
        // { type: 'code', code }
        if (userId && users.has(userId)) {
          users.get(userId).code = data.code;
          broadcastToTeachers({
            type: "codeUpdate",
            userId,
            code: data.code,
            name: users.get(userId).name,
          });
        }
      } else if (data.type === "editForStudent") {
        // { type: 'editForStudent', userId, code }
        const student = users.get(data.userId);
        if (student && student.ws) {
          student.ws.send(
            JSON.stringify({ type: "code", code: data.code })
          );
        }
      }
    } catch (e) { }
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