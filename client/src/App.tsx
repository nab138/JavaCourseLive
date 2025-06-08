import { HashRouter as Router, Routes, Route } from "react-router-dom";
import StudentPage from "./student/Student";
import TeacherPage from "./teacher/Teacher";
import TeacherJoinPage from "./teacher/TeacherJoinPage";
import StudentJoinPage from "./student/StudentJoinPage";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentJoinPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherJoinPage />} />
        <Route path="/teacher/dashboard" element={<TeacherPage />} />
      </Routes>
    </Router>
  );
}
