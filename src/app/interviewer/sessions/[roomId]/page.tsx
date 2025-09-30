"use client";

import React from "react";
import { useParams } from "next/navigation";
import nextDynamic from "next/dynamic";

const VideoCall = nextDynamic(() => import("@/components/VideoCall"), {
  ssr: false,
});

export const dynamic = 'force-dynamic';

export default function InterviewerVideoCallByRoom() {
  const params = useParams();
  const roomId = (params?.roomId as string) || "default-room";
  return (
    <div className="h-screen">
      <VideoCall roomId={roomId} />
    </div>
  );
}