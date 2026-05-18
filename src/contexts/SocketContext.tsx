import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "expo-router";
import { io, type Socket } from "socket.io-client";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/src/contexts/AuthContext";
import { SOCKET_URL } from "@/src/lib/env";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addNotification,
  clearNotifications as clearNotificationsAction,
  hydrateNotifications,
  markAllNotificationsAsRead as markAllNotificationsAsReadAction,
  type LiveNotification,
  setSocketConnectedState,
} from "@/src/store/slices/notificationSlice";

type SocketContextValue = {
  socket: Socket | null;
  socketConnected: boolean;
  notifications: LiveNotification[];
  unreadCount: number;
  markAllNotificationsAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
};

const NOTIFICATIONS_STORAGE_KEY = "live_notifications";
export const PENDING_INCOMING_CALL_STORAGE_KEY = "pending_incoming_call";
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

type CallInvitePayload = {
  conversationId: string;
  targetUserId?: string;
  senderId?: string;
  senderRole?: string;
  senderName?: string;
  senderAvatar?: string;
  callType: "voice" | "video";
  offer?: RTCSessionDescriptionInit;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, updateProfile, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const socketConnected = useAppSelector((state) => state.notifications.socketConnected);
  const socketRef = useRef<Socket | null>(null);
  const incomingCallRef = useRef<CallInvitePayload | null>(null);
  const walletBalanceRef = useRef(0);
  const totalEarningsRef = useRef(0);
  const [incomingCall, setIncomingCall] = useState<CallInvitePayload | null>(null);

  useEffect(() => {
    walletBalanceRef.current = Number(user?.walletBalance || 0);
    totalEarningsRef.current = Number(user?.totalEarnings || 0);
  }, [user?.walletBalance, user?.totalEarnings]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const hydrate = async () => {
      const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as LiveNotification[];
        if (Array.isArray(parsed)) {
          dispatch(hydrateNotifications(parsed));
        }
      } catch {
        await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      }
    };

    void hydrate();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [isAuthenticated, notifications]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !SOCKET_URL) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: `Bearer ${accessToken}`,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      dispatch(setSocketConnectedState(true));
    });

    socket.on("disconnect", () => {
      dispatch(setSocketConnectedState(false));
    });

    socket.on("notification:new", (notification: LiveNotification) => {
      const normalized: LiveNotification = {
        ...notification,
        id: notification.id || `NTF-${Date.now()}`,
        type: notification.type || "system",
        unread: true,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      dispatch(addNotification(normalized));

      const notificationData = (normalized.data || {}) as {
        notificationType?: string;
        providerEarningsAmount?: number;
      };

      if (notificationData.notificationType === "provider_verification_approved") {
        void updateProfile({
          payoutVerificationStatus: "verified",
          payoutInfo: {
            rejectionReason: "",
            reviewedAt: normalized.createdAt,
          },
        });
      }

      if (notificationData.notificationType === "provider_verification_rejected") {
        void updateProfile({
          payoutVerificationStatus: "rejected",
          payoutInfo: {
            rejectionReason: normalized.description || "",
            reviewedAt: normalized.createdAt,
          },
        });
      }

      if (notificationData.notificationType === "order_paid") {
        const earnings = Number(notificationData.providerEarningsAmount || 0);
        if (earnings > 0) {
          void updateProfile({
            walletBalance: walletBalanceRef.current + earnings,
            totalEarnings: totalEarningsRef.current + earnings,
          });
        }
      }
    });

    socket.on("call:invite", (payload: CallInvitePayload) => {
      if (!payload?.conversationId || payload.senderRole === "superAdmin") return;
      if (pathname === "/chat-details") return;
      setIncomingCall(payload);
    });

    socket.on("call:end", (payload: { conversationId?: string }) => {
      if (payload?.conversationId && payload.conversationId === incomingCallRef.current?.conversationId) {
        setIncomingCall(null);
      }
    });

    socket.on("call:blocked", () => {
      setIncomingCall(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      dispatch(setSocketConnectedState(false));
    };
  }, [accessToken, dispatch, isAuthenticated, pathname, updateProfile]);

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    await AsyncStorage.setItem(PENDING_INCOMING_CALL_STORAGE_KEY, JSON.stringify(incomingCall));
    setIncomingCall(null);
    router.push({
      pathname: "/chat-details",
      params: {
        conversationId: incomingCall.conversationId,
        incomingCall: "1",
      },
    });
  }, [incomingCall, router]);

  const cancelIncomingCall = useCallback(() => {
    if (incomingCall?.senderId && socketRef.current) {
      socketRef.current.emit("call:end", {
        conversationId: incomingCall.conversationId,
        targetUserId: incomingCall.senderId,
        callType: incomingCall.callType,
        reason: "declined",
      });
    }
    setIncomingCall(null);
  }, [incomingCall]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    dispatch(markAllNotificationsAsReadAction());
  }, [dispatch]);

  const clearNotifications = useCallback(async () => {
    dispatch(clearNotificationsAction());
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  }, [dispatch]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        socketConnected,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        clearNotifications,
      }}
    >
      {children}
      <Modal visible={Boolean(incomingCall)} transparent animationType="fade" onRequestClose={cancelIncomingCall}>
        <View className="flex-1 items-center justify-center bg-slate-950/70 px-5">
          <View className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <View className="bg-[#2286BE] px-5 py-5">
              <View className="flex-row items-center gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                  <Ionicons
                    name={incomingCall?.callType === "video" ? "videocam" : "call"}
                    size={28}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-black uppercase tracking-[2px] text-white/75">
                    Incoming {incomingCall?.callType === "video" ? "Video" : "Voice"} Call
                  </Text>
                  <Text className="mt-1 text-2xl font-black text-white">
                    {incomingCall?.senderName || "Someone"} is calling
                  </Text>
                </View>
              </View>
            </View>

            <View className="px-5 py-5">
              <Text className="text-sm font-bold leading-5 text-slate-600">
                Accept to open the conversation and connect the call.
              </Text>
              <View className="mt-5 flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={cancelIncomingCall}
                  className="h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white"
                >
                  <Text className="font-black text-slate-600">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={acceptIncomingCall}
                  className="h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-500"
                >
                  <Text className="font-black text-white">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SocketContext.Provider>
  );
}

export function useSocketNotifications() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketNotifications must be used within SocketProvider");
  }
  return context;
}
