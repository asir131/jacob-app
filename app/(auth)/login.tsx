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

export default function LoginScreen() {
    const router = useRouter();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSignIn = () => {
        // Handle sign in logic
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
                    <View className="items-center mt-12 mb-10">
                        <Image
                            source={ImageImport.icon}
                            className="w-[120px] h-[120px]"
                            resizeMode="contain"
                        />
                        <Text className="text-[36px] font-bold text-[#2B84B1] mt-6">
                            Welcome Back
                        </Text>
                        <Text className="text-[16px] text-[#7C8B95] mt-2">
                            Sign in to access your account
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="gap-y-6">
                        {/* User ID Input */}
                        <View>
                            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">
                                User ID
                            </Text>
                            <View className="w-full h-[60px] border-2 border-[#A0AEC0] rounded-[24px] px-6 justify-center">
                                <TextInput
                                    placeholder="Enter your User ID"
                                    placeholderTextColor="#A0AEC0"
                                    value={userId}
                                    onChangeText={setUserId}
                                    className="text-[16px] text-[#2D3748] font-medium"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View>
                            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">
                                New Password
                            </Text>
                            <View className="w-full h-[60px] border-2 border-[#A0AEC0] rounded-[24px] px-6 flex-row items-center">
                                <TextInput
                                    placeholder="Enter new password"
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

                        {/* Remember Me & Forgot Password */}
                        <View className="flex-row items-center justify-between px-1">
                            <TouchableOpacity
                                onPress={() => setRememberMe(!rememberMe)}
                                className="flex-row items-center"
                            >
                                <View className={`w-6 h-6 rounded border-2 items-center justify-center ${rememberMe ? 'bg-[#2B84B1] border-[#2B84B1]' : 'border-[#A0AEC0]'}`}>
                                    {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
                                </View>
                                <Text className="ml-2 text-[14px] font-bold text-[#7C8B95]">
                                    Remember me
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Text className="text-[14px] font-bold text-[#2B84B1]">
                                    Forget password
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleSignIn}
                            className="w-full h-[64px] bg-[#2B84B1] rounded-[32px] items-center justify-center shadow-lg shadow-[#2B84B1]/40 mt-4"
                        >
                            <Text className="text-white text-[18px] font-bold">
                                SIGN IN
                            </Text>
                        </TouchableOpacity>

                        {/* Social Login Section */}
                        <View className="items-center mt-6">
                            <Text className="text-[#7C8B95] font-bold mb-6">
                                or continue with
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
                                Don't have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                                <Text className="text-[#2B84B1] font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
