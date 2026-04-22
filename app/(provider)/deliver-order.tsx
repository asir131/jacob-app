import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatDateLabel, formatTimeLabel } from "@/src/lib/formatters";
import {
  useGetProviderOrderDetailQuery,
  useSubmitProviderDeliveryMutation,
} from "@/src/store/services/apiSlice";

type DeliveryAsset = { uri: string; fileName?: string | null; mimeType?: string | null };

export default function DeliverOrderPage() {
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { data, isLoading } = useGetProviderOrderDetailQuery(id, { skip: !id });
  const [submitProviderDelivery, { isLoading: submitting }] = useSubmitProviderDeliveryMutation();
  const [msg, setMsg] = useState("");
  const [assets, setAssets] = useState<DeliveryAsset[]>([]);
  const order = data?.data.order || null;

  useEffect(() => {
    setMsg(order?.deliveryNote || "");
  }, [order?.deliveryNote]);

  const pickFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need photo library access to attach delivery files.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsMultipleSelection: true, quality: 0.8, selectionLimit: 4 });
    if (result.canceled) return;
    setAssets(result.assets.slice(0, 4).map((asset) => ({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType })));
  };

  const submitDelivery = async () => {
    if (!order) return;
    if (!msg.trim() && assets.length === 0) {
      Alert.alert("Add delivery details", "Please include a note or at least one attachment.");
      return;
    }
    const formData = new FormData();
    formData.append("deliveryNote", msg.trim());
    assets.forEach((asset, index) => {
      formData.append("deliveryImages", {
        uri: asset.uri,
        name: asset.fileName || `delivery-${index + 1}.jpg`,
        type: asset.mimeType || "image/jpeg",
      } as any);
    });
    try {
      await submitProviderDelivery({ id: order.id, formData }).unwrap();
      Alert.alert("Delivered", "Your delivery was submitted successfully.", [{ text: "OK", onPress: () => router.replace("/(provider-tabs)/orders") }]);
    } catch (error) {
      Alert.alert("Delivery failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator color="#2B84B1" size="large" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-1">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4"><Ionicons name="arrow-back" size={20} color="#1A2C42" /></TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Deliver Order</Text>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6 pt-6"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
          <View className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shadow-gray-100 mb-6 flex-row items-center">
            <View className="flex-1">
              <Text className="text-[13px] text-[#A0AEC0] font-bold tracking-widest uppercase mb-1">{order?.orderNumber || "Order"}</Text>
              <Text className="text-[16px] font-bold text-[#1A2C42]" numberOfLines={1}>{order?.orderName || "Service order"}</Text>
              <Text className="text-[13px] text-[#7C8B95] mt-1">Due {formatDateLabel(order?.scheduledDate)}, {formatTimeLabel(order?.scheduledTime)}</Text>
            </View>
            <View className="bg-[#2B84B1]/10 px-3 py-1.5 rounded-full"><Text className="text-[#2B84B1] font-bold text-[14px]">{order?.status ? order.status.replace(/_/g, " ") : "pending"}</Text></View>
          </View>
          <Text className="text-[14px] font-bold text-[#1A2C42] mb-3 ml-1">Upload Work Delivery</Text>
          <TouchableOpacity onPress={() => void pickFiles()} className="w-full min-h-[140px] border-2 border-dashed border-[#CBD5E1] rounded-[24px] bg-[#FAFCFD] items-center justify-center mb-6 px-6 py-8">
            <Ionicons name="cloud-upload" size={36} color="#2B84B1" />
            <Text className="font-bold text-[#1A2C42] text-[15px] mt-2">Upload Delivery Images</Text>
            <Text className="text-[13px] text-[#7C8B95] mt-1 text-center">Attach up to 4 images that show the completed work.</Text>
          </TouchableOpacity>
          {assets.map((asset) => <View key={asset.uri} className="flex-row items-center p-4 bg-white border border-gray-100 rounded-[16px] mb-3"><Image source={{ uri: asset.uri }} className="w-12 h-12 rounded-[12px] mr-3" /><View className="flex-1"><Text className="text-[15px] font-bold text-[#1A2C42]" numberOfLines={1}>{asset.fileName || "Selected image"}</Text><Text className="text-[12px] text-[#7C8B95]">Ready to upload</Text></View><TouchableOpacity onPress={() => setAssets((current) => current.filter((item) => item.uri !== asset.uri))}><Ionicons name="trash-outline" size={20} color="#FF4757" /></TouchableOpacity></View>)}
          <Text className="text-[14px] font-bold text-[#1A2C42] mb-3 ml-1">Message to Buyer</Text>
          <TextInput placeholder="Hi there! Here is the final delivery for your order. Please review and let me know if you need any adjustments..." value={msg} onChangeText={setMsg} multiline numberOfLines={8} textAlignVertical="top" className="w-full min-h-[160px] border border-gray-200 rounded-[24px] p-5 text-[15px] bg-white text-[#2D3748] shadow-sm shadow-gray-100" />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 shadow-xl shadow-black/10 flex-row gap-x-4">
        <TouchableOpacity onPress={() => router.back()} className="flex-1 h-[60px] bg-white border-2 border-gray-200 rounded-[20px] items-center justify-center"><Text className="text-[#1A2C42] font-bold text-[16px]">Cancel</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => void submitDelivery()} disabled={submitting} className="flex-[2] h-[60px] bg-[#55A06F] rounded-[20px] items-center justify-center shadow-lg shadow-[#55A06F]/40 flex-row">{submitting ? <ActivityIndicator color="white" /> : <><Ionicons name="checkmark-circle" size={20} color="white" /><Text className="text-white text-[16px] font-bold ml-2">Deliver Now</Text></>}</TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
