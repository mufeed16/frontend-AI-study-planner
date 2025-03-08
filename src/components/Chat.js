import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

const Chat = ({ handleLogout, userRole }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const chatHistoryRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom on new messages
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [results]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/query', { query: query }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setResults(prevResults => [...prevResults, ...response.data.results]);
            setQuery(''); // Clear the input after sending
        } catch (error) {
            console.error("Error querying the chatbot:", error);
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
                        {results.map((result, index) => (
                            <ListItem key={index} alignItems="flex-start" className={`chat-message ${result.source === 'user' ? 'user-message' : 'bot-message'}`}>
                                <ListItemText
                                    primary={result.text}
                                    secondary={
                                        <React.Fragment>
                                            {result.sources && result.sources.length > 0 ? (
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="textPrimary"
                                                >
                                                    Sources: {result.sources.join(', ')}
                                                </Typography>
                                            ) : (
                                                "No sources available."
                                            )}
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>
                <Paper elevation={3} className="chat-input-area">
                    <form onSubmit={handleSubmit} className="chat-input-form">
                        <TextField
                            label="Enter your query"
                            variant="outlined"
                            fullWidth
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            margin="normal"
                            className="chat-input"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className="send-button"
                        >
                            Send
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Chat;
