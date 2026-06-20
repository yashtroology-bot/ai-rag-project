import { useState, useRef, useEffect, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { 
  MessageSquare, Plus, LogOut, Paperclip, 
  Send, Bot, User as UserIcon, X, FileText,
  Mic, MicOff, Volume2, VolumeX, Image as ImageIcon, StopCircle
} from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  imageBase64?: string;
}

interface Session {
  _id: string;
  title: string;
  updatedAt: string;
  attachedFileUrl?: string;
  attachedFileName?: string;
  attachedFileBase64?: string;
}

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Document/Image State
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const newSocket = io('http://localhost:5000');
    newSocket.emit('join_room', user.id);
    setSocket(newSocket);

    newSocket.on('upload_progress', (data) => {
      toast.info(`Started processing ${data.fileName}...`);
    });

    newSocket.on('upload_complete', (data) => {
      toast.success(`${data.fileName} is ready!`);
      setMessages(prev => [...prev, { role: 'ai', content: `I have finished reading ${data.fileName}. What would you like to know about it?` }]);
    });

    newSocket.on('upload_error', (data) => {
      toast.error(`Failed to process ${data.fileName}: ${data.error}`);
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, there was an error processing ${data.fileName}.` }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch all sessions on load
  const loadSessions = async (isInitialLoad = false) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setSessions(data);
      
      if (isInitialLoad) {
        if (data.length > 0) {
          loadChatHistory(data[0]._id, data);
        } else {
          startNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to load sessions");
    }
  };

  useEffect(() => {
    loadSessions(true);
  }, [user]);

  const loadChatHistory = async (sessionId: string, sessionList?: Session[]) => {
    if (!user) return;
    setActiveSessionId(sessionId);

    // Set PDF URL if this session has an attached document
    const currentSessions = sessionList || sessions;
    const activeSession = currentSessions.find(s => s._id === sessionId);
    if (activeSession?.attachedFileBase64) {
      setPdfUrl(activeSession.attachedFileBase64);
      setShowPdf(true);
    } else if (activeSession?.attachedFileUrl) {
      setPdfUrl(`http://localhost:5000${activeSession.attachedFileUrl}`);
      setShowPdf(true);
    } else {
      setPdfUrl(null);
      setShowPdf(false);
    }

    try {
      const res = await fetch(`${API_BASE}/history/${sessionId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.length > 0) {
        setMessages(data);
      } else {
        setMessages([{ role: 'ai', content: `Session started. How can I help?` }]);
      }
    } catch (err) {
      toast.error("Failed to load chat history");
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    const greeting = `Hello Boss, systems are online. How can I help you today?`;
    setMessages([{ role: 'ai', content: greeting }]);
    speakText(greeting);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success('Image attached!');
      };
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);
    setShowPdf(true);

    toast.info(`Uploading ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    if (activeSessionId) {
      formData.append('sessionId', activeSessionId);
    }

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      const data = await response.json();
      
      if (response.status === 202) {
        toast.success(`Upload accepted!`);
        setMessages(prev => [...prev, { role: 'ai', content: `I have received ${file.name} and I am processing it in the background. I'll let you know as soon as it's ready!` }]);
        loadSessions(); // Refresh sessions so the new attachment URL is fetched from backend
      } else if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: `I have read ${file.name}. What would you like to know about it?` }]);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean up markdown like ** and # for cleaner speech
      const cleanText = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Try to find a male English voice to sound like Jarvis (David, Mark, or Male)
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      
      const maleVoice = englishVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('male') || 
               name.includes('david') || 
               name.includes('mark') || 
               name.includes('george') ||
               name.includes('daniel') ||
               name.includes('arthur') ||
               name.includes('fred') ||
               name.includes('alex') ||
               name.includes('bruce');
      });

      if (maleVoice) {
        utterance.voice = maleVoice;
      } else if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, imageBase64: uploadedImage || undefined }]);
    setIsLoading(true);

    try {
      const payload = { 
        question: userMessage, 
        sessionId: activeSessionId,
        image: uploadedImage // Send base64 image if attached
      };

      // Clear image attachment after sending
      setUploadedImage(null);

      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get an answer");
      }
      
      const newSessionId = response.headers.get('X-Session-ID');
      if (!activeSessionId && newSessionId) {
        setActiveSessionId(newSessionId);
        loadSessions();
      }

      if (!response.body) throw new Error("No response body");

      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let fullResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkText = decoder.decode(value, { stream: true });
        fullResponseText += chunkText;
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'ai') {
            newMessages[lastIndex].content += chunkText;
          }
          return newMessages;
        });
      }

      // Automatically speak the response after it finishes generating
      speakText(fullResponseText);

    } catch (error: any) {
      toast.error(error.message || "Failed to connect to AI");
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <ToastContainer theme="dark" position="top-center" />
      
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-3 z-10 hidden md:flex shrink-0">
        <button 
          onClick={startNewChat}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-zinc-700/50 hover:bg-zinc-800 transition-colors text-sm font-medium mb-4"
        >
          <Plus size={18} />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
          {sessions.map(session => (
            <button
              key={session._id} 
              onClick={() => loadChatHistory(session._id, sessions)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm truncate transition-colors w-full text-left
                ${activeSessionId === session._id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
        </div>

        <div className="pt-3 mt-auto border-t border-zinc-800">
          <button 
            onClick={logout}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover:bg-zinc-800 transition-colors text-sm group"
          >
            <div className="flex items-center gap-3 text-zinc-300 group-hover:text-zinc-100">
              <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-md p-1">
                <UserIcon size={16} className="text-zinc-900" />
              </div>
              <span className="truncate max-w-[120px] font-medium">{user.name}</span>
            </div>
            <LogOut size={16} className="text-zinc-500 group-hover:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex relative">
        <div className="flex-1 flex flex-col bg-zinc-950 min-w-0">
          {/* Header */}
          <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
            <h1 className="font-semibold text-zinc-200 flex items-center gap-2">
              <Bot className="text-emerald-500" /> InsightRAG AI
            </h1>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".pdf,image/png,image/jpeg,image/jpg" 
                onChange={handleFileUpload} 
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-md border border-zinc-700/50 transition-colors"
              >
                <Paperclip size={16} /> Attach
              </button>
              {pdfUrl && (
                <button 
                  onClick={() => setShowPdf(!showPdf)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors
                    ${showPdf 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                      : 'text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50'}`}
                >
                  <FileText size={16} />
                  {showPdf ? 'Hide PDF' : 'View PDF'}
                </button>
              )}
            </div>
          </header>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar scroll-smooth">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      <div className="shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shadow-sm
                          ${msg.role === 'user' 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' 
                            : 'bg-emerald-600 text-white'}`}
                        >
                          {msg.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                        </div>
                      </div>

                      <div className={`px-5 py-3.5 rounded-2xl text-base leading-relaxed shadow-sm relative group markdown-body
                        ${msg.role === 'user' 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm' 
                          : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/50 rounded-tl-sm'}`}
                      >
                        {msg.imageBase64 && (
                          <div className="mb-3">
                            <img src={msg.imageBase64} className="max-h-64 rounded-md border border-zinc-700/50 shadow-md" alt="Attached" />
                          </div>
                        )}
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                        {msg.role === 'ai' && msg.content && (
                           <button 
                             onClick={() => speakText(msg.content)}
                             className="absolute -right-10 top-2 p-1.5 rounded-full text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                             title="Read Aloud"
                           >
                             <Volume2 size={18} />
                           </button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
                  <div className="flex gap-4 max-w-[85%] flex-row">
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm bg-emerald-600 text-white">
                        <Bot size={18} />
                      </div>
                    </div>
                    <div className="px-5 py-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 rounded-tl-sm flex items-center gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-10">
            <div className="max-w-3xl mx-auto relative">
              {uploadedImage && (
                <div className="mb-3 relative inline-block">
                  <img src={uploadedImage} alt="Uploaded preview" className="h-20 rounded-md border border-zinc-700 shadow-md" />
                  <button 
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 bg-zinc-800 border border-zinc-600 text-white rounded-full p-1 hover:bg-red-500 hover:border-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <form 
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 bg-zinc-900 border border-zinc-700 shadow-xl rounded-2xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all p-2"
              >
                {isSpeaking && (
                  <button 
                    type="button"
                    onClick={stopSpeaking}
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors mb-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    title="Stop AI Speaking"
                  >
                    <StopCircle size={18} />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={toggleVoiceRecognition}
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors mb-1
                    ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                  title={isListening ? "Stop Listening" : "Start Voice Input"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if(input.trim() && !isLoading) handleSendMessage(e as any);
                    }
                  }}
                  placeholder="Message InsightRAG..."
                  disabled={isLoading}
                  className="flex-1 max-h-48 min-h-[44px] bg-transparent text-zinc-100 placeholder:text-zinc-500 resize-none outline-none py-2.5 px-2 text-[15px]"
                  rows={1}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || (!input.trim() && !uploadedImage)}
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors mb-1"
                >
                  <Send size={16} className={(input.trim() || uploadedImage) && !isLoading ? "ml-0.5" : ""} />
                </button>
              </form>
              <div className="text-center text-xs text-zinc-500 mt-3">
                InsightRAG can make mistakes. Consider verifying important information.
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: PDF Viewer (Slide Over) */}
        <AnimatePresence>
          {showPdf && pdfUrl && (
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-[45%] min-w-[400px] bg-zinc-900 border-l border-zinc-800 flex flex-col z-20 shadow-2xl absolute right-0 top-0 bottom-0 md:relative"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950/50 shrink-0">
                <span className="font-medium text-zinc-300 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500"/> Document Viewer
                </span>
                <button 
                  onClick={() => setShowPdf(false)}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 bg-zinc-950/50 p-2">
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-full rounded-md border border-zinc-800 bg-white" 
                  title="PDF Viewer" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
