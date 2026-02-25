// public/notifications.js

let swRegistration = null;

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        swRegistration = registration;
        return registration;
    } catch (error) {
        console.error('SW registration failed:', error);
        return null;
    }
}

async function subscribeToPushNotifications(username) {
    try {
        const keyResponse = await fetch('/api/vapid-public-key');
        const { publicKey } = await keyResponse.json();
        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        const subscription = await swRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
        await fetch('/api/subscribe-push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, subscription }) });
        return true;
    } catch (error) {
        console.error('Push subscription failed:', error);
        return false;
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}

window.NotificationManager = {
    initialize: async (username) => {
        const registration = await registerServiceWorker();
        if (registration) subscribeToPushNotifications(username);
    }
};
