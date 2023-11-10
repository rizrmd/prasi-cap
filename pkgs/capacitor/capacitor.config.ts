import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "logbookorthouns2023.app.id",
  appName: "E-Logbook Ortho UNS 2023",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 30 * 1000,
      "launchAutoHide": true,
      useDialog: false,
      splashFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
