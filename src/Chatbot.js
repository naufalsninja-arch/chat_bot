import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiLoader, FiMessageSquare } from 'react-icons/fi';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // ⬇️ AUTO GREETING FROM BACKEND
  useEffect(() => {
  const loadGreeting = async () => {
    try {
      const res = await axios.post(
        "https://tuyaysolihin-chatbot.hf.space/chatbot",
        { message: "" },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessages([{ text: res.data.response, sender: "bot" }]);
    } catch (err) {
      console.error("Greeting failed:", err);
    }
  };

  loadGreeting();
}, []);
  
  // ⬇️ AUTO SCROLL WHEN MESSAGES CHANGE
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://tuyaysolihin-chatbot.hf.space/chatbot',
        { message: input },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botText = response.data.response;

      const botMessage = {
        text: botText,
        sender: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: '⚠️ Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-container">

      <div className="chatbot-header">
        <h1 className="chatbot-title">ASISTEN AII 🤖</h1>
        <p className="chatbot-subtitle">Tanyakan apa saja terkait data perusahaan</p>
      </div>

      <div className="chatbot-messages">

        {messages.length === 0 && (
          <div className="chatbot-welcome-message">
            <FiMessageSquare size={40} />
            <p>Memuat asisten...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message-bubble-wrapper ${msg.sender}`}>
            <div className="message-bubble">
              <div
                className={`message-content ${
                  msg.text.includes('<table') ? 'table-bubble' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              ></div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-bubble-wrapper bot">
            <div className="message-bubble loading">
              <FiLoader className="loading-icon" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <input
          type="text"
          className="chatbot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan Anda..."
          disabled={loading}
        />
        <button
          className="chatbot-send-button"
          onClick={sendMessage}
          disabled={loading || input.trim() === ''}
        >
          <FiSend />
        </button>
      </div>

    </div>
  );
}

export default Chatbot;
