import { io } from "socket.io-client";

// Backend URL same jagah se aata hai jahan se api.js leta hai
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
