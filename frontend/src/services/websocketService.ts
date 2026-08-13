import { Client } from '@stomp/stompjs';
import { BACKEND_URL } from './api';

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
    brokerURL: getWebSocketUrl(),
    webSocketFactory: () => new WebSocket(getWebSocketUrl()),
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: () => {}, // silent
    onConnect: () => {
      // 1. Global Tournament Updates
      client.subscribe('/topic/tournaments', (message) => {
        try {
          const eventData = JSON.parse(message.body);
          window.dispatchEvent(new CustomEvent('tournamentsUpdated', { detail: eventData }));
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
          } catch (e) {
            console.error('Failed to parse wallet realtime event', e);
          }
        });

        client.subscribe(`/topic/user/${cleanEmail}/notifications`, (message) => {
          try {
            const eventData = JSON.parse(message.body);
            window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: eventData }));
          } catch (e) {
            console.error('Failed to parse notification realtime event', e);
          }
        });

        client.subscribe(`/topic/user/${cleanEmail}/support`, (message) => {
          try {
            const eventData = JSON.parse(message.body);
            window.dispatchEvent(new CustomEvent('supportUpdated', { detail: eventData }));
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
