import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion } from 'framer-motion';
import { Send, Users, Trophy, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRegisteredTeamsForParticipant } from '../services/tournamentService';
import { BACKEND_URL } from '../services/api';

interface ChatMessage {
  senderName: string;
  content: string;
  timestamp: string;
}



export default function LiveMatch() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = id || '';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUserName = user?.gameName || user?.email || 'Player';

  useEffect(() => {
    if (!tournamentId) return;

    const checkParticipation = async () => {
      try {
        const teams = await getRegisteredTeamsForParticipant(tournamentId);
        setIsParticipant(teams.length > 0);
      } catch (err) {
        setIsParticipant(false);
      }
    };

    checkParticipation();
  }, [tournamentId]);

  useEffect(() => {
    if (!isParticipant || !tournamentId) return;

    const socket = new SockJS(`${BACKEND_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${tournamentId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [isParticipant, tournamentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !stompClient || !stompClient.connected || !user) return;

    const messageDto = {
      senderName: currentUserName,
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    stompClient.publish({
      destination: `/app/chat/${tournamentId}`,
      body: JSON.stringify(messageDto)
    });
    setInputMessage('');
  };

  if (isParticipant === null) {
    return (
      <LoadingSpinner fullScreen text="Verifying Match Access..." />
    );
  }

  if (isParticipant === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
        <XCircle size={64} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold font-display text-white mb-2">Access Denied</h2>
        <p className="text-textSecondary mb-6">You must be participating in this tournament to watch the live match.</p>
        <button onClick={() => window.history.back()} className="bg-primary text-black font-semibold px-6 py-2.5 rounded hover:bg-primary-hover transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">
      {/* Live Stream / Match Info (Left Side) */}
      <div className="flex-grow flex flex-col gap-6">
        <div className="glass-panel overflow-hidden relative w-full aspect-video flex flex-col items-center justify-center bg-black/40 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
          <span className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 text-xs font-bold rounded uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-secondary/20">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            LIVE MATCH
          </span>
          {/* Placeholder for iframe / video player */}
          <div className="text-center">
            <Trophy size={64} className="mx-auto text-primary/30 mb-4" />
            <p className="text-textSecondary font-medium">Waiting for broadcast to begin...</p>
          </div>
        </div>

        {/* Leaderboard Placeholder */}
        <div className="glass-panel flex-grow p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-display text-white">Live Leaderboard</h3>
            <button className="text-sm text-primary hover:text-white transition-colors">View Full Bracket</button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 rounded bg-surface/50 border border-white/5">
                <div className="flex items-center gap-4">
                  <span className={`font-bold w-6 text-center ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>#{rank}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-background border border-white/10 flex items-center justify-center">
                      <Users size={14} className="text-textSecondary" />
                    </div>
                    <span className="font-semibold text-white">Team Alpha {rank}</span>
                  </div>
                </div>
                <span className="font-bold text-primary">{120 - rank * 15} PTS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chat (Right Side) */}
      <div className="w-full md:w-96 glass-panel flex flex-col h-full border border-white/10 flex-shrink-0">
        <div className="p-4 border-b border-white/10 bg-surfaceHighlight/50">
          <h3 className="font-bold font-display text-white flex items-center gap-2">
            Tournament Chat <span className="text-xs font-normal text-textSecondary bg-background px-2 py-0.5 rounded-full">{messages.length}</span>
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-background/30 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-textSecondary text-sm">
              Be the first to say hello!
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex flex-col ${msg.senderName === currentUserName ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-primary">{msg.senderName}</span>
                  <span className="text-[10px] text-textSecondary">{msg.timestamp}</span>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm max-w-[85%] ${msg.senderName === currentUserName
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-surfaceHighlight text-white border border-white/5 rounded-tl-none'
                  }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-surfaceHighlight/50">
          <div className="relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send a message..."
              className="w-full bg-background border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-full transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
