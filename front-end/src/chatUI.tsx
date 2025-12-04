import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Menu, Plus, MessageSquare, 
  Paperclip, X, Zap, File as FileIcon, ImageIcon, Globe, Code,
  Loader2 // Imported Loader2 for the spinner
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// --- Types ---
interface Attachment {
  name: string;
  type: 'image' | 'file';
  url?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  // --- New Loading Fields ---
  isLoading?: boolean;
  loadingMessage?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

// --- Constants ---
const API_URL = "http://localhost:8000";

const AVAILABLE_TOOLS: Tool[] = [
  { id: 'web-search', name: 'Web Search', icon: <Globe className="h-4 w-4 text-blue-500"/>, description: 'Search the internet for current info' },
  { id: 'code-interpreter', name: 'Code Interpreter', icon: <Code className="h-4 w-4 text-green-500"/>, description: 'Run Python code for analysis' },
  { id: 'img-gen', name: 'Image Gen', icon: <ImageIcon className="h-4 w-4 text-purple-500"/>, description: 'Generate images from text' },
];

export default function ChatUI() {
  // --- State ---
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: Date.now().toString(), title: 'New Conversation', messages: [] }
  ]);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Global loading state (for input disabling)
  
  // UI State for Features
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const currentConversation = conversations.find(c => c.id === activeId);

  // --- Effects ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.messages, activeId]);

  // --- Handlers ---

  const handleCreateNewChat = () => {
    const newId = Date.now().toString();
    const newChat: Conversation = { id: newId, title: 'New Conversation', messages: [] };
    setConversations([newChat, ...conversations]);
    setActiveId(newId);
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveId(id);
    setIsSidebarOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    setIsToolMenuOpen(false);
  };

  // -- API Interaction --
  const handleSubmit = async () => {
    if ((!input.trim()) || !currentConversation || isLoading) return;

    const userMessageContent = input;
    const messageId = Date.now().toString();

    // 1. Add User Message
    const newUserMessage: Message = {
      id: messageId,
      role: 'user',
      content: userMessageContent,
      attachments: [] 
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeId) {
        const newTitle = conv.messages.length === 0 
          ? userMessageContent.slice(0, 30) + (userMessageContent.length > 30 ? '...' : '') 
          : conv.title;
        
        return {
          ...conv,
          title: newTitle,
          messages: [...conv.messages, newUserMessage]
        };
      }
      return conv;
    }));

    setInput('');
    setAttachments([]);
    setActiveTool(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      // 2. Add Assistant Placeholder with Loading State
      const assistantMsgId = (Date.now() + 1).toString();
      const initialAssistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        isLoading: true, // <--- Flag set to true
        loadingMessage: 'Analyzing request...' // <--- Initial status
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeId) {
          return { ...conv, messages: [...conv.messages, initialAssistantMessage] };
        }
        return conv;
      }));

      // 3. Call Backend API
      const response = await fetch(`${API_URL}/messaging`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageContent,
          preference_tags: [] 
        }),
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error('No response body');

      // 4. Handle Streaming Response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirstChunk = true; // Track first chunk to clear loading state

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        if (chunkValue || done) {
          setConversations(prev => prev.map(conv => {
            if (conv.id === activeId) {
              const updatedMessages = [...conv.messages];
              const lastMsgIndex = updatedMessages.length - 1;
              
              if (lastMsgIndex >= 0 && updatedMessages[lastMsgIndex].role === 'assistant') {
                const currentMsg = updatedMessages[lastMsgIndex];
                if(chunkValue.startsWith("[PHASE:LOADING]")) {
                  const trimmed = chunkValue.replace("[PHASE:LOADING]", "").trim();
                  updatedMessages[lastMsgIndex] = {
                    ...currentMsg,
                    content: currentMsg.content,
                    loadingMessage: trimmed
                  };
                }
                else {
                  updatedMessages[lastMsgIndex] = {
                    ...currentMsg,
                    content: currentMsg.content + chunkValue,
                    isLoading: false,
                    loadingMessage: undefined
                  };
                }
              }
              return { ...conv, messages: updatedMessages };
            }
            return conv;
          }));
          
          if (isFirstChunk) isFirstChunk = false;
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      // Update the loading message to an error state or remove it
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeId) {
          const updatedMessages = [...conv.messages];
          const lastMsgIndex = updatedMessages.length - 1;
          
          if (lastMsgIndex >= 0 && updatedMessages[lastMsgIndex].role === 'assistant') {
             // If we failed while loading, switch to error message
             if(updatedMessages[lastMsgIndex].isLoading) {
                 updatedMessages[lastMsgIndex] = {
                     ...updatedMessages[lastMsgIndex],
                     isLoading: false,
                     content: "Sorry, I encountered an error connecting to the server."
                 }
             } else {
                 // If we failed mid-stream
                 updatedMessages.push({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, the connection was interrupted."
                 });
             }
          }
          return { ...conv, messages: updatedMessages };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* --- Sidebar --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <Button 
            onClick={handleCreateNewChat}
            className="w-full justify-start gap-2 mb-6 bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          <div className="flex-1 overflow-y-auto space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider px-2">Recent</h3>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectChat(conv.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors text-left
                  ${activeId === conv.id 
                    ? 'bg-gray-200 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col h-full w-full max-w-full relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 border-b border-gray-200 bg-white">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-4 font-semibold text-gray-900 truncate">
            {currentConversation?.title || 'New Chat'}
          </span>
        </div>

        {/* Messages Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Zap className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">How can I help you today?</p>
              </div>
            ) : (
              currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-2 ${message.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                    
                    {/* Text Bubble */}
                    <div
                      className={`rounded-2xl px-5 py-3 shadow-sm ${
                        message.role === 'user'
                          ? ' text-white rounded-br-none bg-neutral-800'
                          : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {/* Loading State UI */}
                      {message.isLoading ? (
                        <div className="flex items-center gap-3 text-gray-500 py-1">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-sm font-medium animate-pulse">
                            {message.loadingMessage || 'Thinking...'}
                          </span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Input Area with Toolbar --- */}
        <div className="bg-white px-4 py-4 pb-6">
          <div className="max-w-3xl mx-auto">
            
            {/* The Input "Card" */}
            <div className={`
              relative border border-gray-300 rounded-xl bg-white shadow-sm transition-all
              ${isToolMenuOpen ? 'ring-2 ring-blue-100 border-blue-400' : 'focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400'}
            `}>
              
              {/* Selected Tool Indicator (Top Banner) */}
              {activeTool && (
                 <div className="flex items-center justify-between bg-blue-50 px-4 py-1.5 rounded-t-xl border-b border-blue-100 text-xs text-blue-700">
                    <div className="flex items-center gap-2 font-medium">
                      {activeTool.icon}
                      Using {activeTool.name}
                    </div>
                    <button onClick={() => setActiveTool(null)} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                 </div>
              )}

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="flex gap-3 p-3 pb-0 overflow-x-auto">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative group flex flex-col items-center w-24 flex-shrink-0">
                      <div className="w-full h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="preview" 
                            className="w-full h-full object-cover opacity-80" 
                          />
                        ) : (
                          <FileIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 w-full truncate text-center mt-1">
                        {file.name}
                      </span>
                      <button 
                        onClick={() => removeAttachment(idx)}
                        className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Area */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Message Food Bot..."
                className="min-h-[60px] max-h-[200px] border-0 focus:ring-0 focus-visible:ring-0 shadow-none resize-none py-3 px-4 text-gray-900 placeholder:text-gray-400 bg-transparent"
                rows={1}
              />

              {/* Bottom Toolbar */}
              <div className="flex justify-between items-center p-2 pl-3">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 ${isToolMenuOpen ? 'bg-gray-100 text-gray-900' : ''}`}
                      onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                    >
                      <Zap className="h-5 w-5" />
                    </Button>

                    {isToolMenuOpen && (
                      <div className="absolute bottom-10 left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 p-1 animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
                          Select Tool
                        </div>
                        {AVAILABLE_TOOLS.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => handleToolSelect(tool)}
                            className="w-full text-left flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
                          >
                            <div className="mt-0.5 p-1.5 bg-gray-50 group-hover:bg-white rounded-md border border-gray-100 group-hover:border-gray-200">
                              {tool.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                              <div className="text-xs text-gray-500">{tool.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </div>

                <Button
                  onClick={handleSubmit}
                  size="icon"
                  disabled={isLoading || (!input.trim() && attachments.length === 0)}
                  className="h-8 w-8 rounded-lg disabled:bg-gray-100 disabled:text-gray-300 text-white transition-all shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

            </div>
            
            <p className="text-xs text-gray-400 text-center mt-3">
              Food Chatbot can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}