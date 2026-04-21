import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/contexts/AuthContext";
import { formatCurrency, formatDateLabel } from "@/src/lib/formatters";
import {
  useCreateOrderMutation,
  useGetPublicServiceByIdQuery,
  useRemoveSavedServiceMutation,
  useSaveServiceMutation,
} from "@/src/store/services/apiSlice";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export default function ServiceDetailsPage() {
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { isAuthenticated, updateProfile, user } = useAuth();
  const { data, isLoading } = useGetPublicServiceByIdQuery(id, { skip: !id });
  const [createOrder, { isLoading: bookingLoading }] = useCreateOrderMutation();
  const [saveService, { isLoading: isSavingService }] = useSaveServiceMutation();
  const [removeSavedService, { isLoading: isRemovingSavedService }] = useRemoveSavedServiceMutation();
  const service = data?.data || null;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [serviceAddress, setServiceAddress] = useState(user?.address || "");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [scheduledDate, setScheduledDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");

  const activePackage = useMemo(() => service?.packages?.[selectedPackage] || null, [selectedPackage, service]);
  const isSaved = Boolean(user?.savedServiceIds?.includes(service?.id || ""));
  const isSaveActionLoading = isSavingService || isRemovingSavedService;

  const handleToggleSave = async () => {
    if (!service) return;
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    try {
      if (isSaved) {
        const payload = await removeSavedService(service.id).unwrap();
        await updateProfile(payload.data.user || { savedServiceIds: (user?.savedServiceIds || []).filter((item) => item !== service.id) });
      } else {
        const payload = await saveService(service.id).unwrap();
        await updateProfile(payload.data.user || { savedServiceIds: [...(user?.savedServiceIds || []), service.id] });
      }
    } catch (error) {
      Alert.alert("Could not update saved services", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleBookNow = async () => {
    if (!service || !activePackage) return;
    if (!isAuthenticated) {
      Alert.alert("Sign in required", "Please sign in before placing an order.");
      router.push("/(auth)/login");
      return;
    }
    if (!serviceAddress.trim()) {
      Alert.alert("Address required", "Please enter your service address.");
      return;
    }

    try {
      const payload = await createOrder({
        gigId: service.id,
        packageName: activePackage.name,
        packageTitle: activePackage.title,
        scheduledDate,
        scheduledTime,
        serviceAddress: serviceAddress.trim(),
        specialInstructions: specialInstructions.trim(),
      }).unwrap();
      setIsModalVisible(false);
      Alert.alert("Order created", payload.message || "Your order has been created successfully.", [
        { text: "Open bookings", onPress: () => router.push("/(tabs)/booking") },
      ]);
    } catch (error) {
      Alert.alert("Booking failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#2B84B1" /></View>;
  }

  if (!service) {
    return <View className="flex-1 items-center justify-center bg-white px-8"><Text className="text-[18px] font-bold text-[#1A2C42] mb-2">Service not found</Text></View>;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="relative w-full h-[320px] bg-slate-100">
          {service.images[0] ? <Image source={{ uri: service.images[0] }} className="w-full h-full" /> : null}
          <TouchableOpacity onPress={() => router.back()} className="absolute top-14 left-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="px-6 -mt-12">
          <View className="bg-white rounded-[24px] p-6 shadow-xl shadow-black/10 border border-gray-50">
            <View className="flex-row items-center mb-3">
              <View className="w-1.5 h-6 bg-[#2B84B1] rounded-full mr-3" />
              <Text className="text-[20px] font-bold text-[#1A2C42] flex-1">{service.title}</Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Text className="text-[16px] font-bold text-[#4A5568]">{service.provider.name}</Text>
            </View>
            <Text className="text-[32px] font-black text-[#2B84B1] leading-[32px]">{formatCurrency(service.avgPackagePrice)}</Text>
            <TouchableOpacity
              onPress={() => void handleToggleSave()}
              disabled={isSaveActionLoading}
              className={`mt-5 self-start px-4 py-2 rounded-full flex-row items-center ${isSaveActionLoading ? "bg-[#EAF3FA]" : "bg-[#F8FAFC]"}`}
            >
              {isSaveActionLoading ? (
                <>
                  <ActivityIndicator size="small" color="#2B84B1" />
                  <Text className="text-[#2B84B1] font-bold text-[13px] ml-2">
                    {isSaved ? "Removing..." : "Saving..."}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name={isSaved ? "heart" : "heart-outline"} size={16} color="#2B84B1" />
                  <Text className="text-[#2B84B1] font-bold text-[13px] ml-2">{isSaved ? "Saved" : "Save Service"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="px-6 mt-10">
          <Text className="text-[22px] font-bold text-[#1A2C42] mb-4">About Me</Text>
          <Text className="text-[15px] leading-[24px] text-[#7C8B95] font-medium">{service.description || service.provider.bio || "No description added yet."}</Text>
        </View>
        <View className="px-6 mt-10">
          <Text className="text-[22px] font-bold text-[#1A2C42] mb-4">Packages</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {service.packages.map((pkg, index) => (
              <TouchableOpacity key={`${pkg.name}-${index}`} onPress={() => setSelectedPackage(index)} className={`mr-4 rounded-[24px] p-5 border w-[240px] ${selectedPackage === index ? "bg-[#EAF3FA] border-[#2B84B1]" : "bg-white border-gray-100"}`}>
                <Text className="text-[14px] font-bold text-[#2B84B1] mb-2">{pkg.name}</Text>
                <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">{pkg.title}</Text>
                <Text className="text-[14px] text-[#7C8B95] mb-3" numberOfLines={3}>{pkg.description}</Text>
                <Text className="text-[15px] font-black text-[#1A2C42]">{formatCurrency(pkg.price)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View className="px-6 mt-12 pb-10">
          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={16} color="#2B84B1" />
            <Text className="text-[16px] font-bold text-[#1A2C42] ml-2">{Number(service.provider.rating || 0).toFixed(1)} <Text className="text-[#7C8B95] font-normal">({service.reviews.length} reviews)</Text></Text>
          </View>
          {service.reviews.map((review) => (
            <View key={review.id} className="mb-10">
              <Text className="text-[16px] font-bold text-[#1A2C42]">{review.client.name}</Text>
              <Text className="text-[13px] font-medium text-[#7C8B95]">{formatDateLabel(review.createdAt)}</Text>
              <Text className="text-[14px] leading-[22px] text-[#7C8B95] font-medium mt-3">{review.review || "No written review."}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => setIsModalVisible(true)} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">
          <Text className="text-white font-bold text-[17px]">Book Now</Text>
        </TouchableOpacity>
      </View>
      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 pt-8 pb-12">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[22px] font-bold text-[#1A2C42] flex-1">Complete your booking</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>
            <TextInput value={scheduledDate} onChangeText={setScheduledDate} placeholder="YYYY-MM-DD" className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] mb-4" />
            <TextInput value={scheduledTime} onChangeText={setScheduledTime} placeholder="10:00 AM" className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] mb-4" />
            <TextInput value={serviceAddress} onChangeText={setServiceAddress} placeholder="Enter service address" className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] mb-4" />
            <TextInput value={specialInstructions} onChangeText={setSpecialInstructions} placeholder="Anything the provider should know?" multiline className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] h-[100px] mb-6" textAlignVertical="top" />
            <TouchableOpacity onPress={() => void handleBookNow()} disabled={bookingLoading} className="bg-[#2B84B1] w-full py-5 rounded-[24px] items-center">
              {bookingLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-[20px]">Continue</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
