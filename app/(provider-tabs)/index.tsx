import { useAuth } from "@/src/contexts/AuthContext";
import { mobileApi } from "@/src/lib/api";
import { formatCurrency } from "@/src/lib/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type DashboardData = {
  revenue?: {
    totalEarnings?: number;
    walletBalance?: number;
  };
  orders?: {
    activeOrders?: number;
    completedOrders?: number;
    pendingOrders?: number;
  };
  ratings?: {
    averageRating?: number;
  };
};

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const payload = await mobileApi.request<DashboardData>("/api/orders/provider/dashboard");
      setDashboard(payload.data);
    };

    void loadDashboard();
  }, []);

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
        <TouchableOpacity onPress={() => router.push("/(provider)/notifications" as any)} className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center relative border border-gray-100">
          <Ionicons name="notifications-outline" size={24} color="#1A2C42" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
        <View className="bg-[#1A2C42] rounded-[32px] p-6 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white/70 text-[14px] font-bold mb-1 tracking-widest uppercase">Net Income</Text>
              <Text className="text-white text-[42px] font-black tracking-tight">
                {formatCurrency(dashboard?.revenue?.totalEarnings || 0)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(provider)/earnings" as any)} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20">
              <Ionicons name="wallet" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between bg-white/10 p-4 rounded-[20px] border border-white/10">
            <View>
              <Text className="text-white/60 text-[12px] font-bold mb-1 uppercase">Available</Text>
              <Text className="text-white text-[18px] font-bold">{formatCurrency(dashboard?.revenue?.walletBalance || 0)}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(provider)/earnings" as any)} className="ml-auto bg-[#2B84B1] px-5 py-2.5 rounded-full">
              <Text className="text-white font-bold text-[13px]">Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-[18px] font-black text-[#1A2C42] mb-4 tracking-tight">Quick Actions</Text>
        <View className="mb-8 flex-row">
          <TouchableOpacity onPress={() => router.push("/(provider)/create-service" as any)} className="items-center mr-6">
            <View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#2B84B1]">
              <Ionicons name="add" size={28} color="white" />
            </View>
            <Text className="text-[13px] font-bold text-[#1A2C42]">Create Gig</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(provider-tabs)/orders" as any)} className="items-center mr-6">
            <View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#8B5CF6]">
              <Ionicons name="bar-chart" size={28} color="white" />
            </View>
            <Text className="text-[13px] font-bold text-[#1A2C42]">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(provider-tabs)/messages" as any)} className="items-center">
            <View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#55A06F]">
              <Ionicons name="chatbubble" size={28} color="white" />
            </View>
            <Text className="text-[13px] font-bold text-[#1A2C42]">Messages</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[18px] font-black text-[#1A2C42] mb-4 tracking-tight">Performance</Text>
        <View className="flex-row flex-wrap">
          {[
            { label: "Active Orders", value: String(dashboard?.orders?.activeOrders || 0), color: "#2B84B1", icon: "briefcase" as const },
            { label: "Completed", value: String(dashboard?.orders?.completedOrders || 0), color: "#55A06F", icon: "checkmark-circle" as const },
            { label: "Pending", value: String(dashboard?.orders?.pendingOrders || 0), color: "#FACC15", icon: "time" as const },
            { label: "Avg Rating", value: Number(dashboard?.ratings?.averageRating || 0).toFixed(1), color: "#FF9500", icon: "star" as const },
          ].map((stat) => (
            <View key={stat.label} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-gray-100 w-[48%] mr-[4%] mb-4">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${stat.color}15` }}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text className="text-[28px] font-black text-[#1A2C42] mb-1">{stat.value}</Text>
              <Text className="text-[13px] text-[#7C8B95] font-bold">{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
