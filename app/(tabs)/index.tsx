import { useAuth } from "@/src/contexts/AuthContext";
import { mobileApi } from "@/src/lib/api";
import { formatCurrency } from "@/src/lib/formatters";
import type { CategoryItem, PublicServiceCard } from "@/src/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [services, setServices] = useState<PublicServiceCard[]>([]);

  useEffect(() => {
    const load = async () => {
      const [categoryPayload, servicePayload] = await Promise.all([
        mobileApi.getCategories(),
        mobileApi.getPublicServices("page=1&limit=6&categorySlug=all"),
      ]);
      setCategories(categoryPayload.data.slice(0, 3));
      setServices(servicePayload.data.items || []);
    };

    void load();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView
        className="bg-white rounded-b-[30px] px-6 pb-6 pt-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          zIndex: 20,
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity>
            <Ionicons name="menu" size={32} color="#2B84B1" />
          </TouchableOpacity>

          <View className="ml-4 flex-1">
            <Text className="text-[10px] font-bold tracking-widest text-[#7C8B95] uppercase">Current Location</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-[15px] font-bold text-[#2B84B1]">{user?.address || "Location not set"}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/notifications")} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100 ml-4 relative">
            <Ionicons name="notifications-outline" size={22} color="#1A2C42" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 bg-[#FAFCFD]" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
        <View style={{ height: 40 }} />

        <View className="px-6 pt-2 pb-6">
          <Text className="text-[12px] font-bold tracking-[0.15em] text-[#7C8B95] uppercase mb-3">
            HELLO {`${user?.firstName || "Client"} ${user?.lastName || ""}`.trim()}
          </Text>
          <Text className="text-[34px] font-black text-[#1A2C42] leading-[42px] tracking-tight">
            What you are looking{"\n"}for today
          </Text>
        </View>

        <View className="px-6 mb-8">
          <View className="flex-row items-center bg-white rounded-3xl pl-5 pr-2 py-2 border border-gray-100">
            <TextInput
              placeholder="Search what you need..."
              placeholderTextColor="#A0AEC0"
              className="flex-1 text-[15px] font-medium text-[#1A2C42] h-12"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => router.push("/services")} className="bg-[#2B84B1] w-12 h-12 rounded-[18px] items-center justify-center">
              <Ionicons name="search" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-12 flex-row justify-between items-center">
          {categories.map((category) => (
            <View key={category.id} className="items-center">
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/services", params: { title: category.name, categorySlug: category.slug } })}
                className="w-[58px] h-[58px] rounded-full bg-[#EAF3FA] items-center justify-center mb-3"
              >
                <Ionicons name="grid-outline" size={26} color="#2286BE" />
              </TouchableOpacity>
              <Text className="text-[14px] font-semibold text-[#4A5568]">{category.name}</Text>
            </View>
          ))}

          <View className="items-center">
            <TouchableOpacity onPress={() => router.push("/categories")} className="w-[58px] h-[58px] rounded-full bg-gray-50 border border-gray-100 items-center justify-center mb-3">
              <Ionicons name="arrow-forward" size={26} color="#718096" />
            </TouchableOpacity>
            <Text className="text-[14px] font-semibold text-[#4A5568]">See All</Text>
          </View>
        </View>

        <View className="mb-12">
          <View className="px-6 mb-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-3.5" />
              <Text className="text-[22px] font-bold text-[#1A2C42]">Featured Services</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/services")} className="flex-row items-center border border-gray-200 rounded-full px-4 py-2">
              <Text className="text-[13px] font-semibold text-[#4A5568] mr-1.5">See All</Text>
              <Ionicons name="chevron-forward" size={12} color="#4A5568" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
            {services.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => router.push({ pathname: "/service-details", params: { id: item.id } })} className="w-[172px] mr-5">
                <View className="w-full h-[220px] rounded-3xl overflow-hidden mb-4 bg-gray-100 relative">
                  {item.image ? (
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Ionicons name="image-outline" size={32} color="#94A3B8" />
                    </View>
                  )}
                </View>
                <Text className="text-[16px] font-bold text-[#1A2C42]" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="text-[13px] text-[#7C8B95] mt-1">{formatCurrency(item.avgPackagePrice)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
