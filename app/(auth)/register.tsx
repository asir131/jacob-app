import ImageImport from "@/assets/ImageImport";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = () => {
        // Handle sign up logic
        console.log("Signing up...");
        router.push("/(auth)/location-access");
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
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Logo Section */}
                    <View className="items-center mt-10 mb-8">
                        <Image
                            source={ImageImport.icon}
                            className="w-[100px] h-[100px]"
                            resizeMode="contain"
                        />
                        <Text className="text-[32px] font-bold text-[#2B84B1] mt-4">
                            Create Account
                        </Text>
                        <Text className="text-[16px] text-[#7C8B95] mt-2 text-center">
                            Fill in your details to start your journey
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="gap-y-5">
                        {/* Full Name Input */}
                        <View>
                            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">
                                Full Name
                            </Text>
                            <View className="w-full h-[60px] border-2 border-[#A0AEC0] rounded-[24px] px-6 justify-center">
                                <TextInput
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#A0AEC0"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    className="text-[16px] text-[#2D3748] font-medium"
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View>
                            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">
                                Email Address
                            </Text>
                            <View className="w-full h-[60px] border-2 border-[#A0AEC0] rounded-[24px] px-6 justify-center">
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

                        {/* Password Input */}
                        <View>
                            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">
                                Password
                            </Text>
                            <View className="w-full h-[60px] border-2 border-[#A0AEC0] rounded-[24px] px-6 flex-row items-center">
                                <TextInput
                                    placeholder="Enter password"
                                    placeholderTextColor="#A0AEC0"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    className="flex-1 text-[16px] text-[#2D3748] font-medium"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={24}
                                        color="#A0AEC0"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            onPress={handleSignUp}
                            className="w-full h-[64px] bg-[#2B84B1] rounded-[32px] items-center justify-center shadow-lg shadow-[#2B84B1]/40 mt-4"
                        >
                            <Text className="text-white text-[18px] font-bold">
                                SIGN UP
                            </Text>
                        </TouchableOpacity>

                        {/* Social Login Section */}
                        <View className="items-center mt-6">
                            <Text className="text-[#7C8B95] font-bold mb-6">
                                or sign up with
                            </Text>
                            <View className="flex-row gap-x-6">
                                <TouchableOpacity className="w-16 h-16 rounded-full bg-[#E2E8F0] items-center justify-center">
                                    <Ionicons name="logo-google" size={28} color="#2B84B1" />
                                </TouchableOpacity>
                                <TouchableOpacity className="w-16 h-16 rounded-full bg-[#E2E8F0] items-center justify-center">
                                    <Ionicons name="logo-apple" size={32} color="#2B84B1" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer */}
                        <View className="flex-row justify-center mt-8">
                            <Text className="text-[#7C8B95] font-medium">
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                                <Text className="text-[#2B84B1] font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
