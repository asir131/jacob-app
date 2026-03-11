import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeliverOrderPage() {
    const router = useRouter();
    const [msg, setMsg] = useState("");

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-1">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Deliver Order</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Order Details Header */}
                    <View className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shadow-gray-100 mb-6 flex-row items-center">
                        <View className="flex-1">
                            <Text className="text-[13px] text-[#A0AEC0] font-bold tracking-widest uppercase mb-1">Order #ORD-90211</Text>
                            <Text className="text-[16px] font-bold text-[#1A2C42]" numberOfLines={1}>Custom React Native App UI Design</Text>
                        </View>
                        <View className="bg-[#2B84B1]/10 px-3 py-1.5 rounded-full">
                            <Text className="text-[#2B84B1] font-bold text-[14px]">Due 5:00 PM</Text>
                        </View>
                    </View>

                    {/* Delivery Form */}
                    <Text className="text-[14px] font-bold text-[#1A2C42] mb-3 ml-1">Upload Work Delivery</Text>
                    <TouchableOpacity className="w-full h-[140px] border-2 border-dashed border-[#CBD5E1] rounded-[24px] bg-[#FAFCFD] items-center justify-center mb-6">
                        <Ionicons name="cloud-upload" size={36} color="#2B84B1" className="mb-2" />
                        <Text className="font-bold text-[#1A2C42] text-[15px]">Upload Source Files</Text>
                        <Text className="text-[13px] text-[#7C8B95] mt-1">ZIP, PDF, or Image formats (Max 1GB)</Text>
                    </TouchableOpacity>

                    {/* Simulated Attached file */}
                    <View className="flex-row items-center p-4 bg-white border border-gray-100 rounded-[16px] mb-6">
                        <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center mr-3">
                            <Ionicons name="document-text" size={20} color="#55A06F" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[15px] font-bold text-[#1A2C42]">final_ui_delivery_v1.zip</Text>
                            <Text className="text-[12px] text-[#7C8B95]">142 MB • Uploaded</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="trash-outline" size={20} color="#FF4757" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-[14px] font-bold text-[#1A2C42] mb-3 ml-1">Message to Buyer</Text>
                    <TextInput
                        placeholder="Hi there! Here is the final delivery for your order. Please review and let me know if you need any adjustments..."
                        value={msg}
                        onChangeText={setMsg}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                        className="w-full min-h-[160px] border border-gray-200 rounded-[24px] p-5 text-[15px] bg-white text-[#2D3748] shadow-sm shadow-gray-100"
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 shadow-xl shadow-black/10 flex-row gap-x-4">
                <TouchableOpacity className="flex-1 h-[60px] bg-white border-2 border-gray-200 rounded-[20px] items-center justify-center">
                    <Text className="text-[#1A2C42] font-bold text-[16px]">Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(provider-tabs)/orders' as any)} className="flex-[2] h-[60px] bg-[#55A06F] rounded-[20px] items-center justify-center shadow-lg shadow-[#55A06F]/40 flex-row">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white text-[16px] font-bold ml-2">Deliver Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
