export interface Conversation {
    id: string;
    userId: string;
    interviewerId: string;
     userName?: string;
    interviewerName?: string;
    lastMessage?: string;
    unreadForUser?: number;
    unreadForInterviewer?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message{
    id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}