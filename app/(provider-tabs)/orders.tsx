import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProviderOrders() {
    const router = useRouter();
    const [filter, setFilter] = useState('Active');

    const OrderCard = ({ id, service, buyer, price, due, status, statusColor }: any) => (
        <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="text-[13px] text-[#A0AEC0] font-bold tracking-widest uppercase mb-1">{id}</Text>
                    <Text className="text-[16px] font-bold text-[#1A2C42] w-[200px]" numberOfLines={1}>{service}</Text>
                </View>
                <View className="px-3 py-1 rounded-full items-center justify-center" style={{ backgroundColor: `${statusColor}15` }}>
                    <Text className="text-[12px] font-bold" style={{ color: statusColor }}>{status}</Text>
                </View>
            </View>

            <View className="flex-row items-center mb-4">
                <Ionicons name="person-outline" size={16} color="#7C8B95" />
                <Text className="text-[14px] text-[#7C8B95] font-medium mx-2">{buyer}</Text>
                <Text className="text-[14px] text-[#A0AEC0]">•</Text>
                <Text className="text-[14px] font-bold text-[#2B84B1] ml-2">${price}</Text>
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-[12px] px-4 py-2 mb-4">
                <Ionicons name="time-outline" size={16} color="#FACC15" />
                <Text className="text-[13px] font-bold text-[#FACC15] ml-2 flex-1">Due: {due}</Text>
            </View>

            <View className="flex-row flex-wrap border-t border-gray-100 pt-4 gap-2">
                <TouchableOpacity onPress={() => router.push('/(provider-tabs)/messages' as any)} className="flex-1 bg-gray-50 rounded-[12px] py-3 items-center border border-gray-200">
                    <Text className="text-[#1A2C42] font-bold text-[14px]">Message</Text>
                </TouchableOpacity>
                {status === 'Active' && (
                    <TouchableOpacity onPress={() => router.push('/(provider)/deliver-order' as any)} className="flex-1 bg-[#2B84B1] rounded-[12px] py-3 items-center">
                        <Text className="text-white font-bold text-[14px]">Deliver Now</Text>
                    </TouchableOpacity>
                )}
                {status === 'New' && (
                    <TouchableOpacity className="flex-1 bg-[#2B84B1] rounded-[12px] py-3 items-center">
                        <Text className="text-white font-bold text-[14px]">Accept Order</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <Text className="text-[24px] font-bold text-[#1A2C42]">Manage Orders</Text>
            </View>

            {/* Filters */}
            <View className="px-6 mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {['New', 'Active', 'Delivered', 'Completed', 'Cancelled'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-full mr-3 border ${filter === f ? 'bg-[#2B84B1] border-[#2B84B1]' : 'border-gray-200 bg-white'}`}
                        >
                            <Text className={`font-bold text-[14px] ${filter === f ? 'text-white' : 'text-[#7C8B95]'}`}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {filter === 'Active' && (
                    <>
                        <OrderCard
                            id="#ORD-90211"
                            service="Custom React Native App UI Design"
                            buyer="Alice Smith"
                            price="450"
                            due="Tomorrow, 5:00 PM"
                            status="Active"
                            statusColor="#2B84B1"
                        />
                        <OrderCard
                            id="#ORD-90215"
                            service="Backend Node.js API Setup"
                            buyer="TechCorp Inc."
                            price="1,200"
                            due="In 3 days"
                            status="Active"
                            statusColor="#2B84B1"
                        />
                    </>
                )}

                {filter === 'New' && (
                    <OrderCard
                        id="#ORD-90888"
                        service="Fix Frontend Bugs in Next.js"
                        buyer="Mike Johnson"
                        price="150"
                        due="In 2 days"
                        status="New"
                        statusColor="#FACC15"
                    />
                )}

                {filter === 'Completed' && (
                    <OrderCard
                        id="#ORD-80123"
                        service="Figma to HTML/CSS Conversion"
                        buyer="Sarah Williams"
                        price="200"
                        due="Delivered Oct 12"
                        status="Completed"
                        statusColor="#55A06F"
                    />
                )}

                {filter === 'Delivered' && (
                    <OrderCard
                        id="#ORD-90111"
                        service="Landing Page Animation"
                        buyer="DesignStudio"
                        price="300"
                        due="Pending Buyer Review"
                        status="Delivered"
                        statusColor="#FF9500"
                    />
                )}

                {/* Empty State Fallback */}
                {['Cancelled'].includes(filter) && (
                    <View className="items-center justify-center py-20">
                        <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
                        <Text className="text-[18px] font-bold text-[#1A2C42] mt-4">No orders found</Text>
                        <Text className="text-[14px] text-[#7C8B95] mt-2">You don&apos;t have any {filter.toLowerCase()} orders right now.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
