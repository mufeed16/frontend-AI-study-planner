import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    AppBar,
    Toolbar,
    IconButton,
    CircularProgress,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

const Chat = ({ handleLogout, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatHistoryRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
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

            // Send the query
            await axios.post('http://localhost:5000/query', 
                { query: inputMessage },
                { headers: { 'Authorization': `Bearer ${token}` }}
            );

            let currentResponse = '';
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'token') {
                    currentResponse += data.token;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.type === 'bot') {
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

            eventSource.onerror = (error) => {
                console.error("EventSource error:", error);
                eventSource.close();
                setMessages(prev => [...prev, {
                    type: 'error',
                    content: 'Failed to get response. Please try again.',
                    timestamp: new Date()
                }]);
                setIsLoading(false);
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

    const handleUploadClick = () => {
        navigate('/upload');
    };

    const handleHistoryClick = () => {
        navigate('/chat-history');
    };

    return (
        <Container maxWidth="md" className="chat-container">
            <AppBar position="static" className="app-bar">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Chatbot
                    </Typography>
                    <IconButton color="inherit" onClick={handleUploadClick}>
                        <UploadFileIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleHistoryClick}>
                        <HistoryIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogoutClick}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box mt={3} className="chat-interface">
                <div className="chat-history" ref={chatHistoryRef}>
                    <List>
                        {messages.map((message, index) => (
                            <ListItem 
                                key={index}
                                className={`chat-message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                <ListItemText
                                    primary={message.content}
                                    secondary={new Date(message.timestamp).toLocaleTimeString()}
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>

                <Box
                    component="form"
                    onSubmit={sendMessage}
                    className="chat-input-area"
                >
                    <div className="chat-input-form">
                        <TextField
                            fullWidth
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            disabled={isLoading}
                            className="chat-input"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            className="send-button"
                            endIcon={isLoading && <CircularProgress size={20} color="inherit" />}
                        >
                            Send
                        </Button>
                    </div>
                </Box>
            </Box>
        </Container>
    );
};

export default Chat;
