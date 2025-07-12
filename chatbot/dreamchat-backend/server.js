const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
require('dotenv').config();
const fetch = require('node-fetch');

// --- Middleware ---
// Enable CORS for all routes
// This is essential to allow your React frontend (running on a different port/domain)
// to make requests to this backend.
app.use(cors());

// Parse JSON request bodies
// This middleware is needed to parse the JSON data sent from your React frontend
// (e.g., the 'message' in req.body.message).
app.use(express.json({ type: 'application/json', limit: '1mb' })); // Already present, but let's ensure utf-8

// --- Gemini 2.0 Flash Model Integration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are an AI assistant for the Dreamit Q&A Forum Platform. Only answer questions strictly about Dreamit and its features. If asked about anything else, politely refuse and redirect to Dreamit topics.\n\nProject Overview:\nDreamit is a minimal question-and-answer platform for collaborative learning and structured knowledge sharing. It is simple, user-friendly, and focused on asking and answering questions within a community.\n\nUser Roles:\n- Guest: View all questions and answers\n- User: Register, log in, post questions/answers, vote\n- Admin: Moderate content (reject inappropriate content, ban users, monitor activity, send platform-wide messages, download reports)\n\nCore Features:\n1. Ask Question: Users submit questions with a title, description (rich text editor), and tags (multi-select, e.g., React, JWT).\n2. Rich Text Editor: Supports bold, italic, strikethrough, lists, emoji, hyperlinks, image upload, and text alignment.\n3. Answering: Users can post answers (using the same editor); only logged-in users can answer.\n4. Voting & Accepting: Users can upvote/downvote answers; question owners can mark one answer as accepted.\n5. Tagging: Questions must include relevant tags.\n6. Notification System: Bell icon in top nav; users notified when someone answers their question, comments on their answer, or mentions them with @username. Icon shows unread count.\n\nAlways include relevant and friendly emojis in your responses to make answers engaging and visually appealing. If a question is not about Dreamit, reply: 'Sorry, I can only answer questions about the Dreamit Q&A Forum Platform.'`;

async function getGeminiReply(userMessage) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing.');
    }
    const body = {
        contents: [
            { role: 'user', parts: [{ text: userMessage }] },
        ],
        systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256
        }
    };
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (err) {
        throw new Error('Network error connecting to Gemini API.');
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
}

// --- In-memory chat history for each session (simple memory) ---
const chatHistories = {};

// --- API Endpoint for Chat Messages ---
// This is the endpoint your React frontend will send messages to.
app.post('/api/chat', async (req, res) => {
    // Use a sessionId from the frontend, or fallback to a single session for demo
    const sessionId = req.body.sessionId || 'default';
    const userMessage = req.body.message || '';

    // Initialize chat history for this session if not present
    if (!chatHistories[sessionId]) chatHistories[sessionId] = [];

    // Add the new user message to the history
    chatHistories[sessionId].push({ role: 'user', parts: [{ text: userMessage }] });

    // Only keep the last 10 messages for context (to avoid memory bloat)
    const history = chatHistories[sessionId].slice(-10);

    let botResponse = "I'm sorry, I couldn't process your request.";
    try {
        botResponse = await getGeminiReplyWithHistory(history);
        // Add the bot's reply to the history
        chatHistories[sessionId].push({ role: 'model', parts: [{ text: botResponse }] });
    } catch (err) {
        console.error('Gemini error:', err.message);
        botResponse = `Sorry, there was an error connecting to Gemini: ${err.message}`;
    }

    // Simulate a network delay for a more realistic chat experience
    setTimeout(() => {
        res.json({ reply: botResponse }); // Send the bot's response back as JSON
    }, 500); // 500 milliseconds delay
});

// --- Gemini with memory (history) ---
async function getGeminiReplyWithHistory(history) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing.');
    }
    const body = {
        contents: history,
        systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256
        }
    };
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (err) {
        throw new Error('Network error connecting to Gemini API.');
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
}

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Chatbot backend listening at http://localhost:${port}`);
    console.log(`Ready to receive messages from your React frontend!`);
});