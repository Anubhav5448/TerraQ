let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerActivitySW() {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  swRegistration = await navigator.serviceWorker.register("/sw-activity.js");
  return swRegistration;
}

export async function notifyActivityStart(activityType: string) {
  if (!swRegistration?.active) {
    swRegistration = await navigator.serviceWorker.register("/sw-activity.js");
    await navigator.serviceWorker.ready;
  }
  swRegistration?.active?.postMessage({
    type: "START_ACTIVITY",
    payload: { activityType },
  });
}

export async function notifyActivityStop() {
  swRegistration?.active?.postMessage({ type: "STOP_ACTIVITY" });
}

export function onSWStopCommand(callback: () => void) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SW_STOP_ACTIVITY") callback();
  });
}