import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "logbookorthouns2023.app.id",
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
