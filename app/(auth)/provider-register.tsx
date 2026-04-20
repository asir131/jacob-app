import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignupMutation } from "@/src/store/services/apiSlice";

export default function ProviderRegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");

    const [accountType, setAccountType] = useState<'Individual' | 'Agency'>('Individual');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [signup, { isLoading: loading }] = useSignupMutation();

    const handleSignup = async () => {
        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert("Missing information", "Full name, email and password are required.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password mismatch", "Password and confirm password must match.");
            return;
        }

        const [firstName, ...rest] = fullName.trim().split(" ").filter(Boolean);
        try {
            await signup({
                firstName,
                lastName: rest.join(" "),
                email: email.trim(),
                password,
                role: "provider",
            }).unwrap();
            router.push({
                pathname: "/(auth)/otp-verification",
                params: { email: email.trim(), role: "provider", mode: "signup" },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Provider signup failed.";
            Alert.alert("Could not create provider account", message);
        }
    };

    const InputField = ({ label, placeholder, value, onChange, secureTextEntry = false, showToggle = null, onToggle = null, keyboardType = 'default' }: any) => (
        <View className="mb-5">
            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">{label}</Text>
            <View className="w-full h-[60px] border-2 border-[#E2E8F0] rounded-[24px] px-6 flex-row items-center bg-white">
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 text-[16px] text-[#2D3748] font-medium"
                />
                {showToggle !== null && (
                    <TouchableOpacity onPress={onToggle}>
                        <Ionicons name={showToggle ? "eye-outline" : "eye-off-outline"} size={24} color="#A0AEC0" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 block">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42] flex-1">Provider Signup</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-8 pt-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                >
                    <Text className="text-[32px] font-bold text-[#2B84B1] mb-2">Join as Seller</Text>
                    <Text className="text-[15px] text-[#7C8B95] mb-8 leading-[24px]">
                        Create your provider account to start offering services, managing orders, and earning money.
                    </Text>

                    {/* Account Type Selector */}
                    <View className="mb-6">
                        <Text className="text-[14px] font-bold text-[#A0AEC0] mb-3 ml-1">Account Type</Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => setAccountType('Individual')}
                                className={`flex-1 py-4 rounded-[18px] items-center border-2 mr-3 ${accountType === 'Individual' ? 'bg-[#EAF3FA] border-[#2B84B1]' : 'bg-white border-gray-200'}`}
                            >
                                <Ionicons name="person-outline" size={24} color={accountType === 'Individual' ? '#2B84B1' : '#7C8B95'} />
                                <Text className={`text-[15px] font-bold mt-2 ${accountType === 'Individual' ? 'text-[#2B84B1]' : 'text-[#7C8B95]'}`}>Individual</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setAccountType('Agency')}
                                className={`flex-1 py-4 rounded-[18px] items-center border-2 ${accountType === 'Agency' ? 'bg-[#EAF3FA] border-[#2B84B1]' : 'bg-white border-gray-200'}`}
                            >
                                <Ionicons name="business-outline" size={24} color={accountType === 'Agency' ? '#2B84B1' : '#7C8B95'} />
                                <Text className={`text-[15px] font-bold mt-2 ${accountType === 'Agency' ? 'text-[#2B84B1]' : 'text-[#7C8B95]'}`}>Agency</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <InputField label="Full Name" placeholder="John Doe" value={fullName} onChange={setFullName} />
                    <InputField label="Username" placeholder="johndoe_pro" value={username} onChange={setUsername} />
                    <InputField label="Email Address" placeholder="hello@company.com" value={email} onChange={setEmail} keyboardType="email-address" />
                    <InputField label="Phone Number" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} keyboardType="phone-pad" />

                    <InputField
                        label="Password"
                        placeholder="Create strong password"
                        value={password}
                        onChange={setPassword}
                        secureTextEntry={!showPassword}
                        showToggle={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                    />

                    <InputField
                        label="Confirm Password"
                        placeholder="Confirm strong password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        showToggle={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    />

                    <InputField
                        label="Referral Code (Optional)"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={setReferralCode}
                    />

                    {/* Terms Checkboxes */}
                    <View className="mt-4 mb-8">
                        <View className="flex-row items-center mb-4">
                            <TouchableOpacity
                                onPress={() => setAcceptTerms(!acceptTerms)}
                                className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${acceptTerms ? 'bg-[#2B84B1] border-[#2B84B1]' : 'border-[#A0AEC0]'}`}
                            >
                                {acceptTerms && <Ionicons name="checkmark" size={16} color="white" />}
                            </TouchableOpacity>
                            <Text className="text-[14px] text-[#7C8B95] font-medium flex-1">
                                I accept the <Text className="text-[#2B84B1] font-bold">Terms & Conditions</Text>
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                                className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${acceptPrivacy ? 'bg-[#2B84B1] border-[#2B84B1]' : 'border-[#A0AEC0]'}`}
                            >
                                {acceptPrivacy && <Ionicons name="checkmark" size={16} color="white" />}
                            </TouchableOpacity>
                            <Text className="text-[14px] text-[#7C8B95] font-medium flex-1">
                                I accept the <Text className="text-[#2B84B1] font-bold">Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        style={{ opacity: (acceptTerms && acceptPrivacy && !loading) ? 1 : 0.6 }}
                        disabled={!acceptTerms || !acceptPrivacy || loading}
                        className="w-full h-[64px] bg-[#2B84B1] rounded-[32px] items-center justify-center shadow-lg shadow-[#2B84B1]/40 mb-6"
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-[18px] font-bold">Create Account</Text>}
                    </TouchableOpacity>

                    {/* Social Login Section */}
                    <View className="items-center mb-8">
                        <Text className="text-[#7C8B95] font-bold mb-6">Or register with</Text>
                        <View className="flex-row gap-x-4 w-full px-4">
                            <TouchableOpacity className="flex-1 h-[56px] rounded-[18px] bg-white border border-gray-200 items-center justify-center flex-row shadow-sm shadow-gray-100">
                                <Ionicons name="logo-google" size={24} color="#EA4335" />
                                <Text className="ml-2 font-bold text-[#1A2C42]">Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 h-[56px] rounded-[18px] bg-[#1A2C42] border border-[#1A2C42] items-center justify-center flex-row shadow-sm shadow-[#1A2C42]/20">
                                <Ionicons name="logo-github" size={24} color="white" />
                                <Text className="ml-2 font-bold text-white">GitHub</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center pb-8">
                        <Text className="text-[#7C8B95] font-medium">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'provider' } })}>
                            <Text className="text-[#2B84B1] font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
