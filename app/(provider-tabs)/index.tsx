import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { useSocketNotifications } from "@/src/contexts/SocketContext";
import { formatCurrency } from "@/src/lib/formatters";
import { useGetProviderDashboardQuery } from "@/src/store/services/apiSlice";

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useSocketNotifications();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const { data } = useGetProviderDashboardQuery();
  const dashboard = data?.data;

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
          <View className="flex-row items-center justify-between bg-white/10 p-4 rounded-[20px] border border-white/10 mt-6">
            <View>
              <Text className="text-white/60 text-[12px] font-bold mb-1 uppercase">Available</Text>
              <Text className="text-white text-[18px] font-bold">{formatCurrency(dashboard?.revenue?.walletBalance || 0)}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(provider)/earnings" as any)} className="ml-auto bg-[#2B84B1] px-5 py-2.5 rounded-full"><Text className="text-white font-bold text-[13px]">Withdraw</Text></TouchableOpacity>
          </View>
        </View>
        <Text className="text-[18px] font-black text-[#1A2C42] mb-4 tracking-tight">Quick Actions</Text>
        <View className="mb-8 flex-row">
          <TouchableOpacity onPress={() => router.push("/(provider)/create-service" as any)} className="items-center mr-6"><View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#2B84B1]"><Ionicons name="add" size={28} color="white" /></View><Text className="text-[13px] font-bold text-[#1A2C42]">Create Gig</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(provider-tabs)/orders" as any)} className="items-center mr-6"><View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#8B5CF6]"><Ionicons name="bar-chart" size={28} color="white" /></View><Text className="text-[13px] font-bold text-[#1A2C42]">Orders</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(provider-tabs)/messages" as any)} className="items-center"><View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#55A06F]"><Ionicons name="chatbubble" size={28} color="white" /></View><Text className="text-[13px] font-bold text-[#1A2C42]">Messages</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(provider)/requests" as any)} className="items-center ml-6"><View className="w-16 h-16 rounded-[22px] items-center justify-center mb-2 bg-[#F59E0B]"><Ionicons name="document-text" size={28} color="white" /></View><Text className="text-[13px] font-bold text-[#1A2C42]">Requests</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
