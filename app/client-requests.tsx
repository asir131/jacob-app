import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { formatCurrency, formatDateLabel } from "@/src/lib/formatters";
import { useGetClientServiceRequestsQuery } from "@/src/store/services/apiSlice";

const STATUS_OPTIONS = ["all", "open", "accepted", "cancelled"] as const;

export default function ClientRequestsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const { data, isLoading } = useGetClientServiceRequestsQuery({ page: 1, limit: 20, status });
  const items = data?.data.items || [];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">My Requests</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 pt-5 mb-1" contentContainerStyle={{ paddingRight: 24 }}>
        {STATUS_OPTIONS.map((option) => (
          <TouchableOpacity key={option} onPress={() => setStatus(option)} className={`px-4 py-3 rounded-[18px] mr-3 ${status === option ? "bg-[#2286BE]" : "bg-white border border-gray-200"}`}>
            <Text className={`font-bold capitalize ${status === option ? "text-white" : "text-[#1A2C42]"}`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#2286BE" size="large" /></View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {items.length ? items.map((item) => (
            <View key={item.id} className="bg-white rounded-[24px] p-5 mb-5 border border-gray-100 shadow-sm shadow-gray-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                  <Text className="text-[12px] font-bold uppercase tracking-widest text-[#A0AEC0]">{item.requestNumber}</Text>
                  <Text className="text-[18px] font-bold text-[#1A2C42] mt-2">{item.categoryName}</Text>
                </View>
              </View>
              <Text className="text-[14px] text-[#7C8B95] mt-3 leading-[22px]">{item.description}</Text>
              <View className="flex-row items-center mt-4">
                <Ionicons name="location-outline" size={16} color="#94A3B8" />
                <Text className="text-[13px] text-[#7C8B95] ml-2 flex-1">{item.serviceAddress}</Text>
              </View>
              <View className="flex-row justify-between mt-4">
                <Text className="text-[13px] font-bold text-[#2286BE]">{formatCurrency(item.budget)}</Text>
                <Text className="text-[13px] text-[#7C8B95]">{formatDateLabel(item.preferredDate)} • {item.preferredTime}</Text>
              </View>
              {item.acceptedProvider?.name ? <Text className="text-[14px] font-bold text-[#1A2C42] mt-4">Accepted By: {item.acceptedProvider.name}</Text> : null}
              {item.linkedOrderId ? (
                <TouchableOpacity onPress={() => router.push({ pathname: "/booking-details", params: { id: item.linkedOrderId, role: "client" } })} className="mt-3 self-start bg-[#2286BE] px-4 py-3 rounded-[16px]">
                  <Text className="text-white font-bold text-[13px]">Open Linked Order</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )) : <View className="items-center justify-center py-20"><Ionicons name="clipboard-outline" size={54} color="#CBD5E1" /><Text className="text-[20px] font-bold text-[#1A2C42] mt-4">No requests yet</Text></View>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
