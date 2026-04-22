import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapboxLocationPicker } from "@/src/components/MapboxLocationPicker";
import { useAuth } from "@/src/contexts/AuthContext";
import { geocodeAddress, resolveAddressFromCoordinates } from "@/src/lib/geocode";
import {
  useCreateServiceRequestMutation,
  useGetCategoriesQuery,
} from "@/src/store/services/apiSlice";

type PickerAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export default function PostRequestPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { data: categoriesPayload, isLoading: loadingCategories } = useGetCategoriesQuery();
  const [createServiceRequest, { isLoading: submitting }] = useCreateServiceRequestMutation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [serviceAddress, setServiceAddress] = useState(user?.address || "");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [budget, setBudget] = useState("");
  const [assets, setAssets] = useState<PickerAsset[]>([]);
  const [selectedMapCoords, setSelectedMapCoords] = useState({
    lat: typeof user?.locationLat === "number" ? user.locationLat : 40.7128,
    lng: typeof user?.locationLng === "number" ? user.locationLng : -74.006,
  });
  const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const activeCategory = useMemo(() => {
    const categories = categoriesPayload?.data || [];
    if (!categories.length) return null;
    return categories.find((item) => item.slug === selectedCategory) || categories[0];
  }, [categoriesPayload?.data, selectedCategory]);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need photo access so you can add reference images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4,
    });

    if (result.canceled) return;
    setAssets(
      result.assets.slice(0, 4).map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      }))
    );
  };

  const handleUseCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Enable location permission to use your current location.");
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    const lat = current.coords.latitude;
    const lng = current.coords.longitude;
    setSelectedMapCoords({ lat, lng });
    setServiceAddress(await resolveAddressFromCoordinates(lat, lng));
  };

  const handleSetCenterAsLocation = async () => {
    setServiceAddress(await resolveAddressFromCoordinates(selectedMapCoords.lat, selectedMapCoords.lng));
  };

  const submitRequest = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!activeCategory || !serviceAddress.trim() || !description.trim() || !preferredTime || !budget.trim()) {
      Alert.alert("Missing fields", "Please complete all required fields.");
      return;
    }

    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      Alert.alert("Invalid budget", "Please enter a valid budget.");
      return;
    }

    let finalCoords = selectedMapCoords;
    const geocoded = await geocodeAddress(serviceAddress.trim());
    if (geocoded) {
      finalCoords = geocoded;
    }

    const formData = new FormData();
    formData.append("categorySlug", activeCategory.slug);
    formData.append("categoryName", activeCategory.name);
    formData.append("serviceAddress", serviceAddress.trim());
    formData.append("serviceLocationLat", String(finalCoords.lat));
    formData.append("serviceLocationLng", String(finalCoords.lng));
    formData.append("description", description.trim());
    if (preferredDate.trim()) formData.append("preferredDate", preferredDate.trim());
    formData.append("preferredTime", preferredTime.trim());
    formData.append("budget", String(numericBudget));
    assets.forEach((asset, index) => {
      formData.append("images", {
        uri: asset.uri,
        name: asset.fileName || `request-${index + 1}.jpg`,
        type: asset.mimeType || "image/jpeg",
      } as any);
    });

    try {
      await createServiceRequest(formData).unwrap();
      Alert.alert("Posted", "Your request has been posted and nearby providers were notified.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Could not submit request", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Post Request</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Service Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {loadingCategories ? (
            <ActivityIndicator color="#2286BE" />
          ) : (
            (categoriesPayload?.data || []).map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.slug)}
                className={`px-4 py-3 rounded-[18px] mr-3 ${(selectedCategory || activeCategory?.slug) === category.slug ? "bg-[#2286BE]" : "bg-white border border-gray-200"}`}
              >
                <Text className={`font-bold ${(selectedCategory || activeCategory?.slug) === category.slug ? "text-white" : "text-[#1A2C42]"}`}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Service Location</Text>
        <TextInput value={serviceAddress} onChangeText={setServiceAddress} placeholder="Enter exact location" className="bg-white rounded-[18px] px-4 py-4 text-[15px] mb-4" />
        <MapboxLocationPicker
          token={mapboxToken}
          initialCenter={selectedMapCoords}
          onCenterChange={setSelectedMapCoords}
          badgeText="Move map and set center as service location"
          loadingText="Loading interactive map..."
          fallbackHintText="Using fallback map tiles. Add EXPO_PUBLIC_MAPBOX_TOKEN for the same Mapbox styling as web."
        />
        <View className="flex-row justify-between mt-3 mb-6">
          <TouchableOpacity onPress={() => void handleUseCurrentLocation()} className="bg-white border border-gray-200 rounded-[16px] px-4 py-3">
            <Text className="font-bold text-[#2286BE]">Use Current Location</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void handleSetCenterAsLocation()} className="bg-white border border-gray-200 rounded-[16px] px-4 py-3">
            <Text className="font-bold text-[#2286BE]">Set Center</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Description</Text>
        <TextInput multiline textAlignVertical="top" value={description} onChangeText={setDescription} placeholder="Describe your requirements..." className="bg-white rounded-[18px] px-4 py-4 text-[15px] min-h-[120px] mb-6" />

        <View className="flex-row mb-6">
          <View className="flex-1 mr-3">
            <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Preferred Date</Text>
            <TextInput value={preferredDate} onChangeText={setPreferredDate} placeholder="YYYY-MM-DD" className="bg-white rounded-[18px] px-4 py-4 text-[15px]" />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Preferred Time</Text>
            <TextInput value={preferredTime} onChangeText={setPreferredTime} placeholder="14:00" className="bg-white rounded-[18px] px-4 py-4 text-[15px]" />
          </View>
        </View>

        <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Budget</Text>
        <TextInput keyboardType="decimal-pad" value={budget} onChangeText={setBudget} placeholder="100" className="bg-white rounded-[18px] px-4 py-4 text-[15px] mb-6" />

        <TouchableOpacity onPress={pickImages} className="w-full h-[140px] border-2 border-dashed border-[#CBD5E1] rounded-[24px] bg-[#FAFCFD] items-center justify-center mb-4">
          <Ionicons name="cloud-upload" size={36} color="#2286BE" />
          <Text className="font-bold text-[#1A2C42] mt-2">Upload Reference Images</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {assets.map((asset) => (
            <Image key={asset.uri} source={{ uri: asset.uri }} className="w-28 h-24 rounded-[18px] mr-3 bg-slate-100" />
          ))}
        </ScrollView>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100">
        <TouchableOpacity onPress={() => void submitRequest()} disabled={submitting} className="bg-[#2B84B1] w-full py-5 rounded-[18px] items-center">
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[17px]">Submit Request</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
