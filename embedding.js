import AutoTokenizer from "transformers"
import AutoModel from "transformers"
import torch from "torch"
const modelName = "sentence-transformers/all-MiniLM-L6-v2";

import {spawn} from "child_process"
async function generateEmbedding(text) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", ["./embedding.py"]);


    pythonProcess.stdin.write(text);
    pythonProcess.stdin.end();

    let data = "";

    pythonProcess.stdout.on("data", (chunk) => {
      data += chunk;
    });

    pythonProcess.stderr.on("data", (error) => {
        console.error("Ошибка Python скрипта (stderr):", error.toString());
        reject(error.toString());
      });
      
      pythonProcess.stdout.on("data", (data) => {
        console.log("Вывод Python скрипта (stdout):", data.toString());
      });
      

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(JSON.parse(data));
      } else {
        reject(`Python скрипт завершился с кодом ${code}`);
      }
    });
  });
}


export default generateEmbedding;
