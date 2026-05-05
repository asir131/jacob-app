import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { formatCurrency } from "@/src/lib/formatters";
import {
  useCreateOrderMutation,
  useGetPublicServiceByIdQuery,
} from "@/src/store/services/apiSlice";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export default function BookServicePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { data, isLoading } = useGetPublicServiceByIdQuery(id, { skip: !id });
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [scheduledDate, setScheduledDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");
  const [serviceAddress, setServiceAddress] = useState(user?.address || "");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const service = data?.data || null;
  const packageList = useMemo(() => service?.packages || [], [service?.packages]);
  const activePackage = useMemo(() => packageList[selectedPackage] || packageList[0] || null, [packageList, selectedPackage]);

  const continueStep = async () => {
    if (user?.role === "provider") {
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!scheduledDate.trim() || !scheduledTime.trim()) return;
      setStep(3);
      return;
    }

    if (!service || !activePackage || !isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!serviceAddress.trim()) return;

    await createOrder({
      gigId: service.id,
      packageName: activePackage.name,
      packageTitle: activePackage.title,
      scheduledDate,
      scheduledTime,
      serviceAddress: serviceAddress.trim(),
      specialInstructions: specialInstructions.trim(),
    }).unwrap();

    router.replace("/(tabs)/booking");
  };

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#2B84B1" /></View>;
  }

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8" edges={["top"]}>
        <Text className="text-[20px] font-bold text-[#1A2C42] mb-3">Booking not available</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#2B84B1] px-5 py-3 rounded-[18px]">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (user?.role === "provider") {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8" edges={["top"]}>
        <View className="w-20 h-20 rounded-full bg-[#FEF3C7] items-center justify-center mb-6">
          <Ionicons name="shield-checkmark-outline" size={34} color="#D97706" />
        </View>
        <Text className="text-[24px] font-black text-[#1A2C42] text-center">Switch to client to order</Text>
        <Text className="text-[15px] leading-[24px] text-[#7C8B95] text-center mt-3 max-w-[300px]">
          Providers cannot place service orders from this account. Please switch to a client account to continue.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#2B84B1] px-6 py-4 rounded-[18px] mt-8">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => (step > 1 ? setStep((current) => current - 1) : router.back())} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42] flex-1">Secure Checkout</Text>
        <Text className="text-[12px] font-bold text-[#7C8B95]">0{step}/03</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20, paddingBottom: 130 }}>
        <View className="flex-row mb-8">
          {[1, 2, 3].map((index) => (
            <View key={index} className="flex-1 h-2 rounded-full bg-[#E2E8F0] mr-2 overflow-hidden">
              {step >= index ? <View className="h-full bg-[#2B84B1]" /> : null}
            </View>
          ))}
        </View>

        <View className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm shadow-black/5 mb-8">
          <View className="flex-row">
            <View className="w-[90px] h-[90px] rounded-[20px] overflow-hidden bg-gray-100 mr-4">
              {service.images?.[0] ? <Image source={{ uri: service.images[0] }} className="w-full h-full" resizeMode="cover" /> : null}
            </View>
            <View className="flex-1">
              <Text className="text-[18px] font-bold text-[#1A2C42]" numberOfLines={2}>{service.title}</Text>
              <Text className="text-[13px] font-medium text-[#7C8B95] mt-1">{service.provider.name}</Text>
              <Text className="text-[18px] font-black text-[#2B84B1] mt-3">
                {formatCurrency(Number(activePackage?.price || service.avgPackagePrice || 0))}
              </Text>
            </View>
          </View>
        </View>

        {step === 1 ? (
          <View>
            <Text className="text-[26px] font-black text-[#1A2C42] mb-2">Choose your package</Text>
            <Text className="text-[14px] text-[#7C8B95] mb-6">Pick the package that best fits your needs.</Text>
            {packageList.map((pkg, index) => (
              <TouchableOpacity
                key={`${pkg.name}-${index}`}
                onPress={() => setSelectedPackage(index)}
                className={`bg-white rounded-[24px] p-5 border mb-4 ${selectedPackage === index ? "border-[#2B84B1]" : "border-gray-100"}`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-[18px] font-bold text-[#1A2C42]">{pkg.title}</Text>
                  <Text className="text-[18px] font-black text-[#2B84B1]">{formatCurrency(pkg.price)}</Text>
                </View>
                <Text className="text-[14px] leading-[22px] text-[#7C8B95]">{pkg.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text className="text-[26px] font-black text-[#1A2C42] mb-2">Select date and time</Text>
            <Text className="text-[14px] text-[#7C8B95] mb-6">Tell us when you want the professional to arrive.</Text>
            <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5">
              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2">Preferred Date</Text>
              <TextInput value={scheduledDate} onChangeText={setScheduledDate} placeholder="YYYY-MM-DD" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] mb-5" />
              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2">Preferred Time</Text>
              <TextInput value={scheduledTime} onChangeText={setScheduledTime} placeholder="10:00 AM" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px]" />
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View>
            <Text className="text-[26px] font-black text-[#1A2C42] mb-2">Confirm location</Text>
            <Text className="text-[14px] text-[#7C8B95] mb-6">Add your service address and any extra notes.</Text>
            <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-black/5">
              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2">Service Address</Text>
              <TextInput value={serviceAddress} onChangeText={setServiceAddress} placeholder="Enter your exact location" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] mb-5" />
              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2">Special Instructions</Text>
              <TextInput value={specialInstructions} onChangeText={setSpecialInstructions} placeholder="Anything the provider should know?" multiline textAlignVertical="top" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] min-h-[120px]" />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100">
        <TouchableOpacity onPress={() => void continueStep()} disabled={creatingOrder} className="bg-[#2B84B1] w-full py-5 rounded-[18px] items-center">
          {creatingOrder ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[17px]">{step < 3 ? "Continue" : "Finalize Order"}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
