import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatCurrency, formatDateLabel } from "@/src/lib/formatters";
import { formatMilesFromKm } from "@/src/lib/distance";
import {
  useAcceptServiceRequestMutation,
  useGetProviderServiceRequestsQuery,
  useIgnoreServiceRequestMutation,
} from "@/src/store/services/apiSlice";
import type { ServiceRequestSummary } from "@/src/types/api";

export default function ProviderRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actingRequestId, setActingRequestId] = useState<string | null>(null);
  const { data, isLoading, isFetching, refetch } = useGetProviderServiceRequestsQuery({
    page,
    limit: 8,
    radiusKm: 30,
    search,
  });
  const [acceptServiceRequest, { isLoading: accepting }] = useAcceptServiceRequestMutation();
  const [ignoreServiceRequest, { isLoading: ignoring }] = useIgnoreServiceRequestMutation();
  const items = (data?.data.items || []) as ServiceRequestSummary[];
  const pagination = data?.data.pagination;

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
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Requested Orders</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="px-6 pt-6">
          <View className="bg-[#1A2C42] rounded-[30px] p-6 mb-6">
            <Text className="text-white/65 text-[12px] font-bold tracking-[0.18em] uppercase">Nearby Work</Text>
            <Text className="text-white text-[34px] font-black mt-3">{pagination?.totalItems || items.length}</Text>
            <Text className="text-white/75 text-[14px] mt-1">Open requests within {formatMilesFromKm(30)} of your service area.</Text>
          </View>

          <View className="bg-white rounded-[22px] px-4 py-3 border border-gray-100 flex-row items-center mb-5">
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setPage(1);
              }}
              placeholder="Search requests..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 text-[15px] font-medium text-[#1A2C42]"
            />
          </View>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color="#2286BE" size="large" />
          </View>
        ) : (
          <View className="px-6">
            {items.length ? (
              items.map((item) => (
                <View key={item.id} className="bg-white rounded-[28px] p-5 mb-5 border border-gray-100 shadow-sm shadow-black/5">
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1 pr-3">
                      <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#A0AEC0]">
                        {item.requestNumber}
                      </Text>
                      <Text className="text-[21px] font-black text-[#1A2C42] mt-2">{item.categoryName}</Text>
                      <Text className="text-[13px] text-[#7C8B95] mt-2">{item.serviceAddress}</Text>
                    </View>
                    <View className="px-3 py-2 rounded-full bg-[#EAF3FA]">
                      <Text className="text-[11px] font-bold uppercase text-[#2286BE]">Open</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center bg-[#F8FAFC] rounded-[20px] px-4 py-4 mb-4">
                    {item.client.avatar ? (
                      <Image source={{ uri: item.client.avatar }} className="w-12 h-12 rounded-full mr-3" />
                    ) : (
                      <View className="w-12 h-12 rounded-full mr-3 bg-[#EAF3FA] items-center justify-center">
                        <Ionicons name="person" size={22} color="#2286BE" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-[#1A2C42]">{item.client.name}</Text>
                      <Text className="text-[13px] text-[#7C8B95] mt-1">{item.client.address || item.client.phone || "Client info available after acceptance"}</Text>
                    </View>
                  </View>

                  <Text className="text-[14px] text-[#5F7182] leading-[22px]">{item.description}</Text>

                  <View className="flex-row mt-5">
                    <View className="flex-1 mr-3 bg-[#F8FAFC] rounded-[18px] px-4 py-4">
                      <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Budget</Text>
                      <Text className="text-[18px] font-black text-[#1A2C42] mt-2">{formatCurrency(item.budget)}</Text>
                    </View>
                    <View className="flex-1 bg-[#F8FAFC] rounded-[18px] px-4 py-4">
                      <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Preferred</Text>
                      <Text className="text-[14px] font-bold text-[#1A2C42] mt-2">
                        {formatDateLabel(item.preferredDate)} • {item.preferredTime}
                      </Text>
                    </View>
                  </View>

                  {typeof item.distanceKm === "number" ? (
                    <Text className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2286BE] mt-4">
                      {formatMilesFromKm(item.distanceKm)} away
                    </Text>
                  ) : null}

                  <View className="flex-row mt-5">
                    <TouchableOpacity
                      onPress={() => void ignoreItem(item.id)}
                      disabled={ignoring && actingRequestId === item.id}
                      className="flex-1 bg-[#F8FAFC] py-4 rounded-[18px] items-center justify-center mr-3"
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
              ))
            ) : (
              <View className="items-center justify-center py-24">
                <View className="w-24 h-24 rounded-full bg-[#EAF3FA] items-center justify-center mb-5">
                  <Ionicons name="document-text-outline" size={42} color="#2286BE" />
                </View>
                <Text className="text-[24px] font-black text-[#1A2C42]">No nearby requests</Text>
                <Text className="text-[15px] leading-[24px] text-[#7C8B95] text-center mt-3 max-w-[280px]">
                  New nearby client requests will appear here when work matches your service area.
                </Text>
              </View>
            )}

            {pagination && pagination.totalPages > 1 ? (
              <View className="bg-white border border-[#E2E8F0] rounded-[20px] px-4 py-4 flex-row items-center justify-between mt-2">
                <TouchableOpacity
                  disabled={!pagination.hasPrevPage || isFetching}
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`px-4 py-3 rounded-[16px] ${pagination.hasPrevPage ? "bg-[#F8FAFC]" : "bg-[#E2E8F0]"}`}
                >
                  <Text className={`font-bold ${pagination.hasPrevPage ? "text-[#1A2C42]" : "text-[#94A3B8]"}`}>Prev</Text>
                </TouchableOpacity>
                <Text className="text-[13px] font-bold tracking-[0.18em] uppercase text-[#64748B]">
                  {page} / {pagination.totalPages}
                </Text>
                <TouchableOpacity
                  disabled={!pagination.hasNextPage || isFetching}
                  onPress={() => setPage((prev) => prev + 1)}
                  className={`px-4 py-3 rounded-[16px] ${pagination.hasNextPage ? "bg-[#F8FAFC]" : "bg-[#E2E8F0]"}`}
                >
                  <Text className={`font-bold ${pagination.hasNextPage ? "text-[#1A2C42]" : "text-[#94A3B8]"}`}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
