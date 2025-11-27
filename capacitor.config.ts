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
    url: 'http://192.168.0.217:3001',
    // Allow loading external content
    allowNavigation: [
      'http://192.168.0.217:5001',
      'http://192.168.0.217:3001',
      'http://10.*',
      'http://192.168.*'
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
