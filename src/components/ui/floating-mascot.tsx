"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { useAIChat } from '@/hooks/useAIChat';
import { usePathname } from 'next/navigation';

export const FloatingMascot = () => {
  const pathname = usePathname();
  const shouldShow = pathname.startsWith('/user') && !pathname.startsWith('/user/chat') && !pathname.includes('/sessions/');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll to bottom and focus input when popup opens
  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    if (isChatOpen) {
      inputRef.current?.focus();
    }
  }, [isChatOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!shouldShow) return null;

  return (
    <>
      <motion.div
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsChatOpen(true)}
      >
        <Bot className="w-8 h-8 text-white" />
      </motion.div>

      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
            />

            {/* Chat Popup */}
            <motion.div
              className="fixed bottom-24 right-8 z-50 w-96 h-[780px] min-w-64 max-w-screen-sm min-h-64 max-h-[80vh] bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col resize"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gradient-to-r from-purple-700 to-purple-900 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-white" />
                  <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="text-white hover:bg-purple-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="text-white hover:bg-purple-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400">
                      <p>Hello! I'm your AI assistant. How can I help you today?</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex flex-col ${message.isUser ? "items-end" : "items-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          message.isUser
                            ? "bg-purple-500 text-white"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-2">
                        {message.isUser ? (
                          <span className="text-xs text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                        ) : (
                          <>
                            <Bot className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Assistant</span>
                            <span className="text-xs text-gray-400 ml-1">
                              {formatTime(message.timestamp)}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      className="flex flex-col items-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-2xl">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-2">
                        <Bot className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Assistant</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};