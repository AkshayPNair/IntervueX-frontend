"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner'
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CollaborativeEditor } from '@/components/CollaborativeEditor';
import { useCompiler } from '@/hooks/useCompiler';
import { judge0NameToMonaco } from '@/utils/languageMap'

interface VideoCallProps {
  roomId?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId: _roomId }) => {
  const { user } = useAuth();
  const [localName, setLocalName] = useState<string>('You');
  const [remoteName, setRemoteName] = useState<string>('Peer');

  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [compilerTab, setCompilerTab] = useState<'editor' | 'output'>('editor');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState<string>('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<'tab-switch' | 'window-blur' | null>(null);
  const { submit: submitRating, loading: ratingLoading } = useSubmitInterviewerRating();

  // Determine local user info for labels and identity
  const signalingUrl = process.env.NEXT_PUBLIC_URL || ''
  const { localVideoRef, remoteVideoRef, toggleAudio, toggleVideo, messages: rtcMessages, sendChat, remoteJoined, remoteVideoOn, onSignal, sendSignal } = useWebRTC(_roomId ?? 'default-room', signalingUrl)
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

  // Tab switch detection
  useEffect(() => {

    if (user?.role !== 'user') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendSignal({ type: 'visibility:hidden' });
        toast.custom((t) => (
          <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-500 font-medium text-white p-4 rounded-lg shadow-xl shadow-red-500/20">
            <span>Your action has been noticed by the interviewer</span>
            <X className="cursor-pointer ml-4 h-6 w-6 text-white transition-transform hover:scale-125" onClick={() => toast.dismiss(t)} />
          </div>
        ), { duration: Infinity });
      }
    };

    const handleWindowBlur = () => {
      sendSignal({ type: 'window:blur' });
      toast.custom((t) => (
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-500 font-medium text-white p-4 rounded-lg shadow-xl shadow-red-500/20">
          <span>Your action has been noticed by the interviewer</span>
          <X className="cursor-pointer ml-4 h-6 w-6 text-white transition-transform hover:scale-125" onClick={() => toast.dismiss(t)} />
        </div>
      ), { duration: Infinity });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [sendSignal, user?.role]);

  const handleEndCall = async () => {
    const bookingId = _roomId ?? ''
    if (!bookingId) return

    if (user?.role === 'user') {
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

  const validateComment = (input: string): string | null => {
    const trimmed = input.trim();

    if (!trimmed) {
      return 'Please provide a brief comment before submitting.';
    }

    if (input !== trimmed) {
      return 'Comment cannot start or end with spaces.';
    }

    if (trimmed.length <= 20) {
      return 'Comment must be longer than 20 characters.';
    }

    if (!/^[A-Za-z0-9 ]+$/.test(trimmed)) {
      return 'Comment can only include letters, numbers, and spaces.';
    }

    if (/^\d+$/.test(trimmed)) {
      return 'Comment cannot consist of numbers only.';
    }

    return null;
  };

  const handleSubmitRating = async () => {
    const commentValidationError = validateComment(comment);
    if (commentValidationError) {
      setCommentError(commentValidationError);
      return;
    }
    setCommentError(null);
    const Comment = comment.trim();
    const bookingId = _roomId ?? ''
    if (!bookingId) return
    await submitRating({ bookingId, rating, comment: Comment })
    await completeSession({ bookingId })
    setShowRating(false)
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }
  // Compiler state via hook (Monaco + Judge0)
  const { language, setLanguage, languageId, setLanguageId, languages, stdin, setStdin, code, setCode, output, setOutput, isRunning, runCode } = useCompiler();

  const [peerRunning, setPeerRunning] = useState(false);

  const runCodeAndShowOutput = async () => {
    if (!isCompilerOpen) setIsCompilerOpen(true);
    setCompilerTab('output');
    sendSignal({ type: 'compiler:tab', tab: 'output' });
    // notify peer running started
    sendSignal({ type: 'compiler:running', running: true });
    const text = await runCode();
    sendSignal({ type: 'compiler:output', output: text });
    sendSignal({ type: 'compiler:running', running: false });
    setCompilerTab('output');
    sendSignal({ type: 'compiler:tab', tab: 'output' });
  };

  // Chat state (UI only). Messages come from WebRTC data channel.
  const [message, setMessage] = useState('');

  const handleCompilerToggle = () => {
    const next = !isCompilerOpen;
    setIsCompilerOpen(next);
    // broadcast to peer so both see the same state
    sendSignal({ type: 'compiler:toggle', open: next });
    if (next) {
      sendSignal({ type: 'compiler:tab', tab: compilerTab })
    }
  };

  // listen for compiler toggle from peer
  useEffect(() => {
    const off = onSignal((msg) => {
      if (msg.type === 'compiler:toggle') {
        setIsCompilerOpen(!!msg.open);
      } else if (msg.type === 'compiler:tab') {
        if (!isCompilerOpen) setIsCompilerOpen(true);
        setCompilerTab(msg.tab === 'output' ? 'output' : 'editor');
      } else if (msg.type === 'compiler:output' && typeof msg.output === 'string') {
        // ensure output tab is visible and update text
        if (!isCompilerOpen) setIsCompilerOpen(true);
        setCompilerTab('output');
        setOutput(msg.output);
      } else if (msg.type === 'compiler:running') {
        setPeerRunning(!!msg.running);
      } else if (msg.type === 'compiler:language') {
        const nextId = Number(msg.languageId);
        setLanguageId(nextId);
        const label = typeof msg.label === 'string' ? msg.label : String(nextId);
        setLanguage(judge0NameToMonaco(nextId, label));
        setCode((prev) => `// Start coding together in ${label}...\n` + (prev || ''));
      } else if (msg.type === 'visibility:hidden') {
        setAlertType('tab-switch');
        setShowAlertModal(true);
      } else if (msg.type === 'window:blur') {
        setAlertType('window-blur');
        setShowAlertModal(true);
      }
    });
    return () => { if (typeof off === 'function') off(); };
  }, [onSignal, isCompilerOpen]);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  // const handleRunCode = () => {
  //   setIsRunning(true);
  //   setTimeout(() => {
  //     setOutput('55\n\nExecution completed successfully.');
  //     setIsRunning(false);
  //   }, 1500);
  // };

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
          <div className="w-full max-w-md rounded-2xl text-slate-100 p-8 border border-slate-700 shadow-2xl animate-in zoom-in-95"
            style={{
              background: 'linear-gradient(to bottom right, #0D1117, #0D1117, #3B0A58)'
            }}>

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
              onChange={(e) => {
                setComment(e.target.value);
                if (commentError) setCommentError(null);
              }}
              placeholder="Tell us more about your experience"
              className={`w-full min-h-28 rounded-lg border bg-slate-900/50 p-3 text-sm text-slate-200 placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117] transition-shadow
                         ${commentError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-purple-500'}`}
            />
            {commentError && (
              <p className="text-xs text-red-400 mb-4">{commentError}</p>
            )}

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

      {/* Tab Switch Modal */}
      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent className="text-slate-100 border border-slate-700"
          style={{
            background: 'linear-gradient(to bottom right, #0D1117, #0D1117, #3B0A58)'
          }}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {alertType === 'tab-switch' ? 'Tab Switch Detected' : 'Window Focus Lost'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-slate-400 mb-6">
              {alertType === 'tab-switch'
                ? 'The user has switched tabs or minimized the browser during the video call.'
                : 'The user has lost focus on the browser window, possibly by switching to another application or clicking on the taskbar.'
              }
            </p>
            <Button onClick={() => setShowAlertModal(false)} className="bg-purple-600 hover:bg-purple-700 text-white">
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">Code Editor</h3>
                    <div className="ml-2 inline-flex rounded-md overflow-hidden border border-gray-600">
                      <button
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${compilerTab === 'editor'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#2D333B] text-gray-300 hover:bg-[#353b43]'
                          }`}
                        onClick={() => { setCompilerTab('editor'); sendSignal({ type: 'compiler:tab', tab: 'editor' }); }}
                      >
                        Editor
                      </button>
                      <button
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${compilerTab === 'output'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#2D333B] text-gray-300 hover:bg-[#353b43]'
                          }`}
                        onClick={() => { setCompilerTab('output'); sendSignal({ type: 'compiler:tab', tab: 'output' }); }}
                      >
                        Output
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">


                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="control-success"
                    size="sm"
                    onClick={runCodeAndShowOutput}
                    disabled={isRunning || peerRunning}
                  >
                    {isRunning || peerRunning ? (
                      <Square className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {(isRunning || peerRunning) ? 'Running...' : 'Run'}
                  </Button>
                  <Select
                    value={String(languageId)}
                    onValueChange={(value) => {
                      const nextId = Number(value);
                      setLanguageId(nextId);
                      const found = languages.find(l => l.id === nextId);
                      const label = found?.name || String(nextId);
                      setLanguage(judge0NameToMonaco(nextId, label));
                      sendSignal({ type: 'compiler:language', languageId: nextId, label });
                      setCode((prev) => `// Start coding together in ${label}...\n` + (prev || ''));
                    }}
                  >
                    <SelectTrigger className="w-[220px] bg-[#2D333B] border-gray-600 text-gray-200 focus:ring-blue-500">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2D333B] border-gray-600 text-gray-200">
                      {Array.isArray(languages) && languages.length > 0 ? (
                        languages.map((l) => (
                          <SelectItem key={l.id} value={String(l.id)} className="focus:bg-blue-600 focus:text-white">
                            {l.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="63" className="focus:bg-blue-600 focus:text-white">JavaScript (Node.js)</SelectItem>
                          <SelectItem value="71" className="focus:bg-blue-600 focus:text-white">Python (3.8+)</SelectItem>
                          <SelectItem value="54" className="focus:bg-blue-600 focus:text-white">C++ (GCC)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Editor Section */}
                <div className={`flex-1 p-4 ${compilerTab === 'editor' ? '' : 'hidden'}`}>
                  <div className="w-full h-full border border-border rounded-lg overflow-hidden">
                    <CollaborativeEditor
                      roomId={_roomId ?? 'default-room'}
                      initialCode={code}
                      language={language}
                      onChangeCode={setCode}
                      sendSignal={sendSignal}
                      onSignal={onSignal}
                    />
                  </div>
                </div>

                {/* Output Section */}
                <div className={`flex-1 flex flex-col min-h-0 ${compilerTab === 'output' ? '' : 'hidden'}`}>
                  <div className="p-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Console Output</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-2 font-semibold">Program Input (stdin)</div>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      className="w-full h-24 bg-slate-900/50 border border-border rounded p-2 mb-3 text-foreground"
                      placeholder="Optional input to pass to the program"
                    />
                    <div className="mb-2 font-semibold">Output</div>
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
                    <div key={msg.id} className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>

                        {!isOwn && (
                          <p className="text-xs text-muted-foreground mb-1 px-3">{remoteName}</p>
                        )}

                        <div
                          className={`px-3 py-2 ${isOwn
                              ? 'bg-blue-600 text-white rounded-xl rounded-br-none'
                              : 'bg-[#2D333B] text-gray-200 rounded-xl rounded-bl-none'
                            }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>

                        <p className={`text-xs mt-1.5 px-3 ${isOwn
                            ? 'text-gray-400'
                            : 'text-gray-500'
                          }`}
                        >
                          {time}
                        </p>
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
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-white resize-y focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="relative bg-transparent border border-gray-600 hover:bg-[#2D333B]"
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoOn ? "control" : "control-muted"}
              size="control"
              onClick={() => { const next = !isVideoOn; setIsVideoOn(next); toggleVideo(next); }}
              className="relative bg-transparent border border-gray-600 hover:bg-[#2D333B]"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isChatOpen ? "control-active" : "control"}
              size="control"
              onClick={handleChatToggle}
              className="relative bg-transparent border border-gray-600 hover:bg-[#2D333B]"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant={isCompilerOpen ? "control-active" : "control"}
              size="control"
              onClick={handleCompilerToggle}
              className="relative bg-transparent border border-gray-600 hover:bg-[#2D333B]"
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