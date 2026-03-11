import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalInfoPage() {
    const router = useRouter();

    const InputRow = ({ label, value, icon, keyboardType = 'default' }: any) => (
        <View className="mb-5">
            <Text className="text-[14px] font-bold text-[#7C8B95] mb-2 ml-1">{label}</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm shadow-gray-100">
                <Ionicons name={icon} size={20} color="#A0AEC0" />
                <TextInput
                    className="flex-1 ml-3 text-[16px] font-semibold text-[#1A2C42]"
                    defaultValue={value}
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
                        <Image source={{ uri: "https://i.pravatar.cc/150?u=joyboy" }} className="w-24 h-24 rounded-full bg-gray-200" />
                        <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-[#2B84B1] rounded-full flex items-center justify-center border-2 border-white">
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
                <TouchableOpacity className="bg-[#2B84B1] w-full py-5 rounded-[18px] items-center shadow-lg shadow-[#2B84B1]/30">
                    <Text className="text-white font-bold text-[17px]">Save Changes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
