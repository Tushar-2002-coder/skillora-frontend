import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

// Ek hi socket connection poore app mein reuse hota hai
// (chat, live quiz leaderboard, aur notifications sab isi se baat karte hain)
const socket = io(API_BASE_URL, {
  autoConnect: true,
});

export default socket;
