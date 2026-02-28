import { Stack } from "expo-router";
import "../global.css";


export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/index" />
      <Stack.Screen name="(auth)/onboarding" />
      <Stack.Screen name="(auth)/role-selection" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/location-access" />
      <Stack.Screen name="(auth)/forgot-password" />
      <Stack.Screen name="(auth)/otp-verification" />
      <Stack.Screen name="(auth)/otp-success" />
      <Stack.Screen name="(auth)/reset-password" />
      <Stack.Screen name="(auth)/reset-success" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
