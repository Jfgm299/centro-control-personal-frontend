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
    contentInset: 'automatic', // respeta safe areas automáticamente
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#00000000', // transparente — el contenido va bajo la status bar
    },
  },
}

export default config