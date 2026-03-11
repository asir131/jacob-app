import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecurityPage() {
    const router = useRouter();
    const [twoFactor, setTwoFactor] = useState(true);
    const [faceId, setFaceId] = useState(true);

    const PasswordInput = ({ label, placeholder }: any) => (
        <View className="mb-5">
            <Text className="text-[14px] font-bold text-[#7C8B95] mb-2 ml-1">{label}</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm shadow-gray-100">
                <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" />
                <TextInput
                    className="flex-1 ml-3 text-[16px] font-semibold text-[#1A2C42]"
                    placeholder={placeholder}
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry
                />
                <TouchableOpacity>
                    <Ionicons name="eye-off-outline" size={20} color="#A0AEC0" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Security</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
                {/* Advanced Security */}
                <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-1">
                    Advanced Security
                </Text>
                <View className="bg-white rounded-[24px] px-5 py-2 mb-8 border border-gray-100 shadow-sm shadow-black/5">
                    <View className="flex-row items-center py-4">
                        <View className="w-10 h-10 bg-[#EAF3FA] rounded-xl items-center justify-center mr-4">
                            <Ionicons name="shield-checkmark-outline" size={22} color="#2B84B1" />
                        </View>
                        <Text className="flex-1 text-[16px] font-semibold text-[#1A2C42]">Two-Factor Authentication</Text>
                        <Switch
                            value={twoFactor}
                            onValueChange={setTwoFactor}
                            trackColor={{ false: '#E2E8F0', true: '#2B84B1' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                    <View className="h-[1px] bg-gray-100 ml-14" />
                    <View className="flex-row items-center py-4">
                        <View className="w-10 h-10 bg-[#EAF3FA] rounded-xl items-center justify-center mr-4">
                            <Ionicons name="scan-outline" size={22} color="#2B84B1" />
                        </View>
                        <Text className="flex-1 text-[16px] font-semibold text-[#1A2C42]">Face ID / Biometrics</Text>
                        <Switch
                            value={faceId}
                            onValueChange={setFaceId}
                            trackColor={{ false: '#E2E8F0', true: '#2B84B1' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                </View>

                {/* Change Password */}
                <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-1">
                    Change Password
                </Text>
                <PasswordInput label="Current Password" placeholder="•••••••••" />
                <PasswordInput label="New Password" placeholder="Enter new password" />
                <PasswordInput label="Confirm New Password" placeholder="Confirm new password" />

                <TouchableOpacity className="mt-8 mb-4 border border-[#FF4757] rounded-[20px] py-4 items-center">
                    <Text className="text-[#FF4757] font-bold text-[16px]">Sign out of all devices</Text>
                </TouchableOpacity>
            </ScrollView>

            <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100">
                <TouchableOpacity className="bg-[#2B84B1] w-full py-5 rounded-[18px] items-center shadow-lg shadow-[#2B84B1]/30">
                    <Text className="text-white font-bold text-[17px]">Update Password</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
