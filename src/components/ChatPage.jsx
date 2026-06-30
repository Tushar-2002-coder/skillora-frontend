// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import socket from '../socket';
import { Send, Search, ArrowLeft, CheckCheck, MessageCircle, Trash2 } from 'lucide-react';

function timeFormat(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

// Groups a flat message array into { day: [messages] } buckets, WhatsApp-style
function groupByDay(messages) {
  const groups = [];
  let currentDay = null;
  let currentBucket = null;

  messages.forEach((m) => {
    const label = dayLabel(m.createdAt);
    if (label !== currentDay) {
      currentDay = label;
      currentBucket = { day: label, items: [] };
      groups.push(currentBucket);
    }
    currentBucket.items.push(m);
  });

  return groups;
}

export default function ChatPage({ currentUser, conversationId: forcedConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(forcedConversationId || null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const scrollRef = useRef(null);
  const activeConversationIdRef = useRef(activeConversationId);

  const isAdmin = currentUser.role === 'admin';
  const myConversationId = forcedConversationId || `${currentUser._id}_support`;

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Listen for incoming messages globally; only append if it's for the open conversation
  useEffect(() => {
    const handleReceive = (data) => {
      if (data.conversationId === activeConversationIdRef.current) {
        setMessages((prev) => [...prev, data]);
      }
      // Refresh the admin's conversation list so last-message/unread updates live
      if (isAdmin && !forcedConversationId) {
        loadConversations();
      }
    };

    const handleCleared = ({ conversationId }) => {
      if (conversationId === activeConversationIdRef.current) {
        setMessages([]);
      }
      if (isAdmin && !forcedConversationId) {
        loadConversations();
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('chat_cleared', handleCleared);
    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('chat_cleared', handleCleared);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, forcedConversationId]);

  const loadConversations = () => {
    api.get('/chat/conversations')
      .then((res) => setConversations(res.data))
      .catch((err) => console.error(err));
  };

  // Admin: load conversation list. Student: jump straight into their own thread.
  useEffect(() => {
    if (isAdmin && !forcedConversationId) {
      loadConversations();
    } else {
      setActiveConversationId(myConversationId);
      setShowChatOnMobile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, forcedConversationId, myConversationId]);

  // Whenever active conversation changes: join socket room + load history + mark read
  useEffect(() => {
    if (!activeConversationId) return;

    socket.emit('join_conversation', activeConversationId);

    api.get(`/chat/${activeConversationId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));

    if (isAdmin) {
      api.post(`/chat/${activeConversationId}/read`).catch(() => {});
    }
  }, [activeConversationId, isAdmin]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConversationId(conv.conversationId);
    setActiveStudent(conv.student);
    setShowChatOnMobile(true);
    // Optimistically clear unread badge
    setConversations((prev) =>
      prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const sendMessage = () => {
    if (!text.trim() || !activeConversationId) return;

    const msgData = {
      conversationId: activeConversationId,
      senderId: currentUser._id,
      senderRole: currentUser.role,
      messageText: text.trim(),
    };
    socket.emit('send_message', msgData);
    setText('');
  };

  const handleClearChat = async () => {
    if (!activeConversationId) return;
    const confirmed = window.confirm(
      'Clear this entire chat? All messages will be permanently deleted from the server for both you and the student. This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await api.delete(`/chat/${activeConversationId}`);
      setMessages([]);
      socket.emit('chat_cleared', { conversationId: activeConversationId });
      loadConversations();
    } catch (err) {
      console.error(err);
      alert('Failed to clear chat. Please try again.');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.student?.name || 'Unknown').toLowerCase().includes(search.toLowerCase())
  );

  const messageGroups = groupByDay(messages);

  const chatPartnerName = isAdmin ? (activeStudent?.name || 'Student') : 'Skillora Support';
  const chatPartnerInitial = chatPartnerName.charAt(0).toUpperCase();

  return (
    <div className="flex h-[640px] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200">
      {/* ───────────── LEFT: Conversation List (Admin only) ───────────── */}
      {isAdmin && !forcedConversationId && (
        <div
          className={`w-full md:w-[340px] border-r border-slate-200 flex-col bg-white ${
            showChatOnMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="bg-[#1d5ec2] px-4 py-4">
            <h2 className="text-white font-black text-base mb-3">Support Inbox</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-white/95 rounded-xl pl-9 pr-3 py-2 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <MessageCircle className="text-slate-200 mb-2" size={40} />
                <p className="text-xs text-slate-400 font-medium">No conversations yet.</p>
              </div>
            )}

            {filteredConversations.map((c) => {
              const isActive = activeConversationId === c.conversationId;
              const initial = (c.student?.name || 'U').charAt(0).toUpperCase();
              return (
                <div
                  key={c.conversationId}
                  onClick={() => handleSelectConversation(c)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-slate-50 transition ${
                    isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1d5ec2] to-[#3b7de0] text-white flex items-center justify-center font-black text-sm shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {c.student?.name || 'Unknown Student'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                        {timeFormat(c.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate">
                        {c.lastSenderRole === 'admin' ? 'You: ' : ''}
                        {c.lastMessage}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="bg-[#1d5ec2] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-2">
                          {c.unreadCount > 9 ? '9+' : c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────── RIGHT: Chat Window ───────────── */}
      <div
        className={`flex-1 flex-col bg-[#e9eef5] ${
          isAdmin && !forcedConversationId && !showChatOnMobile ? 'hidden md:flex' : 'flex'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(29,94,194,0.06) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      >
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <MessageCircle className="text-[#1d5ec2]" size={32} />
            </div>
            <p className="text-slate-500 font-bold text-sm">Select a conversation</p>
            <p className="text-slate-400 text-xs mt-1">Choose a student from the list to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-[#1d5ec2] px-4 py-3 flex items-center gap-3 shrink-0">
              {isAdmin && !forcedConversationId && (
                <button
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden text-white"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-sm shrink-0">
                {isAdmin ? chatPartnerInitial : '🎓'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-sm truncate">{chatPartnerName}</p>
                <p className="text-blue-100 text-[11px] font-medium">
                  {isAdmin ? 'Student' : 'Usually replies within a day'}
                </p>
              </div>

              {isAdmin && messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition shrink-0"
                  title="Clear chat"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messageGroups.map((group, gIdx) => (
                <div key={gIdx}>
                  <div className="flex justify-center my-3">
                    <span className="bg-white/80 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                      {group.day}
                    </span>
                  </div>
                  {group.items.map((m, i) => {
                    const mine = m.senderRole === currentUser.role;
                    return (
                      <div key={m._id || i} className={`flex mb-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] md:max-w-[60%] px-3.5 py-2 text-sm shadow-sm ${
                            mine
                              ? 'bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-tr-sm'
                              : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm'
                          }`}
                        >
                          <p className="leading-snug break-words">{m.messageText}</p>
                          <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {timeFormat(m.createdAt)}
                            </span>
                            {mine && <CheckCheck size={13} className="text-sky-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <div className="px-3 py-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-10 h-10 rounded-full bg-[#1d5ec2] hover:bg-[#154fa5] disabled:bg-slate-300 text-white flex items-center justify-center transition shrink-0"
              >
                <Send size={17} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
