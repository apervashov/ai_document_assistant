import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false); // Новое состояние

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Пожалуйста, выберите файл для загрузки.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setIsFileUploaded(false); // Сбрасываем состояние

        try {
            const { data } = await axios.post('http://localhost:3050/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Ответ от /upload:", data);
            setFileContent(data.content);
            setIsFileUploaded(true); // Устанавливаем состояние
            alert("Файл успешно загружен и обработан.");
        } catch (error) {
            console.error("Ошибка при загрузке файла:", error.response ? error.response.data : error.message);
            alert("Ошибка при загрузке файла.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFileUploaded) {
            alert("Please upload a file before sending a message.");
            return;
        }

        const prompt = `Context:\n${fileContent}\n\nQuestion: ${message}\nAnswer:`;

        try {
            const { data } = await axios.post('http://localhost:3050/chat', { message: prompt });
            console.log("Response from /chat:", data);
            setResponse(data.response);
        } catch (error) {
            console.error("Error sending the question:", error.response ? error.response.data : error.message);
            alert("Error processing the question.");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Upload file and ask questions.</h1>
            
            <form onSubmit={handleFileUpload} style={styles.form}>
                <input type="file" accept=".pdf, .txt" onChange={handleFileChange} style={styles.fileInput} />
                <button type="submit" style={styles.uploadButton}>
                    {isLoading ? "Loading" : "Upload file"}
                </button>
            </form>

            {isLoading && <div style={styles.loading}>Processing the file...</div>}

            {fileContent && (
                <div style={styles.fileContentContainer}>
                    <h2 style={styles.subHeader}>File contents:</h2>
                    <pre style={styles.fileContent}>{fileContent}</pre>
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a question about the files content."
                    style={styles.input}
                />
                <button type="submit" style={styles.submitButton}>Send a question</button>
            </form>

            {response && (
                <div style={styles.responseContainer}>
                    <h2 style={styles.subHeader}>Response:</h2>
                    <p style={styles.responseText}>{response}</p>
                </div>
            )}
        </div>
    );
}

// Стили
const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
    },
    header: {
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    subHeader: {
        color: '#666',
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
        marginBottom: '10px',
    },
    uploadButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#4CAF50',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    uploadButtonHover: {
        backgroundColor: '#45a049',
    },
    loading: {
        fontSize: '16px',
        color: '#888',
        margin: '10px 0',
    },
    fileContentContainer: {
        backgroundColor: '#f8f8f8',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        overflowY: 'auto',
        maxHeight: '200px',
    },
    fileContent: {
        margin: '0',
        color: '#333',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        boxSizing: 'border-box',
    },
    submitButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#008CBA',
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
        color: '#333',
        fontSize: '16px',
        backgroundColor: '#e6f7ff',
        padding: '10px',
        borderRadius: '5px',
    }
};
