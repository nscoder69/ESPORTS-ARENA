import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createSupportTicket, getUserSupportTickets } from '../services/supportService';
import { HelpCircle, Send, MessageSquare, Clock, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await getUserSupportTickets();
      setTickets(data);
    } catch {
      // Quietly fail
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupportTicket({ subject, message });
      setSuccess('Your support ticket has been submitted. The admin email has been notified!');
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
          <HelpCircle className="text-primary" size={32} /> Help & Support Portal
        </h1>
        <p className="text-textSecondary text-sm max-w-xl">
          Submit any complaints, issues, or feedback. Support requests are automatically forwarded to <strong className="text-primary">esportsarena638@gmail.com</strong>. You will receive notifications in your account as soon as an administrator replies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Submit Ticket Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 glass-panel p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Send size={18} className="text-primary" /> Submit a Ticket
          </h2>

          {error && (
            <div className="bg-secondary/10 border border-secondary/20 text-secondary text-xs p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-md mb-4 flex items-center gap-2">
              <CheckCircle size={14} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Subject *</label>
              <input 
                type="text" 
                className="input-field text-sm"
                placeholder="e.g., Transaction issue, Tournament feedback..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Message *</label>
              <textarea 
                rows={5}
                className="input-field text-sm resize-none py-3"
                placeholder="Describe your issue or complaint in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
            </button>
          </form>
        </motion.div>

        {/* Previous Tickets Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Your Tickets ({tickets.length})
            </h2>
          </div>

          {tickets.length === 0 ? (
            <div className="glass-panel p-8 text-center text-textSecondary text-sm">
              You haven't submitted any support requests yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {tickets.map((ticket) => {
                const isExpanded = expandedTicketId === ticket.id;
                const date = new Date(ticket.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div 
                    key={ticket.id}
                    className={`glass-panel border transition-all duration-200 ${
                      isExpanded ? 'border-primary/30 bg-surfaceHighlight/30' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Header Panel */}
                    <button
                      onClick={() => toggleExpand(ticket.id)}
                      className="w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                            ticket.status === 'Resolved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ticket.status === 'Resolved' ? (
                              <CheckCircle size={10} />
                            ) : (
                              <Clock size={10} />
                            )}
                            {ticket.status}
                          </span>
                          <span className="text-[10px] text-textSecondary">{date}</span>
                        </div>
                        <h3 className="text-white font-semibold text-sm truncate">{ticket.subject}</h3>
                      </div>
                      <div className="text-textSecondary hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Expandable Details */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-5 pt-1 border-t border-white/5 space-y-4">
                            {/* User Message */}
                            <div>
                              <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider mb-1">Your Request</p>
                              <p className="text-textPrimary text-sm bg-black/20 p-3 rounded border border-white/5 whitespace-pre-line">
                                {ticket.message}
                              </p>
                            </div>

                            {/* Admin Reply */}
                            {ticket.reply ? (
                              <div className="border-l-2 border-primary pl-3 mt-4">
                                <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">Administrator Reply</p>
                                <p className="text-textPrimary text-sm bg-primary/5 p-3 rounded border border-primary/10 whitespace-pre-line">
                                  {ticket.reply}
                                </p>
                              </div>
                            ) : (
                              <div className="border-l-2 border-amber-500/50 pl-3 mt-4 text-xs text-textSecondary italic">
                                Awaiting response from support team...
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
