import { useState, useRef, useEffect } from 'react';
import './index.css'; // Make sure styles are applied

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Smart AI Assistant. Please upload a document to get started!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // URL to our Node Backend (which forwards to Python)
  const API_BASE = 'http://localhost:5000/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessages(prev => [...prev, { role: 'ai', content: `Uploading and processing ${file.name}... This might take a moment.` }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: `Success! ${file.name} is now stored in my memory. Ask me anything about it!` }]);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error uploading file: ${error.message}` }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      } else {
        throw new Error(data.error || "Failed to get an answer");
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1>InsightRAG</h1>
        
        <div>
          <input 
            type="file" 
            id="file-upload" 
            accept=".pdf,.txt" 
            onChange={handleFileUpload} 
            disabled={isUploading || isLoading}
          />
          <label htmlFor="file-upload" className="upload-btn">
            {isUploading ? 'Uploading...' : '📁 Upload Document'}
          </label>
        </div>
      </header>

      {/* Chat Area */}
      <div className="chat-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="input-area" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          disabled={isLoading || isUploading}
        />
        <button type="submit" disabled={isLoading || isUploading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
