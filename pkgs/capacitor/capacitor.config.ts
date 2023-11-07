import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "med.avolut",
  appName: "Medic Link",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
