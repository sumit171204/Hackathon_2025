import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api/chat';
const projectName = import.meta.env.VITE_PROJECT_NAME || 'Team Dreamable';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;
        const newUserMessage = { sender: 'user', text: input };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setInput('');
        setIsLoading(true);
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            const botMessage = { sender: 'bot', text: data.reply };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            const errorMessage = { sender: 'bot', text: "Oops! Something went wrong. Please try again later." };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
            {/* Toggle Button */}
            <button className="chatbot-toggle-button" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close Chatbot' : 'Open Chatbot'}>
                {isOpen ? <span style={{fontSize: 28, fontWeight: 'bold'}}>×</span> : <span style={{fontSize: 24}}>💬</span>}
            </button>
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-avatar">🤖</div>
                        <div className="chat-header-title">{projectName} Chatbot</div>
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && <p className="initial-message">Ask me anything about <b>{projectName}</b>!</p>}
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>
                        ))}
                        {isLoading && <div className="chat-message bot loading"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || input.trim() === ''}>
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;