import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TipCalculatorScreen } from './src/TipCalculatorScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* "auto" picks light or dark bars to match the system theme. */}
      <StatusBar style="auto" />
      <TipCalculatorScreen />
    </SafeAreaProvider>
  );
}
