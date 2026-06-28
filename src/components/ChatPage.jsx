// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import socket from '../socket';

export default function ChatPage({ currentUser, conversationId: forcedConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(forcedConversationId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const isAdmin = currentUser.role === 'admin';

  // Students only ever talk to ONE conversation: their own support thread.
  // Admins can see a list of all student conversations.
  const myConversationId = forcedConversationId || `${currentUser._id}_support`;

useEffect(() => {
  const handleReceive = (data) => {
    // ⚠️ Yahan activeConversationId (state) nahi, Ref use karna hai
    if (data.conversationId === activeConversationIdRef.current) {
      setMessages((prev) => [...prev, data]);
    } else {
      console.log("Message received for a different conversation, ignoring...");
    }
  };

  socket.on('receive_message', handleReceive);
  
  return () => {
    socket.off('receive_message', handleReceive);
  };
}, [activeConversationId]);

  // Keep a ref in sync so the socket callback (captured once) always sees the latest value
  const activeConversationIdRef = useRef(activeConversationId);


  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);


  // Admin: load list of all student conversations
  useEffect(() => {
    if (isAdmin && !forcedConversationId) {
      api.get('/chat/conversations')
        .then((res) => setConversations(res.data))
        .catch((err) => console.error(err));
    } else {
      setActiveConversationId(myConversationId);
    }
  }, [isAdmin, forcedConversationId, myConversationId]);

  // Load message history + join socket room whenever active conversation changes

    useEffect(() => {
  if (!activeConversationId) return;

  // Purani room se nikalna (Optional but recommended)
  // socket.emit('leave_conversation', previousId); 
  
  socket.emit('join_conversation', activeConversationId);

  api.get(`/chat/${activeConversationId}`)
    .then((res) => setMessages(res.data))
    .catch((err) => console.error(err));
}, [activeConversationId]);



  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !activeConversationId) return;

    const msgData = {
      conversationId: activeConversationId,
      senderId: currentUser._id,
      senderRole: currentUser.role,
      messageText: text,
    };
    socket.emit('send_message', msgData);
    setText('');
  };

  return (
    <div className="flex h-[600px] border rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Left: Conversation List (admin only) */}
      {isAdmin && !forcedConversationId && (
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 font-black text-sm text-slate-700 border-b">Support Inbox</div>
          {conversations.length === 0 && (
            <p className="p-4 text-xs text-slate-400 font-medium">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.conversationId}
              onClick={() => setActiveConversationId(c.conversationId)}
              className={`p-4 cursor-pointer border-b hover:bg-slate-50 transition ${
                activeConversationId === c.conversationId ? 'bg-indigo-50' : ''
              }`}
            >
              <p className="text-sm font-bold text-slate-800">{c.student?.name || 'Unknown Student'}</p>
              <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
            </div>
          ))}
        </div>
      )}

      {/* Right: Message Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
          {!activeConversationId && (
            <p className="text-center text-slate-400 text-sm font-bold mt-10">
              Select a conversation to start chatting
            </p>
          )}
          {messages.map((m, i) => {
            const mine = m.senderRole === currentUser.role;
            return (
              <div key={m._id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm font-medium ${
                    mine ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {m.messageText}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <div className="p-3 border-t flex gap-2 bg-white">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={activeConversationId ? "Type a message..." : "Select a conversation first"}
            disabled={!activeConversationId}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
          />
          <button
            onClick={sendMessage}
            disabled={!activeConversationId}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-5 py-2 rounded-xl text-sm font-bold transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
