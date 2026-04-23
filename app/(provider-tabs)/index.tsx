import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Alert, Image, Platform, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { useSocketNotifications } from "@/src/contexts/SocketContext";
import { formatCurrency } from "@/src/lib/formatters";
import {
  useAcceptProviderOrderMutation,
  useDeclineProviderOrderMutation,
  useGetProviderDashboardQuery,
} from "@/src/store/services/apiSlice";

const quickActions = [
  { label: "Create Gig", icon: "add", color: "#2B84B1", route: "/(provider)/create-service" },
  { label: "Orders", icon: "bar-chart", color: "#8B5CF6", route: "/(provider-tabs)/orders" },
  { label: "Messages", icon: "chatbubble", color: "#55A06F", route: "/(provider-tabs)/messages" },
  { label: "Requests", icon: "document-text", color: "#F59E0B", route: "/(provider)/requests" },
];

const formatRelativeTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount } = useSocketNotifications();
  const insets = useSafeAreaInsets();
  const tabBarHeight =
    Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const { data, refetch } = useGetProviderDashboardQuery();
  const [acceptOrder, { isLoading: accepting }] = useAcceptProviderOrderMutation();
  const [declineOrder, { isLoading: declining }] = useDeclineProviderOrderMutation();
  const dashboard = data?.data;
  const refetchMarkerRef = useRef("");
  const latestNotification = notifications[0];

  const statCards = [
    {
      label: "Active Orders",
      value: String(dashboard?.orders?.activeOrders || 0),
      icon: "briefcase-outline",
      color: "#2B84B1",
    },
    {
      label: "Pending Orders",
      value: String(dashboard?.orders?.pendingOrders || 0),
      icon: "time-outline",
      color: "#F59E0B",
    },
    {
      label: "Completed",
      value: String(dashboard?.orders?.completedOrders || 0),
      icon: "checkmark-circle-outline",
      color: "#10B981",
    },
    {
      label: "Rating",
      value: Number(dashboard?.ratings?.averageRating || 0).toFixed(1),
      icon: "star-outline",
      color: "#8B5CF6",
    },
  ];

  const requests = useMemo(
    () =>
      (dashboard?.pendingRequests || []).slice(0, 2).map((request: any) => ({
        id: String(request.id || request.orderId || request.orderNumber || ""),
        title: String(request.title || request.orderName || "Service order"),
        category: String(request.category || request.categoryName || "General"),
        customer: String(request.customer || request.client?.name || "Client"),
        address: String(request.address || request.serviceAddress || request.location || "Location not set"),
        time: String(request.time || request.createdAt || ""),
        avatar: String(request.avatar || request.client?.avatar || ""),
      })),
    [dashboard?.pendingRequests]
  );

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${user?.firstName || "this provider"} on Jacob.`,
      });
    } catch {
      // ignore share dismissal
    }
  };

  const handleAction = async (id: string, action: "accept" | "decline") => {
    try {
      if (action === "accept") {
        await acceptOrder(id).unwrap();
      } else {
        await declineOrder(id).unwrap();
      }
      await refetch();
    } catch (error) {
      Alert.alert(`${action === "accept" ? "Accept" : "Decline"} failed`, error instanceof Error ? error.message : "Please try again.");
    }
  };

  useEffect(() => {
    if (!latestNotification) return;
    const notificationType = String((latestNotification.data || {})?.notificationType || "");
    if (notificationType !== "order_created") return;
    if (refetchMarkerRef.current === latestNotification.id) return;
    refetchMarkerRef.current = latestNotification.id;
    void refetch();
  }, [latestNotification, refetch]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm shadow-black/5 z-10 w-full">
        <View className="flex-row items-center">
          <View className="relative mr-3">
            <Image source={{ uri: user?.avatar || "https://i.pravatar.cc/150?u=provider" }} className="w-14 h-14 rounded-full border-2 border-gray-100" />
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#55A06F] rounded-full border-2 border-white" />
          </View>
          <View>
            <Text className="text-[13px] text-[#7C8B95] font-bold tracking-wide">Good Morning,</Text>
            <Text className="text-[20px] font-black text-[#1A2C42]">{user?.firstName || "Provider"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/notifications")} className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center relative border border-gray-100">
          <Ionicons name="notifications-outline" size={24} color="#1A2C42" />
          {unreadCount ? <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> : null}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
        <View className="bg-[#1A2C42] rounded-[32px] p-6 mb-8">
          <Text className="text-white/70 text-[14px] font-bold mb-1 tracking-widest uppercase">Net Income</Text>
          <Text className="text-white text-[42px] font-black tracking-tight">{formatCurrency(dashboard?.revenue?.totalEarnings || 0)}</Text>
          <Text className="text-white/70 text-[14px] mt-2">Seller level: {(dashboard?.sellerLevel || user?.sellerLevel || "new").toUpperCase()}</Text>
          <View className="flex-row items-center justify-between bg-white/10 p-4 rounded-[20px] border border-white/10 mt-6">
            <View>
              <Text className="text-white/60 text-[12px] font-bold mb-1 uppercase">Available</Text>
              <Text className="text-white text-[18px] font-bold">{formatCurrency(dashboard?.revenue?.walletBalance || 0)}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(provider)/earnings" as never)} className="ml-auto bg-[#2B84B1] px-5 py-2.5 rounded-full">
              <Text className="text-white font-bold text-[13px]">Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row mb-8">
          <TouchableOpacity onPress={() => void handleShareProfile()} className="flex-1 mr-3 bg-white border border-gray-200 rounded-[18px] py-4 items-center">
            <Text className="font-bold text-[#1A2C42]">Share Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(provider)/create-service" as never)} className="flex-1 bg-[#2286BE] rounded-[18px] py-4 items-center">
            <Text className="font-bold text-white">Create New Gig</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between mb-8">
          {statCards.map((item) => (
            <View key={item.label} className="w-[48%] bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5 mb-4">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={item.color} />
              </View>
              <Text className="text-[24px] font-black text-[#1A2C42]">{item.value}</Text>
              <Text className="text-[12px] font-bold tracking-[0.16em] uppercase text-[#7C8B95] mt-2">{item.label}</Text>
            </View>
          ))}
        </View>

        <Text className="text-[18px] font-black text-[#1A2C42] mb-4 tracking-tight">Quick Actions</Text>
        <View className="mb-8 flex-row flex-wrap">
          {quickActions.map((action) => (
            <TouchableOpacity key={action.label} onPress={() => router.push(action.route as never)} className="items-center mr-6 mb-4">
              <View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2" style={{ backgroundColor: action.color }}>
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={28} color="white" />
              </View>
              <Text className="text-[13px] font-bold text-[#1A2C42]">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm shadow-black/5 mb-8">
          <Text className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#7C8B95]">Business Health</Text>
          <View className="flex-row mt-5">
            <View className="flex-1 mr-3 bg-[#F8FAFC] rounded-[20px] px-4 py-4">
              <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Completion Rate</Text>
              <Text className="text-[26px] font-black text-[#1A2C42] mt-2">{Math.round(Number(dashboard?.orders?.completionRate || 0))}%</Text>
            </View>
            <View className="flex-1 bg-[#F8FAFC] rounded-[20px] px-4 py-4">
              <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Reviews</Text>
              <Text className="text-[26px] font-black text-[#1A2C42] mt-2">{dashboard?.ratings?.reviewCount || 0}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm shadow-black/5 mb-8">
          <View className="mb-5">
            <View>
              <Text className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#7C8B95]">Earnings Trend</Text>
              <Text className="text-[22px] font-black text-[#1A2C42] mt-2">Recent Performance</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(provider)/earnings" as never)} className="mt-3 self-start">
              <Text className="text-[14px] font-bold text-[#2286BE]">View Earnings</Text>
            </TouchableOpacity>
          </View>
          {(dashboard?.earningsAnalytics || []).length ? (
            (dashboard?.earningsAnalytics || []).slice(-4).map((item) => (
              <View key={item.name} className="flex-row items-center justify-between py-3 border-b border-[#F1F5F9] last:border-b-0">
                <Text className="text-[15px] font-semibold text-[#1A2C42]">{item.name || "Period"}</Text>
                <Text className="text-[16px] font-black text-[#2286BE]">{formatCurrency(item.earnings || 0)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-[14px] leading-[22px] text-[#7C8B95]">Earnings trend data will appear here as your completed orders grow.</Text>
          )}
        </View>

        <View className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm shadow-black/5">
          <View className="mb-5">
            <View>
              <Text className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#7C8B95]">Request Inbox</Text>
              <Text className="text-[22px] font-black text-[#1A2C42] mt-2">Pending Opportunities</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(provider)/requests" as never)} className="mt-3 self-start">
              <Text className="text-[14px] font-bold text-[#2286BE]">Open Requests</Text>
            </TouchableOpacity>
          </View>

          {requests.length ? (
            requests.map((req) => (
              <View key={req.id} className="bg-[#F8FAFC] rounded-[20px] p-4 mb-4 last:mb-0">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D97706]">Incoming Order</Text>
                  <Text className="text-[11px] font-bold text-[#94A3B8]">{formatRelativeTime(req.time)}</Text>
                </View>
                <Text className="text-[16px] font-bold text-[#1A2C42]">{req.title}</Text>
                <Text className="text-[12px] font-bold tracking-[0.16em] uppercase text-[#94A3B8] mt-2">{req.category}</Text>
                <View className="flex-row items-center mt-3">
                  {req.avatar ? (
                    <Image source={{ uri: req.avatar }} className="w-9 h-9 rounded-full mr-3" />
                  ) : (
                    <View className="w-9 h-9 rounded-full mr-3 bg-white items-center justify-center">
                      <Ionicons name="person" size={16} color="#2286BE" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-[14px] font-bold text-[#1A2C42]">{req.customer}</Text>
                    <Text className="text-[13px] text-[#7C8B95] mt-1">{req.address}</Text>
                  </View>
                </View>
                <View className="flex-row mt-4">
                  <TouchableOpacity
                    onPress={() => void handleAction(req.id, "decline")}
                    disabled={declining}
                    className="flex-1 mr-3 bg-white rounded-[16px] py-3 items-center border border-gray-200"
                  >
                    <Text className="font-bold text-[#1A2C42]">{declining ? "Declining..." : "Decline"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => void handleAction(req.id, "accept")}
                    disabled={accepting}
                    className="flex-1 bg-[#2286BE] rounded-[16px] py-3 items-center"
                  >
                    <Text className="font-bold text-white">{accepting ? "Accepting..." : "Accept"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <>
              <Text className="text-[16px] font-bold text-[#1A2C42]">{dashboard?.pendingRequests?.length || 0} nearby requests</Text>
              <Text className="text-[14px] leading-[22px] text-[#7C8B95] mt-3">
                Stay active in the request inbox to respond quickly and turn custom jobs into booked orders.
              </Text>
            </>
          )}
          <TouchableOpacity onPress={() => router.push("/(provider-tabs)/orders" as never)} className="mt-5 self-start">
            <Text className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#2286BE]">All Orders History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
