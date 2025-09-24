import api from './api'
import { API_ROUTES } from '../constants/apiRoutes';
import { Conversation,Message } from '@/types/chat.types'

export const startOrGetConversation=async (interviewerId:string):Promise<Conversation>=>{
    const response=await api.post(API_ROUTES.CHAT.CREATE_CONVERSATION,{interviewerId})
    return response.data
}

export const listConversations = async():Promise<Conversation[]>=>{
    const response=await api.get(API_ROUTES.CHAT.CONVERSATIONS)
    return response.data
}

export const listMessages=async(conversationId:string,opts?:{limit?:number,before?:string}):Promise<Message[]>=>{
    const response=await api.get(API_ROUTES.CHAT.MESSAGES(conversationId),{params:opts})
    return response.data
}

export const markConversationRead=async (conversationId:string):Promise<void>=>{
    await api.patch(API_ROUTES.CHAT.MARK_READ(conversationId),{})
}

export const sendMessage=async(conversationId:string,recipientId:string,text:string):Promise<Message>=>{
    const response=await api.post(API_ROUTES.CHAT.SEND_MESSAGE(conversationId),{recipientId,text})
    return response.data
}