import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { extractZipCode } from "@/src/lib/zip";
import {
  useCreateServiceRequestMutation,
  useGetCategoriesQuery,
} from "@/src/store/services/apiSlice";

type PickerAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

const slugifySearchTerm = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function PostRequestPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryName?: string;
    categorySlug?: string;
    zipCode?: string;
  }>();
  const { isAuthenticated, user } = useAuth();
  const { data: categoriesPayload, isLoading: loadingCategories } = useGetCategoriesQuery();
  const [createServiceRequest, { isLoading: submitting }] = useCreateServiceRequestMutation();
  const queryCategoryName = String(params.categoryName || "").trim();
  const queryCategorySlug = String(params.categorySlug || "").trim() || slugifySearchTerm(queryCategoryName);
  const queryZipCode = extractZipCode(String(params.zipCode || ""));
  const [selectedCategory, setSelectedCategory] = useState(queryCategorySlug || "");
  const [categoryMode, setCategoryMode] = useState<"existing" | "custom">("existing");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryDescription, setCustomCategoryDescription] = useState("");
  const [serviceAddress, setServiceAddress] = useState(user?.address || (queryZipCode ? `ZIP ${queryZipCode}` : ""));
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

  const categories = useMemo(() => {
    const baseCategories = categoriesPayload?.data || [];
    const hasQueryCategory =
      queryCategorySlug &&
      !baseCategories.some((item) => item.slug === queryCategorySlug);

    if (!hasQueryCategory) return baseCategories;

    return [
      {
        id: queryCategorySlug,
        name: queryCategoryName || queryCategorySlug,
        slug: queryCategorySlug,
      },
      ...baseCategories,
    ];
  }, [categoriesPayload?.data, queryCategoryName, queryCategorySlug]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories.find((item) => item.slug === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory && queryCategorySlug) {
      setSelectedCategory(queryCategorySlug);
    }
  }, [queryCategorySlug, selectedCategory]);

  useEffect(() => {
    const approvedCategoryItems = categoriesPayload?.data || [];
    const hasApprovedQueryCategory = approvedCategoryItems.some((item) => item.slug === queryCategorySlug);
    if (queryCategorySlug && !hasApprovedQueryCategory) {
      setCategoryMode("custom");
      setCustomCategoryName((current) => current || queryCategoryName || queryCategorySlug);
      return;
    }

    if (queryCategorySlug && hasApprovedQueryCategory) {
      setCategoryMode("existing");
    }
  }, [categoriesPayload?.data, queryCategoryName, queryCategorySlug]);

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

    if (!serviceAddress.trim() || !description.trim() || !preferredTime || !budget.trim()) {
      Alert.alert("Missing fields", "Please complete all required fields.");
      return;
    }

    if (categoryMode === "existing" && !activeCategory) {
      Alert.alert("Missing category", "Please select an existing category.");
      return;
    }

    if (categoryMode === "custom" && !customCategoryName.trim()) {
      Alert.alert("Missing category", "Please enter the custom category you want admin to add.");
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
    formData.append("requestCustomCategory", String(categoryMode === "custom"));
    if (categoryMode === "custom") {
      formData.append("customCategoryName", customCategoryName.trim());
      if (customCategoryDescription.trim()) {
        formData.append("customCategoryDescription", customCategoryDescription.trim());
      }
      formData.append("categorySlug", slugifySearchTerm(customCategoryName));
      formData.append("categoryName", customCategoryName.trim());
    } else if (activeCategory) {
      formData.append("categorySlug", activeCategory.slug);
      formData.append("categoryName", activeCategory.name);
    }
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
      Alert.alert(
        categoryMode === "custom" ? "Sent for review" : "Posted",
        categoryMode === "custom"
          ? "Your custom category request is waiting for admin approval. Once approved, the request will go live."
          : "Your request has been posted and nearby providers were notified.",
        [
        { text: "OK", onPress: () => router.back() },
        ]
      );
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
        <Text className="text-[14px] font-bold uppercase tracking-[0.14em] text-[#1A2C42] mb-3 ml-1">Service Category</Text>
        <View className="mb-4 flex-row gap-3">
          <TouchableOpacity
            onPress={() => setCategoryMode("existing")}
            className={`flex-1 rounded-[18px] border px-4 py-4 items-center justify-center ${categoryMode === "existing" ? "border-[#2286BE] bg-[#2286BE]/10" : "border-gray-200 bg-white"}`}
          >
            <Text className={`text-[12px] text-center font-bold ${categoryMode === "existing" ? "text-[#2286BE]" : "text-[#6B7280]"}`}>
              Select existing category
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setCategoryMode("custom");
              setCustomCategoryName((current) => current || queryCategoryName || activeCategory?.name || "");
            }}
            className={`flex-1 rounded-[18px] border px-4 py-4 items-center justify-center ${categoryMode === "custom" ? "border-[#2286BE] bg-[#2286BE]/10" : "border-gray-200 bg-white"}`}
          >
            <Text className={`text-[12px] text-center font-bold ${categoryMode === "custom" ? "text-[#2286BE]" : "text-[#6B7280]"}`}>
              Request new category
            </Text>
          </TouchableOpacity>
        </View>
        {categoryMode === "existing" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {loadingCategories ? (
              <ActivityIndicator color="#2286BE" />
            ) : (
              categories.map((category) => (
                <TouchableOpacity
                  key={category.id || category.slug}
                  onPress={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-3 rounded-[18px] mr-3 ${(selectedCategory || activeCategory?.slug) === category.slug ? "bg-[#2286BE]" : "bg-white border border-gray-200"}`}
                >
                  <Text className={`font-bold ${(selectedCategory || activeCategory?.slug) === category.slug ? "text-white" : "text-[#1A2C42]"}`}>{category.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <View className="mb-6 rounded-[24px] border border-dashed border-[#2286BE]/30 bg-[#2286BE]/5 p-4">
            <TextInput
              value={customCategoryName}
              onChangeText={setCustomCategoryName}
              placeholder="Enter the category you want admin to add"
              placeholderTextColor="#94A3B8"
              className="bg-white rounded-[18px] border border-gray-200 px-4 py-4 text-[15px] mb-3 text-[#1A2C42]"
            />
            <TextInput
              multiline
              textAlignVertical="top"
              value={customCategoryDescription}
              onChangeText={setCustomCategoryDescription}
              placeholder="Optional: explain this new category for admin"
              placeholderTextColor="#94A3B8"
              className="bg-white rounded-[18px] border border-gray-200 px-4 py-4 text-[15px] min-h-[96px] text-[#1A2C42]"
            />
            <Text className="mt-3 text-[12px] font-semibold leading-[18px] text-[#51606C]">
              Admin will review this category first. Once approved, your request will go live to nearby providers.
            </Text>
          </View>
        )}

        <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Service Location</Text>
        <TextInput value={serviceAddress} onChangeText={setServiceAddress} placeholder="Enter exact location" className="bg-white rounded-[18px] px-4 py-4 text-[15px] mb-4" />
        {queryZipCode ? (
          <View className="mb-4 self-start rounded-full bg-[#EAF3FA] px-4 py-2">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2286BE]">
              Search ZIP {queryZipCode}
            </Text>
          </View>
        ) : null}
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
