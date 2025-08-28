"use client";

import React from "react";
import { useParams } from "next/navigation";
import VideoCall from "@/components/VideoCall";

export default function UserVideoCallByRoom() {
  const params = useParams();
  const roomId = (params?.roomId as string) || "default-room";
  return (
    <div className="h-screen">
      <VideoCall roomId={roomId} />
    </div>
  );
}