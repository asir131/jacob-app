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
import { router } from "expo-router";
import { io, type Socket } from "socket.io-client";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
export const PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY = "pending_incoming_call_candidates";
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

type CallSignalPayload = {
  conversationId: string;
  senderId?: string;
  signalType?: "offer" | "answer" | "candidate";
  signal?: RTCIceCandidateInit;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, updateProfile, user } = useAuth();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const socketConnected = useAppSelector((state) => state.notifications.socketConnected);
  const socketRef = useRef<Socket | null>(null);
  const incomingCallRef = useRef<CallInvitePayload | null>(null);
  const acceptedIncomingCallRef = useRef<CallInvitePayload | null>(null);
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
      acceptedIncomingCallRef.current = null;
      void AsyncStorage.removeItem(PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY);
      setIncomingCall(payload);
    });

    socket.on("call:signal", (payload: CallSignalPayload) => {
      const currentIncomingCall = incomingCallRef.current || acceptedIncomingCallRef.current;
      if (
        !currentIncomingCall ||
        payload?.conversationId !== currentIncomingCall.conversationId ||
        payload.signalType !== "candidate" ||
        !payload.signal
      ) {
        return;
      }

      void (async () => {
        try {
          const raw = await AsyncStorage.getItem(PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY);
          const existing = raw ? (JSON.parse(raw) as RTCIceCandidateInit[]) : [];
          const nextCandidates = Array.isArray(existing) ? [...existing, payload.signal!] : [payload.signal!];
          await AsyncStorage.setItem(
            PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY,
            JSON.stringify(nextCandidates)
          );
        } catch {
          await AsyncStorage.removeItem(PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY);
        }
      })();
    });

    socket.on("call:end", (payload: { conversationId?: string }) => {
      const currentIncomingCall = incomingCallRef.current || acceptedIncomingCallRef.current;
      if (payload?.conversationId && payload.conversationId === currentIncomingCall?.conversationId) {
        setIncomingCall(null);
        acceptedIncomingCallRef.current = null;
        void AsyncStorage.removeItem(PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY);
      }
    });

    socket.on("call:blocked", () => {
      setIncomingCall(null);
      acceptedIncomingCallRef.current = null;
      void AsyncStorage.removeItem(PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      dispatch(setSocketConnectedState(false));
    };
  }, [accessToken, dispatch, isAuthenticated, updateProfile]);

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    await AsyncStorage.setItem(PENDING_INCOMING_CALL_STORAGE_KEY, JSON.stringify(incomingCall));
    acceptedIncomingCallRef.current = incomingCall;
    setIncomingCall(null);
    router.replace({
      pathname: "/chat-details",
      params: {
        conversationId: incomingCall.conversationId,
        incomingCall: "1",
        autoAcceptIncomingCall: "1",
      },
    });
  }, [incomingCall]);

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
    acceptedIncomingCallRef.current = null;
    void AsyncStorage.removeItem(PENDING_INCOMING_CALL_CANDIDATES_STORAGE_KEY);
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
        <View style={styles.callOverlay}>
          <View style={styles.callCard}>
            <View style={styles.callHeader}>
              <View style={styles.callHeaderRow}>
                <View style={styles.callIconWrap}>
                  <Ionicons
                    name={incomingCall?.callType === "video" ? "videocam" : "call"}
                    size={28}
                    color="#fff"
                  />
                </View>
                <View style={styles.callTitleWrap}>
                  <Text style={styles.callEyebrow}>
                    Incoming {incomingCall?.callType === "video" ? "Video" : "Voice"} Call
                  </Text>
                  <Text style={styles.callTitle} numberOfLines={2}>
                    {incomingCall?.senderName || "Someone"} is calling
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.callBody}>
              <Text style={styles.callMessage}>
                Receive to open the conversation and connect the call.
              </Text>
              <View style={styles.callActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={cancelIncomingCall}
                  style={[styles.callButton, styles.declineButton]}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={acceptIncomingCall}
                  style={[styles.callButton, styles.receiveButton]}
                >
                  <Text style={styles.receiveButtonText}>Receive</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SocketContext.Provider>
  );
}

const styles = StyleSheet.create({
  callOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  callCard: {
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  callHeader: {
    backgroundColor: "#2286BE",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  callHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  callIconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    marginRight: 14,
  },
  callTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  callEyebrow: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  callTitle: {
    marginTop: 4,
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  callBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  callMessage: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  callActions: {
    flexDirection: "row",
    marginTop: 18,
  },
  callButton: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  declineButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    marginRight: 10,
  },
  receiveButton: {
    backgroundColor: "#10B981",
    marginLeft: 10,
  },
  declineButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "900",
  },
  receiveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});

export function useSocketNotifications() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketNotifications must be used within SocketProvider");
  }
  return context;
}
