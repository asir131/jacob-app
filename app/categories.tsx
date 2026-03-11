import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
    { id: '1', name: 'AC Repair', icon: 'air-filter', type: 'MaterialCommunityIcons', bgColor: '#FFDFB3', iconColor: '#C46000' },
    { id: '2', name: 'Beauty', icon: 'sparkles', type: 'Ionicons', bgColor: '#DCCFFD', iconColor: '#553098' },
    { id: '3', name: 'Appliance', icon: 'washing-machine', type: 'MaterialCommunityIcons', bgColor: '#B1EBF2', iconColor: '#008EA6' },
    { id: '4', name: 'Painting', icon: 'format-paint', type: 'MaterialCommunityIcons', bgColor: '#C6F3D7', iconColor: '#2F855A' },
    { id: '5', name: 'Cleaning', icon: 'hand-okay', type: 'MaterialCommunityIcons', bgColor: '#FFE8B3', iconColor: '#C05621' },
    { id: '6', name: 'Plumbing', icon: 'pipe', type: 'MaterialCommunityIcons', bgColor: '#E2F2E4', iconColor: '#38A169' },
    { id: '7', name: 'Electronics', icon: 'power-plug', type: 'MaterialCommunityIcons', bgColor: '#FED7D7', iconColor: '#C53030' },
    { id: '8', name: 'Shifting', icon: 'truck-delivery', type: 'MaterialCommunityIcons', bgColor: '#FBB6CE', iconColor: '#B83280' },
    { id: '9', name: 'Men\'s Salon', icon: 'content-cut', type: 'MaterialCommunityIcons', bgColor: '#C3DAFE', iconColor: '#2B6CB0' },
];

export default function CategoriesPage() {
    const router = useRouter();


    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header with Search */}
            <View className="px-6 pt-4 pb-8 rounded-b-[30px]">
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

            {/* Main Content */}
            <View className="flex-1 px-4">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}>
                    {/* Section Title */}
                    <View className="flex-row items-center mb-10 px-2 ml-4">
                        <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-4"></View>
                        <Text className="text-[24px] font-bold text-[#1A2C42]">All Categories</Text>
                    </View>

                    {/* Categories Grid - Using a simple Map for 3 columns to ensure pixel perfect alignment */}
                    <View className="flex-row flex-wrap justify-start">
                        {CATEGORIES.map((item) => (
                            <View key={item.id} className="w-[33.33%] items-center mb-12">
                                <TouchableOpacity
                                    style={{ backgroundColor: item.bgColor }}
                                    className="w-[58px] h-[58px] rounded-full items-center justify-center mb-4"
                                >
                                    {item.type === 'Ionicons' ? (
                                        <Ionicons name={item.icon as any} size={36} color={item.iconColor} />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon as any} size={36} color={item.iconColor} />
                                    )}
                                </TouchableOpacity>
                                <Text className="text-[15px] font-bold text-[#4A5568] text-center">
                                    {item.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
