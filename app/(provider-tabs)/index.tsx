import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SellerDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);

    const StatCard = ({ icon, label, value, color, trend = null, isPositive = true }: any) => (
        <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-gray-100 flex-1 mr-3 mb-4">
            <View className="flex-row justify-between items-start mb-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                {trend && (
                    <View className={`flex-row items-center px-1.5 py-1 rounded-lg ${isPositive ? 'bg-[#EAF6ED]' : 'bg-[#FFF0F0]'}`}>
                        <Ionicons name={isPositive ? 'arrow-up' : 'arrow-down'} size={12} color={isPositive ? '#55A06F' : '#FF4757'} />
                        <Text className={`text-[11px] font-bold ml-1 ${isPositive ? 'text-[#55A06F]' : 'text-[#FF4757]'}`}>{trend}</Text>
                    </View>
                )}
            </View>
            <Text className="text-[28px] font-black text-[#1A2C42] mb-1">{value}</Text>
            <Text className="text-[13px] text-[#7C8B95] font-bold">{label}</Text>
        </View>
    );

    const ActionButton = ({ icon, label, route, color }: any) => (
        <TouchableOpacity
            onPress={() => router.push(route)}
            className="items-center mr-6"
        >
            <View className="w-16 h-16 rounded-[22px] items-center justify-center shadow-sm shadow-gray-200 mb-2 border border-gray-100" style={{ backgroundColor: color }}>
                <Ionicons name={icon} size={28} color="white" />
            </View>
            <Text className="text-[13px] font-bold text-[#1A2C42]">{label}</Text>
        </TouchableOpacity>
    );

    const ActiveOrderRow = ({ id, service, due, price }: any) => (
        <TouchableOpacity
            onPress={() => router.push('/(provider-tabs)/orders' as any)}
            className="flex-row items-center bg-white border border-gray-100 p-4 rounded-[20px] mb-3 shadow-sm shadow-gray-100"
        >
            <View className="w-12 h-12 bg-orange-50 rounded-[14px] items-center justify-center mr-4">
                <Ionicons name="time" size={24} color="#FF9500" />
            </View>
            <View className="flex-1 pr-2">
                <Text className="text-[15px] font-bold text-[#1A2C42]" numberOfLines={1}>{service}</Text>
                <View className="flex-row items-center mt-1">
                    <Text className="text-[13px] text-[#A0AEC0] font-bold">{id} • </Text>
                    <Text className="text-[13px] font-bold text-[#FF9500]">Due {due}</Text>
                </View>
            </View>
            <Text className="text-[16px] font-black text-[#2B84B1]">${price}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm shadow-black/5 z-10 w-full">
                <View className="flex-row items-center">
                    <View className="relative mr-3">
                        <Image source={{ uri: "https://i.pravatar.cc/150?u=joyboy" }} className="w-14 h-14 rounded-full border-2 border-gray-100" />
                        <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#55A06F] rounded-full border-2 border-white" />
                    </View>
                    <View>
                        <Text className="text-[13px] text-[#7C8B95] font-bold tracking-wide">Good Morning,</Text>
                        <Text className="text-[20px] font-black text-[#1A2C42]">Joyboy Pro <Ionicons name="checkmark-circle" size={18} color="#2B84B1" /></Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/(provider)/notifications' as any)} className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center relative border border-gray-100">
                    <Ionicons name="notifications-outline" size={24} color="#1A2C42" />
                    <View className="absolute top-2.5 right-3 w-3 h-3 rounded-full bg-[#FF4757] border-2 border-white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>

                {/* Advanced Earnings Card */}
                <View className="bg-[#1A2C42] rounded-[32px] p-6 mb-8 shadow-xl shadow-[#1A2C42]/30 overflow-hidden relative">
                    <View className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
                    <View className="absolute -right-12 top-10 w-40 h-40 bg-[#2B84B1]/20 rounded-full blur-xl" />

                    <View className="flex-row justify-between items-center mb-6 z-10">
                        <View>
                            <Text className="text-white/70 text-[14px] font-bold mb-1 tracking-widest uppercase">Net Income</Text>
                            <Text className="text-white text-[42px] font-black tracking-tight">$4,500.00</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(provider)/earnings' as any)} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20">
                            <Ionicons name="wallet" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between z-10 bg-white/10 p-4 rounded-[20px] border border-white/10">
                        <View>
                            <Text className="text-white/60 text-[12px] font-bold mb-1 uppercase">Available</Text>
                            <Text className="text-white text-[18px] font-bold">$1,250</Text>
                        </View>
                        <View className="w-[1px] h-8 bg-white/20 mx-4" />
                        <View>
                            <Text className="text-white/60 text-[12px] font-bold mb-1 uppercase">Pending</Text>
                            <Text className="text-white text-[18px] font-bold">$320</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(provider)/earnings' as any)} className="ml-auto bg-[#2B84B1] px-5 py-2.5 rounded-full shadow-sm shadow-[#2B84B1]/50">
                            <Text className="text-white font-bold text-[13px]">Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Seller Level Progress */}
                <View className="bg-white rounded-[24px] p-5 mb-8 border border-gray-100 shadow-sm shadow-gray-100 flex-row items-center">
                    <View className="w-16 h-16 bg-[#FACC15]/20 rounded-full items-center justify-center mr-4 border-4 border-[#FACC15]/30">
                        <Ionicons name="medal" size={28} color="#D97706" />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row justify-between items-end mb-2">
                            <Text className="text-[16px] font-bold text-[#1A2C42]">Level 2 Seller</Text>
                            <Text className="text-[13px] font-black text-[#2B84B1]">85%</Text>
                        </View>
                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <View className="h-full bg-[#2B84B1] rounded-full w-[85%]" />
                        </View>
                        <Text className="text-[12px] font-bold text-[#7C8B95] mt-2">15% more to Top Rated Seller</Text>
                    </View>
                </View>

                {/* Dynamic Quick Actions */}
                <Text className="text-[18px] font-black text-[#1A2C42] mb-4 tracking-tight">Quick Actions</Text>
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-6 px-6">
                        <ActionButton icon="add" label="Create Gig" color="#2B84B1" route="/(provider)/create-service" />
                        <ActionButton icon="bar-chart" label="Analytics" color="#8B5CF6" route="/(provider)/analytics" />
                        <ActionButton icon="star" label="Reviews" color="#55A06F" route="/(provider)/reviews" />
                        <ActionButton icon="help-buoy" label="Support" color="#FACC15" route="/(provider)/support" />
                        <View className="w-6" />
                    </ScrollView>
                </View>

                {/* Dashboard Stats */}
                <Text className="text-[18px] font-black text-[#1A2C42] mb-4 tracking-tight">Performance</Text>
                <View className="flex-row flex-wrap">
                    <StatCard icon="briefcase" label="Active Orders" value="4" color="#2B84B1" trend="12%" isPositive={true} />
                    <StatCard icon="checkmark-circle" label="Completed" value="82" color="#55A06F" trend="5%" isPositive={true} />
                </View>
                <View className="flex-row flex-wrap mb-4">
                    <StatCard icon="eye" label="Profile Views" value="4.2k" color="#8B5CF6" trend="24%" isPositive={true} />
                    <StatCard icon="star" label="Avg Rating" value="4.9" color="#FF9500" trend="0.1" isPositive={true} />
                </View>

                {/* Urgent Tasks / Active Orders */}
                <View className="flex-row justify-between items-end mb-4">
                    <Text className="text-[18px] font-black text-[#1A2C42] tracking-tight">Urgent Orders</Text>
                    <TouchableOpacity onPress={() => router.push('/(provider-tabs)/orders' as any)}>
                        <Text className="text-[14px] font-bold text-[#2B84B1]">View All Tasks</Text>
                    </TouchableOpacity>
                </View>
                <ActiveOrderRow id="#ORD-90211" service="Custom React Native App UI Design" due="Today 5:00 PM" price="450" />
                <ActiveOrderRow id="#ORD-90215" service="Backend Node.js API Setup" due="Tomorrow" price="1,200" />

            </ScrollView>
        </SafeAreaView>
    );
}
