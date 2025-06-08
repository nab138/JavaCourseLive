export default function runJava(
  studentCode: string,
  setResult: (result: string) => void
) {
  return new Promise<void>((resolve, reject) => {
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
            reject("No output generated.");
          } else {
            if (data.run.code === 0) resolve();
            reject("Your code had an error!");
          }
        } else {
          reject(`Error running code: ${data.error || "Unknown error"}`);
        }
      })
      .catch((error) => {
        console.error("Error running code:", error);
        reject(
          `Error running code: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      });
  });
}
