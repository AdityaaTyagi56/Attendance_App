import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iiitnr.attendance',
  appName: 'IIIT-NR Attendance',
  webDir: 'dist',
  server: {
    // Use HTTPS for production backend
    androidScheme: 'https',
    // Allow loading external content
    allowNavigation: [
      'https://*',
      'http://*'
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
