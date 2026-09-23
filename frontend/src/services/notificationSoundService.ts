// Notification Sound & Web Notification Service

let audioCtx: AudioContext | null = null;

// Initialize or get the AudioContext safely
const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
};

/**
 * Plays a unique, futuristic 3-tone Esports Arena notification chime.
 * Uses Web Audio API for zero latency, with HTML5 Audio (/notification.wav) fallback.
 */
export const playNotificationSound = () => {
  try {
    // 1. Try Web Audio API synthesized unique sound
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      // 3 Harmonious Notes: E5 (659.25Hz) -> G#5 (830.61Hz) -> B5 (987.77Hz) with E6 sparkle
      const notes = [
        { freq: 659.25, time: 0.00, dur: 0.35, gain: 0.35 },
        { freq: 830.61, time: 0.10, dur: 0.38, gain: 0.40 },
        { freq: 987.77, time: 0.20, dur: 0.45, gain: 0.50 },
        { freq: 1318.51, time: 0.20, dur: 0.45, gain: 0.20 }
      ];

      notes.forEach(({ freq, time, dur, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gainNode.gain.setValueAtTime(0.001, now + time);
        gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
      return;
    }
  } catch {
    // Fall back to audio element if Web Audio fails
  }

  try {
    const audio = new Audio('/notification.wav');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch {}
};

/**
 * Requests browser/device permission for notifications.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Sends a system/PWA desktop or mobile notification with the official logo and plays the unique chime.
 */
export const sendAppNotification = async (
  title: string,
  options?: {
    body?: string;
    url?: string;
    icon?: string;
    tag?: string;
  }
) => {
  // Always play the unique notification sound
  playNotificationSound();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const notificationOptions = {
    body: options?.body || '',
    icon: options?.icon || '/logo192.png',
    badge: '/logo192.png',
    data: { url: options?.url || '/' },
    tag: options?.tag || `ea-${Date.now()}`,
    vibrate: [200, 100, 200]
  } as any;

  try {
    // Prefer Service Worker registration (native PWA notification on mobile & desktop)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return;
      }
    }

    // Fallback to standard Notification object
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (options?.url) {
        window.location.href = options.url;
      }
      notif.close();
    };
  } catch (err) {
    console.warn('Failed to display native notification:', err);
  }
};
