import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prasi.app',
  appName: 'capacitor',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
