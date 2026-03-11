import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";



const PHOTOS = [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576016773322-80c2723f501b?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop",
];

const REVIEWS = [
    {
        id: '1',
        name: 'Darrell Steward',
        date: '12/04/25',
        avatar: "https://i.pravatar.cc/150?u=darrell",
        comment: "Ms. Sarah helped me prepare for my IB math exams, I improved from a 4 to a 6! Her techniques and practice sessions are very effective.",
    },
    {
        id: '2',
        name: 'Albert Flores',
        date: '10/04/25',
        avatar: "https://i.pravatar.cc/150?u=albert",
        comment: "I've always found math boring and hard, but She made it fun with games, and visual explanations.",
    },
    {
        id: '3',
        name: 'Ronald Richards',
        date: '10/04/25',
        avatar: "https://i.pravatar.cc/150?u=ronald",
        comment: "I used to struggle so much with Algebra, but after just a few sessions with Sarah, everything started making sense. She explains things step-by-step & never makes you feel bad for asking questions.",
    }
];

export default function ServiceDetailsPage() {
    const router = useRouter();
    const { provider = 'John Doe', price = '24' } = useLocalSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Image Section */}
                <View className="relative w-full h-[320px]">
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop" }}
                        className="w-full h-full"
                    />

                    {/* Floating Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-14 left-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Carousel Arrows */}
                    <View className="absolute inset-0 flex-row items-center justify-between px-4">
                        <TouchableOpacity className="w-10 h-10 bg-white/30 rounded-full items-center justify-center">
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 bg-white/30 rounded-full items-center justify-center">
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Pagination Dots */}
                    <View className="absolute bottom-16 w-full flex-row justify-center space-x-1">
                        <View className="w-2 h-2 rounded-full bg-white" />
                        <View className="w-2 h-2 rounded-full bg-white/50" />
                        <View className="w-2 h-2 rounded-full bg-white/50" />
                    </View>
                </View>

                {/* Floating Info Card */}
                <View className="px-6 -mt-12">
                    <View className="bg-white rounded-[24px] p-6 shadow-xl shadow-black/10 border border-gray-50">
                        <View className="flex-row items-center mb-3">
                            <View className="w-1.5 h-6 bg-[#2B84B1] rounded-full mr-3"></View>
                            <Text className="text-[20px] font-bold text-[#1A2C42]">I will do your ac cleaning</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Text className="text-[16px] font-bold text-[#4A5568]">{provider}</Text>
                            <View className="flex-row items-center ml-2">
                                <Ionicons name="star" size={14} color="#2B84B1" />
                                <Text className="text-[14px] font-bold text-[#2B84B1] ml-0.5">4.5</Text>
                                <Text className="text-[14px] text-[#7C8B95] ml-1">(87 reviews)</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-6">
                            <View className="bg-[#EAF3FA] px-4 py-1.5 rounded-full mr-4">
                                <Text className="text-[#2B84B1] text-[13px] font-bold">Repairing</Text>
                            </View>
                            <View className="flex-row items-center flex-1">
                                <Ionicons name="location-outline" size={18} color="#2B84B1" />
                                <Text className="text-[#7C8B95] text-[13px] font-medium ml-1 flex-1" numberOfLines={1}>
                                    8081 Lakewood Gardens Junction
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-end">
                            <Text className="text-[32px] font-black text-[#2B84B1] leading-[32px]">${price}</Text>
                            <Text className="text-[13px] text-[#7C8B95] font-medium ml-2 mb-1">(Starting price)</Text>
                        </View>
                    </View>
                </View>

                {/* About Me Section */}
                <View className="px-6 mt-10">
                    <Text className="text-[22px] font-bold text-[#1A2C42] mb-4">About Me</Text>
                    <Text className="text-[15px] leading-[24px] text-[#7C8B95] font-medium">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. <Text className="text-[#2B84B1] font-bold">Read More...</Text>
                    </Text>
                </View>

                {/* Photos & Videos Section */}
                <View className="px-6 mt-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-[22px] font-bold text-[#1A2C42]">Photos & Videos</Text>
                        <TouchableOpacity>
                            <Text className="text-[15px] font-bold text-[#2B84B1]">See All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Mosaic Grid Mockup */}
                    <View className="flex-row h-[500px]">
                        <View className="flex-1 pr-2">
                            <Image source={{ uri: PHOTOS[0] }} className="w-full h-full rounded-[24px]" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-1 mb-2">
                                <View className="flex-row flex-1 gap-2">
                                    <View className="flex-1">
                                        <View className="flex-1 mb-2">
                                            <Image source={{ uri: PHOTOS[1] }} className="w-full h-full rounded-[20px]" />
                                        </View>
                                        <View className="flex-1">
                                            <Image source={{ uri: PHOTOS[2] }} className="w-full h-full rounded-[20px]" />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Image source={{ uri: PHOTOS[3] }} className="w-full h-full rounded-[24px]" />
                                    </View>
                                </View>
                            </View>
                            <View className="h-[240px]">
                                <Image source={{ uri: PHOTOS[4] }} className="w-full h-full rounded-[24px]" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Reviews Section */}
                <View className="px-6 mt-12 pb-10">
                    <View className="flex-row items-center mb-6">
                        <Ionicons name="star" size={16} color="#2B84B1" />
                        <Text className="text-[16px] font-bold text-[#1A2C42] ml-2">4.5 <Text className="text-[#7C8B95] font-normal">(87 reviews)</Text></Text>
                    </View>

                    {/* Filter Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8 overflow-visible">
                        <TouchableOpacity className="bg-[#2B84B1] px-6 py-2 rounded-full flex-row items-center mr-3">
                            <Ionicons name="star" size={14} color="white" />
                            <Text className="text-white font-bold text-[14px] ml-1.5">All</Text>
                        </TouchableOpacity>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <TouchableOpacity key={star} className="border border-[#2B84B1] px-6 py-2 rounded-full flex-row items-center mr-3 bg-white">
                                <Ionicons name="star" size={14} color="#2B84B1" />
                                <Text className="text-[#2B84B1] font-bold text-[14px] ml-1.5">{star}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Review List */}
                    {REVIEWS.map((review) => (
                        <View key={review.id} className="mb-10">
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                        <Image source={{ uri: review.avatar }} className="w-full h-full" />
                                    </View>
                                    <View>
                                        <Text className="text-[16px] font-bold text-[#1A2C42]">{review.name}</Text>
                                        <View className="flex-row items-center mt-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Ionicons key={s} name="star" size={14} color="#F5A623" style={{ marginRight: 2 }} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-[13px] font-medium text-[#7C8B95]">{review.date}</Text>
                            </View>
                            <Text className="text-[14px] leading-[22px] text-[#7C8B95] font-medium">
                                {review.comment}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity className="bg-[#EAF3FA] flex-1 py-5 rounded-[18px] mr-4 items-center">
                    <Text className="text-[#2B84B1] font-bold text-[17px]">Message</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsModalVisible(true)} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">
                    <Text className="text-white font-bold text-[17px]">Book Now</Text>
                </TouchableOpacity>
            </View>

            {/* Booking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-[40px] px-8 pt-8 pb-12">
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-10">
                            <View className="flex-row items-center">
                                <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-4"></View>
                                <Text className="text-[22px] font-bold text-[#1A2C42]">Select your Date & Time?</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        {/* Date Picker Card */}
                        <TouchableOpacity className="bg-[#FFBD99] rounded-[24px] p-6 mb-5 flex-row items-center">
                            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-5">
                                <Ionicons name="calendar-outline" size={28} color="#1A2C42" />
                            </View>
                            <View>
                                <Text className="text-[13px] font-bold text-[#7C8B95] uppercase tracking-wider mb-1">Date</Text>
                                <Text className="text-[20px] font-bold text-[#1A2C42]">Select your Date</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Time Picker Card */}
                        <TouchableOpacity className="bg-[#BCE3CD] rounded-[24px] p-6 mb-10 flex-row items-center">
                            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-5">
                                <Ionicons name="time-outline" size={28} color="#1A2C42" />
                            </View>
                            <View>
                                <Text className="text-[13px] font-bold text-[#7C8B95] uppercase tracking-wider mb-1">Time</Text>
                                <Text className="text-[20px] font-bold text-[#1A2C42]">Select your Time</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Summary Row */}
                        <View className="flex-row justify-between items-center mb-10">
                            <Text className="text-[18px] text-[#7C8B95] font-medium">
                                Total: <Text className="text-black font-bold">Kshs 150.50</Text>
                            </Text>
                            <TouchableOpacity className="flex-row items-center">
                                <Text className="text-[#FF9F6A] font-bold text-[16px] mr-1.5">View Details</Text>
                                <Ionicons name="chevron-up" size={14} color="#FF9F6A" />
                            </TouchableOpacity>
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(false)}
                            className="bg-[#EBECEE] w-full py-6 rounded-[24px] items-center"
                        >
                            <Text className="text-[#1A2C42] font-black text-[20px]">Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
