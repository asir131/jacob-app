import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecurityPage() {
    const router = useRouter();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const [twoFactor, setTwoFactor] = useState(true);
    const [faceId, setFaceId] = useState(true);

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Password visibility toggle
    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    };

    // Form validation
    const validatePasswordForm = (): boolean => {
        if (!passwordData.currentPassword.trim()) {
            Alert.alert('Validation Error', 'Current password is required.');
            return false;
        }

        if (!passwordData.newPassword.trim()) {
            Alert.alert('Validation Error', 'New password is required.');
            return false;
        }

        if (passwordData.newPassword.length < 8) {
            Alert.alert('Validation Error', 'New password must be at least 8 characters long.');
            return false;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Validation Error', 'New passwords do not match.');
            return false;
        }

        return true;
    };

    // Update password handler
    const handleUpdatePassword = async () => {
        if (!validatePasswordForm()) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            Alert.alert('Success', 'Your password has been updated successfully!', [
                { text: 'OK' }
            ]);
        }, 2000);
    };

    // Sign out handler
    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out of all devices? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                        // In a real app, this would clear auth tokens and navigate to login
                        Alert.alert('Success', 'You have been signed out of all devices.');
                        router.push('/(auth)/login' as any);
                    }
                }
            ]
        );
    };

    const PasswordInput = ({ label, placeholder, field, showPassword }: any) => (
        <View className="mb-5">
            <Text className="text-[14px] font-bold text-[#7C8B95] mb-2 ml-1">{label}</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm shadow-gray-100">
                <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" />
                <TextInput
                    className="flex-1 ml-3 text-[16px] font-semibold text-[#1A2C42]"
                    placeholder={placeholder}
                    placeholderTextColor="#A0AEC0"
                    value={passwordData[field as keyof typeof passwordData]}
                    onChangeText={(text: string) => setPasswordData(prev => ({ ...prev, [field]: text }))}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(field)}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#A0AEC0" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
     <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* ১. সব কন্টেন্টকে একটি flex-1 ভিউতে রাখতে হবে */}
            <View className="flex-1"> 
                
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
                        <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                    </TouchableOpacity>
                    <Text className="text-[20px] font-bold text-[#1A2C42]">Security</Text>
                </View>

                {/* ScrollView - contentContainerStyle এ ভালোমতো প্যাডিং দিতে হবে */}
                <ScrollView 
                    className="flex-1 px-6 pt-6" 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingBottom: 160 }} // এখানে প্যাডিং বাড়িয়ে দিন যাতে নিচের বাটনের জন্য জায়গা থাকে
                >
                    {/* Advanced Security Section */}
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

                    {/* Change Password Section */}
                    <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-1">
                        Change Password
                    </Text>
                    <PasswordInput label="Current Password" placeholder="•••••••••" field="currentPassword" showPassword={showPasswords.current} />
                    <PasswordInput label="New Password" placeholder="Enter new password" field="newPassword" showPassword={showPasswords.new} />
                    <PasswordInput label="Confirm New Password" placeholder="Confirm new password" field="confirmPassword" showPassword={showPasswords.confirm} />

                    <TouchableOpacity onPress={handleSignOut} className="mt-8 mb-4 border border-[#FF4757] rounded-[20px] py-4 items-center">
                        <Text className="text-[#FF4757] font-bold text-[16px]">Sign out of all devices</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Bottom Button - z-index নিশ্চিত করুন যাতে এটি উপরে থাকে */}
                <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 z-20">
                    <TouchableOpacity 
                        onPress={handleUpdatePassword} // এখানে onPress ফাংশনটি যোগ করা হয়েছে
                        className="bg-[#2B84B1] w-full py-5 rounded-[18px] items-center shadow-lg shadow-[#2B84B1]/30"
                    >
                        <Text className="text-white font-bold text-[17px]">Update Password</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
