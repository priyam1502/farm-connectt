import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ea0fcb6530324c46a7b64a769db020b4',
  appName: 'yield-bridge',
  webDir: 'dist',
  server: {
    url: 'https://ea0fcb65-3032-4c46-a7b6-4a769db020b4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;