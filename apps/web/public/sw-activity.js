let activityInterval = null;
let startTime = null;
let activityType = "running";

self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  if (type === "START_ACTIVITY") {
    startTime = Date.now();
    activityType = payload.activityType || "running";

    // Show persistent notification
    self.registration.showNotification("TerrainQuest — Activity in progress", {
      body: `${capitalize(activityType)} • 00:00`,
      icon: "/icon-192.png",
      tag: "activity-timer",
      renotify: true,
      silent: true,
      requireInteraction: true,
      actions: [
        { action: "stop", title: "Stop & Save" },
        { action: "open", title: "Open App" },
      ],
    });

    // Update notification every 10 seconds
    activityInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const ss = String(elapsed % 60).padStart(2, "0");

      self.registration.showNotification("TerrainQuest — Activity in progress", {
        body: `${capitalize(activityType)} • ${mm}:${ss}`,
        icon: "/icon-192.png",
        tag: "activity-timer",
        renotify: false,
        silent: true,
        requireInteraction: true,
        actions: [
          { action: "stop", title: "Stop & Save" },
          { action: "open", title: "Open App" },
        ],
      });
    }, 10000);
  }

  if (type === "STOP_ACTIVITY") {
    if (activityInterval) clearInterval(activityInterval);
    self.registration.getNotifications({ tag: "activity-timer" }).then((notifications) => {
      notifications.forEach((n) => n.close());
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "stop") {
    // Post message to all clients to trigger stop
    self.clients.matchAll({ type: "window" }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "SW_STOP_ACTIVITY" }));
    });
  } else {
    // Open the app
    self.clients.openWindow("/dashboard");
  }
});

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}