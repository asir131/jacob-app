import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatItem {
    id: string;
    name: string;
    info: string;
    time: string;
    unreadCount: number;
    avatar: string;
    isOnline: boolean;
}

const CHAT_DATA: ChatItem[] = [
    {
        id: '1',
        name: 'Dianne Russell',
        info: '(209) 555-0104',
        time: '9:30 am',
        unreadCount: 1,
        avatar: "https://i.pravatar.cc/150?u=dianne",
        isOnline: true,
    },
    {
        id: '2',
        name: 'Marvin McKinney',
        info: '(302) 555-0107',
        time: '9:30 am',
        unreadCount: 1,
        avatar: "https://i.pravatar.cc/150?u=marvin",
        isOnline: true,
    },
    {
        id: '3',
        name: 'Bessie Cooper',
        info: '(808) 555-0111',
        time: '9:30 am',
        unreadCount: 1,
        avatar: "https://i.pravatar.cc/150?u=bessie",
        isOnline: true,
    },
    {
        id: '4',
        name: 'Esther Howard',
        info: '(505) 555-0125',
        time: '9:30 am',
        unreadCount: 1,
        avatar: "https://i.pravatar.cc/150?u=esther",
        isOnline: true,
    },
    {
        id: '5',
        name: 'Eleanor Pena',
        info: '(229) 555-0109',
        time: '9:30 am',
        unreadCount: 0,
        avatar: "https://i.pravatar.cc/150?u=eleanor",
        isOnline: false,
    },
    {
        id: '6',
        name: 'Kristin Watson',
        info: '(201) 555-0124',
        time: '9:30 am',
        unreadCount: 0,
        avatar: "https://i.pravatar.cc/150?u=kristin",
        isOnline: false,
    }
];

export default function ProviderMessages() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
    const [activeTab, setActiveTab] = useState('All');

    const renderChatItem = ({ item }: { item: ChatItem }) => (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/chat-details',
                params: {
                    name: item.name,
                    avatar: item.avatar,
                    info: item.info
                }
            })}
            className="flex-row items-center px-6 py-4"
        >
            <View className="relative">
                <View className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-[#EAF3FA]">
                    <Image source={{ uri: item.avatar }} className="w-full h-full" />
                </View>
                {item.isOnline && (
                    <View style={{ borderRadius: 999 }} className="absolute bottom-0 right-0 w-4 h-4 bg-[#34A853] border-2 border-white" />
                )}
            </View>

            <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                    <View className="flex-1 mr-2">
                        <Text className="text-[17px] font-bold text-[#2286BE]" numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text className="text-[13px] text-[#7C8B95] font-medium">{item.time}</Text>
                </View>

                <View className="flex-row justify-between items-center">
                    <Text className="text-[15px] text-[#7C8B95] font-medium flex-1 mr-2" numberOfLines={1}>{item.info}</Text>
                    {item.unreadCount > 0 && (
                        <View className="bg-[#2286BE] w-5 h-5 rounded-full items-center justify-center">
                            <Text className="text-white text-[11px] font-bold">{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header with Search */}
            <SafeAreaView
                edges={['top']}
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.03,
                    shadowRadius: 10,
                    elevation: 3,
                    zIndex: 20,
                }}
                className="bg-white rounded-b-[40px] px-6 pb-6"
            >
                <View
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 5,
                    }}
                    className="flex-row items-center bg-white rounded-[20px] px-4 h-[64px] border border-gray-50"
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#2286BE" />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Search Category"
                        placeholderTextColor="#7C8B95"
                        className="flex-1 ml-4 text-[15px] font-medium text-[#1A2C42]"
                    />
                    <TouchableOpacity className="bg-[#2286BE] w-10 h-10 rounded-xl items-center justify-center">
                        <Ionicons name="search" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Title */}
            <View className="px-6 mb-8 flex-row items-center mt-2">
                <View className="w-1.5 h-6 bg-[#2286BE] rounded-full mr-3" />
                <Text className="text-[24px] font-bold text-[#1A2C42]">Chat</Text>
            </View>

            {/* Tab Switcher */}
            <View className="px-6 mb-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {['All', 'Unread (3)', 'Groups', 'Favorite'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`px-7 py-3 rounded-[20px] mr-3 ${activeTab === tab ? 'bg-[#2286BE]' : 'bg-transparent'}`}
                        >
                            <Text className={`text-[15px] font-bold ${activeTab === tab ? 'text-white' : 'text-[#2286BE]'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Chat List */}
            <FlatList
                data={CHAT_DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                ItemSeparatorComponent={() => <View className="h-[1px] bg-[#F2F2F2] mx-6" />}
                contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
