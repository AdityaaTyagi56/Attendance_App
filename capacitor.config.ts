import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iiitnr.attendance',
  appName: 'IIIT-NR Attendance',
  webDir: 'dist',
  server: {
    // Allow cleartext traffic for local network backend
    androidScheme: 'http',
    // Don't clear cookies/cache on reload
    cleartext: true,
    // url: 'http://YOUR_IP:3001', // Uncomment and set IP for live reload
    // Allow loading external content
    allowNavigation: [
      'http://*',
      'https://*'
    ]
  },
  android: {
    // Allow mixed content (http in APK)
    allowMixedContent: true,
    // Enable debugging
    webContentsDebuggingEnabled: true
  }
};

export default config;
