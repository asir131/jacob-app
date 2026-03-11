import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProviderMessages() {
    const ChatRow = ({ name, message, time, unread = 0, online = false }: any) => (
        <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100 bg-white">
            <View className="relative w-14 h-14 rounded-full bg-gray-100 mr-4 border border-gray-200 items-center justify-center">
                <Ionicons name="person" size={24} color="#A0AEC0" />
                {online && <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#55A06F] rounded-full border-2 border-white" />}
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-[16px] font-bold text-[#1A2C42]">{name}</Text>
                    <Text className={`text-[12px] font-bold ${unread > 0 ? 'text-[#2B84B1]' : 'text-[#A0AEC0]'}`}>{time}</Text>
                </View>
                <Text className={`text-[14px] ${unread > 0 ? 'text-[#1A2C42] font-semibold' : 'text-[#7C8B95] font-medium'}`} numberOfLines={1}>
                    {message}
                </Text>
            </View>
            {unread > 0 && (
                <View className="w-5 h-5 bg-[#FF4757] rounded-full items-center justify-center ml-2">
                    <Text className="text-white text-[10px] font-bold">{unread}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <Text className="text-[24px] font-bold text-[#1A2C42]">Messages</Text>
            </View>

            {/* Search */}
            <View className="px-6 mb-4">
                <View className="w-full h-[50px] bg-gray-50 rounded-[16px] px-4 flex-row items-center border border-gray-100">
                    <Ionicons name="search" size={20} color="#A0AEC0" />
                    <TextInput
                        placeholder="Search chats"
                        className="flex-1 ml-2 text-[15px] text-[#1A2C42]"
                        placeholderTextColor="#A0AEC0"
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <ChatRow
                    name="Alice Smith"
                    message="Hey, just checking on the app UI progress. Thanks!"
                    time="10:42 AM"
                    unread={2}
                    online={true}
                />
                <ChatRow
                    name="TechCorp Inc."
                    message="Can we schedule a call for tomorrow?"
                    time="Yesterday"
                    online={true}
                />
                <ChatRow
                    name="Mike Johnson"
                    message="I sent over the requirements doc."
                    time="Monday"
                />
                <ChatRow
                    name="Sarah Williams"
                    message="Wow, this looks amazing! Thank you so much."
                    time="Oct 12"
                />
                <ChatRow
                    name="DesignStudio"
                    message="Please review the feedback left on the delivery."
                    time="Oct 10"
                    unread={1}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
