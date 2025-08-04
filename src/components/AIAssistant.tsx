import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Search, Loader2, ExternalLink, Globe, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { AIMessage, College } from '../types';
import { aiService, SearchResult } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  colleges: College[];
  onCollegeUpdate: (updates: Partial<College> & { id: string }) => void;
}

type MessageStateType = AIMessage[];

export default function AIAssistant({ colleges, onCollegeUpdate }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI college application assistant. I can help you research colleges, find current deadlines, track requirements, and discover scholarships. I have access to real-time web search to get you the most up-to-date information!\n\nTry asking me about:\n• Specific university requirements\n• Application deadlines\n• Scholarship opportunities\n• Admission statistics\n• Application tips',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

  setMessages((prev: AIMessage[]) => [...prev, userMessage]);
  const currentInput = inputValue;
  setInputValue('');
  setIsProcessing(true);
  setApiError('');
  setSearchResults([]);    // Add thinking message
    const thinkingMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Let me search for the latest information and analyze your question...',
      timestamp: new Date().toISOString(),
      isSearching: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await aiService.processQuery(currentInput, colleges, true);
      
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

      // Handle suggestions (future enhancement)
      if (response.suggestions && response.suggestions.length > 0) {
        // Could show suggestion UI here
        console.log('AI Suggestions:', response.suggestions);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      
      setMessages(prev => {
        const withoutThinking = prev.filter(msg => !msg.isSearching);
        return [...withoutThinking, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `I encountered an error while processing your request: ${errorMessage}\n\nPlease make sure your API keys are properly configured in your .env.local file, or try asking a different question.`,
          timestamp: new Date().toISOString()
        }];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "What are Stanford's application requirements for 2025?",
    "Find scholarship opportunities for international students",
    "What's the average GPA for MIT admissions?",
    "Compare application deadlines for all my colleges"
  ];

  return (
    <div 
      className={`${
        isFullScreen 
          ? 'fixed inset-0 z-50 bg-white' 
          : 'w-80 border-l'
      } bg-white border-gray-200 flex flex-col h-full transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">AI Assistant</h2>
          <div className="ml-auto flex items-center gap-2">
            <Globe className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600">Live</span>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
        <p className="text-xs text-gray-600 mt-1">Real-time college research & advice</p>
        
        {apiError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>API Error: Check your environment setup</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
            }`}>
              {message.type === 'user' ? (
                <span className="text-sm font-medium">You</span>
              ) : message.isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className={`flex-1 ${isFullScreen ? 'max-w-2xl' : 'max-w-xs'} ${message.type === 'user' ? 'text-right' : ''}`}>
              <div className={`rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.isSearching ? (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="text-sm">{message.content}</span>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Search Results Panel */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Search className="w-3 h-3" />
              Sources ({searchResults.length})
            </h4>
            <button
              onClick={() => setShowSearchResults(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            {searchResults.slice(0, 3).map((result, index) => (
              <div key={index} className="text-xs">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {result.title.substring(0, 50)}...
                  <ExternalLink className="w-2 h-2" />
                </a>
                <p className="text-gray-600 mt-1">{result.content.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-700 mb-2">Try asking:</p>
          <div className="space-y-1">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputValue(prompt)}
                className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
              >
                • {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about colleges, deadlines, requirements..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <span>Web search enabled</span>
          </div>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}