import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { formatCurrency } from "@/src/lib/formatters";
import {
  useGetSavedServicesQuery,
  useRemoveSavedServiceMutation,
} from "@/src/store/services/apiSlice";

export default function ClientSavedServicesPage() {
  const router = useRouter();
  const { updateProfile, user } = useAuth();
  const { data, isLoading, refetch } = useGetSavedServicesQuery();
  const [removeSavedService, { isLoading: removing }] = useRemoveSavedServiceMutation();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const items = data?.data.items || [];

  const removeItem = async (gigId: string) => {
    try {
      setRemovingId(gigId);
      const payload = await removeSavedService(gigId).unwrap();
      await updateProfile(payload.data.user || { savedServiceIds: (user?.savedServiceIds || []).filter((item) => item !== gigId) });
      refetch();
    } catch (error) {
      Alert.alert("Could not remove service", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Saved Services</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#2286BE" size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          ListEmptyComponent={<View className="items-center justify-center py-20"><Ionicons name="heart-outline" size={54} color="#CBD5E1" /><Text className="text-[20px] font-bold text-[#1A2C42] mt-4">No saved services yet</Text></View>}
          renderItem={({ item }) => (
            <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden mb-5">
              <TouchableOpacity onPress={() => router.push({ pathname: "/service-details", params: { id: item.id } })}>
                <View className="h-[180px] bg-slate-100">{item.image ? <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" /> : null}</View>
              </TouchableOpacity>
              <View className="p-5">
                <Text className="text-[18px] font-bold text-[#1A2C42]" numberOfLines={2}>{item.title}</Text>
                <Text className="text-[14px] text-[#7C8B95] mt-1">{item.provider.name}</Text>
                <Text className="text-[16px] font-black text-[#2286BE] mt-3">{formatCurrency(item.avgPackagePrice)}</Text>
                <View className="flex-row mt-4 gap-x-3">
                  <TouchableOpacity onPress={() => router.push({ pathname: "/service-details", params: { id: item.id } })} className="flex-1 bg-[#2286BE] py-4 rounded-[18px] items-center">
                    <Text className="text-white font-bold">View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => void removeItem(item.id)}
                    disabled={removing && removingId === item.id}
                    className="px-5 bg-[#FFF0F0] py-4 rounded-[18px] items-center justify-center min-w-[76px]"
                  >
                    {removing && removingId === item.id ? (
                      <ActivityIndicator color="#FF4757" />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color="#FF4757" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
