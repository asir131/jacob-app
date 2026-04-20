import { mobileApi } from "@/src/lib/api";
import { formatCurrency, formatDateLabel, formatStatusLabel } from "@/src/lib/formatters";
import type { OrderSummary } from "@/src/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProviderOrders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const payload = await mobileApi.getProviderOrders(`page=1&limit=20&status=${filter}`);
        setOrders(payload.data.items || []);
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [filter]);

  const labelMap: Record<string, string> = useMemo(
    () => ({
      all: "All",
      pending: "New",
      accepted: "Active",
      accepting_delivery: "Delivered",
      completed: "Completed",
      declined: "Cancelled",
    }),
    []
  );

  const handleAccept = async (id: string) => {
    await mobileApi.acceptProviderOrder(id);
    setFilter("pending");
  };

  const handleDecline = async (id: string) => {
    await mobileApi.declineProviderOrder(id);
    setFilter("pending");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
        <Text className="text-[24px] font-bold text-[#1A2C42]">Manage Orders</Text>
      </View>

      <View className="px-6 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {Object.entries(labelMap).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              onPress={() => setFilter(value)}
              className={`px-5 py-2.5 rounded-full mr-3 border ${filter === value ? "bg-[#2B84B1] border-[#2B84B1]" : "border-gray-200 bg-white"}`}
            >
              <Text className={`font-bold text-[14px] ${filter === value ? "text-white" : "text-[#7C8B95]"}`}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B84B1" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
          {orders.map((order) => (
            <View key={order.id} className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm shadow-gray-100">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-[13px] text-[#A0AEC0] font-bold tracking-widest uppercase mb-1">{order.orderNumber}</Text>
                  <Text className="text-[16px] font-bold text-[#1A2C42] w-[220px]" numberOfLines={1}>{order.orderName}</Text>
                </View>
                <View className="px-3 py-1 rounded-full items-center justify-center bg-[#EAF3FA]">
                  <Text className="text-[12px] font-bold text-[#2B84B1]">{formatStatusLabel(order.status)}</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <Ionicons name="person-outline" size={16} color="#7C8B95" />
                <Text className="text-[14px] text-[#7C8B95] font-medium mx-2">{order.client.name}</Text>
                <Text className="text-[14px] font-bold text-[#2B84B1] ml-2">{formatCurrency(order.paymentAmount || order.packagePrice)}</Text>
              </View>

              <View className="flex-row items-center bg-gray-50 rounded-[12px] px-4 py-2 mb-4">
                <Ionicons name="time-outline" size={16} color="#FACC15" />
                <Text className="text-[13px] font-bold text-[#FACC15] ml-2 flex-1">
                  Due: {formatDateLabel(order.scheduledDate)}
                </Text>
              </View>

              <View className="flex-row flex-wrap border-t border-gray-100 pt-4 gap-2">
                <TouchableOpacity onPress={() => router.push("/(provider-tabs)/messages" as any)} className="flex-1 bg-gray-50 rounded-[12px] py-3 items-center border border-gray-200">
                  <Text className="text-[#1A2C42] font-bold text-[14px]">Message</Text>
                </TouchableOpacity>
                {order.status === "pending" ? (
                  <>
                    <TouchableOpacity onPress={() => void handleDecline(order.id)} className="flex-1 bg-gray-50 rounded-[12px] py-3 items-center border border-gray-200">
                      <Text className="text-[#1A2C42] font-bold text-[14px]">Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => void handleAccept(order.id)} className="flex-1 bg-[#2B84B1] rounded-[12px] py-3 items-center">
                      <Text className="text-white font-bold text-[14px]">Accept Order</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity className="flex-1 bg-[#2B84B1] rounded-[12px] py-3 items-center">
                    <Text className="text-white font-bold text-[14px]">Deliver Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {orders.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
              <Text className="text-[18px] font-bold text-[#1A2C42] mt-4">No orders found</Text>
              <Text className="text-[14px] text-[#7C8B95] mt-2">You don&apos;t have matching orders right now.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
