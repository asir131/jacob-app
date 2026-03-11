import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
    id: string;
    isUnread: boolean;
    userInitials: string;
    userName: string;
    action: string;
    targetAndTime: string;
    avatarBg: string;
}

const mockToday: Notification[] = [
    {
        id: '1',
        isUnread: true,
        userInitials: 'CR',
        userName: 'Ronaldo',
        action: 'Liked your posted',
        targetAndTime: 'Favorites Places - 2h ago',
        avatarBg: '#E89F65'
    },
    {
        id: '2',
        isUnread: true,
        userInitials: 'CS',
        userName: 'Costas',
        action: 'Liked your posted',
        targetAndTime: 'Favourites Places - 2h ago',
        avatarBg: '#09102A'
    },
    {
        id: '3',
        isUnread: false,
        userInitials: 'JD',
        userName: 'Jeremy',
        action: 'mention you in new post',
        targetAndTime: '@jeremypasos - 2h ago',
        avatarBg: '#D92D20'
    },
];

const mockThisWeek: Notification[] = [
    {
        id: '4',
        isUnread: false,
        userInitials: 'MC',
        userName: 'Malika',
        action: 'Liked your posted',
        targetAndTime: 'Favourites Places - 2h ago',
        avatarBg: '#F09000'
    },
];

export default function NotificationPage() {
    const [activeTab, setActiveTab] = useState<'Recent activity' | 'Unread'>('Recent activity');
    const [todayNotifications, setTodayNotifications] = useState(mockToday);
    const [thisWeekNotifications, setThisWeekNotifications] = useState(mockThisWeek);

    const unreadCount = todayNotifications.filter(n => n.isUnread).length + thisWeekNotifications.filter(n => n.isUnread).length;

    const markAsRead = (id: string, isToday: boolean) => {
        if (isToday) {
            setTodayNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
        } else {
            setThisWeekNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
        }
    };

    const renderNotification = (item: Notification, isToday: boolean) => (
        <TouchableOpacity
            key={item.id}
            onPress={() => markAsRead(item.id, isToday)}
            className="flex-row items-center py-5 border-b border-gray-100"
            activeOpacity={0.7}
        >
            <View className="w-4 h-4 mr-2 items-center justify-center">
                {item.isUnread && <View className="w-2 h-2 rounded-full bg-[#2B84B1]" />}
            </View>
            <View style={{ backgroundColor: item.avatarBg }} className="w-12 h-12 rounded-full items-center justify-center mr-4">
                <Text className="text-white text-[15px] font-bold">{item.userInitials}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-[15px] font-medium text-[#7C8B95]">
                    <Text className="text-[#2B84B1] font-bold">{item.userName}</Text> {item.action}
                </Text>
                <Text className="text-[13px] text-[#7C8B95] mt-1">{item.targetAndTime}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 pt-6 mt-4">
                <View className="flex-row items-center mb-3">
                    <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-3" />
                    <Text className="text-[28px] font-bold text-[#1A2C42]">Notification</Text>
                </View>
                <Text className="text-[15px] text-[#7C8B95] mb-8 font-medium">
                    You have <Text className="text-[#2B84B1] font-bold">{unreadCount} Notifications</Text> today.
                </Text>

                <View className="flex-row border-b border-gray-200">
                    <TouchableOpacity
                        onPress={() => setActiveTab('Recent activity')}
                        className={`flex-1 items-center pb-3 ${activeTab === 'Recent activity' ? 'border-b-2 border-[#2B84B1]' : ''}`}
                    >
                        <Text className={`text-[15px] font-bold ${activeTab === 'Recent activity' ? 'text-[#2B84B1]' : 'text-[#7C8B95]'}`}>Recent activity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('Unread')}
                        className={`flex-1 items-center pb-3 ${activeTab === 'Unread' ? 'border-b-2 border-[#2B84B1]' : ''}`}
                    >
                        <Text className={`text-[15px] font-bold ${activeTab === 'Unread' ? 'text-[#2B84B1]' : 'text-[#7C8B95]'}`}>Unread</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                {(activeTab === 'Recent activity' || todayNotifications.some(n => n.isUnread)) && (
                    <View className="mb-6">
                        <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">Today</Text>
                        {todayNotifications
                            .filter(n => activeTab === 'Recent activity' || n.isUnread)
                            .map(item => renderNotification(item, true))}
                    </View>
                )}

                {(activeTab === 'Recent activity' || thisWeekNotifications.some(n => n.isUnread)) && (
                    <View className="mb-10">
                        <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">This Week</Text>
                        {thisWeekNotifications
                            .filter(n => activeTab === 'Recent activity' || n.isUnread)
                            .map(item => renderNotification(item, false))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}