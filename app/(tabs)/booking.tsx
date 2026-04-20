import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { formatCurrency, formatDateLabel, formatStatusLabel, formatTimeLabel } from "@/src/lib/formatters";
import { useGetClientOrdersQuery } from "@/src/store/services/apiSlice";

export default function BookingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const { data, isLoading } = useGetClientOrdersQuery({ page: 1, limit: 20, status: "all" });
  const filteredOrders = useMemo(() => {
    const orders = data?.data.items || [];
    if (activeTab === "History") return orders.filter((item) => item.status === "completed");
    if (activeTab === "Draft") return orders.filter((item) => item.paymentStatus !== "paid");
    return orders.filter((item) => item.status !== "completed");
  }, [activeTab, data?.data.items]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-6 flex-row items-center">
        <View className="w-1 h-6 bg-[#2286BE] rounded-full mr-3" />
        <Text className="text-[24px] font-bold text-[#1A2C42]">Bookings</Text>
      </View>
      <View className="px-6 flex-row mb-8">
        {["Upcoming", "History", "Draft"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl mr-3 ${activeTab === tab ? "bg-[#EAF3FA]" : "bg-transparent"}`}>
            <Text className={`text-[15px] font-semibold ${activeTab === tab ? "text-[#2286BE]" : "text-[#7C8B95]"}`}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#2286BE" /></View>
      ) : filteredOrders.length > 0 ? (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
          {filteredOrders.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => router.push({ pathname: "/booking-details", params: { id: item.id, role: "client" } })} className="mb-8 border border-[#F2F2F2] rounded-[24px] overflow-hidden">
              <View className="p-5">
                <View className="flex-row items-center mb-5">
                  <View className="w-14 h-14 rounded-full items-center justify-center mr-4 bg-[#EAF3FA]"><Ionicons name="briefcase-outline" size={24} color="#2286BE" /></View>
                  <View className="flex-1">
                    <Text className="text-[18px] font-bold text-[#1A2C42]">{item.orderName}</Text>
                    <Text className="text-[13px] text-[#7C8B95] mt-1">Reference Code: {item.orderNumber}</Text>
                  </View>
                </View>
                <View className="h-[1px] bg-[#F2F2F2] mb-5" />
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-[15px] text-[#7C8B95] font-medium">Status</Text>
                  <View className="px-4 py-1.5 rounded-lg bg-[#EAF6ED]"><Text className="text-[13px] font-bold text-[#55A06F]">{formatStatusLabel(item.status)}</Text></View>
                </View>
                <View className="flex-row items-center mb-6">
                  <View className="w-10 h-10 rounded-full border border-[#F2F2F2] items-center justify-center mr-4"><Ionicons name="calendar-outline" size={20} color="#7C8B95" /></View>
                  <View>
                    <Text className="text-[15px] font-bold text-[#1A2C42]">{formatDateLabel(item.scheduledDate)}, {formatTimeLabel(item.scheduledTime)}</Text>
                    <Text className="text-[13px] text-[#7C8B95] mt-0.5">Schedule</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {item.provider.avatar ? <Image source={{ uri: item.provider.avatar }} className="w-10 h-10 rounded-full mr-4" /> : <View className="w-10 h-10 rounded-full mr-4 bg-[#EAF3FA]" />}
                    <View>
                      <Text className="text-[15px] font-bold text-[#1A2C42]">{item.provider.name}</Text>
                      <Text className="text-[13px] text-[#7C8B95] mt-0.5">{formatCurrency(item.paymentAmount || item.packagePrice)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-10" style={{ paddingBottom: tabBarHeight + 20 }}>
          <View className="mb-8"><View className="relative w-24 h-24 items-center justify-center"><Ionicons name="clipboard-outline" size={80} color="#2286BE" /><View className="absolute bottom-2 right-0 bg-white rounded-full p-1"><MaterialCommunityIcons name="pencil-circle" size={36} color="#48D1CC" /></View></View></View>
          <Text className="text-[22px] font-bold text-[#1A2C42] mb-3 text-center">No bookings yet</Text>
          <Text className="text-[15px] text-[#7C8B95] text-center leading-[22px] mb-10">Currently you don&apos;t have any matching bookings. Browse services and place your first order.</Text>
          <TouchableOpacity onPress={() => router.push("/services")} className="bg-[#2286BE] px-10 py-5 rounded-[20px] w-full"><Text className="text-white text-[18px] font-bold text-center">View all services</Text></TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
