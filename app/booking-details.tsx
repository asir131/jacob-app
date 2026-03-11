import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingDetailsPage() {
    const router = useRouter();
    const { title = 'AC Installation', refCode = '#D-571224', status = 'Confirmed', time = '8:00-9:00 AM', date = '09 Dec', provider = 'Westinghouse', providerIcon = 'https://cdn-icons-png.flaticon.com/512/5977/5977581.png', price = '$150.50' } = useLocalSearchParams();

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 block">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42] flex-1">Booking Details</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Status Card */}
                <View className="bg-white px-6 py-8 mb-4 border-b border-gray-100">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-[22px] font-bold text-[#1A2C42] mb-1">{title}</Text>
                            <Text className="text-[14px] font-medium text-[#7C8B95]">Ref: {refCode}</Text>
                        </View>
                        <View className="bg-[#EAF6ED] px-4 py-1.5 rounded-lg">
                            <Text className="text-[13px] font-bold text-[#55A06F]">{status}</Text>
                        </View>
                    </View>

                    {/* Progress Tracker Tracker */}
                    <View className="flex-row items-center justify-between px-2 mt-4">
                        <View className="items-center z-10">
                            <View className="w-8 h-8 rounded-full bg-[#55A06F] items-center justify-center mb-2 border-4 border-white">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="text-[12px] font-bold text-[#1A2C42]">Pending</Text>
                        </View>
                        <View className="flex-1 h-1 bg-[#55A06F] -mt-6 -mx-2" />

                        <View className="items-center z-10">
                            <View className="w-8 h-8 rounded-full bg-[#55A06F] items-center justify-center mb-2 border-4 border-white">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="text-[12px] font-bold text-[#1A2C42]">Confirmed</Text>
                        </View>
                        <View className="flex-1 h-1 bg-gray-200 -mt-6 -mx-2" />

                        <View className="items-center z-10">
                            <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mb-2 border-4 border-white">
                                <View className="w-2.5 h-2.5 bg-white rounded-full" />
                            </View>
                            <Text className="text-[12px] font-bold text-[#A0AEC0]">Working</Text>
                        </View>
                        <View className="flex-1 h-1 bg-gray-200 -mt-6 -mx-2" />

                        <View className="items-center z-10">
                            <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mb-2 border-4 border-white">
                            </View>
                            <Text className="text-[12px] font-bold text-[#A0AEC0]">Done</Text>
                        </View>
                    </View>
                </View>

                {/* Service Data */}
                <View className="px-6 mb-6">
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">
                        Service Information
                    </Text>
                    <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5">
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-[#FEF3EA] rounded-full items-center justify-center mr-4">
                                <FontAwesome5 name="wind" size={20} color="#E89F65" />
                            </View>
                            <View>
                                <Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">Category</Text>
                                <Text className="text-[16px] font-bold text-[#1A2C42]">AC Repairing</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-[#EAF3FA] rounded-full items-center justify-center mr-4">
                                <Ionicons name="calendar-outline" size={22} color="#2B84B1" />
                            </View>
                            <View>
                                <Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">Schedule</Text>
                                <Text className="text-[16px] font-bold text-[#1A2C42]">{date}, {time}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-[#F3EAFE] rounded-full items-center justify-center mr-4">
                                <Ionicons name="location-outline" size={22} color="#A865E8" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">Location</Text>
                                <Text className="text-[16px] font-bold text-[#1A2C42]" numberOfLines={2}>
                                    15A James Street, Manhattan, New York City
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Provider Data */}
                <View className="px-6 mb-6">
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">
                        Service Provider
                    </Text>
                    <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5 flex-row items-center">
                        <Image source={{ uri: providerIcon as string }} className="w-[52px] h-[52px] rounded-full mr-4 border border-gray-100" />
                        <View className="flex-1">
                            <Text className="text-[18px] font-bold text-[#1A2C42] mb-1">{provider}</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="star" size={14} color="#F5A623" />
                                <Text className="text-[13px] font-bold text-[#1A2C42] ml-1">4.9</Text>
                                <Text className="text-[13px] text-[#7C8B95] ml-1">(128 Jobs)</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="w-12 h-12 bg-[#EAF3FA] rounded-full items-center justify-center">
                            <Ionicons name="chatbubble-ellipses" size={22} color="#2B84B1" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Price Summary */}
                <View className="px-6 mb-8">
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">
                        Price Details
                    </Text>
                    <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5">
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-[15px] font-medium text-[#7C8B95]">Service Charge</Text>
                            <Text className="text-[16px] font-bold text-[#1A2C42]">{price}</Text>
                        </View>
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-[15px] font-medium text-[#7C8B95]">Tax & Fees</Text>
                            <Text className="text-[16px] font-bold text-[#1A2C42]">$15.00</Text>
                        </View>
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-[15px] font-medium text-[#7C8B95]">Discount (10%)</Text>
                            <Text className="text-[16px] font-bold text-[#55A06F]">-$15.05</Text>
                        </View>
                        <View className="h-[1px] bg-gray-100 my-2" />
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-[18px] font-bold text-[#1A2C42]">Total</Text>
                            <Text className="text-[22px] font-black text-[#2B84B1]">$150.45</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Actions */}
            <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 flex-row">
                <TouchableOpacity className="bg-[#FFF0F0] flex-1 py-5 rounded-[18px] mr-4 items-center">
                    <Text className="text-[#FF4757] font-bold text-[17px]">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">
                    <Text className="text-white font-bold text-[17px]">Reschedule</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
