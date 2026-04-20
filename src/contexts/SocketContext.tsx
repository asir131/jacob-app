import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { io, type Socket } from "socket.io-client";

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
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, updateProfile, user } = useAuth();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const socketConnected = useAppSelector((state) => state.notifications.socketConnected);
  const socketRef = useRef<Socket | null>(null);
  const walletBalanceRef = useRef(0);
  const totalEarningsRef = useRef(0);

  useEffect(() => {
    walletBalanceRef.current = Number(user?.walletBalance || 0);
    totalEarningsRef.current = Number(user?.totalEarnings || 0);
  }, [user?.walletBalance, user?.totalEarnings]);

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

    return () => {
      socket.disconnect();
      socketRef.current = null;
      dispatch(setSocketConnectedState(false));
    };
  }, [accessToken, dispatch, isAuthenticated, updateProfile]);

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
