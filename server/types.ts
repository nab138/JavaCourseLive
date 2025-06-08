type JoinData = {
  type: "join";
  name: string;
  role: "teacher" | "student";
  password?: string;
};

type CodeData = {
  type: "code";
  code: string;
};

type EditForStudentData = {
  type: "editForStudent";
  userId: string;
  code: string;
};

export type IncomingMessageData = JoinData | CodeData | EditForStudentData;
