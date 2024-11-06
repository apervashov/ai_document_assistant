import fs from "fs";
import express from "express";
import pdfParse from "pdf-parse";
import multer from "multer";
import cors from "cors";
import {Pinecone} from "@pinecone-database/pinecone";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import generateEmbedding from "./embedding.js";
import dotenv from "dotenv";
import axios from "axios"
dotenv.config();

const port = 3050;
const app = express();

app.use(cors());
app.use(express.json());


const upload = multer({ dest: "uploads/" });


const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.Index("briliant-test1");
async function generateResponse(prompt) {
  const API_KEY = process.env.MISTRAL_API_KEY;
  const MISTRAL_API_URL = process.env.MISTRAL_API_URL;
  const MODEL_NAME = process.env.MISTRAL_MODEL_NAME;


  const queryVector = await generateEmbedding(prompt);
  

  const relevantChunks = await getRelevantChunksFromPinecone(queryVector);
  const context = relevantChunks.join("\n");


  const enhancedPrompt = `Context:\n${context}\n\nQuestion: ${prompt}\nAnswer:`;

  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: enhancedPrompt }],
        max_tokens: 1024,
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      return "No response from a model";
    }
  } catch (error) {
    console.error("Error accessing Mistral API:", error.response ? error.response.data : error.message);
    return "Error accessing Mistral API";
  }
}
async function getRelevantChunksFromPinecone(queryVector, topK = 5) {
  const results = await index.query({
    vector: queryVector,
    topK: topK,
    includeMetadata: true,
  });
  const chunks = results.matches.map(match => match.metadata.text);
  return chunks;
}

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Received an /upload request");
  const file = req.file;

  if (!file) {
    console.log("File wasn't uploaded.");
    return res.status(400).json({ error: "File wasn't uploaded." });
  }

  console.log(`Processing the file: ${file.originalname}`);
  let content = "";

  try {
    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
      console.log(`${pdfData.text.length} symbols extracted from a .pdf file.`);
    }
    else if (file.mimetype === "text/plain") {
      content = fs.readFileSync(file.path, "utf8");
      console.log(`${content.length} symbols extracted from a .txt file.`);
    } else {
      console.log("Unsupported file type:", file.mimetype);
      return res.status(400).json({ error: "Only .txt and .pdf files are supported." });
    }
    fs.unlinkSync(file.path);

    const chunks = splitTextIntoChunks(content);

    for (const [index, chunk] of chunks.entries()) {
      const vector = await generateEmbedding(chunk);
      await saveToPinecone(index, chunk, vector);
    }
    runPythonScript();

    res.json({ message: "File processed and uploaded successfully" });
  } catch (error) {
    console.error("Error processing the file: ", error);
    return res.status(500).json({ error: "Error processing the file" });
  }
});

function splitTextIntoChunks(text, chunkSize = 512) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "'message' field is mandatory." });
  }

  const response = await generateResponse(message);
  res.json({ response });
});


async function saveToPinecone(id, text, vector) {
  const upsertRequest = [
    {
      id: `chunk-${id}`,
      values: vector,
      metadata: { text: text },
    },
  ];

  await index.upsert(upsertRequest);
  console.log(`Saved chunk ${id} to Pinecone`);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, "embedding.py");
function runPythonScript() {
  exec(`python ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Python script error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
