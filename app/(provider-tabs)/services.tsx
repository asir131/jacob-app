import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCurrency } from "@/src/lib/formatters";
import {
  useDeleteGigMutation,
  useDeleteGigRequestMutation,
  useGetMyGigsQuery,
} from "@/src/store/services/apiSlice";

const kmToMiles = (km?: number | null) => ((Number(km || 0) * 0.621371) || 0).toFixed(1);

export default function ProviderServices() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight =
    Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
  const [activeTab, setActiveTab] = useState<"published" | "pending" | "other">("published");
  const { data, isLoading, refetch } = useGetMyGigsQuery();
  const [deleteGig, { isLoading: deletingGig }] = useDeleteGigMutation();
  const [deleteGigRequest, { isLoading: deletingGigRequest }] = useDeleteGigRequestMutation();

  const published = useMemo(
    () => (Array.isArray(data?.data.publishedGigs) ? data?.data.publishedGigs : []),
    [data?.data.publishedGigs]
  );
  const pending = useMemo(
    () => (Array.isArray(data?.data.pendingRequests) ? data?.data.pendingRequests : []),
    [data?.data.pendingRequests]
  );

  const activeItems = useMemo(() => {
    if (activeTab === "published") return published.filter((gig: any) => gig.status === "published");
    if (activeTab === "pending") return pending.filter((gig: any) => gig.status === "pending_approval");
    return published.filter((gig: any) => gig.status === "rejected" || gig.status === "draft");
  }, [activeTab, pending, published]);

  const tabCounts = {
    published: published.filter((gig: any) => gig.status === "published").length,
    pending: pending.filter((gig: any) => gig.status === "pending_approval").length,
    other: published.filter((gig: any) => gig.status === "rejected" || gig.status === "draft").length,
  };

  const handlePreview = (gig: any) => {
    if (gig.status !== "published") {
      Alert.alert("Preview unavailable", "This gig must be published before it can be previewed publicly.");
      return;
    }
    router.push({ pathname: "/service-details", params: { id: String(gig._id || gig.id) } });
  };

  const handleShareGig = async (gig: any) => {
    try {
      await Share.share({
        message: `${gig.title}\n${formatCurrency(Number(gig.packages?.[0]?.price || 0))}\nShared from Jacob provider app.`,
      });
    } catch {
      // ignore share dismissal
    }
  };

  const handleDeleteGig = async (gig: any) => {
    Alert.alert(
      "Delete this gig?",
      `${gig.title || "This gig"} will be removed permanently.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (gig.status === "pending_approval") {
                await deleteGigRequest(String(gig._id || gig.id)).unwrap();
              } else {
                await deleteGig(String(gig._id || gig.id)).unwrap();
              }
              await refetch();
            } catch (error) {
              Alert.alert("Delete failed", error instanceof Error ? error.message : "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
        <View>
          <Text className="text-[26px] font-black text-[#1A2C42]">My Gigs</Text>
          <Text className="text-[13px] text-[#7C8B95] mt-1">Manage published gigs and review status.</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(provider)/create-service" as never)}
          className="w-11 h-11 bg-[#2B84B1] rounded-full flex items-center justify-center shadow-sm shadow-[#2B84B1]/40"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B84B1" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        >
          <View className="bg-[#1A2C42] rounded-[30px] p-6 mb-6">
            <Text className="text-white/65 text-[12px] font-bold tracking-[0.18em] uppercase">Gig Overview</Text>
            <Text className="text-white text-[34px] font-black mt-3">{activeItems.length}</Text>
            <Text className="text-white/75 text-[14px] mt-1">Items in the current gig tab.</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {[
              { id: "published", label: "Published", count: tabCounts.published },
              { id: "pending", label: "Review", count: tabCounts.pending },
              { id: "other", label: "Other", count: tabCounts.other },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as "published" | "pending" | "other")}
                  className={`px-5 py-3 rounded-full mr-3 border ${active ? "bg-[#2286BE] border-[#2286BE]" : "bg-white border-gray-200"}`}
                >
                  <Text className={`font-bold text-[13px] ${active ? "text-white" : "text-[#64748B]"}`}>
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {activeItems.length ? (
            activeItems.map((gig: any) => {
              const image = gig.images?.[0];
              const price = Number(gig.packages?.[0]?.price || 0);
              const statusLabel =
                gig.status === "published"
                  ? "Live"
                  : gig.status === "pending_approval"
                    ? "Under Review"
                    : gig.status === "rejected"
                      ? "Rejected"
                      : "Draft";
              const deleting = deletingGig || deletingGigRequest;

              return (
                <View key={String(gig._id || gig.id)} className="bg-white rounded-[28px] p-5 mb-5 border border-gray-100 shadow-sm shadow-black/5">
                  <View className="flex-row">
                    <View className="w-24 h-24 rounded-[20px] mr-4 border border-gray-200 overflow-hidden bg-gray-100">
                      {image ? (
                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="text-[18px] font-black text-[#1A2C42]" numberOfLines={2}>
                            {gig.title || "Untitled gig"}
                          </Text>
                          <Text className="text-[13px] text-[#2286BE] font-bold mt-2">{gig.categoryName || "General"}</Text>
                        </View>
                        <View className="px-3 py-2 rounded-full bg-[#EAF3FA]">
                          <Text className="text-[11px] font-bold uppercase text-[#2286BE]">{statusLabel}</Text>
                        </View>
                      </View>

                      <Text className="text-[18px] font-black text-[#1A2C42] mt-4">From {formatCurrency(price)}</Text>
                    </View>
                  </View>

                  <View className="flex-row mt-5">
                    <View className="flex-1 mr-3 bg-[#F8FAFC] rounded-[18px] px-4 py-4">
                      <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Expert Type</Text>
                      <Text className="text-[15px] font-bold text-[#1A2C42] mt-2">{gig.expertType === "team" ? "Team" : "Solo"}</Text>
                    </View>
                    <View className="flex-1 bg-[#F8FAFC] rounded-[18px] px-4 py-4">
                      <Text className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#94A3B8]">Radius</Text>
                      <Text className="text-[15px] font-bold text-[#1A2C42] mt-2">{kmToMiles(gig.travelRadiusKm)} mi</Text>
                    </View>
                  </View>

                  {gig.description ? (
                    <Text className="text-[14px] leading-[22px] text-[#5F7182] mt-4">{gig.description}</Text>
                  ) : null}

                  <View className="flex-row mt-5">
                    <TouchableOpacity
                      onPress={() =>
                        router.push({ pathname: "/(provider)/create-service", params: { editId: String(gig._id || gig.id) } } as never)
                      }
                      className="flex-1 mr-3 py-4 rounded-[18px] bg-[#F8FAFC] items-center"
                    >
                      <Text className="font-bold text-[#1A2C42]">Edit Gig</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => void handlePreview(gig)} className="flex-1 py-4 rounded-[18px] bg-[#2286BE] items-center">
                      <Text className="font-bold text-white">{statusLabel === "Under Review" ? "Preview Later" : "Preview"}</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row mt-3">
                    <TouchableOpacity onPress={() => void handleShareGig(gig)} className="flex-1 mr-3 py-3 rounded-[16px] bg-white border border-gray-200 items-center">
                      <Text className="font-bold text-[#1A2C42]">Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/provider-help")} className="flex-1 mr-3 py-3 rounded-[16px] bg-white border border-gray-200 items-center">
                      <Text className="font-bold text-[#1A2C42]">{statusLabel === "Under Review" ? "Review Tips" : "Help"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void handleDeleteGig(gig)}
                      disabled={deleting}
                      className="flex-1 py-3 rounded-[16px] bg-red-50 border border-red-100 items-center"
                    >
                      {deleting ? <ActivityIndicator color="#DC2626" /> : <Text className="font-bold text-[#DC2626]">Delete</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="items-center justify-center py-24">
              <View className="w-24 h-24 rounded-full bg-[#EAF3FA] items-center justify-center mb-5">
                <Ionicons name="briefcase-outline" size={42} color="#2286BE" />
              </View>
              <Text className="text-[24px] font-black text-[#1A2C42]">No gigs in this tab</Text>
              <Text className="text-[15px] leading-[24px] text-[#7C8B95] text-center mt-3 max-w-[280px]">
                Create a new service to start getting discovered by local clients.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(provider)/create-service" as never)}
                className="bg-[#2286BE] px-8 py-4 rounded-[20px] mt-8"
              >
                <Text className="text-white text-[16px] font-bold">Create New Gig</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
