import React, { useState, useEffect, useRef } from 'react';
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
    IconButton,
    TextField,
    Button,
    CircularProgress
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';

const ChatHistory = ({ handleLogout, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            // Add user message immediately
            setMessages(prev => [...prev, {
                type: 'user',
                content: inputMessage,
                timestamp: new Date()
            }]);
            
            setInputMessage('');

            const eventSource = new EventSource(
                `http://localhost:5000/query?token=${token}`
            );

            let currentResponse = '';

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'token') {
                    currentResponse += data.token;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage.type === 'bot') {
                            lastMessage.content = currentResponse;
                        } else {
                            newMessages.push({
                                type: 'bot',
                                content: currentResponse,
                                timestamp: new Date()
                            });
                        }
                        return newMessages;
                    });
                }
            };

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Failed to send message. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

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
        <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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

            <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                p: 2,
                overflow: 'hidden'
            }}>
                <Paper 
                    elevation={3} 
                    sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        p: 2,
                        backgroundColor: '#f5f5f5'
                    }}
                >
                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                mb: 2
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    maxWidth: '70%',
                                    backgroundColor: msg.type === 'user' ? '#1976d2' : '#fff',
                                    color: msg.type === 'user' ? '#fff' : 'inherit'
                                }}
                            >
                                <Typography>{msg.content}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </Typography>
                            </Paper>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Paper>

                <Paper 
                    component="form" 
                    onSubmit={sendMessage}
                    sx={{ 
                        p: 2,
                        display: 'flex',
                        gap: 1
                    }}
                >
                    <TextField
                        fullWidth
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        variant="outlined"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        endIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                        Send
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default ChatHistory;
