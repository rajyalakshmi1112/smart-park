import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  MapPin,
  ExternalLink,
  RotateCcw,
  Zap,
  Compass,
  Brain,
  AlertCircle,
  ChevronDown,
  Navigation,
  Info
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingChunks?: Array<{
    maps?: {
      uri?: string;
      title?: string;
      placeAnswerSources?: {
        reviewSnippets?: Array<{ reviewText?: string }>;
      };
    };
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  webSearchQueries?: string[];
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: (facilityId?: string) => void;
}

type ModelTier = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  onNavigateToBooking
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "👋 **Hello! I'm your SmartPark Vizag Assistant.**\n\nI can help you locate prototype parking bays across Visakhapatnam, check rates and hours, navigate to nearby landmarks with **Google Maps data**, or plan your route.\n\nHow can I help you park in Vizag today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelTier>('gemini-3.5-flash');
  const [useMapsGrounding, setUseMapsGrounding] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Format payload for backend server endpoint
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          text: m.text
        })),
        model: selectedModel,
        useMapsGrounding: useMapsGrounding || selectedModel === 'gemini-3.5-flash'
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error status ${response.status}`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.text || 'I have retrieved the parking and route details for you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks || [],
        webSearchQueries: data.webSearchQueries || [],
        modelUsed: data.modelUsed || selectedModel
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat generation error:', err);
      setErrorMessage(err.message || 'Unable to connect to the SmartPark Assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: "Conversation cleared. How can I assist with your Visakhapatnam parking plans?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
    setErrorMessage(null);
  };

  const quickPrompts = [
    'Where is the closest parking to CMR Central Maddilapalem?',
    'Find parking near CMR Central Gajuwaka',
    'Which facilities have EV charging at Inorbit Mall?',
    'What are the rates and operating hours at CMR Maddilapalem?'
  ];

  // Helper to render markdown-like text nicely
  const formatMessageText = (text: string) => {
    // Process lines
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Bold handling
      const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed my-0.5">
            {formattedLine}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={index} className="ml-2 text-xs text-slate-700 leading-relaxed my-1 font-medium">
            {formattedLine}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={index} className="h-1.5" />;
      }
      return (
        <p key={index} className="text-xs text-slate-700 leading-relaxed my-1">
          {formattedLine}
        </p>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="SmartPark Vizag Gemini Chatbot"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  SmartPark AI Concierge
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Visakhapatnam Parking & Google Maps Navigator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model Selection & Grounding Config Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Model:</span>
            <div className="flex rounded-lg p-0.5 bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.5-flash')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  selectedModel === 'gemini-3.5-flash'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="gemini-3.5-flash: General tasks with live Google Maps grounding"
              >
                <Compass className="w-3 h-3 text-emerald-600" />
                <span>3.5 Flash (Maps)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="gemini-3.1-flash-lite: Fast responses for quick questions"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>3.1 Lite (Fast)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-white text-purple-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="gemini-3.1-pro-preview: Deep reasoning for complex route and trip itineraries"
              >
                <Brain className="w-3 h-3 text-purple-600" />
                <span>3.1 Pro (Trip Planner)</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={useMapsGrounding || selectedModel === 'gemini-3.5-flash'}
              disabled={selectedModel === 'gemini-3.5-flash'}
              onChange={(e) => setUseMapsGrounding(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
            />
            <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              Google Maps Data
            </span>
          </label>
        </div>

        {/* Message Thread (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const mapsChunks = message.groundingChunks?.filter((c) => c.maps?.uri);

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Message Content */}
                  {isUser ? (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  ) : (
                    <div>{formatMessageText(message.text)}</div>
                  )}

                  {/* Google Maps Grounding Links (Mandatory Requirement) */}
                  {mapsChunks && mapsChunks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Google Maps Place Data</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mapsChunks.map((chunk, cIdx) => {
                          const mapData = chunk.maps;
                          if (!mapData?.uri) return null;

                          return (
                            <a
                              key={cIdx}
                              href={mapData.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between gap-2 p-2 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all group"
                            >
                              <div className="min-w-0">
                                <div className="text-[11px] font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                                  {mapData.title || 'Vizag Location'}
                                </div>
                                {mapData.placeAnswerSources?.reviewSnippets?.[0]?.reviewText && (
                                  <div className="text-[10px] text-slate-500 line-clamp-1 italic">
                                    &ldquo;{mapData.placeAnswerSources.reviewSnippets[0].reviewText}&rdquo;
                                  </div>
                                )}
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Timestamp & model badge */}
                  <div
                    className={`mt-2 flex items-center justify-end gap-2 text-[10px] ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {!isUser && message.modelUsed && (
                      <span className="font-mono text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200">
                        {message.modelUsed}
                      </span>
                    )}
                    <span>{message.timestamp}</span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing/Loading State */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">
                  {selectedModel === 'gemini-3.5-flash'
                    ? 'Retrieving Google Maps Vizag places...'
                    : selectedModel === 'gemini-3.1-pro-preview'
                      ? 'Synthesizing parking route plan...'
                      : 'Thinking quickly...'}
                </span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Unable to complete request</div>
                <div className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</div>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-medium text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full px-3 py-1 whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about CMR Maddilapalem, CMR Gajuwaka, Inorbit Mall, EV charging, or rates..."
                disabled={isLoading}
                className="w-full pl-3.5 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Powered by Gemini 3.5 & Google Maps Grounding</span>
            <span>Simulated Prototype Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
