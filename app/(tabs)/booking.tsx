import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Booking {
    id: string;
    title: string;
    refCode: string;
    status: 'Confirmed' | 'Pending' | 'Draft' | 'History';
    time: string;
    date: string;
    provider: string;
    providerIcon: string;
    icon: string;
    iconBg: string;
    iconColor: string;
}

const BOOKINGS_DATA: Booking[] = [
    {
        id: '1',
        title: 'AC Installation',
        refCode: '#D-571224',
        status: 'Confirmed',
        time: '8:00-9:00 AM',
        date: '09 Dec',
        provider: 'Westinghouse',
        providerIcon: 'https://cdn-icons-png.flaticon.com/512/5977/5977581.png', // Mock local icon via URL
        icon: 'wind',
        iconBg: '#FEF3EA',
        iconColor: '#E89F65'
    },
    {
        id: '2',
        title: 'Multi Mask Facial',
        refCode: '#D-571224',
        status: 'Pending',
        time: '8:00-9:00 AM',
        date: '09 Dec',
        provider: 'Sindenayu',
        providerIcon: 'https://cdn-icons-png.flaticon.com/512/2921/2921204.png', // Mock local icon
        icon: 'spa',
        iconBg: '#F3EAFE',
        iconColor: '#A865E8'
    }
];

export default function BookingPage() {
    const [activeTab, setActiveTab] = useState('Upcoming');

    // For demonstration: if tab is 'Upcoming', show data. Others show empty.
    const hasData = activeTab === 'Upcoming' && BOOKINGS_DATA.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 pt-4 pb-6 flex-row items-center">
                <View className="w-1 h-6 bg-[#2286BE] rounded-full mr-3" />
                <Text className="text-[24px] font-bold text-[#1A2C42]">Bookings</Text>
            </View>

            {/* Tab Switcher */}
            <View className="px-6 flex-row mb-8">
                {['Upcoming', 'History', 'Draft'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl mr-3 ${activeTab === tab ? 'bg-[#EAF3FA]' : 'bg-transparent'}`}
                    >
                        <Text className={`text-[15px] font-semibold ${activeTab === tab ? 'text-[#2286BE]' : 'text-[#7C8B95]'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {hasData ? (
                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {BOOKINGS_DATA.map((item) => (
                        <View key={item.id} className="mb-8 border border-[#F2F2F2] rounded-[24px] overflow-hidden">
                            {/* Card Content */}
                            <View className="p-5">
                                {/* Header Section */}
                                <View className="flex-row items-center mb-5">
                                    <View
                                        style={{ backgroundColor: item.iconBg }}
                                        className="w-14 h-14 rounded-full items-center justify-center mr-4"
                                    >
                                        <FontAwesome5 name={item.icon} size={24} color={item.iconColor} />
                                    </View>
                                    <View>
                                        <Text className="text-[18px] font-bold text-[#1A2C42]">{item.title}</Text>
                                        <Text className="text-[13px] text-[#7C8B95] mt-1">Reference Code: {item.refCode}</Text>
                                    </View>
                                </View>

                                {/* Divider */}
                                <View className="h-[1px] bg-[#F2F2F2] mb-5" />

                                {/* Status Section */}
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-[15px] text-[#7C8B95] font-medium">Status</Text>
                                    <View className={`px-4 py-1.5 rounded-lg ${item.status === 'Confirmed' ? 'bg-[#EAF6ED]' : 'bg-[#FEF3EA]'}`}>
                                        <Text className={`text-[13px] font-bold ${item.status === 'Confirmed' ? 'text-[#55A06F]' : 'text-[#E89F65]'}`}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Schedule Section */}
                                <View className="flex-row items-center mb-6">
                                    <View className="w-10 h-10 rounded-full border border-[#F2F2F2] items-center justify-center mr-4">
                                        <Ionicons name="calendar-outline" size={20} color="#7C8B95" />
                                    </View>
                                    <View>
                                        <Text className="text-[15px] font-bold text-[#1A2C42]">{item.time}, {item.date}</Text>
                                        <Text className="text-[13px] text-[#7C8B95] mt-0.5">Schedule</Text>
                                    </View>
                                </View>

                                {/* Provider Section */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 rounded-full border border-[#F2F2F2] items-center justify-center mr-4 overflow-hidden">
                                            <Image source={{ uri: item.providerIcon }} className="w-6 h-6" resizeMode="contain" />
                                        </View>
                                        <View>
                                            <Text className="text-[15px] font-bold text-[#1A2C42]">{item.provider}</Text>
                                            <Text className="text-[13px] text-[#7C8B95] mt-0.5">Service provider</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity className="bg-[#2286BE] flex-row items-center px-6 py-3 rounded-2xl">
                                        <Ionicons name="call" size={18} color="white" />
                                        <Text className="text-white font-bold text-[14px] ml-2">Call</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                    <View className="h-20" />
                </ScrollView>
            ) : (
                <View className="flex-1 items-center justify-center px-10 pb-20">
                    {/* Empty State Illustration Placeholder */}
                    <View className="mb-8">
                        {/* Custom Clipboard SVG representation using icons */}
                        <View className="relative w-24 h-24 items-center justify-center">
                            <Ionicons name="clipboard-outline" size={80} color="#2286BE" />
                            <View className="absolute bottom-2 right-0 bg-white rounded-full p-1">
                                <MaterialCommunityIcons name="pencil-circle" size={36} color="#48D1CC" />
                            </View>
                        </View>
                    </View>

                    <Text className="text-[22px] font-bold text-[#1A2C42] mb-3 text-center">
                        No Upcoming Order
                    </Text>
                    <Text className="text-[15px] text-[#7C8B95] text-center leading-[22px] mb-10">
                        Currently you don't have any upcoming order. Place and track your orders from here.
                    </Text>

                    <TouchableOpacity className="bg-[#2286BE] px-10 py-5 rounded-[20px] w-full">
                        <Text className="text-white text-[18px] font-bold text-center">View all services</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}