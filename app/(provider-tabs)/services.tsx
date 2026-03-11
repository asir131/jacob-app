import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProviderServices() {
    const router = useRouter();

    const ServiceCard = ({ title, category, price, rating, orders, status }: any) => (
        <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row items-start">
                <View className="w-20 h-20 bg-gray-100 rounded-[16px] mr-4 border border-gray-200 items-center justify-center overflow-hidden">
                    <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-[16px] font-bold text-[#1A2C42] flex-1 mr-2" numberOfLines={2}>{title}</Text>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#7C8B95" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-[13px] text-[#2B84B1] font-bold mb-2">{category}</Text>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-3">
                            <View className="flex-row items-center mr-3">
                                <Ionicons name="star" size={14} color="#FF9500" />
                                <Text className="text-[13px] font-bold text-[#1A2C42] ml-1">{rating}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="cart" size={14} color="#A0AEC0" />
                                <Text className="text-[13px] font-bold text-[#7C8B95] ml-1">{orders}</Text>
                            </View>
                        </View>
                        <Text className="text-[16px] font-black text-[#1A2C42]">From ${price}</Text>
                    </View>
                </View>
            </View>
            <View className="flex-row mt-4 pt-4 border-t border-gray-100 items-center justify-between">
                <View className="flex-row items-center">
                    <View className={`w-2.5 h-2.5 rounded-full mr-2 ${status === 'Active' ? 'bg-[#55A06F]' : 'bg-[#FACC15]'}`} />
                    <Text className={`text-[13px] font-bold ${status === 'Active' ? 'text-[#55A06F]' : 'text-[#FACC15]'}`}>{status}</Text>
                </View>
                <View className="flex-row">
                    <TouchableOpacity className="px-4 py-2 bg-gray-50 rounded-lg mr-2 border border-gray-200">
                        <Text className="text-[#1A2C42] font-bold text-[13px]">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 bg-[#2B84B1] rounded-lg">
                        <Text className="text-white font-bold text-[13px]">Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <Text className="text-[24px] font-bold text-[#1A2C42]">My Gigs</Text>
                <TouchableOpacity onPress={() => router.push('/(provider)/create-service' as any)} className="w-10 h-10 bg-[#2B84B1] rounded-full flex items-center justify-center shadow-sm shadow-[#2B84B1]/40">
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <ServiceCard
                    title="I will design a modern Mobile App UI UX in Figma"
                    category="App Design"
                    price="150"
                    rating="4.9"
                    orders="24"
                    status="Active"
                />

                <ServiceCard
                    title="I will build a full stack Next.js Serverless App"
                    category="Web Development"
                    price="500"
                    rating="5.0"
                    orders="8"
                    status="Active"
                />

                <ServiceCard
                    title="I will create custom AI automation and agents"
                    category="AI Automation"
                    price="300"
                    rating="4.8"
                    orders="12"
                    status="Paused"
                />
            </ScrollView>
        </SafeAreaView>
    );
}
