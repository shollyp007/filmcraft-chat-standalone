import { io } from 'socket.io-client';

// In development this defaults to localhost.
// In production set VITE_CHAT_SERVER_URL in your Vercel project env vars
// to point at your deployed chat server (Railway, Render, Fly.io, etc.)
export const CHAT_SERVER_URL =
  import.meta.env.VITE_CHAT_SERVER_URL ?? 'http://localhost:3001';

// Single socket instance shared across the app.
// autoConnect: false so we connect only when a user identifies themselves.
export const socket = io(CHAT_SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
});
