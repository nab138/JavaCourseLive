import { toast } from "sonner";

export default function runJava(
  studentCode: string,
  setResult: (result: string) => void
) {
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
        toast.error(`Error running code: ${data.error || "Unknown error"}`);
      }
    })
    .catch((error) => {
      toast.error(
        `Error running code: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    });
}
