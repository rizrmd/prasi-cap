import { PushNotifications } from "@capacitor/push-notifications";
import { waitUntil } from "./wait-until";
(window as any).notif = {};

export const addListeners = async () => {
  await PushNotifications.addListener("registration", (token) => {
    notif.loaded = (send) => {
      send({ type: "notification-token", token: token.value });
    };
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("Registration error: ", err.error);
  });

  await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      if (notif && typeof notif.onReceive === "function") {
        notif.onReceive(notification);
      }
    }
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    async (notification) => {
      const delivered = await PushNotifications.getDeliveredNotifications();
      if (notif && typeof notif.onTap === "function") {
        notif.onTap(notification);
        PushNotifications.removeDeliveredNotifications(delivered);
      } else {
        await waitUntil(() => notif && typeof notif.onTap === "function");
        notif.onTap(null);
        PushNotifications.removeDeliveredNotifications(delivered);
      }
    }
  );
};

export const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") {
    throw new Error("User denied permissions!");
  }

  await PushNotifications.register();
};

export const getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications();
  return notificationList;
};
