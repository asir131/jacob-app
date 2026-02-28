import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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

export default function OTPVerificationScreen() {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", ""]);
    const [timer, setTimer] = useState(20);
    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Move to next input if text is entered
        if (text && index < 4) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleContinue = () => {
        // Handle OTP verification logic
        console.log("OTP entered:", otp.join(""));
        router.push("/(auth)/otp-success");
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
                    <View className="items-center mb-10">
                        <Text className="text-[36px] font-bold text-[#2B84B1] text-center">
                            OTP Verification
                        </Text>
                        <Text className="text-[16px] text-[#7C8B95] text-center mt-4 leading-[24px] px-4 font-medium">
                            Enter the otp sent to your email address to reset your old password
                        </Text>
                    </View>

                    {/* OTP Inputs */}
                    <View className="flex-row justify-between mb-12">
                        {otp.map((digit, index) => (
                            <View
                                key={index}
                                className="w-[60px] h-[64px] border-2 border-[#A0AEC0] rounded-[16px] items-center justify-center"
                            >
                                <TextInput
                                    ref={inputRefs[index]}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    textAlign="center"
                                    className="text-[24px] font-bold text-[#2B84B1] w-full h-full"
                                />
                            </View>
                        ))}
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        className="w-full h-[68px] bg-[#2B84B1] rounded-[34px] items-center justify-center shadow-lg shadow-[#2B84B1]/40 mb-8"
                    >
                        <Text className="text-white text-[18px] font-bold">
                            CONTINUE
                        </Text>
                    </TouchableOpacity>

                    {/* Resend Section */}
                    <View className="items-center mb-10">
                        <Text className="text-[16px] text-[#78829D] font-medium">
                            Re-send code in <Text className="text-[#2B84B1]">{formatTimer(timer)}</Text>
                        </Text>
                    </View>

                    {/* Footer */}
                    <TouchableOpacity
                        onPress={() => router.push("/(auth)/login")}
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
