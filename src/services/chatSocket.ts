import {io,Socket} from 'socket.io-client'

let chatSocket:Socket|null = null

export function getChatSocket(baseUrl:string){
    if(!chatSocket){
        chatSocket=io(baseUrl,{withCredentials:true,transports:['websocket']})
    }
    return chatSocket
}

export function disconnectChatSocket(){
    if(chatSocket){
        chatSocket.disconnect()
        chatSocket=null
    }
}