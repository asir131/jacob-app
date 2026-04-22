import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { formatMilesFromKm, milesToKm } from "@/src/lib/distance";
import { formatCurrency } from "@/src/lib/formatters";
import { useAppSelector } from "@/src/store/hooks";
import { useGetPublicServicesQuery } from "@/src/store/services/apiSlice";
import type { PublicServiceCard } from "@/src/types/api";

const providerTypeOptions = ["All", "Solo", "Team"];
const ratingOptions = [
  { id: 0, label: "Any" },
  { id: 4, label: "4.0+" },
  { id: 4.5, label: "4.5+" },
];

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { title, categorySlug } = useLocalSearchParams<{ title?: string; categorySlug?: string }>();
  const location = useAppSelector((state) => state.location);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [providerType, setProviderType] = useState("All");
  const [minRating, setMinRating] = useState(0);

  const queryArgs = {
    page,
    limit: 8,
    radiusKm: milesToKm(location.radius),
    requireCoverage: true,
    categorySlug: categorySlug || "all",
    search,
    lat: typeof user?.locationLat === "number" ? user.locationLat : location.coordinates?.lat ?? null,
    lng: typeof user?.locationLng === "number" ? user.locationLng : location.coordinates?.lng ?? null,
  };

  const { data, isLoading, isFetching, error } = useGetPublicServicesQuery(queryArgs);
  const rawServices = useMemo(() => ((data?.data.items || []) as PublicServiceCard[]), [data?.data.items]);
  const services = useMemo(() => {
    return rawServices.filter((item) => {
      const nextProviderType = item.expertType === "team" ? "Team" : "Solo";
      if (providerType !== "All" && providerType !== nextProviderType) return false;
      const rating = Number(item.provider.rating || 0);
      if (minRating > 0 && rating < minRating) return false;
      return true;
    });
  }, [minRating, providerType, rawServices]);
  const screenTitle = useMemo(() => title || "Services", [title]);
  const pagination = data?.data.pagination;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 pt-4 pb-6 rounded-b-[30px] bg-white shadow-sm shadow-black/5">
        <View className="flex-row items-center bg-white rounded-[24px] pl-3 pr-2 py-1.5 border border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={26} color="#2B84B1" />
          </TouchableOpacity>
          <TextInput
            placeholder="Search services"
            placeholderTextColor="#A0AEC0"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
            className="flex-1 text-[16px] font-medium text-[#1A2C42] px-2"
          />
          <TouchableOpacity className="bg-[#2B84B1] w-[46px] h-[46px] rounded-[16px] items-center justify-center">
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-5 bg-[#F8FAFC] rounded-[22px] px-4 py-4">
          <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Search Radius</Text>
          <Text className="text-[18px] font-black text-[#1A2C42] mt-2">{location.radius} miles around {location.city}</Text>
        </View>
      </View>

      <View className="flex-1">
        <View className="px-6 mt-6 mb-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-1.5 h-6 bg-[#2B84B1] rounded-full mr-3.5" />
            <Text className="text-[22px] font-bold text-[#1A2C42]">{screenTitle}</Text>
          </View>
          <Text className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#7C8B95]">
            {pagination?.totalItems || services.length} results
          </Text>
        </View>

        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View className="mb-4">
                <FlatList
                  data={providerTypeOptions}
                  horizontal
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24 }}
                  renderItem={({ item }) => {
                    const active = providerType === item;
                    return (
                      <TouchableOpacity
                        onPress={() => setProviderType(item)}
                        className={`px-4 py-3 rounded-full mr-3 border ${active ? "bg-[#2286BE] border-[#2286BE]" : "bg-white border-gray-200"}`}
                      >
                        <Text className={`font-bold text-[13px] ${active ? "text-white" : "text-[#64748B]"}`}>{item}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              <View className="mb-6">
                <FlatList
                  data={ratingOptions}
                  horizontal
                  keyExtractor={(item) => String(item.id)}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24 }}
                  renderItem={({ item }) => {
                    const active = minRating === item.id;
                    return (
                      <TouchableOpacity
                        onPress={() => setMinRating(item.id)}
                        className={`px-4 py-3 rounded-full mr-3 border ${active ? "bg-[#1A2C42] border-[#1A2C42]" : "bg-white border-gray-200"}`}
                      >
                        <Text className={`font-bold text-[13px] ${active ? "text-white" : "text-[#64748B]"}`}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/service-details", params: { id: item.id } })}
              className="mb-6 mx-6 rounded-[28px] bg-white border border-gray-100 shadow-sm shadow-black/5 overflow-hidden"
            >
              <View className="relative w-full h-[220px] bg-slate-100">
                {item.image ? (
                  <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="image-outline" size={42} color="#94A3B8" />
                  </View>
                )}
                <View className="absolute left-4 top-4 bg-white/95 px-3 py-2 rounded-full">
                  <Text className="text-[12px] font-black text-[#1A2C42]">{formatCurrency(item.avgPackagePrice)}</Text>
                </View>
              </View>

              <View className="p-5">
                <View className="flex-row items-center justify-between mb-3">
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/provider-profile", params: { id: item.provider.id } })}
                    className="flex-row items-center flex-1 pr-3"
                  >
                    {item.provider.avatar ? (
                      <Image source={{ uri: item.provider.avatar }} className="w-8 h-8 rounded-full mr-3" />
                    ) : (
                      <View className="w-8 h-8 rounded-full mr-3 bg-[#EAF3FA]" />
                    )}
                    <Text className="text-[14px] font-bold text-[#2B84B1]" numberOfLines={1}>{item.provider.name}</Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-[13px] font-bold text-[#1A2C42] ml-1">{Number(item.provider.rating || 0).toFixed(1)}</Text>
                  </View>
                </View>

                <Text className="text-[18px] font-black text-[#1A2C42]" numberOfLines={2}>{item.title}</Text>
                <Text className="text-[13px] text-[#7C8B95] mt-2 font-medium">
                  {item.categoryName} • {item.expertType === "team" ? "Team" : "Solo"}
                </Text>

                <View className="flex-row items-center justify-between mt-5">
                  <View className="flex-row items-center bg-[#EAF3FA] px-3 py-2 rounded-full">
                    <Ionicons name="location-outline" size={14} color="#2286BE" />
                    <Text className="text-[12px] font-bold text-[#2286BE] ml-1">
                      {typeof item.distanceKm === "number" ? formatMilesFromKm(item.distanceKm) : "Nearby"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/service-details", params: { id: item.id } })}
                    className="px-4 py-3 rounded-[16px] bg-[#1A2C42]"
                  >
                    <Text className="text-white font-bold text-[13px]">View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            isLoading || isFetching ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#2B84B1" />
              </View>
            ) : error ? (
              <View className="items-center justify-center px-8 py-20">
                <Text className="text-center text-[#7C8B95] font-medium mb-4">Could not load services.</Text>
              </View>
            ) : (
              <View className="items-center px-8 pt-16 pb-20">
                <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">No services found</Text>
                <Text className="text-center text-[#7C8B95]">Try another category, provider type, or search term.</Text>
              </View>
            )
          }
          ListFooterComponent={
            pagination && pagination.totalPages > 1 ? (
              <View className="mx-6 mt-2 mb-8 bg-white rounded-[20px] border border-gray-100 px-4 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                  disabled={!pagination.hasPrevPage}
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`px-4 py-3 rounded-[16px] ${pagination.hasPrevPage ? "bg-[#F8FAFC]" : "bg-[#E2E8F0]"}`}
                >
                  <Text className={`font-bold ${pagination.hasPrevPage ? "text-[#1A2C42]" : "text-[#94A3B8]"}`}>Prev</Text>
                </TouchableOpacity>
                <Text className="text-[13px] font-bold tracking-[0.18em] uppercase text-[#64748B]">
                  {page} / {pagination.totalPages}
                </Text>
                <TouchableOpacity
                  disabled={!pagination.hasNextPage}
                  onPress={() => setPage((prev) => prev + 1)}
                  className={`px-4 py-3 rounded-[16px] ${pagination.hasNextPage ? "bg-[#F8FAFC]" : "bg-[#E2E8F0]"}`}
                >
                  <Text className={`font-bold ${pagination.hasNextPage ? "text-[#1A2C42]" : "text-[#94A3B8]"}`}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
