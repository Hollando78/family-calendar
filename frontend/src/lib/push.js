import { api } from './api.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }

  return navigator.serviceWorker.register('/service-worker.js');
}

export async function enablePush(token) {
  if (!('Notification' in window) || Notification.permission === 'denied') {
    throw new Error('Notifications blocked');
  }

  const registration = await registerServiceWorker();

  let publicKey = import.meta.env.VITE_PUSH_PUBLIC_KEY;
  if (!publicKey) {
    const keyResponse = await api.getPushKey();
    publicKey = keyResponse.publicKey;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  await api.saveSubscription(token, subscription);
  return true;
}
