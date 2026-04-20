import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/src/lib/formatters";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGetPublicServicesQuery } from "@/src/store/services/apiSlice";

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { title, categorySlug } = useLocalSearchParams<{ title?: string; categorySlug?: string }>();
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, error } = useGetPublicServicesQuery({
    page: 1,
    limit: 24,
    radiusKm: 25,
    categorySlug: categorySlug || "all",
    search,
    lat: typeof user?.locationLat === "number" ? user.locationLat : null,
    lng: typeof user?.locationLng === "number" ? user.locationLng : null,
  });
  const services = data?.data.items || [];
  const screenTitle = useMemo(() => title || "Services", [title]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 pt-4 pb-10 rounded-b-[30px]">
        <View className="flex-row items-center bg-white rounded-[24px] pl-3 pr-2 py-1.5 border border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={26} color="#2B84B1" />
          </TouchableOpacity>
          <TextInput
            placeholder="Search services"
            placeholderTextColor="#A0AEC0"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-[16px] font-medium text-[#1A2C42] px-2"
          />
          <TouchableOpacity className="bg-[#2B84B1] w-[46px] h-[46px] rounded-[16px] items-center justify-center">
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="px-6 mb-8 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-1.5 h-6 bg-[#2B84B1] rounded-full mr-3.5" />
            <Text className="text-[22px] font-bold text-[#1A2C42]">{screenTitle}</Text>
          </View>
        </View>

        {isLoading || isFetching ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2B84B1" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-[#7C8B95] font-medium mb-4">Could not load services.</Text>
          </View>
        ) : (
          <FlatList
            data={services}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/service-details", params: { id: item.id } })}
                className="mb-8 px-6"
              >
                <View className="relative w-full h-[220px] rounded-[24px] overflow-hidden mb-4 bg-slate-100">
                  {item.image ? (
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Ionicons name="image-outline" size={42} color="#94A3B8" />
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mb-1">
                  {item.provider.avatar ? (
                    <Image source={{ uri: item.provider.avatar }} className="w-5 h-5 rounded-full mr-2" />
                  ) : (
                    <View className="w-5 h-5 rounded-full mr-2 bg-[#EAF3FA]" />
                  )}
                  <Text className="text-[14px] font-bold text-[#2B84B1]">{item.provider.name}</Text>
                </View>
                <Text className="text-[15px] text-[#7C8B95] mb-2 font-medium" numberOfLines={2}>{item.title}</Text>
                <Text className="text-[16px] font-black text-[#1A2C42]">From {formatCurrency(item.avgPackagePrice)}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center px-8 pt-16">
                <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">No services found</Text>
                <Text className="text-center text-[#7C8B95]">Try another category or search term.</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
