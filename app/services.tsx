import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICES_DATA = [
    {
        id: '1',
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
        provider: "John Doe",
        avatar: "https://i.pravatar.cc/150?u=john",
        description: "I will do your home cleaning",
        rating: 4.8,
        reviews: 87,
        price: 15,
    },
    {
        id: '2',
        image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
        provider: "Jane Smith",
        avatar: "https://i.pravatar.cc/150?u=jane",
        description: "Expert carpet cleaning service",
        rating: 4.9,
        reviews: 124,
        price: 25,
    },
    {
        id: '3',
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
        provider: "Mike Brown",
        avatar: "https://i.pravatar.cc/150?u=mike",
        description: "Deep cleaning for your office",
        rating: 4.7,
        reviews: 56,
        price: 45,
    }
];

export default function ServicesPage() {
    const router = useRouter();
    const { title } = useLocalSearchParams();

    const renderServiceCard = ({ item }: { item: typeof SERVICES_DATA[0] }) => (
        <TouchableOpacity className="mb-8 px-6">
            <View className="relative w-full h-[220px] rounded-[24px] overflow-hidden mb-4">
                <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                {/* Pagination Dots Mockup */}
                <View className="absolute bottom-4 w-full flex-row justify-center space-x-1.5">
                    <View className="w-2 h-2 rounded-full bg-white" />
                    <View className="w-2 h-2 rounded-full bg-white/50" />
                </View>
            </View>

            <View className="flex-row items-center mb-1">
                <Image source={{ uri: item.avatar }} className="w-5 h-5 rounded-full mr-2" />
                <Text className="text-[14px] font-bold text-[#2B84B1]">{item.provider}</Text>
            </View>

            <Text className="text-[15px] text-[#7C8B95] mb-2 font-medium">
                {item.description}
            </Text>

            <View className="flex-row items-center mb-2">
                <Ionicons name="star" size={14} color="#F5A623" />
                <Text className="text-[14px] font-bold text-[#1A2C42] ml-1.5">
                    {item.rating} <Text className="text-[#7C8B95] font-normal">({item.reviews})</Text>
                </Text>
            </View>

            <Text className="text-[16px] font-black text-[#1A2C42]">
                From ${item.price}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header with Search */}
            <View className="px-6 pt-4 pb-10 rounded-b-[30px]">
                <View
                    className="flex-row items-center bg-white rounded-[24px] pl-3 pr-2 py-1.5 border border-gray-100"
                    style={{
                        shadowColor: '#1A2C42',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 4
                    }}
                >
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Ionicons name="arrow-back" size={26} color="#2B84B1" />
                    </TouchableOpacity>

                    <TextInput
                        placeholder="Search Category"
                        placeholderTextColor="#A0AEC0"
                        className="flex-1 text-[16px] font-medium text-[#1A2C42] px-2"
                    />

                    <TouchableOpacity className="bg-[#2B84B1] w-[46px] h-[46px] rounded-[16px] items-center justify-center">
                        <Ionicons name="search" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="px-6 mb-8 flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="w-1.5 h-6 bg-[#2B84B1] rounded-full mr-3.5"></View>
                        <Text className="text-[22px] font-bold text-[#1A2C42]">{title || "Services"}</Text>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="options-outline" size={24} color="#2B84B1" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={SERVICES_DATA}
                    renderItem={renderServiceCard}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </SafeAreaView>
    );
}
