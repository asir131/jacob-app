import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleSendLink = () => {
        // Handle reset link logic
        router.push("/(auth)/otp-verification");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-8"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
                >
                    {/* Header Section */}
                    <View className="items-center mb-12">
                        <Text className="text-[36px] font-bold text-[#2B84B1] text-center">
                            Forgot Password
                        </Text>
                        <Text className="text-[16px] text-[#7C8B95] text-center mt-4 leading-[24px] px-2 font-medium">
                            Enter your email address and we&apos;ll send you a link to reset your password
                        </Text>
                    </View>

                    {/* Input Section */}
                    <View className="mb-10">
                        <Text className="text-[15px] font-bold text-[#A0AEC0] mb-3 ml-1">
                            Email
                        </Text>
                        <View className="w-full h-[64px] border-2 border-[#A0AEC0] rounded-[24px] px-6 justify-center">
                            <TextInput
                                placeholder="Enter your email"
                                placeholderTextColor="#A0AEC0"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                className="text-[16px] text-[#2D3748] font-medium"
                            />
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleSendLink}
                        className="w-full h-[68px] bg-[#2B84B1] rounded-[34px] items-center justify-center shadow-lg shadow-[#2B84B1]/40 mb-10"
                    >
                        <Text className="text-white text-[18px] font-bold">
                            SEND RESET LINK
                        </Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="items-center"
                    >
                        <Text className="text-[#2B84B1] text-[16px] font-bold">
                            Back to Sign In
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
