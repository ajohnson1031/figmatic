"use client";

import { Comments } from "@/components/comments/Comments";
import CursorChat from "@/components/cursor/CursorChat";
import LiveCursors from "@/components/cursor/LiveCursors";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { shortcuts } from "@/constants";
import useInterval from "@/hooks/useInterval";
import { useBroadcastEvent, useEventListener, useMyPresence } from "@/liveblocks.config";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import { useCallback, useEffect, useState } from "react";
import FlyingReaction from "./reaction/FlyingReaction";
import ReactionSelector from "./reaction/ReactionButton";

interface CanvasRefProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
}

const Live = ({ canvasRef, undo, redo }: CanvasRefProps) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reaction, setReaction] = useState<Reaction[]>([]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReaction((reaction) => reaction.filter((r) => r.timestamp > Date.now() - 4000));
  }, 1000);

  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReaction((reactions) => reactions.concat([{ point: { x: cursor.x, y: cursor.y }, value: cursorState.reaction, timestamp: Date.now() }]));
      broadcast({ x: cursor.x, y: cursor.y, value: cursorState.reaction });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event;
    setReaction((reactions) => reactions.concat([{ point: { x: event.x, y: event.y }, value: event.value, timestamp: Date.now() }]));
  });

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });

      setCursorState((state: CursorState) => (cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state));
    },
    [cursorState.mode, setCursorState]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      setCursorState((state: CursorState) => (cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state));
    },
    [cursorState.mode, setCursorState]
  );

  const setReactions = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
        break;
      case "Reactions":
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;
      case "Undo":
        undo();
        break;
      case "Redo":
        redo();
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      }

      if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      }

      if (e.key === "e") {
        console.log("e has been pressed");
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative h-full w-full flex flex-1 justify-center items-center"
      >
        <canvas ref={canvasRef} />
        {reaction.map((r) => (
          <FlyingReaction key={r.timestamp.toString()} x={r.point.x} y={r.point.y} timestamp={r.timestamp} value={r.value} />
        ))}

        {cursor && <CursorChat cursor={cursor} cursorState={cursorState} setCursorState={setCursorState} updateMyPresence={updateMyPresence} />}

        {cursorState.mode === CursorMode.ReactionSelector && <ReactionSelector setReaction={setReactions} />}
        <LiveCursors />

        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((shortcut) => (
          <ContextMenuItem key={shortcut.key} onClick={() => handleContextMenuClick(shortcut.name)} className="right-menu-item">
            <p>{shortcut.name}</p>
            <p className="text-xs text-primary-grey-300">{shortcut.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
