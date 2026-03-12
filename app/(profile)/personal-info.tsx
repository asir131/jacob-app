import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalInfoPage() {
    const router = useRouter();
    const [personalInfo, setPersonalInfo] = React.useState({
        fullName: 'Joyboy',
        email: 'hello@joyboy.dev',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '12 June, 1995',
        avatar: 'https://i.pravatar.cc/150?u=joyboy',
        gender: 'male' as 'male' | 'female',
    });
    const [loading, setLoading] = React.useState(false);

    // Avatar Picker
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need access to your photo library to update your avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            updateField('avatar', result.assets[0].uri);
        }
    };

    // Form Validation
    const validateForm = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

        if (!personalInfo.fullName.trim()) {
            Alert.alert('Validation Error', 'Full name is required.');
            return false;
        }

        if (!emailRegex.test(personalInfo.email)) {
            Alert.alert('Validation Error', 'Please enter a valid email address.');
            return false;
        }

        if (!phoneRegex.test(personalInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
            Alert.alert('Validation Error', 'Please enter a valid phone number.');
            return false;
        }

        return true;
    };

    // Save Function
    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Your personal information has been updated!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 2000);
    };

    const updateField = (field: string, value: string) => {
        setPersonalInfo({ ...personalInfo, [field]: value });
    };

    const InputRow = ({ label, value, icon, keyboardType = 'default', field }: any) => (
        <View className="mb-5">
            <Text className="text-[14px] font-bold text-[#7C8B95] mb-2 ml-1">{label}</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm shadow-gray-100">
                <Ionicons name={icon} size={20} color="#A0AEC0" />
                <TextInput
                    className="flex-1 ml-3 text-[16px] font-semibold text-[#1A2C42]"
                    value={value}
                    onChangeText={(text) => updateField(field, text)}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Personal Information</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Avatar Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <Image source={{ uri: personalInfo.avatar }} className="w-24 h-24 rounded-full bg-gray-200" />
                        <TouchableOpacity onPress={pickImage} className="absolute bottom-0 right-0 w-8 h-8 bg-[#2B84B1] rounded-full flex items-center justify-center border-2 border-white">
                            <Ionicons name="camera" size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <InputRow label="Full Name" value="Joyboy" icon="person-outline" />
                <InputRow label="Email Address" value="hello@joyboy.dev" icon="mail-outline" keyboardType="email-address" />
                <InputRow label="Phone Number" value="+1 (555) 123-4567" icon="call-outline" keyboardType="phone-pad" />
                <InputRow label="Date of Birth" value="12 June, 1995" icon="calendar-outline" />

                <View className="mb-5 mt-2">
                    <Text className="text-[14px] font-bold text-[#7C8B95] mb-2 ml-1">Gender</Text>
                    <View className="flex-row">
                        <TouchableOpacity className="flex-1 bg-[#2B84B1] rounded-xl py-3 items-center mr-3">
                            <Text className="text-white font-bold text-[15px]">Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-white border border-gray-200 rounded-xl py-3 items-center">
                            <Text className="text-[#7C8B95] font-bold text-[15px]">Female</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className="bg-[#2B84B1] w-full py-5 rounded-[18px] items-center shadow-lg shadow-[#2B84B1]/30 flex-row justify-center"
                >
                    {loading ? (
                        <React.Fragment>
                            <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin" />
                            <Text className="text-white font-bold text-[17px]">Saving...</Text>
                        </React.Fragment>
                    ) : (
                        <Text className="text-white font-bold text-[17px]">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
