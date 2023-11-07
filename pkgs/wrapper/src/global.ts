import { css as gooberCSS } from "goober";
const w = window as any;

const gooberCX = (...classNames: any[]) => {
  const result: string[] = [];

  classNames
    .filter((e) => {
      if (e) {
        if (typeof e === "string" && e.trim()) return true;
        else return true;
      }
      return false;
    })
    .forEach((e) => {
      if (Array.isArray(e)) {
        for (const f of e) {
          if (typeof f === "string" && f.trim()) {
            result.push(f.trim());
          }
        }
      } else result.push(e.trim());
    });
  return result.join(" ");
};
w.cx = gooberCX;
w.css = gooberCSS;
import {
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications";

declare global {
  const css: typeof gooberCSS;
  const cx: typeof gooberCX;
  const notif: {
    loaded: (send: (data: any) => void) => void;
    onReceive: (notif: PushNotificationSchema) => void | Promise<void>;
    onTap: (notif: null | ActionPerformed) => void | Promise<void>;
  };
}
