'use client'

import React from "react";
import nextDynamic from "next/dynamic";
import { useParams } from "next/navigation";

const VideoCall = nextDynamic(() => import("@/components/VideoCall"), {
  ssr: false,
});

export const dynamic = "force-dynamic";

export default function UserVideoCallByRoom() {
  const params = useParams();
  const roomId = (params?.roomId as string) || "default-room";

  return (
    <div className="h-screen">
      <VideoCall roomId={roomId} />
    </div>
  );
}
