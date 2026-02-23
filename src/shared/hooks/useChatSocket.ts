import { useEffect } from 'react';
import { socket } from '../utils/socket';
import { useStore } from '../store/useStore';
import type { ChatMessage, ChatUser } from '../types';

/**
 * Manages the Socket.io connection lifecycle for the chat.
 * Call this once inside the Chat component.
 */
export function useChatSocket() {
  const {
    chatCurrentUser,
    activeProject,
    activeChatChannelId,
    activeDmId,
    receiveMessage,
    setRoomHistory,
    receiveReactionUpdate,
    setSocketConnected,
    setOnlineMembers,
  } = useStore();

  // ── Connect / identify when user is set ──────────────────────
  useEffect(() => {
    if (!chatCurrentUser) {
      socket.disconnect();
      setSocketConnected(false);
      setOnlineMembers([]);
      return;
    }

    const project = useStore.getState().activeProject();
    // Capture in a local const so TypeScript knows it's non-null inside callbacks
    const user = chatCurrentUser;

    socket.connect();

    function onConnect() {
      setSocketConnected(true);
      socket.emit('identify', {
        userId: user.id,
        name: user.name,
        role: user.role,
        department: user.department,
        projectId: project.id,
      });
    }

    function onDisconnect() {
      setSocketConnected(false);
    }

    function onMessage({ message }: { message: ChatMessage }) {
      receiveMessage(message);
    }

    function onHistory({ roomId, messages }: { roomId: string; messages: ChatMessage[] }) {
      setRoomHistory(roomId, messages);
    }

    function onReactionUpdate({
      roomId, messageId, reactions,
    }: { roomId: string; messageId: string; reactions: Record<string, string[]> }) {
      receiveReactionUpdate(roomId, messageId, reactions);
    }

    function onPresence(members: ChatUser[]) {
      setOnlineMembers(members);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('history', onHistory);
    socket.on('reaction_update', onReactionUpdate);
    socket.on('presence', onPresence);

    // If already connected (reconnect scenario), identify immediately
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('history', onHistory);
      socket.off('reaction_update', onReactionUpdate);
      socket.off('presence', onPresence);
      socket.disconnect();
      setSocketConnected(false);
      setOnlineMembers([]);
    };
  }, [chatCurrentUser?.id]);

  // ── Join room whenever active room changes ───────────────────
  useEffect(() => {
    const roomId = activeDmId || activeChatChannelId;
    if (!roomId || !chatCurrentUser) return;

    if (socket.connected) {
      socket.emit('join_room', { roomId });
    } else {
      // Queue the join for when connection is established
      socket.once('connect', () => {
        socket.emit('join_room', { roomId });
      });
    }
  }, [activeChatChannelId, activeDmId, chatCurrentUser?.id]);
}
