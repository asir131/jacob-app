import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { formatCurrency, formatDateLabel, formatStatusLabel } from "@/src/lib/formatters";
import {
  useGetMyWithdrawalsQuery,
  useRequestWithdrawalMutation,
} from "@/src/store/services/apiSlice";

export default function EarningsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const { data, isLoading, isFetching, refetch } = useGetMyWithdrawalsQuery({ page: 1, limit: 20 });
  const [requestWithdrawal, { isLoading: requesting }] = useRequestWithdrawalMutation();
  const balance = data?.data.balance || null;
  const withdrawals = data?.data.withdrawals || [];

  const submitWithdrawal = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid withdrawal amount.");
      return;
    }
    try {
      await requestWithdrawal({ amount: numericAmount, note: note.trim() }).unwrap();
      setAmount("");
      setNote("");
      refetch();
      Alert.alert("Request sent", "Your withdrawal request has been submitted.");
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4"><Ionicons name="arrow-back" size={20} color="#1A2C42" /></TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Earnings</Text>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#2B84B1" size="large" /></View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
          <View className="bg-[#1A2C42] rounded-[24px] p-6 mb-6 shadow-xl shadow-[#1A2C42]/30">
            <Text className="text-white/70 text-[14px] font-medium mb-1">Available for Withdrawal</Text>
            <Text className="text-white text-[36px] font-black">{formatCurrency(balance?.availableBalance || 0)}</Text>
          </View>
          <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-gray-100 mb-8">
            <Text className="text-[18px] font-bold text-[#1A2C42] mb-4">Request Withdrawal</Text>
            <TextInput placeholder="Amount" placeholderTextColor="#A0AEC0" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42] mb-3" />
            <TextInput placeholder="Note (optional)" placeholderTextColor="#A0AEC0" value={note} onChangeText={setNote} className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42] mb-4" />
            <TouchableOpacity onPress={() => void submitWithdrawal()} disabled={requesting} className="w-full bg-[#2B84B1] h-[56px] rounded-[16px] items-center justify-center flex-row">
              {requesting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Withdraw balance</Text>}
            </TouchableOpacity>
          </View>
          <Text className="text-[18px] font-bold text-[#1A2C42] mb-4">Transaction History</Text>
          <View className="bg-white rounded-[24px] px-5 py-2 border border-gray-100 shadow-sm shadow-gray-100 mb-10">
            {withdrawals.length ? withdrawals.map((item) => (
              <View key={item.id} className="flex-row items-center py-4 border-b border-gray-100">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.status === "rejected" ? "bg-[#FFF0F0]" : "bg-[#EAF6ED]"}`}>
                  <Ionicons name={item.status === "paid" ? "arrow-up" : "arrow-down"} size={20} color={item.status === "rejected" ? "#FF4757" : item.status === "paid" ? "#2B84B1" : "#55A06F"} />
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-bold text-[#1A2C42] mb-1">{formatStatusLabel(item.status)} withdrawal</Text>
                  <Text className="text-[14px] text-[#7C8B95]">{formatDateLabel(item.requestedAt)}</Text>
                </View>
                <Text className={`text-[16px] font-bold ${item.status === "rejected" ? "text-[#FF4757]" : "text-[#55A06F]"}`}>{formatCurrency(item.amount)}</Text>
              </View>
            )) : <View className="py-10 items-center"><Ionicons name="document-text-outline" size={42} color="#CBD5E1" /><Text className="text-[15px] font-bold text-[#1A2C42] mt-3">No withdrawals yet</Text></View>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
