import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
}

export default function ChatDetailsPage() {
    const router = useRouter();
    const { name = "John Smith", avatar, info = "(209) 555-0104" } = useLocalSearchParams();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "I'm planning to go to the gym later. Want to grab coffee after?",
            time: "10:30 AM",
            isMe: false,
        },
        {
            id: "2",
            text: "Sure! Let me check my schedule",
            time: "10:30 AM",
            isMe: true,
        },
        {
            id: "3",
            text: "Perfect! I know a great place downtown.",
            time: "10:30 AM",
            isMe: false,
        },
        {
            id: "4",
            text: "How about 4 PM? I should be done by then.",
            time: "10:30 AM",
            isMe: true,
        },
        {
            id: "5",
            text: "Hey! How was the new design project coming along?",
            time: "10:30 AM",
            isMe: true,
        },
    ]);

    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
            };
            setMessages([...messages, newMessage]);
            setInput("");
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <View className="flex-1">
            {/* Header */}
            <SafeAreaView
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 3,
                    zIndex: 10,
                }}
                className="bg-white rounded-b-[40px] px-6 pb-8"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mb-4 pt-2"
                >
                    <Ionicons name="arrow-back" size={24} color="#2286BE" />
                    <Text className="text-[#2286BE] font-bold text-[18px] ml-2">Go Back</Text>
                </TouchableOpacity>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Image
                            source={{ uri: avatar as string || "https://i.pravatar.cc/150?u=john" }}
                            className="w-[52px] h-[52px] rounded-full mr-4"
                        />
                        <View>
                            <Text className="text-[20px] font-bold text-[#2286BE]">{name}</Text>
                            <Text className="text-[14px] font-medium text-[#7C8B95] mt-1">{info}</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="w-12 h-12 items-center justify-center">
                        <Ionicons name="call" size={28} color="#2286BE" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-6 pt-6"
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((item) => (
                        <View
                            key={item.id}
                            className={`flex-row mb-8 ${item.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            {!item.isMe && (
                                <Image
                                    source={{ uri: avatar as string || "https://i.pravatar.cc/150?u=john" }}
                                    className="w-8 h-8 rounded-full mr-3 mt-1"
                                />
                            )}
                            <View className={`max-w-[75%]`}>
                                <View
                                    style={{
                                        borderBottomLeftRadius: item.isMe ? 20 : 4,
                                        borderBottomRightRadius: item.isMe ? 4 : 20,
                                        borderTopLeftRadius: 20,
                                        borderTopRightRadius: 20,
                                    }}
                                    className={`px-5 py-4 ${item.isMe ? 'bg-[#2286BE]' : 'bg-white border border-[#F2F2F2]'}`}
                                >
                                    <Text className={`text-[15px] leading-[22px] font-medium ${item.isMe ? 'text-white' : 'text-[#4A5568]'}`}>
                                        {item.text}
                                    </Text>
                                    {item.isMe && (
                                        <Text className="text-white/70 text-[12px] mt-2 font-medium">{item.time}</Text>
                                    )}
                                </View>
                                {!item.isMe && (
                                    <Text className="text-[#7C8B95] text-[13px] mt-2 font-medium ml-1">{item.time}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                    <View className="h-4" />
                </ScrollView>

                {/* Bottom Input Area */}
                <View
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 10,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }}
                    className="bg-white px-6 pt-4 pb-6 border-t border-[#F2F2F2] flex-row items-center"
                >
                    <TouchableOpacity className="mr-4">
                        <Ionicons name="add" size={32} color="#2286BE" />
                    </TouchableOpacity>

                    <View className="flex-1 mr-4 overflow-hidden rounded-[20px] border border-[#7C8B95]/30">
                        <TextInput
                            placeholder="Type a message..."
                            placeholderTextColor="#7C8B95"
                            className="px-5 py-4 text-[16px] font-medium text-[#1A2C42]"
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSend}
                        className="bg-[#2286BE] w-[54px] h-[54px] rounded-full items-center justify-center"
                    >
                        <Ionicons name="send" size={24} color="white" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
