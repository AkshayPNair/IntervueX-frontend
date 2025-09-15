"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  Monitor,
  MessageSquare,
  Play,
  Square,
  Terminal,
  Save,
  Upload,
  Send,
  X,
  MoreVertical,
  Smile,
  Star
} from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCompleteBooking } from '@/hooks/useCompleteBooking';
import { useAuth } from '@/hooks/useAuth';
import { getUserBookings, getInterviewerBookings } from '@/services/bookingService';
import { useRouter } from 'next/navigation';
import { useSubmitInterviewerRating } from '@/hooks/useSubmitInterviewerRating';

interface VideoCallProps {
  roomId?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId: _roomId }) => {
  const { user } = useAuth();
  const [localName, setLocalName] = useState<string>('You');
  const [remoteName, setRemoteName] = useState<string>('Peer');

  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState(0); 
  const [comment, setComment] = useState<string>('');
  const { submit: submitRating, loading: ratingLoading } = useSubmitInterviewerRating();

  // Determine local user info for labels and identity
  const signalingUrl = process.env.NEXT_PUBLIC_URL || ''
  const { localVideoRef, remoteVideoRef, toggleAudio, toggleVideo, messages: rtcMessages, sendChat, remoteJoined, remoteVideoOn } = useWebRTC(_roomId ?? 'default-room', signalingUrl)
  const { completeSession } = useCompleteBooking()
  const router = useRouter()

  // Load names from booking data depending on role
  useEffect(() => {
    let isActive = true;
    const loadNames = async () => {
      try {
        // roomId equals bookingId on this page
        const bookingId = _roomId ?? '';
        if (!bookingId) return;

        // Try from both endpoints based on role to be safe
        if (user?.role === 'interviewer') {
          const bookings = await getInterviewerBookings();
          const current = bookings.find(booking => booking.id === bookingId);
          if (current && isActive) {
            setLocalName(user.name);
            // interviewer sees candidate name (userName)
            setRemoteName(current.userName);
          }
        } else {
          const bookings = await getUserBookings();
          const current = bookings.find(b => b.id === bookingId);
          if (current && isActive) {
            setLocalName(user?.name || 'You');
            // user sees interviewer name (interviewerName)
            setRemoteName(current.interviewerName);
          }
        }
      } catch (e) {
        // Fallback to auth user name only
        setLocalName(user?.name || 'You');
      }
    };

    loadNames();
    return () => { isActive = false; };
  }, [_roomId, user]);

  const handleEndCall = async  () => {
    const bookingId = _roomId ?? ''
    if (!bookingId) return

    if(user?.role==='user'){
      setShowRating(true)
      return
    }

    await completeSession({ bookingId })
    // If interviewer, navigate to submit feedback page with bookingId
    if (user?.role === 'interviewer' && bookingId) {
      router.push(`/interviewer/feedback/${bookingId}?mode=create`)
      return
    }
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  const handleSubmitRating=async()=>{
    const bookingId=_roomId??''
    if(!bookingId) return
      await submitRating({bookingId,rating,comment})
      await completeSession({bookingId})
      setShowRating(false)
      if(typeof window !== 'undefined'){
        window.history.back()
      }
  }

  // Compiler state
  const [code, setCode] = useState(`// Welcome to the collaborative compiler
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`);
  const [output, setOutput] = useState('Output will appear here...');
  const [isRunning, setIsRunning] = useState(false);

  // Chat state (UI only). Messages come from WebRTC data channel.
  const [message, setMessage] = useState('');

  const handleCompilerToggle = () => {
    setIsCompilerOpen(!isCompilerOpen);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput('55\n\nExecution completed successfully.');
      setIsRunning(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendChat(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{
      background: 'linear-gradient(135deg, hsl(218, 23%, 8%), hsl(218, 23%, 8%), hsl(261, 60%, 18%))'
    }}>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-slate-100 p-8 border border-slate-700 shadow-2xl animate-in zoom-in-95">
            
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold mb-2">Rate Your Experience</h3>
              <p className="text-sm text-slate-400 mb-6">Your feedback helps us improve.</p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="group cursor-pointer"
                  aria-label={`Rate ${starValue} star`}
                >
                  <Star 
                    className={`h-8 w-8 transition-all duration-200 ease-in-out group-hover:scale-110 
                      ${(hoverRating || rating) >= starValue 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-slate-600'
                      }`
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience"
              className="w-full min-h-28 rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-200 placeholder:text-slate-500 mb-6
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0D1117] transition-shadow"
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowRating(false)} disabled={ratingLoading} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleSubmitRating} disabled={ratingLoading || rating === 0} className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-700 disabled:text-slate-400">
                {ratingLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 z-10 space-y-1">
        <div className="bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
          {/* <div className="flex items-center gap-1">
            <span className="text-white text-xs font-medium">00:00:00</span>
            <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse"></div>
          </div> */}
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Video Section */}
        <div className={`flex-1 flex transition-all duration-300 ${isCompilerOpen ? (isChatOpen ? 'w-1/3' : 'w-1/2') : (isChatOpen ? 'w-3/4' : 'w-full')
          }`}>
           <div className="flex-1 p-4 min-h-0">
            <div className={`h-full grid gap-4 ${isCompilerOpen ? 'grid-cols-1 grid-rows-2' : 'grid-cols-1 md:grid-cols-2'
              }`}>
              {/* Participant 1 */}
              <div className="relative bg-card rounded-xl overflow-hidden border border-border shadow-lg">
              <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover bg-black ${(!isVideoOn) ? 'opacity-20' : ''}`} />
                {/* Avatar overlay when local video is off */}
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl md:text-3xl font-semibold border border-border shadow-lg">
                      {(localName || 'You')?.[0]?.toUpperCase() || 'Y'}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs font-medium">{localName || 'You'}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {!isMicOn && (
                    <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                      <MicOff className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!isVideoOn && (
                    <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                      <VideoOff className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Participant 2 */}
              <div className="relative bg-card rounded-xl overflow-hidden border border-border shadow-lg">
              <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover bg-black ${(!remoteVideoOn) ? 'opacity-20' : ''}`} />
                {!remoteJoined && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center px-4">
                      <p className="text-white text-sm md:text-base font-medium">Waiting for {remoteName || 'other participant'} to join…</p>
                      </div>
                  </div>
                )}
                {/* Avatar overlay when remote video is off */}
                {remoteJoined && !remoteVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl md:text-3xl font-semibold border border-border shadow-lg">
                      {remoteName?.[0]?.toUpperCase() || 'P'}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs font-medium">{remoteName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compiler Panel */}
        {isCompilerOpen && (
          <div className={`transition-all duration-300 border-l border-border ${isChatOpen ? 'w-1/3' : 'w-1/2'
            }`}>
             <div className="h-full bg-compiler-bg flex flex-col min-h-0">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Code Editor</h3>
                  <div className="flex items-center gap-2">
                    
                    <Button variant="control" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="control-success"
                    size="sm"
                    onClick={handleRunCode}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <Square className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                  <select className="bg-secondary border border-border rounded px-3 py-1 text-sm text-foreground">
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>C++</option>
                  </select>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-4">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-muted border border-border rounded-lg p-4 text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Write your code here..."
                    spellCheck={false}
                  />
                </div>

                {/* Output Panel */}
                <div className="h-32 border-t border-border">
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Console Output</span>
                    </div>
                  </div>
                  <div className="p-4 h-20 overflow-y-auto">
                    <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                      {output}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {isChatOpen && (
          <div className={`w-80 transition-all duration-300 border-l border-border`}>
             <div className="h-full bg-chat-bg flex flex-col min-h-0">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Chat</h3>
                    <p className="text-sm text-muted-foreground">2 participants</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar">
                {rtcMessages.map((msg) => {
                  const isOwn = msg.self;
                  const time = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {!isOwn && (
                          <p className="text-xs text-muted-foreground mb-1 px-3">{remoteName}</p>
                        )}
                        <div className={`rounded-lg px-3 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                      style={{
                        minHeight: '38px',
                        maxHeight: '38px'
                      }}
                    />
                  </div>

                  <Button
                    variant="control-success"
                    size="sm"
                    className='mb-2'
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-video-control p-4 border-t border-border">
        <div className="flex items-center justify-center max-w-6xl mx-auto">
          {/* Center Controls Only */}
          <div className="flex items-center gap-3">
            <Button
              variant={isMicOn ? "control" : "control-muted"}
              size="control"
              onClick={() => { const next = !isMicOn; setIsMicOn(next); toggleAudio(next); }}
              className="relative"
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoOn ? "control" : "control-muted"}
              size="control"
              onClick={() => { const next = !isVideoOn; setIsVideoOn(next); toggleVideo(next); }}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isChatOpen ? "control-active" : "control"}
              size="control"
              onClick={handleChatToggle}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant={isCompilerOpen ? "control-active" : "control"}
              size="control"
              onClick={handleCompilerToggle}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="control-danger"
              size="control"
              onClick={handleEndCall}
            >
              <Phone className="h-5 w-5 rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;