import ImageImport from "@/assets/ImageImport";
import { useSignupMutation } from "@/src/store/services/apiSlice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SignupRole = "client" | "provider";

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const [selectedRole, setSelectedRole] = useState<SignupRole>(
    params.role === "provider" ? "provider" : "client"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signup, { isLoading: loading }] = useSignupMutation();

  const roleCopy = useMemo(
    () =>
      selectedRole === "client"
        ? {
            title: "Create Account",
            subtitle: "Book trusted local help, track orders, and manage everything in one place.",
            cta: "CREATE CLIENT ACCOUNT",
          }
        : {
            title: "Join as Provider",
            subtitle: "Start selling services, manage requests, and grow your local business with Jacob.",
            cta: "CREATE PROVIDER ACCOUNT",
          },
    [selectedRole]
  );

  const resolveSignupErrorMessage = (error: unknown) => {
    const apiMessage =
      typeof error === "object" && error !== null && "data" in error
        ? (error as { data?: { message?: string } }).data?.message
        : "";

    if (typeof apiMessage === "string" && apiMessage.toLowerCase().includes("email already")) {
      return "Email already in use";
    }

    return "Signup failed.";
  };

  const handleSignUp = async () => {
    const [firstName, ...rest] = fullName.trim().split(" ").filter(Boolean);
    if (!firstName || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing information", "Full name, email, password and confirm password are required.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters long.");
      return;
    }

    if (!/[^\w\s]/.test(password)) {
      Alert.alert("Weak password", "Password must include at least 1 special character.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Password and confirm password must match.");
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      Alert.alert("Agreement required", "Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    try {
      await signup({
        firstName,
        lastName: rest.join(" "),
        email: email.trim(),
        password,
        role: selectedRole,
      }).unwrap();
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { email: email.trim(), role: selectedRole, mode: "signup" },
      });
    } catch (error) {
      const message = resolveSignupErrorMessage(error);
      Alert.alert("Could not create account", message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-8"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
          <View className="items-center mt-10 mb-8">
            <Image source={ImageImport.icon} className="w-[100px] h-[100px]" resizeMode="contain" />
            <Text className="text-[32px] font-bold text-[#2B84B1] mt-4">{roleCopy.title}</Text>
            <Text className="text-[16px] text-[#7C8B95] mt-2 text-center leading-[24px]">
              {roleCopy.subtitle}
            </Text>
          </View>

          <View className="bg-[#F8FAFC] rounded-[24px] p-2 flex-row mb-6">
            {[
              { id: "client", label: "Client", icon: "person-outline" },
              { id: "provider", label: "Provider", icon: "briefcase-outline" },
            ].map((role) => {
              const active = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => setSelectedRole(role.id as SignupRole)}
                  className={`flex-1 rounded-[18px] py-4 px-3 flex-row items-center justify-center ${active ? "bg-white" : ""}`}
                >
                  <Ionicons
                    name={role.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={active ? "#2B84B1" : "#7C8B95"}
                  />
                  <Text className={`ml-2 font-bold ${active ? "text-[#2B84B1]" : "text-[#7C8B95]"}`}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedRole === "provider" ? (
            <View className="mb-8">
              <View className="bg-[#1A2C42] rounded-[28px] p-6 mb-5">
                <Text className="text-[12px] font-bold tracking-[0.16em] uppercase text-[#9CCAE2]">
                  Provider Benefits
                </Text>
                <Text className="text-white text-[26px] font-black leading-[32px] mt-3">
                  Turn your skills into steady bookings
                </Text>
                <Text className="text-white/75 text-[15px] leading-[24px] mt-3">
                  Create services, respond to client requests, manage orders, receive reviews, and handle payouts from the app.
                </Text>
              </View>

              {[
                "Publish your services and pricing",
                "Get discovered by nearby clients",
                "Manage chats, orders, and earnings in one place",
              ].map((item) => (
                <View key={item} className="flex-row items-center bg-white rounded-[20px] border border-gray-100 px-4 py-4 mb-3">
                  <View className="w-9 h-9 rounded-full bg-[#EAF3FA] items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={18} color="#2B84B1" />
                  </View>
                  <Text className="flex-1 text-[15px] font-semibold text-[#1A2C42]">{item}</Text>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => router.push("/join-provider")}
                className="mt-2 self-start px-5 py-3 rounded-full bg-[#EAF3FA]"
              >
                <Text className="font-bold text-[#2B84B1]">Learn More About Provider Benefits</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View className="gap-y-5">
            <View>
              <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">Full Name</Text>
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

            <View>
              <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">Email Address</Text>
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

            <View>
              <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">Password</Text>
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

            <View>
              <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2 ml-1">Confirm Password</Text>
              <View className="w-full h-[60px] border-2 border-[#A0AEC0] rounded-[24px] px-6 flex-row items-center">
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="flex-1 text-[16px] text-[#2D3748] font-medium"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-6 mb-2">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                onPress={() => setAcceptTerms((current) => !current)}
                className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${acceptTerms ? "bg-[#2B84B1] border-[#2B84B1]" : "border-[#A0AEC0]"}`}
              >
                {acceptTerms ? <Ionicons name="checkmark" size={16} color="white" /> : null}
              </TouchableOpacity>
              <Text className="text-[14px] text-[#7C8B95] font-medium flex-1">
                I accept the <Text className="text-[#2B84B1] font-bold">Terms & Conditions</Text>
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setAcceptPrivacy((current) => !current)}
                className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${acceptPrivacy ? "bg-[#2B84B1] border-[#2B84B1]" : "border-[#A0AEC0]"}`}
              >
                {acceptPrivacy ? <Ionicons name="checkmark" size={16} color="white" /> : null}
              </TouchableOpacity>
              <Text className="text-[14px] text-[#7C8B95] font-medium flex-1">
                I accept the <Text className="text-[#2B84B1] font-bold">Privacy Policy</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={handleSignUp}
            style={{ opacity: acceptTerms && acceptPrivacy && !loading ? 1 : 0.6 }}
            className="w-full h-[64px] bg-[#2B84B1] rounded-[32px] items-center justify-center shadow-lg shadow-[#2B84B1]/40 mt-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-[18px] font-bold">{roleCopy.cta}</Text>
            )}
          </TouchableOpacity>

          <View className="items-center mt-6">
            <Text className="text-[#7C8B95] font-bold mb-6">
              {selectedRole === "provider" ? "or explore provider resources" : "or sign up with"}
            </Text>
            {selectedRole === "provider" ? (
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => router.push("/provider-help")}
                  className="bg-[#EAF3FA] px-5 py-4 rounded-[18px] mr-3"
                >
                  <Text className="font-bold text-[#2B84B1]">Provider Help</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/contact")}
                  className="bg-[#F8FAFC] px-5 py-4 rounded-[18px]"
                >
                  <Text className="font-bold text-[#1A2C42]">Contact Us</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-x-6">
                <TouchableOpacity className="w-16 h-16 rounded-full bg-[#E2E8F0] items-center justify-center">
                  <Ionicons name="logo-google" size={28} color="#2B84B1" />
                </TouchableOpacity>
                <TouchableOpacity className="w-16 h-16 rounded-full bg-[#E2E8F0] items-center justify-center">
                  <Ionicons name="logo-apple" size={32} color="#2B84B1" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-[#7C8B95] font-medium">Already have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                router.push(selectedRole === "provider" ? "/(auth)/login?role=provider" : "/(auth)/login")
              }
            >
              <Text className="text-[#2B84B1] font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
