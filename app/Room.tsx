"use client";

import Loader from "@/components/loader";
import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { ReactNode } from "react";
import { RoomProvider } from "../liveblocks.config";

const Room = ({ children }: { children: ReactNode }) => {
  return (
    <RoomProvider id="my-room" initialPresence={{ cursor: null, cursorColor: null, editingText: null }} initialStorage={{ canvasObjects: new LiveMap() }}>
      <ClientSideSuspense fallback={<Loader />}>{() => children}</ClientSideSuspense>
    </RoomProvider>
  );
};

export default Room;
