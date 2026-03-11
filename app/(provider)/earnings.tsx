import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EarningsPage() {
    const router = useRouter();

    const TransactionRow = ({ title, date, amount, type = 'credit' }: any) => (
        <View className="flex-row items-center py-4 border-b border-gray-100">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${type === 'credit' ? 'bg-[#EAF6ED]' : 'bg-[#FFF0F0]'}`}>
                <Ionicons name={type === 'credit' ? 'arrow-down' : 'arrow-up'} size={20} color={type === 'credit' ? '#55A06F' : '#FF4757'} />
            </View>
            <View className="flex-1">
                <Text className="text-[16px] font-bold text-[#1A2C42] mb-1">{title}</Text>
                <Text className="text-[14px] text-[#7C8B95]">{date}</Text>
            </View>
            <Text className={`text-[16px] font-bold ${type === 'credit' ? 'text-[#55A06F]' : 'text-[#FF4757]'}`}>
                {type === 'credit' ? '+' : '-'}${amount}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Earnings</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View className="bg-[#1A2C42] rounded-[24px] p-6 mb-6 shadow-xl shadow-[#1A2C42]/30">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-white/70 text-[14px] font-medium mb-1">Available for Withdrawal</Text>
                            <Text className="text-white text-[36px] font-black">$1,250.00</Text>
                        </View>
                        <View className="bg-[#2B84B1] p-3 rounded-full">
                            <Ionicons name="wallet" size={24} color="white" />
                        </View>
                    </View>

                    <TouchableOpacity className="w-full bg-white h-[56px] rounded-[16px] items-center justify-center flex-row shadow-sm shadow-black/10">
                        <Text className="text-[#1A2C42] font-bold text-[16px] mr-2">Withdraw balance</Text>
                        <Ionicons name="arrow-forward" size={18} color="#1A2C42" />
                    </TouchableOpacity>
                </View>

                {/* Lifetime Stats */}
                <View className="flex-row justify-between mb-8">
                    <View className="w-[48%] bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shadow-gray-100">
                        <Ionicons name="cash-outline" size={24} color="#2B84B1" />
                        <Text className="text-[22px] font-bold text-[#1A2C42] mt-3 mb-1">$4,500</Text>
                        <Text className="text-[13px] text-[#7C8B95] font-medium">Net Income</Text>
                    </View>
                    <View className="w-[48%] bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shadow-gray-100">
                        <Ionicons name="time-outline" size={24} color="#FACC15" />
                        <Text className="text-[22px] font-bold text-[#1A2C42] mt-3 mb-1">$320</Text>
                        <Text className="text-[13px] text-[#7C8B95] font-medium">Pending Clearance</Text>
                    </View>
                </View>

                {/* History */}
                <Text className="text-[18px] font-bold text-[#1A2C42] mb-4">Transaction History</Text>
                <View className="bg-white rounded-[24px] px-5 py-2 border border-gray-100 shadow-sm shadow-gray-100 mb-10">
                    <TransactionRow title="Order #ORD-90211" date="Today, 10:45 AM" amount="450" />
                    <TransactionRow title="Withdrawal to PayPal" date="Yesterday, 2:30 PM" amount="800" type="debit" />
                    <TransactionRow title="Order #ORD-80123" date="Oct 12, 11:00 AM" amount="200" />
                    <TransactionRow title="Service Fee (#ORD-80123)" date="Oct 12, 11:00 AM" amount="40" type="debit" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
