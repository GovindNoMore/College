import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Bot, Send, Search, Loader2, ExternalLink, Globe, AlertCircle, Maximize2, Minimize2, MessageSquare, Sparkles } from 'lucide-react';
import { AIMessage, College, UserProfile } from '../types';
import { aiService, SearchResult } from '../services/aiService';

interface AIAssistantProps {
  colleges: College[];
  profile: UserProfile | null;
  onCollegeUpdate: (updates: Partial<College> & { id: string }) => void;
  onAddCollege: (data: any) => void;
}

export default function AIAssistant({ colleges, profile, onCollegeUpdate, onAddCollege }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi${profile?.name ? ` ${profile.name}` : ''}! 👋 I'm your AI college application assistant. I can help you with:\n\n• **Research colleges** - Find requirements, deadlines, and admission stats\n• **Track deadlines** - Get reminders for upcoming dates\n• **Discover scholarships** - Find funding opportunities\n• **Application tips** - Get personalized advice\n• **Compare colleges** - Analyze your options\n\nI have access to real-time web search for the most current information. What would you like to explore?`,
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxRetries = 3;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-focus input when not processing
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  const personalizedPrompts = useMemo(() => {
    const basePrompts = [
      "What are the application requirements for my colleges?",
      "Find scholarship opportunities for international students",
      "Compare admission statistics for my college list",
      "What are the upcoming deadlines I should know about?"
    ];

    if (colleges.length > 0) {
      const collegeNames = colleges.slice(0, 2).map(c => c.name).join(' and ');
      return [
        `What are ${collegeNames}'s application requirements for 2025?`,
        `Find scholarship opportunities at ${collegeNames}`,
        `Compare ${collegeNames} admission statistics`,
        "Analyze my college list and suggest improvements"
      ];
    }

    return basePrompts;
  }, [colleges]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsProcessing(true);
    setApiError('');
    setSearchResults([]);
    setRetryCount(0);

    // Add thinking message with more engaging content
    const thinkingMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '🔍 Searching for the latest information and analyzing your question...',
      timestamp: new Date().toISOString(),
      isSearching: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await aiService.processQuery(currentInput, colleges, true, profile);
      
      // Remove thinking message and add actual response
      setMessages(prev => {
        const withoutThinking = prev.filter(msg => !msg.isSearching);
        return [...withoutThinking, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString()
        }];
      });

      // Set search results if available
      if (response.searchResults && response.searchResults.length > 0) {
        setSearchResults(response.searchResults);
        setShowSearchResults(true);
      }

      // Handle college modal suggestions
      if (response.suggestions?.some(s => s.type === 'openCollegeModal')) {
        const collegeSuggestion = response.suggestions.find(s => s.type === 'openCollegeModal');
        if (collegeSuggestion?.data?.name) {
          // Dispatch custom event to open college modal
          window.dispatchEvent(new CustomEvent('openCollegeModal', {
            detail: { name: collegeSuggestion.data.name }
          }));
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('AI Assistant Error:', error);
      
      setApiError(errorMessage);
      
      setMessages(prev => {
        const withoutThinking = prev.filter(msg => !msg.isSearching);
        return [...withoutThinking, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `I encountered an error while processing your request. ${
            retryCount < maxRetries 
              ? "Let me try a different approach or you can rephrase your question." 
              : "Please check if your API keys are configured correctly."
          }\n\n**Error:** ${errorMessage}`,
          timestamp: new Date().toISOString()
        }];
      });
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, isProcessing, colleges, profile, retryCount, maxRetries]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  }, [handleSendMessage]);

  const clearConversation = useCallback(() => {
    setMessages([{
      id: '1',
      type: 'assistant',
      content: `Hi${profile?.name ? ` ${profile.name}` : ''}! 👋 I'm your AI college application assistant. I can help you with research, deadlines, scholarships, and more. What would you like to explore?`,
      timestamp: new Date().toISOString()
    }]);
    setSearchResults([]);
    setShowSearchResults(false);
    setApiError('');
  }, [profile]);

  return (
    <div 
      className={`${
        isFullScreen 
          ? 'fixed inset-0 z-50 bg-white' 
          : 'w-80 border-l'
      } bg-white border-gray-200 flex flex-col h-full transition-all duration-300 shadow-xl`}
    >
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-6 h-6 text-blue-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
            <div className="flex items-center gap-2 text-xs">
              <Globe className="w-3 h-3 text-green-500" />
              <span className="text-green-600 font-medium">Live Research</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{colleges.length} colleges tracked</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearConversation}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullScreen ? "Exit full screen" : "Full screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        {apiError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Connection Issue</div>
              <div className="mt-1">Check your API configuration or try again</div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.isSearching
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              }`}>
                {message.type === 'user' ? (
                  <span className="text-sm font-medium">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                ) : message.isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={`flex-1 ${isFullScreen ? 'max-w-3xl' : 'max-w-xs'} ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-xl p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-900 border border-gray-100'
                }`}>
                  {message.isSearching ? (
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <span className="text-sm">{message.content}</span>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {message.type === 'assistant' && !message.isSearching && (
                    <>
                      <span>•</span>
                      <Sparkles className="w-3 h-3" />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Search Results Panel */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                Sources ({searchResults.length})
              </h4>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              >
                Hide
              </button>
            </div>
            <div className="space-y-3">
              {searchResults.slice(0, 4).map((result, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-start gap-2 leading-tight"
                  >
                    <span className="flex-1">{result.title}</span>
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  </a>
                  <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                    {result.content.substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Prompts - Show when conversation is fresh */}
      {messages.length <= 2 && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Try asking:
          </p>
          <div className="space-y-2">
            {personalizedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-blue-100"
                disabled={isProcessing}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about colleges, requirements, scholarships..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
            disabled={isProcessing}
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Real-time search enabled</span>
          </div>
          <span>{inputValue.length}/500</span>
        </div>
      </div>
    </div>
  );
}
