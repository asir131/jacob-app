import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { formatCurrency, formatDateLabel } from "@/src/lib/formatters";
import {
  useAcceptServiceRequestMutation,
  useGetProviderServiceRequestsQuery,
  useIgnoreServiceRequestMutation,
} from "@/src/store/services/apiSlice";

const kmToMiles = (km: number) => (km * 0.621371).toFixed(1);

export default function ProviderRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [actingRequestId, setActingRequestId] = useState<string | null>(null);
  const { data, isLoading, refetch } = useGetProviderServiceRequestsQuery({ page: 1, limit: 20, radiusKm: 30, search });
  const [acceptServiceRequest, { isLoading: accepting }] = useAcceptServiceRequestMutation();
  const [ignoreServiceRequest, { isLoading: ignoring }] = useIgnoreServiceRequestMutation();
  const items = data?.data.items || [];

  const acceptItem = async (id: string) => {
    try {
      setActingRequestId(id);
      await acceptServiceRequest(id).unwrap();
      refetch();
      Alert.alert("Accepted", "Service request accepted successfully.");
    } catch (error) {
      Alert.alert("Accept failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setActingRequestId(null);
    }
  };

  const ignoreItem = async (id: string) => {
    try {
      setActingRequestId(id);
      await ignoreServiceRequest(id).unwrap();
      refetch();
    } catch (error) {
      Alert.alert("Ignore failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setActingRequestId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Requested Orders</Text>
      </View>
      <View className="px-6 pt-5">
        <TextInput value={search} onChangeText={setSearch} placeholder="Search requests..." className="bg-white rounded-[18px] px-4 py-4 text-[15px] mb-4" />
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#2286BE" size="large" /></View>
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {items.length ? items.map((item) => (
            <View key={item.id} className="bg-white rounded-[24px] p-5 mb-5 border border-gray-100 shadow-sm shadow-gray-100">
              <Text className="text-[12px] font-bold uppercase tracking-widest text-[#A0AEC0]">{item.requestNumber}</Text>
              <Text className="text-[18px] font-bold text-[#1A2C42] mt-2">{item.categoryName}</Text>
              <Text className="text-[14px] text-[#7C8B95] mt-3 leading-[22px]">{item.description}</Text>
              <Text className="text-[13px] text-[#7C8B95] mt-3">{item.serviceAddress}</Text>
              <View className="flex-row justify-between mt-4">
                <Text className="text-[13px] font-bold text-[#2286BE]">{formatCurrency(item.budget)}</Text>
                <Text className="text-[13px] text-[#7C8B95]">{formatDateLabel(item.preferredDate)} • {item.preferredTime}</Text>
              </View>
              {typeof item.distanceKm === "number" ? <Text className="text-[12px] font-bold uppercase tracking-widest text-[#2286BE] mt-3">{kmToMiles(item.distanceKm)} mi away</Text> : null}
              <View className="flex-row gap-x-3 mt-5">
                <TouchableOpacity
                  onPress={() => void ignoreItem(item.id)}
                  disabled={ignoring && actingRequestId === item.id}
                  className="flex-1 bg-[#F8FAFC] py-4 rounded-[18px] items-center justify-center"
                >
                  {ignoring && actingRequestId === item.id ? (
                    <ActivityIndicator color="#1A2C42" />
                  ) : (
                    <Text className="font-bold text-[#1A2C42]">Ignore</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void acceptItem(item.id)}
                  disabled={accepting && actingRequestId === item.id}
                  className="flex-1 bg-[#2286BE] py-4 rounded-[18px] items-center justify-center"
                >
                  {accepting && actingRequestId === item.id ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-bold text-white">Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )) : <View className="items-center justify-center py-20"><Ionicons name="document-text-outline" size={54} color="#CBD5E1" /><Text className="text-[20px] font-bold text-[#1A2C42] mt-4">No nearby requests</Text></View>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
