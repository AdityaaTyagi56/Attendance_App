import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleIcon, XIcon, PaperAirplaneIcon } from './icons';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.217:5001/api';
console.log('[Chatbot] API Base URL:', API_BASE_URL);

const SYSTEM_PROMPT = `You are a helpful AI assistant for the IIIT-Naya Raipur Attendance Portal. Your purpose is to guide users and answer questions about the application's features and how to use them.

The portal has two main user types: Teachers and Students.

Teacher features include:
- A dashboard with quick access to all functions.
- Managing students: adding new students, editing their details (including photos and credentials), and removing them.
- Managing courses: creating courses, assigning a course code, and enrolling students into them.
- Taking attendance: selecting a course and date, then marking students as present.
- Generating AI-powered reports: analyzing attendance data for a specific course to identify trends, calculate overall percentages, and highlight at-risk students (those with low attendance).

Student features include:
- A personalized dashboard showing all enrolled courses.
- Viewing detailed attendance for each course, including overall percentage, total classes, and a history of present/absent days.

Important constraints:
- You DO NOT have access to any user-specific data. This includes student names, course details, or actual attendance records. Do not pretend you can access this information.
- Provide general guidance and instructions on how to use the features.
- You can also answer general questions about IIIT-Naya Raipur or related educational topics.
- Always format your answers clearly using Markdown for better readability.`;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const startChat = () => {
    setIsOpen(true);
    setMessages([{ role: 'model', text: 'Hello! How can I help you with the IIIT-NR portal today?' }]);
    setConversationHistory([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation context
      const context = conversationHistory.join('\n') + `\nUser: ${currentInput}\nAssistant:`;
      const fullPrompt = `${SYSTEM_PROMPT}\n\n${context}`;

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      const modelResponse = data.response || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
      setConversationHistory(prev => [...prev, `User: ${currentInput}`, `Assistant: ${modelResponse}`]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.name === 'AbortError') {
        errorText = 'Request timeout - the AI is taking too long to respond. Please try a shorter question.';
      }
      const errorMessage = { role: 'model' as const, text: errorText };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    console.log('Toggle chat clicked, current state:', isOpen);
    if (isOpen) {
      setIsOpen(false);
    } else {
      startChat();
    }
  };

  const MarkdownRenderer = ({ text, role }: { text: string; role: 'user' | 'model' }) => {
    const proseClasses = role === 'user' ? 'prose-invert' : 'dark:prose-invert';
    return (
        <div className={`prose prose-sm max-w-none ${proseClasses}`}>
            <ReactMarkdown
                components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-[max(2rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] bg-brand text-on-surface p-4 rounded-full shadow-glass hover:opacity-90 active:scale-95 transition-all transform hover:scale-105 z-[100]"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <XIcon className="w-7 h-7" /> : <ChatBubbleIcon className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-[calc(7rem+env(safe-area-inset-bottom))] right-4 w-[calc(100%-2rem)] max-w-sm h-[32rem] max-h-[calc(100vh-8rem)] bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl shadow-glass flex flex-col z-[100] border border-white/10 overflow-hidden right-[max(1rem,env(safe-area-inset-right))]">
          <header className="p-4 flex justify-between items-center border-b border-white/10 bg-transparent">
            <h3 className="font-bold font-serif text-on-surface dark:text-on-surface-dark text-lg">IIIT-NR Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant dark:text-on-surface-dark-variant hover:text-on-surface dark:hover:text-on-surface-dark transition-colors p-1 rounded-full hover:bg-white/10">
                <XIcon className="w-5 h-5"/>
            </button>
          </header>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-transparent">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm py-2 px-4 shadow-sm ${msg.role === 'user' ? 'rounded-2xl rounded-br-lg bg-brand text-on-surface' : 'rounded-2xl rounded-bl-lg bg-surface-variant/80 dark:bg-black/20 text-on-surface dark:text-on-surface-dark'}`}>
                  <MarkdownRenderer text={msg.text} role={msg.role} />
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length-1]?.role === 'user' && (
              <div className="flex justify-start">
                  <div className="py-3 px-4 rounded-2xl rounded-bl-lg bg-black/20">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2 w-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-on-surface-variant rounded-full animate-bounce"></span>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center space-x-2 bg-transparent">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 py-2 px-3 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand bg-black/20 text-on-surface dark:text-on-surface-dark placeholder-on-surface-variant dark:placeholder-on-surface-dark-variant transition-all"
              disabled={isLoading}
            />
            <button type="submit" className="bg-brand text-on-surface p-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:bg-on-surface-variant transition-all" disabled={isLoading || !input.trim()}>
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;