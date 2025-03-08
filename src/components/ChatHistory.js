import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Paper,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';

const ChatHistory = ({ handleLogout, userRole }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
                const response = await axios.get(`${baseUrl}/chat-history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // Adjust response if backend returns { chats: [...] }
                setChatHistory(response.data.chats || response.data);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
                console.error("Error fetching chat history:", error);
            }
        };

        fetchChatHistory();
    }, []);

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login');
    };

    const handleChatClick = () => {
        navigate('/chat');
    };

    const handleUploadClick = () => {
        // If you see an "upload" error in your backend, check the corresponding upload endpoint implementation.
        console.log("Navigating to /upload - if there is an upload error, please review the backend upload route.");
        navigate('/upload');
    };

    return (
        <Container maxWidth="md">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Chat History
                    </Typography>
                    {userRole === 'admin' && (
                        <IconButton color="inherit" onClick={handleUploadClick}>
                            <UploadFileIcon />
                        </IconButton>
                    )}
                    <IconButton color="inherit" onClick={handleChatClick}>
                        <ChatIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogoutClick}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box mt={3}>
                {error && (
                    <Typography color="error" gutterBottom>
                        {error}
                    </Typography>
                )}
                <Typography variant="h4" gutterBottom>
                    Chat History
                </Typography>
                <Paper elevation={3} style={{ padding: '20px' }}>
                    <List>
                        {chatHistory.map((chat, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemText
                                    primary={chat.query}
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="textPrimary"
                                            >
                                                Response: {chat.response}
                                            </Typography>
                                            <br />
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="textSecondary"
                                            >
                                                Timestamp: {new Date(chat.timestamp).toLocaleString()}
                                            </Typography>
                                            {chat.sources && chat.sources.length > 0 && (
                                                <>
                                                    <br />
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textSecondary"
                                                    >
                                                        Sources: {chat.sources.join(', ')}
                                                    </Typography>
                                                </>
                                            )}
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Container>
    );
};

export default ChatHistory;
