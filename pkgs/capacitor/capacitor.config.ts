import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "logbookorthouns2023.app.id",
  appName: "Medic Link",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 30 * 1000,
      "launchAutoHide": false,
      useDialog: false,
      splashFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
