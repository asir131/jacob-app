import { useAuth } from "@/src/contexts/AuthContext";
import { mobileApi } from "@/src/lib/api";
import { formatCurrency, formatDateLabel } from "@/src/lib/formatters";
import type { PublicServiceDetail } from "@/src/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export default function ServiceDetailsPage() {
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { isAuthenticated, user } = useAuth();
  const [service, setService] = useState<PublicServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [serviceAddress, setServiceAddress] = useState(user?.address || "");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [scheduledDate, setScheduledDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      try {
        const payload = await mobileApi.getPublicServiceById(id);
        setService(payload.data);
      } catch (error) {
        Alert.alert("Could not load service", error instanceof Error ? error.message : "Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadService();
    }
  }, [id]);

  const activePackage = useMemo(() => service?.packages?.[selectedPackage] || null, [selectedPackage, service]);

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

    setBookingLoading(true);
    try {
      const payload = await mobileApi.createOrder({
        gigId: service.id,
        packageName: activePackage.name,
        packageTitle: activePackage.title,
        scheduledDate,
        scheduledTime,
        serviceAddress: serviceAddress.trim(),
        specialInstructions: specialInstructions.trim(),
      });
      setIsModalVisible(false);
      Alert.alert("Order created", payload.message || "Your order has been created successfully.", [
        {
          text: "Open bookings",
          onPress: () => router.push("/(tabs)/booking"),
        },
      ]);
    } catch (error) {
      Alert.alert("Booking failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2B84B1" />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">Service not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#2B84B1] px-5 py-3 rounded-[18px]">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="relative w-full h-[320px] bg-slate-100">
          {service.images[0] ? (
            <Image source={{ uri: service.images[0] }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="image-outline" size={44} color="#94A3B8" />
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-14 left-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30"
          >
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
              <View className="flex-row items-center ml-2">
                <Ionicons name="star" size={14} color="#2B84B1" />
                <Text className="text-[14px] font-bold text-[#2B84B1] ml-0.5">
                  {Number(service.provider.rating || 0).toFixed(1)}
                </Text>
                <Text className="text-[14px] text-[#7C8B95] ml-1">({service.provider.reviewCount || 0} reviews)</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-6">
              <View className="bg-[#EAF3FA] px-4 py-1.5 rounded-full mr-4">
                <Text className="text-[#2B84B1] text-[13px] font-bold">{service.categoryName}</Text>
              </View>
              <View className="flex-row items-center flex-1">
                <Ionicons name="location-outline" size={18} color="#2B84B1" />
                <Text className="text-[#7C8B95] text-[13px] font-medium ml-1 flex-1" numberOfLines={1}>
                  {service.baseCity || "Location unavailable"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-end">
              <Text className="text-[32px] font-black text-[#2B84B1] leading-[32px]">
                {formatCurrency(service.avgPackagePrice)}
              </Text>
              <Text className="text-[13px] text-[#7C8B95] font-medium ml-2 mb-1">(Average package price)</Text>
            </View>
          </View>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-[22px] font-bold text-[#1A2C42] mb-4">About Me</Text>
          <Text className="text-[15px] leading-[24px] text-[#7C8B95] font-medium">
            {service.description || service.provider.bio || "No description added yet."}
          </Text>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-[22px] font-bold text-[#1A2C42] mb-4">Packages</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {service.packages.map((pkg, index) => (
              <TouchableOpacity
                key={`${pkg.name}-${index}`}
                onPress={() => setSelectedPackage(index)}
                className={`mr-4 rounded-[24px] p-5 border w-[240px] ${selectedPackage === index ? "bg-[#EAF3FA] border-[#2B84B1]" : "bg-white border-gray-100"}`}
              >
                <Text className="text-[14px] font-bold text-[#2B84B1] mb-2">{pkg.name}</Text>
                <Text className="text-[18px] font-bold text-[#1A2C42] mb-2">{pkg.title}</Text>
                <Text className="text-[14px] text-[#7C8B95] mb-3" numberOfLines={3}>{pkg.description}</Text>
                <Text className="text-[15px] font-black text-[#1A2C42]">{formatCurrency(pkg.price)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 mt-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[22px] font-bold text-[#1A2C42]">Photos</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {service.images.map((image, index) => (
              <Image key={`${image}-${index}`} source={{ uri: image }} className="w-[220px] h-[180px] rounded-[24px] mr-4 bg-slate-100" />
            ))}
          </ScrollView>
        </View>

        <View className="px-6 mt-12 pb-10">
          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={16} color="#2B84B1" />
            <Text className="text-[16px] font-bold text-[#1A2C42] ml-2">
              {Number(service.provider.rating || 0).toFixed(1)}{" "}
              <Text className="text-[#7C8B95] font-normal">({service.reviews.length} reviews)</Text>
            </Text>
          </View>

          {service.reviews.map((review) => (
            <View key={review.id} className="mb-10">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  {review.client.avatar ? (
                    <Image source={{ uri: review.client.avatar }} className="w-12 h-12 rounded-full mr-4" />
                  ) : (
                    <View className="w-12 h-12 rounded-full mr-4 bg-[#EAF3FA]" />
                  )}
                  <View>
                    <Text className="text-[16px] font-bold text-[#1A2C42]">{review.client.name}</Text>
                    <View className="flex-row items-center mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={14} color={s <= review.rating ? "#F5A623" : "#CBD5E1"} style={{ marginRight: 2 }} />
                      ))}
                    </View>
                  </View>
                </View>
                <Text className="text-[13px] font-medium text-[#7C8B95]">{formatDateLabel(review.createdAt)}</Text>
              </View>
              <Text className="text-[14px] leading-[22px] text-[#7C8B95] font-medium">
                {review.review || "No written review."}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (!isAuthenticated) {
              router.push("/(auth)/login");
              return;
            }
            Alert.alert("Chat unavailable", "Create an order first to start chatting with this provider.");
          }}
          className="bg-[#EAF3FA] flex-1 py-5 rounded-[18px] mr-4 items-center"
        >
          <Text className="text-[#2B84B1] font-bold text-[17px]">Message</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">
          <Text className="text-white font-bold text-[17px]">Book Now</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 pt-8 pb-12">
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center flex-1">
                <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-4" />
                <Text className="text-[22px] font-bold text-[#1A2C42] flex-1">Complete your booking</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2">Package</Text>
            <View className="bg-[#FFBD99] rounded-[24px] p-5 mb-4">
              <Text className="text-[20px] font-bold text-[#1A2C42]">{activePackage?.title || "Selected package"}</Text>
              <Text className="mt-1 text-[14px] text-[#1A2C42]/70">{formatCurrency(activePackage?.price || 0)}</Text>
            </View>

            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2">Date</Text>
            <TextInput
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="YYYY-MM-DD"
              className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] mb-4"
            />

            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2">Time</Text>
            <TextInput
              value={scheduledTime}
              onChangeText={setScheduledTime}
              placeholder="10:00 AM"
              className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] mb-4"
            />

            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2">Service Address</Text>
            <TextInput
              value={serviceAddress}
              onChangeText={setServiceAddress}
              placeholder="Enter service address"
              className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] mb-4"
            />

            <Text className="text-[14px] font-bold text-[#A0AEC0] mb-2">Special Instructions</Text>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Anything the provider should know?"
              multiline
              className="bg-[#F8FAFC] rounded-[18px] px-5 py-4 text-[16px] h-[100px] mb-6"
              textAlignVertical="top"
            />

            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[18px] text-[#7C8B95] font-medium">
                Total: <Text className="text-black font-bold">{formatCurrency(activePackage?.price || 0)}</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleBookNow}
              disabled={bookingLoading}
              className="bg-[#2B84B1] w-full py-5 rounded-[24px] items-center"
            >
              {bookingLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-[20px]">Continue</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
