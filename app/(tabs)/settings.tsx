import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

export default function SettingsPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tabBarHeight = Platform.OS === "ios" ? 65 + insets.bottom : 75 + (insets.bottom > 0 ? insets.bottom : 0);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    const SettingsRow = ({ icon, label, type = 'chevron', color = '#1A2C42', value = null, onChange = null, isDestructive = false, route = null }: any) => (
        <TouchableOpacity
            className="flex-row items-center py-4 bg-white"
            activeOpacity={type === 'switch' ? 1 : 0.7}
            onPress={() => {
                if (type === 'switch' && onChange) {
                    onChange(!value);
                } else if (route) {
                    router.push(route);
                }
            }}
        >
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`}>
                <Ionicons name={icon} size={22} color={isDestructive ? '#FF4757' : color} />
            </View>
            <Text className={`flex-1 text-[16px] font-semibold ${isDestructive ? 'text-[#FF4757]' : 'text-[#1A2C42]'}`}>
                {label}
            </Text>

            {type === 'chevron' && (
                <View className="flex-row items-center">
                    {value && <Text className="text-[#7C8B95] text-[15px] font-medium mr-2">{value}</Text>}
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>
            )}

            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#E2E8F0', true: '#2B84B1' }}
                    thumbColor={'#FFFFFF'}
                    ios_backgroundColor="#E2E8F0"
                />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-6 pb-2">
                <View className="flex-row items-center mb-6">
                    <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-3" />
                    <Text className="text-[28px] font-bold text-[#1A2C42]">Settings</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}>
                {/* Profile Widget */}
                <View className="px-6 mb-8">
                    <TouchableOpacity
                        className="bg-white rounded-[24px] p-5 flex-row items-center border border-gray-100"
                        style={{
                            shadowColor: "#1A2C42",
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.04,
                            shadowRadius: 16,
                            elevation: 4
                        }}
                    >
                        <Image
                            source={{ uri: "https://i.pravatar.cc/150?u=joyboy" }}
                            className="w-[68px] h-[68px] rounded-full mr-4 bg-gray-100"
                        />
                        <View className="flex-1">
                            <Text className="text-[20px] font-bold text-[#1A2C42] mb-0.5">Joyboy</Text>
                            <Text className="text-[14px] text-[#7C8B95] font-medium mb-1.5">hello@joyboy.dev</Text>
                            <View className="bg-[#EAF3FA] self-start px-3 py-1 rounded-full">
                                <Text className="text-[#2B84B1] text-[12px] font-bold tracking-wide">PREMIUM</Text>
                            </View>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                            <Ionicons name="pencil" size={18} color="#2B84B1" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Account Settings */}
                <View className="px-6 mb-8">
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">
                        Account Settings
                    </Text>
                    <View className="bg-white rounded-[24px] px-5 py-2 border border-gray-100 shadow-sm shadow-gray-100">
                        <SettingsRow icon="person-outline" label="Personal Information" color="#2B84B1" route="/(profile)/personal-info" />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow icon="card-outline" label="Payment Methods" value="Visa ending 4242" color="#2B84B1" route="/(profile)/payment-methods" />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow icon="location-outline" label="Saved Addresses" value="2 places" color="#2B84B1" route="/(profile)/saved-addresses" />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow icon="shield-checkmark-outline" label="Security & Password" color="#2B84B1" route="/(profile)/security" />
                    </View>
                </View>

                {/* Notifications & Prefs */}
                <View className="px-6 mb-8">
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">
                        Preferences
                    </Text>
                    <View className="bg-white rounded-[24px] px-5 py-2 border border-gray-100 shadow-sm shadow-gray-100">
                        <SettingsRow
                            icon="notifications-outline"
                            label="Push Notifications"
                            type="switch"
                            color="#F5A623"
                            value={pushEnabled}
                            onChange={setPushEnabled}
                        />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow
                            icon="mail-outline"
                            label="Email Updates"
                            type="switch"
                            color="#F5A623"
                            value={emailEnabled}
                            onChange={setEmailEnabled}
                        />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow icon="language-outline" label="Language" value="English (US)" color="#F5A623" />
                    </View>
                </View>

                {/* Support & About */}
                <View className="px-6 mb-8">
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">
                        Support & Info
                    </Text>
                    <View className="bg-white rounded-[24px] px-5 py-2 border border-gray-100 shadow-sm shadow-gray-100">
                        <SettingsRow icon="help-buoy-outline" label="Help Center" color="#10B981" />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow icon="document-text-outline" label="Terms of Service" color="#10B981" />
                        <View className="h-[1px] bg-gray-100 ml-14" />
                        <SettingsRow icon="lock-closed-outline" label="Privacy Policy" color="#10B981" />
                    </View>
                </View>

                {/* Logout */}
                <View className="px-6 mb-8">
                    <View className="bg-white rounded-[24px] px-5 py-2 border border-gray-100 shadow-sm shadow-gray-100">
                        <SettingsRow icon="log-out-outline" label="Log Out" isDestructive={true} />
                    </View>
                    <Text className="text-[#A0AEC0] text-[12px] font-bold text-center mt-6 tracking-widest">
                        APP VERSION 1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
