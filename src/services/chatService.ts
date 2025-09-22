import api from './api'
import { Conversation,Message } from '@/types/chat.types'

export const startOrGetConversation=async (interviewerId:string):Promise<Conversation>=>{
    const response=await api.post('/chat/conversation',{interviewerId})
    return response.data
}

export const listConversations = async():Promise<Conversation[]>=>{
    const response=await api.get('/chat/conversations')
    return response.data
}

export const listMessages=async(conversationId:string,opts?:{limit?:number,before?:string}):Promise<Message[]>=>{
    const response=await api.get(`/chat/${conversationId}/messages`,{params:opts})
    return response.data
}

export const markConversationRead=async (conversationId:string):Promise<void>=>{
    await api.patch(`/chat/${conversationId}/read`,{})
}

export const sendMessage=async(conversationId:string,recipientId:string,text:string):Promise<Message>=>{
    const response=await api.post(`/chat/${conversationId}/messages`,{recipientId,text})
    return response.data
}