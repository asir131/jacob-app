import { mobileApi } from "@/src/lib/api";
import { formatCurrency } from "@/src/lib/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ProviderGig = {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  orders: number;
  status: string;
};

export default function ProviderServices() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<ProviderGig[]>([]);

  useEffect(() => {
    const loadGigs = async () => {
      try {
        const payload = await mobileApi.getMyGigs();
        const published = Array.isArray(payload.data.publishedGigs) ? payload.data.publishedGigs : [];
        const pending = Array.isArray(payload.data.pendingRequests) ? payload.data.pendingRequests : [];
        const mapped = [...published, ...pending].map((gig: any) => ({
          id: String(gig._id || gig.id),
          title: String(gig.title || "Untitled gig"),
          category: String(gig.categoryName || "General"),
          price: Number(gig.packages?.[0]?.price || 0),
          rating: Number(gig.providerId?.averageRating || 0),
          orders: Number(gig.totalOrders || 0),
          status: gig.status === "published" ? "Active" : "Pending",
        }));
        setGigs(mapped);
      } finally {
        setLoading(false);
      }
    };

    void loadGigs();
  }, []);

  const sortedGigs = useMemo(() => gigs.sort((a, b) => a.title.localeCompare(b.title)), [gigs]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
        <Text className="text-[24px] font-bold text-[#1A2C42]">My Gigs</Text>
        <TouchableOpacity onPress={() => router.push("/(provider)/create-service" as any)} className="w-10 h-10 bg-[#2B84B1] rounded-full flex items-center justify-center shadow-sm shadow-[#2B84B1]/40">
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B84B1" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
          {sortedGigs.map((gig) => (
            <View key={gig.id} className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm shadow-gray-100">
              <View className="flex-row items-start">
                <View className="w-20 h-20 bg-gray-100 rounded-[16px] mr-4 border border-gray-200 items-center justify-center overflow-hidden">
                  <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-[16px] font-bold text-[#1A2C42] flex-1 mr-2" numberOfLines={2}>{gig.title}</Text>
                  </View>
                  <Text className="text-[13px] text-[#2B84B1] font-bold mb-2">{gig.category}</Text>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="flex-row items-center mr-3">
                        <Ionicons name="star" size={14} color="#FF9500" />
                        <Text className="text-[13px] font-bold text-[#1A2C42] ml-1">{gig.rating.toFixed(1)}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="cart" size={14} color="#A0AEC0" />
                        <Text className="text-[13px] font-bold text-[#7C8B95] ml-1">{gig.orders}</Text>
                      </View>
                    </View>
                    <Text className="text-[16px] font-black text-[#1A2C42]">From {formatCurrency(gig.price)}</Text>
                  </View>
                </View>
              </View>
              <View className="flex-row mt-4 pt-4 border-t border-gray-100 items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-2.5 h-2.5 rounded-full mr-2 ${gig.status === "Active" ? "bg-[#55A06F]" : "bg-[#FACC15]"}`} />
                  <Text className={`text-[13px] font-bold ${gig.status === "Active" ? "text-[#55A06F]" : "text-[#FACC15]"}`}>{gig.status}</Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity onPress={() => router.push({ pathname: "/(provider)/create-service", params: { editId: gig.id } } as any)} className="px-4 py-2 bg-gray-50 rounded-lg mr-2 border border-gray-200">
                    <Text className="text-[#1A2C42] font-bold text-[13px]">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Share.share({ message: `${gig.title}\n${formatCurrency(gig.price)}` })}
                    className="px-4 py-2 bg-[#2B84B1] rounded-lg"
                  >
                    <Text className="text-white font-bold text-[13px]">Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
