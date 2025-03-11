import React, { useState } from 'react';
import axios from 'axios';
import {
    Container,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [processingStep, setProcessingStep] = useState(null);
    const navigate = useNavigate();

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setError(null);
        } else {
            setError('Please select a PDF file');
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Make the upload request and get response stream
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const {value, done} = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const event = line.slice(6);
                            if (!event) continue;
                            
                            const data = JSON.parse(event);
                            
                            switch (data.step) {
                                case 'upload':
                                    if (data.status === 'complete') {
                                        setProcessingStep('PDF uploaded successfully');
                                    }
                                    break;
                                case 'processing':
                                    setProcessingStep(data.message);
                                    break;
                                case 'embeddings':
                                    setProcessingStep(data.message);
                                    break;
                                case 'vectordb':
                                    if (data.status === 'complete') {
                                        setProcessingStep(data.message);
                                        setSuccess(true);
                                        setTimeout(() => {
                                            navigate('/chat');
                                        }, 2000);
                                    } else if (data.status === 'error') {
                                        setError(data.message);
                                    }
                                    break;
                                case 'error':
                                    setError(data.message);
                                    break;
                            }
                        }
                    }
                }
            } catch (streamError) {
                setError('Error processing response stream');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Upload PDF
                    </Typography>
                    <IconButton color="inherit" onClick={() => navigate('/chat')}>
                        <ChatIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="pdf-upload"
                />
                <label htmlFor="pdf-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading}
                    >
                        Select PDF File
                    </Button>
                </label>

                {selectedFile && (
                    <Typography variant="body1">
                        Selected: {selectedFile.name}
                    </Typography>
                )}

                {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                )}

                {processingStep && (
                    <Alert severity={success ? "success" : "info"} sx={{ width: '100%' }}>
                        {processingStep}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    sx={{ mt: 2 }}
                >
                    {uploading ? (
                        <>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            Uploading...
                        </>
                    ) : (
                        'Upload'
                    )}
                </Button>
            </Box>
        </Container>
    );
};

export default Upload;
