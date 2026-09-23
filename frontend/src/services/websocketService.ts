import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BACKEND_URL } from './api';
import { sendAppNotification } from './notificationSoundService';

let stompClient: Client | null = null;
let currentSubscribedEmail: string | null = null;

export const getWebSocketUrl = (): string => {
  if (BACKEND_URL.startsWith('https://')) {
    return BACKEND_URL.replace('https://', 'wss://') + '/ws';
  }
  if (BACKEND_URL.startsWith('http://')) {
    return BACKEND_URL.replace('http://', 'ws://') + '/ws';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

export const initRealtimeSync = (userEmail?: string) => {
  if (stompClient && stompClient.active && currentSubscribedEmail === userEmail) {
    return;
  }

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  const client = new Client({
    webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws`),
    reconnectDelay: 10000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {}, // silent
    onStompError: (frame) => {
      console.warn('STOMP protocol error:', frame.headers['message']);
    },
    onWebSocketError: () => {}, // suppress connection noise during server sleep
    onConnect: () => {
      // 1. Global Tournament Updates
      client.subscribe('/topic/tournaments', (message) => {
        try {
          const eventData = JSON.parse(message.body);
          window.dispatchEvent(new CustomEvent('tournamentsUpdated', { detail: eventData }));

          if (eventData.type === 'ROOM_CREDENTIALS_UPDATE') {
            sendAppNotification('Match Room Details Updated! 🎮', {
              body: eventData.message || 'Room ID and Password are now available for your match.',
              url: '/tournaments?mode=registered',
              tag: 'tournament-room'
            });
          }
        } catch (e) {
          console.error('Failed to parse tournament realtime event', e);
        }
      });

      // 2. User Specific Streams (Wallet, Notifications, Support)
      if (userEmail) {
        const cleanEmail = userEmail.trim().toLowerCase();

        client.subscribe(`/topic/user/${cleanEmail}/wallet`, (message) => {
          try {
            const eventData = JSON.parse(message.body);
            window.dispatchEvent(new CustomEvent('walletUpdated', { detail: eventData }));

            if (eventData.message && eventData.message !== 'Wallet balance updated') {
              sendAppNotification('Wallet Update 💳', {
                body: eventData.message,
                url: '/wallet',
                tag: 'user-wallet'
              });
            }
          } catch (e) {
            console.error('Failed to parse wallet realtime event', e);
          }
        });

        client.subscribe(`/topic/user/${cleanEmail}/notifications`, (message) => {
          try {
            const eventData = JSON.parse(message.body);
            window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: eventData }));

            const notifTitle = eventData.data?.title || 'New Notification - Esports Arena';
            const notifBody = eventData.data?.message || eventData.message || 'You have received a new alert';
            sendAppNotification(notifTitle, {
              body: notifBody,
              url: '/',
              tag: `user-notif-${eventData.data?.id || Date.now()}`
            });
          } catch (e) {
            console.error('Failed to parse notification realtime event', e);
          }
        });

        client.subscribe(`/topic/user/${cleanEmail}/support`, (message) => {
          try {
            const eventData = JSON.parse(message.body);
            window.dispatchEvent(new CustomEvent('supportUpdated', { detail: eventData }));

            sendAppNotification('Support Ticket Update 💬', {
              body: eventData.message || 'Admin has replied to your support ticket.',
              url: '/support',
              tag: 'user-support'
            });
          } catch (e) {
            console.error('Failed to parse support realtime event', e);
          }
        });

        // 3. Admin Stream
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            if (userObj.role === 'ROLE_ADMIN' || userObj.role === 'ROLE_SUPER_ADMIN') {
              client.subscribe('/topic/admin/updates', (message) => {
                const eventData = JSON.parse(message.body);
                window.dispatchEvent(new CustomEvent('adminUpdated', { detail: eventData }));

                const msgType = eventData.message || eventData.type;
                if (msgType === 'DEPOSIT_REQUESTED') {
                  const amount = eventData.data?.amount ? `₹${eventData.data.amount}` : '';
                  const sender = eventData.data?.userEmail || 'player';
                  sendAppNotification('New Deposit Request 💰', {
                    body: `A deposit ${amount ? 'of ' + amount + ' ' : ''}was submitted by ${sender}. Please verify.`,
                    url: '/admin/dashboard',
                    tag: 'admin-deposit'
                  });
                } else if (msgType === 'WITHDRAWAL_REQUESTED') {
                  const amount = eventData.data?.amount ? `₹${eventData.data.amount}` : '';
                  const sender = eventData.data?.userEmail || 'player';
                  sendAppNotification('New Withdrawal Request 💸', {
                    body: `A withdrawal request ${amount ? 'for ' + amount + ' ' : ''}was submitted by ${sender}.`,
                    url: '/admin/dashboard',
                    tag: 'admin-withdrawal'
                  });
                } else if (msgType === 'SUPPORT_TICKET_CREATED') {
                  const subject = eventData.data?.subject || 'A player submitted a help ticket';
                  sendAppNotification('New Support Ticket 💬', {
                    body: `${subject}. Click to reply from admin panel.`,
                    url: '/admin/dashboard',
                    tag: 'admin-support'
                  });
                } else if (msgType === 'GAME_PROFILE_REQUEST_SUBMITTED') {
                  const sender = eventData.data?.userEmail || 'player';
                  sendAppNotification('Game Profile Verification 🎮', {
                    body: `New in-game credentials submitted for verification by ${sender}.`,
                    url: '/admin/dashboard',
                    tag: 'admin-verification'
                  });
                }
              });
            }
          } catch (ignored) {}
        }
      }
    },
  });

  client.activate();
  stompClient = client;
  currentSubscribedEmail = userEmail || null;
};

export const disconnectRealtimeSync = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    currentSubscribedEmail = null;
  }
};
