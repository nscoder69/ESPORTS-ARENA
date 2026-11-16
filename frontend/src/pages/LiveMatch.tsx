import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { motion } from 'framer-motion';
import { Send, Users, Trophy, XCircle, Flame } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRegisteredTeamsForParticipant } from '../services/tournamentService';
import { getWebSocketUrl } from '../services/websocketService';

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

    const client = new Client({
      brokerURL: getWebSocketUrl(),
      webSocketFactory: () => new WebSocket(getWebSocketUrl()),
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 bg-background">
        <XCircle size={64} className="text-secondary mb-4 drop-shadow-[0_0_12px_rgba(255,32,32,0.4)]" />
        <h2 className="text-2xl font-bold font-display text-white mb-2">Access Denied</h2>
        <p className="text-textSecondary mb-6 text-sm">You must be participating in this tournament to watch the live match.</p>
        <button onClick={() => window.history.back()} className="btn-primary max-w-xs cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl min-h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 bg-background">
      {/* Live Stream / Match Info (Left Side) */}
      <div className="flex-grow flex flex-col gap-6">
        <div className="bg-card rounded-2xl overflow-hidden relative w-full aspect-video flex flex-col items-center justify-center border border-borderColor shadow-card-dark">
          <span className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 text-xs font-extrabold rounded-md uppercase tracking-wider flex items-center gap-2 shadow-red-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            LIVE MATCH
          </span>
          {/* Placeholder for iframe / video player */}
          <div className="text-center">
            <Trophy size={64} className="mx-auto text-primary/30 mb-4" />
            <p className="text-textSecondary font-semibold text-sm">Waiting for broadcast to begin...</p>
          </div>
        </div>

        {/* Leaderboard Placeholder */}
        <div className="bg-card border border-borderColor rounded-2xl flex-grow p-6 flex flex-col shadow-card-dark">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Trophy size={20} className="text-gold" /> Live Leaderboard
            </h3>
            <button className="text-xs font-bold text-primary hover:text-white transition-colors cursor-pointer">View Full Bracket</button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3.5 rounded-xl bg-elevated border border-borderColor">
                <div className="flex items-center gap-4">
                  <span className={`font-extrabold w-6 text-center text-sm ${rank === 1 ? 'text-gold' : rank === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]'}`}>
                    #{rank}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-inputBg border border-borderColor flex items-center justify-center">
                      <Users size={14} className="text-textSecondary" />
                    </div>
                    <span className="font-bold text-white text-sm">Team Alpha {rank}</span>
                  </div>
                </div>
                <span className="font-extrabold text-gold text-sm drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">{120 - rank * 15} PTS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chat (Right Side) */}
      <div className="w-full md:w-96 bg-card border border-borderColor rounded-2xl flex flex-col h-[550px] md:h-auto flex-shrink-0 shadow-card-dark overflow-hidden">
        <div className="p-4 border-b border-borderColor bg-elevated">
          <h3 className="font-bold font-display text-white flex items-center gap-2 text-sm">
            <Flame size={16} className="text-primary" /> Tournament Chat <span className="text-[10px] font-bold text-primary bg-inputBg px-2 py-0.5 rounded-full border border-borderColor">{messages.length}</span>
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-inputBg/50 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-textSecondary text-xs">
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
                  <span className="text-[9px] text-textSecondary">{msg.timestamp}</span>
                </div>
                <div className={`px-3.5 py-2 rounded-xl text-xs max-w-[85%] ${msg.senderName === currentUserName
                    ? 'bg-gradient-to-r from-primary to-[#FF733B] text-white rounded-tr-none shadow-fire-sm font-medium'
                    : 'bg-elevated text-white border border-borderColor rounded-tl-none font-medium'
                  }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-borderColor bg-elevated">
          <div className="relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send a message..."
              className="w-full bg-inputBg border border-borderColor rounded-full pl-4 pr-12 py-2.5 text-xs text-white placeholder-textSecondary/50 focus:outline-none focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-primary hover:brightness-110 disabled:opacity-40 text-white rounded-full transition-all shadow-fire-sm cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
