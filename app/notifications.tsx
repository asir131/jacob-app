import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSocketNotifications } from "@/src/contexts/SocketContext";

export default function NotificationPage() {
  const router = useRouter();
  const { clearNotifications, markAllNotificationsAsRead, notifications, unreadCount } =
    useSocketNotifications();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 pt-6 mt-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-3" />
            <Text className="text-[28px] font-bold text-[#1A2C42]">Notifications</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <Ionicons name="close" size={20} color="#1A2C42" />
          </TouchableOpacity>
        </View>
        <Text className="text-[15px] text-[#7C8B95] mb-6 font-medium">
          You have <Text className="text-[#2B84B1] font-bold">{unreadCount} unread</Text> notifications.
        </Text>

        <View className="flex-row mb-6">
          <TouchableOpacity onPress={() => void markAllNotificationsAsRead()} className="bg-[#EAF3FA] px-4 py-3 rounded-[16px] mr-3">
            <Text className="text-[#2B84B1] font-bold">Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void clearNotifications()} className="bg-[#FFF1F2] px-4 py-3 rounded-[16px]">
            <Text className="text-[#E11D48] font-bold">Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {notifications.length ? (
          notifications.map((item) => (
            <View key={item.id} className="flex-row items-start py-5 border-b border-gray-100">
              <View className="w-4 h-4 mr-2 items-center justify-center mt-1">
                {item.unread ? <View className="w-2 h-2 rounded-full bg-[#2B84B1]" /> : null}
              </View>
              <View className="w-12 h-12 rounded-full bg-[#EAF3FA] items-center justify-center mr-4">
                <Ionicons
                  name={item.type === "message" ? "chatbubble-outline" : "notifications-outline"}
                  size={22}
                  color="#2B84B1"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1A2C42]">{item.title}</Text>
                <Text className="text-[14px] text-[#7C8B95] mt-1 leading-[22px]">{item.description}</Text>
                <Text className="text-[12px] text-[#94A3B8] mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center px-8 py-16">
            <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">No notifications yet</Text>
            <Text className="text-center text-[#7C8B95]">
              New order, message, and system updates will appear here in real time.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
