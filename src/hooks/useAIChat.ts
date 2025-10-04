import { useState, useEffect } from 'react';
import { generateAIResponse } from '@/services/aiService';

interface Message {
    id: string,
    text: string,
    isUser: boolean,
    timestamp: Date
}

const STORAGE_KEY = 'intervuex_ai_chat_messages';

export const useAIChat = () => {
    const [messages, setMessages] = useState<Message[]>(() => {
        // Load messages from localStorage on initialization
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Convert timestamp strings back to Date objects
                    return parsed.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                }
            } catch (error) {
                console.error('Error loading chat messages from localStorage:', error);
            }
        }
        return [];
    });
    const [isLoading, setIsLoading] = useState(false);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            } catch (error) {
                console.error('Error saving chat messages to localStorage:', error);
            }
        }
    }, [messages]);

    const sendMessage = async (userMessage: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userMessage,
            isUser: true,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            const aiResponse = await generateAIResponse(userMessage)
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            console.error('Error in AI chat:', error)
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I am unable to respond right now. Please try again later.',
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg])
        }finally{
            setIsLoading(false)
        }
    }

    const clearMessages=()=>{
        setMessages([]);
        // Clear from localStorage as well
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.error('Error clearing chat messages from localStorage:', error);
            }
        }
    }

    return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}