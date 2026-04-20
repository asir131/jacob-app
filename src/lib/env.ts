import { Platform } from "react-native";

const normalizeBaseUrl = (value?: string) => {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const androidDefault = "http://10.0.2.2:5001";
const iosDefault = "http://localhost:5001";

export const API_BASE_URL =
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL) ||
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
  (Platform.OS === "android" ? androidDefault : iosDefault);

export const SOCKET_URL =
  normalizeBaseUrl(process.env.EXPO_PUBLIC_SOCKET_URL) ||
  normalizeBaseUrl(process.env.NEXT_PUBLIC_SOCKET_URL) ||
  API_BASE_URL;

