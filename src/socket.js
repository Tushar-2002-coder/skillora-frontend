import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true, // Yeh zaroori hai kyunki tumne server par credentials: true rakha hai
  transports: ['websocket', 'polling'], // Pehle WebSocket try karega, phir Polling
});

window.socket = socket; 

export default socket;