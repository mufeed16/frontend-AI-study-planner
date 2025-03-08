import React, { useState } from 'react';
import axios from 'axios';
import {
    Button,
    Container,
    Typography,
    Box,
    Alert,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

const Upload = ({ handleLogout, userRole }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            setMessage('');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage(response.data.message);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Upload failed');
            setMessage('');
        }
    };

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login');
    };

    const handleChatClick = () => {
        navigate('/chat');
    };

    const handleHistoryClick = () => {
        navigate('/chat-history');
    };

    return (
        <Container maxWidth="md">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Upload Document
                    </Typography>
                    <IconButton color="inherit" onClick={handleChatClick}>
                        <ChatIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleHistoryClick}>
                        <HistoryIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogoutClick}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box mt={3}>
                <Typography variant="h4" gutterBottom>
                    Upload a File
                </Typography>
                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ marginBottom: '20px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                >
                    Upload
                </Button>
            </Box>
        </Container>
    );
};

export default Upload;
