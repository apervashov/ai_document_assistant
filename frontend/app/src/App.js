import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setIsFileUploaded(false);

        try {
            const { data } = await axios.post('http://localhost:3050/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Response from /upload:", data);
            setFileContent(data.content);
            setIsFileUploaded(true);
            alert("File uploaded and processed successfully.");
        } catch (error) {
            console.error("Error uploading file:", error.response ? error.response.data : error.message);
            alert("Error uploading file.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFileUploaded) {
            alert("Please upload a file before sending a question.");
            return;
        }

        const prompt = `Context:\n${fileContent}\n\nQuestion: ${message}\nAnswer:`;

        try {
            const { data } = await axios.post('http://localhost:3050/chat', { message: prompt });
            console.log("Response from /chat:", data);
            setResponse(data.response);
        } catch (error) {
            console.error("Error sending question:", error.response ? error.response.data : error.message);
            alert("Error processing question.");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.header}>Upload File and Ask Questions</h1>
                
                <form onSubmit={handleFileUpload} style={styles.form}>
                    <input type="file" accept=".pdf, .txt" onChange={handleFileChange} style={styles.fileInput} />
                    <button type="submit" style={styles.uploadButton}>
                        {isLoading ? "Loading..." : "Upload File"}
                    </button>
                </form>

                {isLoading && <div style={styles.loading}>Processing the file...</div>}

                {fileContent && (
                    <div style={styles.fileContentContainer}>
                        <h2 style={styles.subHeader}>File Contents:</h2>
                        <pre style={styles.fileContent}>{fileContent}</pre>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask a question about the file's content."
                        style={styles.input}
                    />
                    <button type="submit" style={styles.submitButton}>Send Question</button>
                </form>

                {response && (
                    <div style={styles.responseContainer}>
                        <h2 style={styles.subHeader}>Response:</h2>
                        <p style={styles.responseText}>{response}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Dark Theme Styles with Global Background
const styles = {
    page: {
        backgroundColor: '#121212', // Dark background for the entire page
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e0e0e0',
    },
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        textAlign: 'center',
        backgroundColor: '#1f1f1f',
        color: '#e0e0e0',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    },
    header: {
        color: '#bb86fc',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    subHeader: {
        color: '#03dac5',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px',
    },
    fileInput: {
        padding: '10px',
        fontSize: '14px',
        color: '#e0e0e0',
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '5px',
        marginBottom: '10px',
    },
    uploadButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#bb86fc',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    loading: {
        fontSize: '16px',
        color: '#f1c40f',
        margin: '10px 0',
    },
    fileContentContainer: {
        backgroundColor: '#2e2e2e',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        overflowY: 'auto',
        maxHeight: '200px',
    },
    fileContent: {
        color: '#cfcfcf',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        color: '#e0e0e0',
        backgroundColor: '#333',
        borderRadius: '5px',
        border: '1px solid #555',
        marginBottom: '10px',
        boxSizing: 'border-box',
    },
    submitButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#03dac5',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    responseContainer: {
        marginTop: '20px',
        textAlign: 'left',
    },
    responseText: {
        color: '#cfcfcf',
        fontSize: '16px',
        backgroundColor: '#333',
        padding: '10px',
        borderRadius: '5px',
    }
};
