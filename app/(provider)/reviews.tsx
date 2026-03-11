import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewsPage() {
    const router = useRouter();

    const ReviewCard = ({ name, date, rating, comment, service }: any) => (
        <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-gray-100 rounded-full mr-3 items-center justify-center">
                        <Ionicons name="person" size={20} color="#CBD5E1" />
                    </View>
                    <View>
                        <Text className="text-[15px] font-bold text-[#1A2C42]">{name}</Text>
                        <Text className="text-[12px] text-[#7C8B95]">{date}</Text>
                    </View>
                </View>
                <View className="flex-row items-center bg-[#FFF9E6] px-2 py-1 rounded-lg">
                    <Ionicons name="star" size={14} color="#FF9500" />
                    <Text className="text-[13px] font-bold text-[#FF9500] ml-1">{rating}</Text>
                </View>
            </View>

            <Text className="text-[14px] text-[#4A5568] leading-[22px] mb-4">
                &quot;{comment}&quot;
            </Text>

            <View className="flex-row items-center bg-gray-50 p-3 rounded-[12px]">
                <Ionicons name="briefcase-outline" size={16} color="#7C8B95" />
                <Text className="text-[12px] text-[#7C8B95] font-medium ml-2 flex-1" numberOfLines={1}>{service}</Text>
            </View>

            <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                <TouchableOpacity className="flex-1 items-center flex-row justify-center">
                    <Ionicons name="chatbubble-outline" size={18} color="#2B84B1" />
                    <Text className="text-[#2B84B1] font-bold ml-2">Reply</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Buyer Reviews</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Overall Rating */}
                <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-gray-100 mb-6 flex-row items-center">
                    <View className="items-center mr-6 pr-6 border-r border-gray-100">
                        <Text className="text-[42px] font-black text-[#1A2C42]">4.9</Text>
                        <View className="flex-row mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Ionicons key={s} name="star" size={16} color="#FF9500" />
                            ))}
                        </View>
                        <Text className="text-[12px] text-[#7C8B95] font-medium">128 Reviews</Text>
                    </View>

                    <View className="flex-1">
                        {[
                            { star: 5, pct: 90 },
                            { star: 4, pct: 8 },
                            { star: 3, pct: 2 },
                            { star: 2, pct: 0 },
                            { star: 1, pct: 0 },
                        ].map((bars) => (
                            <View key={bars.star} className="flex-row items-center mb-1">
                                <Text className="text-[12px] text-[#7C8B95] font-bold w-3">{bars.star}</Text>
                                <Ionicons name="star" size={10} color="#CBD5E1" className="mx-1" />
                                <View className="flex-1 h-1.5 bg-gray-100 rounded-full mx-2 overflow-hidden">
                                    <View className="h-full bg-[#FF9500] rounded-full" style={{ width: `${bars.pct}%` }} />
                                </View>
                                <Text className="text-[10px] text-[#A0AEC0] w-6">{bars.pct}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Reviews List */}
                <Text className="text-[16px] font-bold text-[#1A2C42] mb-4">Recent Feedback</Text>

                <ReviewCard
                    name="Alice Smith"
                    date="2 days ago"
                    rating="5.0"
                    comment="Outstanding work! The communication was excellent and the final delivery exceeded my expectations. Highly recommended."
                    service="Custom React Native App UI Design"
                />

                <ReviewCard
                    name="TechCorp Inc."
                    date="1 week ago"
                    rating="5.0"
                    comment="Very professional and fast. Solved our backend architectural issues perfectly."
                    service="Backend Node.js API Setup"
                />

                <ReviewCard
                    name="John Doe"
                    date="2 weeks ago"
                    rating="4.0"
                    comment="Good work overall. Required one small revision but it was handled very quickly."
                    service="Figma to HTML/CSS Conversion"
                />
            </ScrollView>
        </SafeAreaView>
    );
}
