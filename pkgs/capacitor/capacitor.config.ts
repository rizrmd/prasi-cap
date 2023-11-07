import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "med.avolut",
  appName: "Medic Link",
  webDir: "www",
  server: {
    url: "http://192.168.18.214:3000",
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
