import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tuapp.centrocontrol',
  appName: 'Centro Control',
  webDir: 'dist',
  server: {
    // En desarrollo puedes apuntar a tu Vite dev server local:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },
  ios: {
    contentInset: 'never', // el WebView ocupa toda la pantalla, CSS gestiona el safe area
    scrollEnabled: false,
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#00000000',
      overlaysWebView: true, // status bar flota sobre el WebView
    },
  },
}

export default config