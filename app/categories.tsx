import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetCategoriesQuery } from "@/src/store/services/apiSlice";

const ICON_MAP: Record<string, { library: "ion" | "material"; name: string; bgColor: string; iconColor: string }> = {
  cleaning: { library: "material", name: "hand-okay", bgColor: "#FFE8B3", iconColor: "#C05621" },
  beauty: { library: "ion", name: "sparkles", bgColor: "#DCCFFD", iconColor: "#553098" },
  plumbing: { library: "material", name: "pipe", bgColor: "#E2F2E4", iconColor: "#38A169" },
  appliance: { library: "material", name: "washing-machine", bgColor: "#B1EBF2", iconColor: "#008EA6" },
  shifting: { library: "material", name: "truck-delivery", bgColor: "#FBB6CE", iconColor: "#B83280" },
};

export default function CategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetCategoriesQuery();
  const filtered = useMemo(() => {
    const categories = data?.data || [];
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(query));
  }, [data?.data, search]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 pt-4 pb-8 rounded-b-[30px]">
        <View className="flex-row items-center bg-white rounded-[24px] pl-3 pr-2 py-1.5 border border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2"><Ionicons name="arrow-back" size={26} color="#2B84B1" /></TouchableOpacity>
          <TextInput placeholder="Search Category" placeholderTextColor="#A0AEC0" value={search} onChangeText={setSearch} className="flex-1 text-[16px] font-medium text-[#1A2C42] px-2" />
          <TouchableOpacity className="bg-[#2B84B1] w-[46px] h-[46px] rounded-[16px] items-center justify-center"><Ionicons name="search" size={20} color="white" /></TouchableOpacity>
        </View>
      </View>
      <View className="flex-1 px-4">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}>
          <View className="flex-row items-center mb-10 px-2 ml-4"><View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-4" /><Text className="text-[24px] font-bold text-[#1A2C42]">All Categories</Text></View>
          {isLoading ? (
            <View className="items-center justify-center py-20"><ActivityIndicator size="large" color="#2B84B1" /></View>
          ) : (
            <View className="flex-row flex-wrap justify-start">
              {filtered.map((item) => {
                const icon = ICON_MAP[item.slug] || { library: "material" as const, name: "shape", bgColor: "#EAF3FA", iconColor: "#2B84B1" };
                return (
                  <View key={item.id} className="w-[33.33%] items-center mb-12">
                    <TouchableOpacity onPress={() => router.push({ pathname: "/services", params: { title: item.name, categorySlug: item.slug } })} style={{ backgroundColor: icon.bgColor }} className="w-[58px] h-[58px] rounded-full items-center justify-center mb-4">
                      {icon.library === "ion" ? <Ionicons name={icon.name as any} size={32} color={icon.iconColor} /> : <MaterialCommunityIcons name={icon.name as any} size={32} color={icon.iconColor} />}
                    </TouchableOpacity>
                    <Text className="text-[15px] font-bold text-[#4A5568] text-center">{item.name}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
