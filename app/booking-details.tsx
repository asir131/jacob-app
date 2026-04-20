import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatCurrency, formatDateLabel, formatStatusLabel, formatTimeLabel } from "@/src/lib/formatters";
import {
  useEnsureConversationByOrderMutation,
  useFinalizeClientOrderMutation,
  useGetClientOrderDetailQuery,
  useGetProviderOrderDetailQuery,
  useRequestClientRevisionMutation,
} from "@/src/store/services/apiSlice";

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id = "", role = "client" } = useLocalSearchParams<{ id?: string; role?: string }>();
  const [reviewText, setReviewText] = useState("");
  const providerQuery = useGetProviderOrderDetailQuery(id, { skip: !id || role !== "provider" });
  const clientQuery = useGetClientOrderDetailQuery(id, { skip: !id || role === "provider" });
  const [ensureConversationByOrder] = useEnsureConversationByOrderMutation();
  const [finalizeClientOrder, { isLoading: finalizing }] = useFinalizeClientOrderMutation();
  const [requestClientRevision, { isLoading: requestingRevision }] = useRequestClientRevisionMutation();
  const order = (role === "provider" ? providerQuery.data?.data.order : clientQuery.data?.data.order) || null;
  const loading = role === "provider" ? providerQuery.isLoading : clientQuery.isLoading;

  useEffect(() => {
    setReviewText(order?.clientReview || "");
  }, [order?.clientReview]);

  const progress = useMemo(() => {
    const status = order?.status || "pending";
    if (status === "completed") return 4;
    if (["accepting_delivery", "revision_requested", "under_revision", "after_sell_revision_requested", "under_after_sell_revision"].includes(status)) return 3;
    if (status === "accepted") return 2;
    return 1;
  }, [order?.status]);

  const personAddress = order && role === "provider" ? order.client.address : undefined;

  const openChat = async () => {
    if (!order) return;
    let conversationId = order.conversationId || "";
    try {
      if (!conversationId) {
        const payload = await ensureConversationByOrder(order.id).unwrap();
        conversationId = payload.data.id;
      }
      const person = role === "provider" ? order.client : order.provider;
      router.push({
        pathname: "/chat-details",
        params: {
          conversationId,
          name: person.name,
          avatar: person.avatar || "",
          info: order.orderName,
        },
      });
    } catch (error) {
      Alert.alert("Chat unavailable", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const finalizeOrder = async () => {
    if (!order) return;
    try {
      await finalizeClientOrder(order.id).unwrap();
      Alert.alert("Done", "Order finalized successfully.");
      clientQuery.refetch();
    } catch (error) {
      Alert.alert("Finalize failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const requestRevision = async () => {
    if (!order) return;
    if (!reviewText.trim()) {
      Alert.alert("Revision note required", "Please add a short note for the provider.");
      return;
    }
    try {
      await requestClientRevision({ id: order.id, note: reviewText.trim() }).unwrap();
      Alert.alert("Sent", "Revision request sent.");
      clientQuery.refetch();
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#2B84B1" /></View>;
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-[18px] font-bold text-[#1A2C42] mb-3">Booking not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#2B84B1] px-5 py-3 rounded-[18px]"><Text className="text-white font-bold">Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  const person = role === "provider" ? order.client : order.provider;
  const canFinalize = role !== "provider" && order.status === "accepting_delivery";
  const canRequestRevision = role !== "provider" && order.status === "accepting_delivery";
  const submitting = finalizing || requestingRevision;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4"><Ionicons name="arrow-back" size={20} color="#1A2C42" /></TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42] flex-1">Booking Details</Text>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View className="bg-white px-6 py-8 mb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 pr-4"><Text className="text-[22px] font-bold text-[#1A2C42] mb-1">{order.orderName}</Text><Text className="text-[14px] font-medium text-[#7C8B95]">Ref: {order.orderNumber}</Text></View>
            <View className="bg-[#EAF6ED] px-4 py-1.5 rounded-lg"><Text className="text-[13px] font-bold text-[#55A06F]">{formatStatusLabel(order.status)}</Text></View>
          </View>
          <View className="flex-row items-center justify-between px-2 mt-4">
            {["Pending", "Accepted", "Working", "Done"].map((step, index) => {
              const active = progress >= index + 1;
              return <View key={step} className="items-center flex-1"><View className={`w-8 h-8 rounded-full items-center justify-center mb-2 border-4 border-white ${active ? "bg-[#55A06F]" : "bg-gray-200"}`}>{active ? <Ionicons name="checkmark" size={16} color="white" /> : null}</View><Text className={`text-[12px] font-bold ${active ? "text-[#1A2C42]" : "text-[#A0AEC0]"}`}>{step}</Text></View>;
            })}
          </View>
        </View>
        <View className="px-6 mb-6">
          <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">Service Information</Text>
          <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-6"><View className="w-12 h-12 bg-[#FEF3EA] rounded-full items-center justify-center mr-4"><FontAwesome5 name="briefcase" size={20} color="#E89F65" /></View><View><Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">Category</Text><Text className="text-[16px] font-bold text-[#1A2C42]">{order.categoryName || "General service"}</Text></View></View>
            <View className="flex-row items-center mb-6"><View className="w-12 h-12 bg-[#EAF3FA] rounded-full items-center justify-center mr-4"><Ionicons name="calendar-outline" size={22} color="#2B84B1" /></View><View><Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">Schedule</Text><Text className="text-[16px] font-bold text-[#1A2C42]">{formatDateLabel(order.scheduledDate)}, {formatTimeLabel(order.scheduledTime)}</Text></View></View>
            <View className="flex-row items-center"><View className="w-12 h-12 bg-[#F3EAFE] rounded-full items-center justify-center mr-4"><Ionicons name="location-outline" size={22} color="#A865E8" /></View><View className="flex-1"><Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">Location</Text><Text className="text-[16px] font-bold text-[#1A2C42]" numberOfLines={2}>{order.serviceAddress || personAddress || "Location unavailable"}</Text></View></View>
          </View>
        </View>
        <View className="px-6 mb-6">
          <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">{role === "provider" ? "Client" : "Service Provider"}</Text>
          <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5 flex-row items-center">
            {person.avatar ? <Image source={{ uri: person.avatar }} className="w-[52px] h-[52px] rounded-full mr-4 border border-gray-100" /> : <View className="w-[52px] h-[52px] rounded-full mr-4 bg-[#EAF3FA]" />}
            <View className="flex-1"><Text className="text-[18px] font-bold text-[#1A2C42] mb-1">{person.name}</Text><Text className="text-[13px] text-[#7C8B95]">{person.phone || personAddress || "Contact info unavailable"}</Text></View>
            <TouchableOpacity onPress={() => void openChat()} className="w-12 h-12 bg-[#EAF3FA] rounded-full items-center justify-center"><Ionicons name="chatbubble-ellipses" size={22} color="#2B84B1" /></TouchableOpacity>
          </View>
        </View>
        {(order.deliveryNote || (order.deliveryImages || []).length) ? <View className="px-6 mb-6"><Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">Delivery</Text><View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5">{order.deliveryNote ? <Text className="text-[15px] text-[#1A2C42] leading-[22px] mb-4">{order.deliveryNote}</Text> : null}{(order.deliveryImages || []).map((image: string) => <Image key={image} source={{ uri: image }} className="w-full h-[180px] rounded-[20px] mb-3 bg-slate-100" />)}</View></View> : null}
        {canRequestRevision ? <View className="px-6 mb-8"><Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">Revision Request</Text><View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5"><TextInput value={reviewText} onChangeText={setReviewText} placeholder="Tell the provider what needs to be adjusted..." multiline textAlignVertical="top" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42] min-h-[120px]" /></View></View> : null}
        <View className="px-6 mb-8"><Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">Price Details</Text><View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5"><View className="flex-row justify-between mb-4"><Text className="text-[15px] font-medium text-[#7C8B95]">Service Charge</Text><Text className="text-[16px] font-bold text-[#1A2C42]">{formatCurrency(order.packagePrice)}</Text></View><View className="flex-row justify-between mb-4"><Text className="text-[15px] font-medium text-[#7C8B95]">Platform Fee</Text><Text className="text-[16px] font-bold text-[#1A2C42]">{formatCurrency(order.paymentAmount ? order.paymentAmount - order.packagePrice : 0)}</Text></View><View className="h-[1px] bg-gray-100 my-2" /><View className="flex-row justify-between mt-2"><Text className="text-[18px] font-bold text-[#1A2C42]">Total</Text><Text className="text-[22px] font-black text-[#2B84B1]">{formatCurrency(order.paymentAmount || order.packagePrice)}</Text></View></View></View>
      </ScrollView>
      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 flex-row">
        <TouchableOpacity onPress={() => void openChat()} className="bg-[#EAF3FA] flex-1 py-5 rounded-[18px] mr-4 items-center"><Text className="text-[#2B84B1] font-bold text-[17px]">Message</Text></TouchableOpacity>
        {role === "provider" ? <TouchableOpacity onPress={() => router.push({ pathname: "/(provider)/deliver-order", params: { id: order.id } } as any)} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center"><Text className="text-white font-bold text-[17px]">Deliver</Text></TouchableOpacity> : canFinalize ? <TouchableOpacity onPress={() => void finalizeOrder()} disabled={submitting} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">{submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[17px]">Finalize</Text>}</TouchableOpacity> : canRequestRevision ? <TouchableOpacity onPress={() => void requestRevision()} disabled={submitting} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">{submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[17px]">Request Revision</Text>}</TouchableOpacity> : <TouchableOpacity disabled className="bg-gray-200 flex-1 py-5 rounded-[18px] items-center"><Text className="text-[#7C8B95] font-bold text-[17px]">{formatStatusLabel(order.status)}</Text></TouchableOpacity>}
      </View>
    </SafeAreaView>
  );
}
