# AI-Enhanced Document QA System

## Description

This project is a document ingestion and question-answering system that uses Retrieval Augmented Generation (RAG). The system integrates advanced AI models and the Pinecone vector database for relevant text retrieval and processing.

## Main Components

1. **Backend**: A Node.js server using Express to handle document uploads and response generation.
2. **Frontend**: A React interface for uploading files, displaying file contents, and submitting questions.
3. **Python Script**: A script for vector generation and topic modeling.
4. **Pinecone**: A vector database for storing and searching document text fragments.
5. **AI API Integration**: Integration with the Mistrall API for text analysis and question-answering.

## Features

- Upload PDF and text files
- Split text into chunks, vectorize them, and save to Pinecone
- Use RAG to find relevant chunks from Pinecone and enhance responses with retrieved context
- Send requests and receive responses from the AI API
- Display file processing status on the interface

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository_link>
cd <folder_name>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following variables:

```plaintext
MISTRAL_API_KEY=your_api_key
MISTRAL_API_URL=your_api_url
MISTRAL_MODEL_NAME=model_name
PINECONE_API_KEY=your_pinecone_api_key
```

### 4. Start the Server and Client

```bash
# Start the server
node server.js
```

### 5. Start the Client

Open a new terminal and run:

```bash
npm start
```

## Project Structure

```
├── server.js           # Main server file
├── embedding.js        # Function for generating vectors from text
├── topic_modeling.py   # Python script for topic modeling
├── frontend            # Folder with frontend code (React)
└── .env                # Environment variables file
```

## Usage

1. **Upload a Document**: Go to the client page and upload a PDF or text file.
2. **Ask a Question**: After the file is uploaded, enter a question about the document's contents.
3. **Get an Answer**: The system uses RAG to add relevant chunks from Pinecone to the query and sends it to the AI model for an answer.

## Troubleshooting

### Pinecone Errors

1. **`PineconeArgumentError: Object contained invalid properties`**: This error is caused by sending incorrect parameters in `index.query`. Make sure `vector`, `topK`, and `includeMetadata` are passed directly without wrapping them in `queryRequest`.

2. **`Vector dimension does not match`**: Ensure that the vectors created in `embedding.py` match the dimensionality set in the Pinecone index (e.g., 1700 for Mistral).

### File Path and Module Issues

1. **`__dirname is not defined` in ES modules**: Add the following code to define paths correctly:

   ```javascript
   import { fileURLToPath } from "url";
   import path from "path";
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   ```

2. **Python Script Errors**: Ensure all necessary dependencies are installed (e.g., `torch`, `transformers`, `scikit-learn` for Python).

### Deleting `node_modules/@pinecone-database/pinecone/dist/utils/validateProperties.js`

To resolve errors with Pinecone, you may need to temporarily delete or modify validators if an error appears in `validateProperties.js`. Try updating or reinstalling the Pinecone module if this error persists.

### **pdf-parse package error.**
   Comment the if(isDebugMode) statement in node_modules/pdf-parse/index.js
## Notes

- **RAG Support**: With each query, the system retrieves relevant chunks from Pinecone, adding them to the query context sent to the AI model.
- **Model Configuration**: Verify that all API keys and URLs are correct for the AI API to function properly.


### Approach

1. **Document Ingestion**: 
   I set up an Express backend to handle file uploads, allowing users to submit PDF or plain text files. Upon upload, the backend processes the file by reading its content, splitting it into manageable chunks, and then vectorizing these chunks.

2. **Vectorization and Pinecone Integration**: 
   Each chunk is converted to a vector using a pre-trained embedding model, and the resulting vectors are stored in Pinecone with metadata for easy retrieval.
3. **Retrieval-Augmented Generation (RAG)**: 
   When a user submits a question, the system generates a vector for the question and uses Pinecone to find the most relevant document chunks. These chunks are then used to enhance the context of the question, which is submitted to the AI model to generate a highly contextualized response.

4. **Frontend**: 
   Built a React interface that allows users to upload files, view file content, and ask questions. It also displays file processing status for a smoother user experience.

### Challenges Faced

1. **Pinecone Integration**: 
   Some errors arose from incorrect parameter usage, like wrapping query parameters incorrectly or mismatched vector dimensions. Ensuring that vectors’ dimensions matched the Pinecone index setting (1700 for this setup) was essential but required troubleshooting.

2. **Dynamic Path Issues in ES Modules**: 
   Using ES modules in Node.js meant that common methods like `__dirname` were unavailable. I resolved this by using `fileURLToPath` and `path` modules to dynamically handle paths.

3. **AI API Context Limitations**: 
   I had to carefully design how much context (from retrieved document chunks) to include in queries sent to the AI API due to token limits. This was particularly important to keep responses relevant without exceeding the model’s input capacity.

4. **Debugging External Module Errors**: 
   Some errors in Pinecone’s module validators required either updating, reinstalling, or even temporarily modifying modules like `validateProperties.js` to keep the project running smoothly.
