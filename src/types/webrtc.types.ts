export type SignalOffer={to:string; sdp:RTCSessionDescriptionInit}
export type SignalAnswer={to:string; sdp:RTCSessionDescriptionInit}
export type SignalCandidate={to:string; candidate:RTCIceCandidateInit}

export type PeerJoined={socketId:string}
export type Peers={peers:string[]}

