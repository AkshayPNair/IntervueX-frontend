import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '@/services/signalingService';
import { PeerJoined, Peers } from '@/types/webrtc.types';

// Manages 1:1 WebRTC media + data channel chat
export function useWebRTC(roomId: string, signalingUrl: string) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [messages, setMessages] = useState<{ id: string; text: string; self: boolean; ts:number; }[]>([]);
  const [connectedPeer, setConnectedPeer] = useState<string | null>(null);
  const [remoteJoined, setRemoteJoined] = useState<boolean>(false);
  const [remoteVideoOn, setRemoteVideoOn] = useState<boolean>(false);

  

  const makingOfferRef = useRef(false);
  const politeRef = useRef(false);
  const pendingCandidatesRef = useRef<{candidate: RTCIceCandidateInit, from: string}[]>([]);
  const isConnectedRef = useRef(false);
  const isSettingRemoteRef = useRef(false);

  const sendChat = useCallback((text: string) => {
    if (!text.trim()) return;
    const dc = dataChannelRef.current;
    const ts = Date.now();
    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify({ type: 'chat', text }));
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text, self: true , ts}]);
    }
  }, []);

  const processPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) return;
    
    const candidates = pendingCandidatesRef.current.splice(0);
    for (const {candidate} of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[webrtc] added queued ice candidate');
      } catch (err) {
        console.warn('[webrtc] failed to add queued candidate:', err);
      }
    }
  }, []);

  const createPeerConnection = useCallback((peerId:string) => {
    console.log('[webrtc] creating new peer connection');
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && peerId && socketRef.current) {
        console.log('[webrtc] sending ice candidate');
        socketRef.current.emit('signaling:candidate', { 
           to: peerId, 
          candidate: e.candidate.toJSON() 
        });
      }
    };

    pc.ontrack = (e) => {
      console.log('[webrtc] received remote track');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
        // Watch remote video track enabled state
      const [remoteStream] = e.streams;
      const videoTrack = remoteStream.getVideoTracks()[0];
      if (videoTrack) {
        setRemoteVideoOn(videoTrack.enabled);
        videoTrack.onended = () => setRemoteVideoOn(false);
        videoTrack.onmute = () => setRemoteVideoOn(false);
        videoTrack.onunmute = () => setRemoteVideoOn(true);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[webrtc] connection state:', pc.connectionState);
      isConnectedRef.current = pc.connectionState === 'connected';
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[webrtc] ice connection state:', pc.iceConnectionState);
    };

    pcRef.current = pc;
    return pc;
  }, []);

  const setupDataChannel = useCallback((dc: RTCDataChannel) => {
    dataChannelRef.current = dc;
    dc.onopen = () => console.log('[webrtc] data channel opened');
    dc.onclose = () => console.log('[webrtc] data channel closed');
    dc.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === 'chat') {
          setMessages((prev) => [...prev, { 
            id: crypto.randomUUID(), 
            text: payload.text, 
            self: false,
            ts: typeof payload.ts === 'number' ? payload.ts : Date.now(), 
          }]);     
        }
      } catch (err) {
        console.warn('[webrtc] failed to parse data channel message:', err);
      }
    };
  }, []); 

  const setupLocalMedia = useCallback(async (pc: RTCPeerConnection) => {
    try {
      console.log('[webrtc] setting up local media');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      localStreamRef.current = stream;
      
      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      
      // Set local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('[webrtc] local media setup complete');
    } catch (err) {
      console.error('[webrtc] failed to setup local media:', err);
    }
  }, []);

  

  

  useEffect(() => {
    if (!roomId || !signalingUrl) return;

    // Prevent multiple connections from React strict mode
    if (socketRef.current) return;

    const socket = getSocket(signalingUrl);
    socketRef.current = socket;

    const initiatePeerConnection = async (peerId: string) => {
      if (pcRef.current) {
        console.log('[webrtc] peer connection already exists');
        return;
      }

      console.log('[webrtc] initiating peer connection to', peerId);
      setConnectedPeer(peerId);
      politeRef.current = false; // Initiator is impolite
      
      const pc = createPeerConnection(peerId);
      await setupLocalMedia(pc);
      
      // Create data channel
      const dc = pc.createDataChannel('chat');
      setupDataChannel(dc);
      
      // Create and send offer
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        if (socketRef.current) {
          socketRef.current.emit('signaling:offer', { to: peerId, sdp: offer });
          console.log('[webrtc] offer sent to', peerId);
        }
      } catch (err) {
        console.error('[webrtc] failed to create/send offer:', err);
      } finally {
        makingOfferRef.current = false;
      }
    };

    const handleIncomingPeer = async (peerId: string) => {
      if (pcRef.current) {
        console.log('[webrtc] peer connection already exists for incoming peer');
        return;
      }

      console.log('[webrtc] setting up for incoming peer', peerId);
      setConnectedPeer(peerId);
      politeRef.current = true; // Receiver is polite
      
      const pc = createPeerConnection(peerId);
      await setupLocalMedia(pc);
      
      // Set up data channel handler
      pc.ondatachannel = (e) => {
        setupDataChannel(e.channel);
      };
    };

    const handlePeers = async ({ peers }: Peers) => {
      console.log('[webrtc] peers received:', peers);
      setRemoteJoined(peers.length > 0);
      if (peers.length > 0 && !pcRef.current) {
        await initiatePeerConnection(peers[0]);
      }
    };

    const handlePeerJoined = async ({ socketId }: PeerJoined) => {
      console.log('[webrtc] peer joined:', socketId);
      setRemoteJoined(true);
      if (!pcRef.current) {
        await handleIncomingPeer(socketId);
      }
    };

    const handleOffer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      console.log('[webrtc] offer received from', from);
      
      if (!pcRef.current) {
        await handleIncomingPeer(from);
      }
      
      const pc = pcRef.current;
      if (!pc) return;

      const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';
      const ignoreOffer = !politeRef.current && offerCollision;
      
      if (ignoreOffer) {
        console.log('[webrtc] ignoring offer (impolite collision)');
        return;
      }

      try {
        isSettingRemoteRef.current = true;
        await pc.setRemoteDescription(sdp);
        console.log('[webrtc] remote offer set');
        
        // Process any pending candidates
        await processPendingCandidates();
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        if (socketRef.current) {
          socketRef.current.emit('signaling:answer', { to: from, sdp: answer });
          console.log('[webrtc] answer sent to', from);
        }
      } catch (err) {
        console.error('[webrtc] failed to handle offer:', err);
      } finally {
        isSettingRemoteRef.current = false;
      }
    };

    const handleAnswer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      console.log('[webrtc] answer received from', from);
      const pc = pcRef.current;
      if (!pc) return;

      try {
        isSettingRemoteRef.current = true;
        await pc.setRemoteDescription(sdp);
        console.log('[webrtc] remote answer set');
        
        // Process any pending candidates
        await processPendingCandidates();
      } catch (err) {
        console.error('[webrtc] failed to set remote answer:', err);
      } finally {
        isSettingRemoteRef.current = false;
      }
    };

    const handleCandidate = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      console.log('[webrtc] ice candidate received from', from);
      const pc = pcRef.current;
      if (!pc) return;

      if (!pc.remoteDescription || isSettingRemoteRef.current) {
        console.log('[webrtc] queuing ice candidate');
        pendingCandidatesRef.current.push({ candidate, from });
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[webrtc] ice candidate added');
      } catch (err) {
        console.warn('[webrtc] failed to add ice candidate:', err);
      }
    };

    const handlePeerLeft = () => {
      console.log('[webrtc] peer left');
      setConnectedPeer(null);
      setRemoteJoined(false);
      setRemoteVideoOn(false);
      isConnectedRef.current = false;
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      
      dataChannelRef.current = null;
      pendingCandidatesRef.current = [];
    };

    socket.on('signaling:peers', handlePeers);
    socket.on('signaling:peer-joined', handlePeerJoined);
    socket.on('signaling:offer', handleOffer);
    socket.on('signaling:answer', handleAnswer);
    socket.on('signaling:candidate', handleCandidate);
    socket.on('signaling:peer-left', handlePeerLeft);

    console.log('[webrtc] joining room', roomId);
    socket.emit('signaling:join', { roomId });

    return () => {
      console.log('[webrtc] cleaning up');
      
      // Clean up socket listeners
      socket.off('signaling:peers', handlePeers);
      socket.off('signaling:peer-joined', handlePeerJoined);
      socket.off('signaling:offer', handleOffer);
      socket.off('signaling:answer', handleAnswer);
      socket.off('signaling:candidate', handleCandidate);
      socket.off('signaling:peer-left', handlePeerLeft);
      
      // Clean up peer connection
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      
      // Clean up local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      
      // Reset refs
      socketRef.current = null;
      dataChannelRef.current = null;
      pendingCandidatesRef.current = [];
      isConnectedRef.current = false;
      isSettingRemoteRef.current = false;
      makingOfferRef.current = false;
      politeRef.current = false;
      setConnectedPeer(null);
    };
  }, [roomId, signalingUrl, createPeerConnection, setupLocalMedia, setupDataChannel, processPendingCandidates]);

  const toggleVideo = useCallback((on: boolean) => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = on;
      });
    }
  }, []);

  const toggleAudio = useCallback((on: boolean) => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = on;
      });
    }
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    messages,
    sendChat,
    toggleVideo,
    toggleAudio,
    connectedPeer,
    remoteJoined,
    remoteVideoOn,  
  };
}