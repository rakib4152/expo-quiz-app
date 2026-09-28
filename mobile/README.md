# QuizPulse Mobile — Expo Go & NativeWind v4 Setup

This is the pure React Native Expo project configured for **Expo SDK 52** and **NativeWind v4**.

---

## 🚀 Quick Start in Expo Go

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Set API Endpoint (Optional)
By default, the app is pre-configured to connect directly to the hosted development cloud backend:
`https://ais-dev-4bjzqvwall6zdaojnl3ork-365858207471.asia-east1.run.app/api/v1`

If you are running the backend locally on your computer, set your computer's local LAN IP:
```bash
export EXPO_PUBLIC_API_URL="http://YOUR_LOCAL_IP:3000/api/v1"
```

### 3. Start Expo Dev Server
```bash
npx expo start -c
```

### 4. Open in Expo Go
- **Android**: Open the **Expo Go** app and tap **Scan QR Code**.
- **iOS**: Open the native **Camera** app, point at the terminal QR code, and tap the notification to open in **Expo Go**.

---

## 🛠️ Key Technical Details
- **Styling**: NativeWind v4 / Tailwind CSS with `className="..."`.
- **Icons**: `lucide-react-native` for high-performance SVG vector icons.
- **Components**: Pure React Native primitives (`View`, `Text`, `TouchableOpacity`, `Pressable`, `TextInput`, `SafeAreaView`).
- **Storage**: Safe token storage abstraction compatible with `expo-secure-store`.
- **Zero Web Tags**: Completely free of `div`, `span`, `p`, `button`, or `input` elements.
