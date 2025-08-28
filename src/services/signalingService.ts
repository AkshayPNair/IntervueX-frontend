import {io, Socket} from 'socket.io-client'

let socket:Socket | null = null

export function getSocket(baseUrl:string){
    if(!socket){
        socket=io(baseUrl,{withCredentials:true,transports:['websocket']})
    }
    return socket
}

export function disconnectSocket(){
    if(socket){
        socket.disconnect()
        socket=null
    }
}