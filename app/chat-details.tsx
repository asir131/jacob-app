import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { useAuth } from "@/src/contexts/AuthContext";
import { useSocketNotifications } from "@/src/contexts/SocketContext";
import type { ChatMessage } from "@/src/types/api";
import {
  useGetConversationMessagesQuery,
  useMarkConversationMessagesAsReadMutation,
  useSendConversationMessageMutation,
} from "@/src/store/services/apiSlice";

export default function ChatDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocketNotifications();
  const { conversationId = "", name = "User", avatar, info = "" } = useLocalSearchParams<{
    conversationId?: string;
    name?: string;
    avatar?: string;
    info?: string;
  }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { data, isLoading } = useGetConversationMessagesQuery(
    { conversationId, page: 1, limit: 100 },
    { skip: !conversationId }
  );
  const [markRead] = useMarkConversationMessagesAsReadMutation();
  const [sendMessage, { isLoading: sending }] = useSendConversationMessageMutation();

  const initialMessages = useMemo(() => data?.data.items || [], [data]);

  useEffect(() => {
    setMessages(initialMessages);
    if (conversationId) {
      void markRead(conversationId);
    }
  }, [conversationId, initialMessages, markRead]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (payload: ChatMessage) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((current) => {
        if (current.some((message) => message.id === payload.id)) return current;
        return [...current, payload];
      });
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
    };

    socket.on("chat:message:new", handleNewMessage);
    return () => {
      socket.off("chat:message:new", handleNewMessage);
    };
  }, [conversationId, socket]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    const formData = new FormData();
    formData.append("text", input.trim());

    try {
      const payload = await sendMessage({ conversationId, formData }).unwrap();
      setMessages((current) => {
        if (current.some((message) => message.id === payload.data.id)) return current;
        return [...current, payload.data];
      });
      setInput("");
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // Leave message box state untouched if send fails.
    }
  };

  return (
    <View className="flex-1">
      <SafeAreaView
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          zIndex: 10,
        }}
        className="bg-white rounded-b-[40px] px-6"
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4 pt-2">
          <Ionicons name="arrow-back" size={24} color="#2286BE" />
          <Text className="text-[#2286BE] font-bold text-[18px] ml-2">Go Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={{ uri: (avatar as string) || "https://i.pravatar.cc/150?u=guest" }}
              className="w-[52px] h-[52px] rounded-full mr-4"
            />
            <View>
              <Text className="text-[20px] font-bold text-[#2286BE]">{name}</Text>
              <Text className="text-[14px] font-medium text-[#7C8B95] mt-1">{info}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1" keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2286BE" />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-6 pt-6"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((item) => {
              const isMe = item.senderId === user?.id;
              return (
                <View key={item.id} className={`flex-row mb-8 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <Image source={{ uri: (avatar as string) || "https://i.pravatar.cc/150?u=guest" }} className="w-8 h-8 rounded-full mr-3 mt-1" />
                  )}
                  <View className="max-w-[75%]">
                    <View
                      style={{
                        borderBottomLeftRadius: isMe ? 20 : 4,
                        borderBottomRightRadius: isMe ? 4 : 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                      }}
                      className={`px-5 py-4 ${isMe ? "bg-[#2286BE]" : "bg-white border border-[#F2F2F2]"}`}
                    >
                      <Text className={`text-[15px] leading-[22px] font-medium ${isMe ? "text-white" : "text-[#4A5568]"}`}>
                        {item.text}
                      </Text>
                      <Text className={`text-[12px] mt-2 font-medium ${isMe ? "text-white/70" : "text-[#7C8B95]"}`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View className="h-4" />
          </ScrollView>
        )}

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

          <TouchableOpacity onPress={() => void handleSend()} disabled={sending} className="bg-[#2286BE] w-[54px] h-[54px] rounded-full items-center justify-center">
            {sending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="send" size={24} color="white" style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
