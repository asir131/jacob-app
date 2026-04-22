import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

import { MapboxLocationPicker } from "@/src/components/MapboxLocationPicker";
import { resolveAddressFromCoordinates } from "@/src/lib/geocode";
import type { CategoryItem } from "@/src/types/api";
import {
  useCreateGigMutation,
  useGetCategoriesQuery,
  useGetMyGigsQuery,
  useUpdateGigMutation,
} from "@/src/store/services/apiSlice";

type PackageKey = "basic" | "standard" | "premium";

type PackageData = {
  name: string;
  title: string;
  description: string;
  deliveryTime: string;
  price: string;
};

type PickerAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

const PACKAGE_KEYS: PackageKey[] = ["basic", "standard", "premium"];
const PACKAGE_NAMES = ["Basic", "Standard", "Premium"];
const PACKAGE_TITLES = ["Basic Package", "Standard Package", "Premium Package"];
const RADIUS_OPTIONS = ["5", "10", "25", "50"];
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };
const MILES_TO_KM = 1.60934;

const createInitialPackages = (): Record<PackageKey, PackageData> => ({
  basic: { name: "Basic", title: "Basic Package", description: "", deliveryTime: "1", price: "15" },
  standard: { name: "Standard", title: "Standard Package", description: "", deliveryTime: "3", price: "30" },
  premium: { name: "Premium", title: "Premium Package", description: "", deliveryTime: "5", price: "60" },
});

const convertMilesToKm = (miles: string) => Math.round((Number(miles) || 0) * MILES_TO_KM);

const convertKmToNearestMilesOption = (km: number | null | undefined) => {
  const miles = (Number(km) || 0) / MILES_TO_KM;
  return RADIUS_OPTIONS.reduce((closest, option) =>
    Math.abs(Number(option) - miles) < Math.abs(Number(closest) - miles) ? option : closest
  );
};

export default function CreateServicePage() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activePackage, setActivePackage] = useState<PackageKey>("basic");
  const [selectedRadius, setSelectedRadius] = useState("25");
  const [selectedMapCoords, setSelectedMapCoords] = useState(DEFAULT_CENTER);
  const [settingAddress, setSettingAddress] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<PickerAsset[]>([]);
  const [packages, setPackages] = useState<Record<PackageKey, PackageData>>(createInitialPackages());
  const [formData, setFormData] = useState({
    title: "",
    categorySlug: "",
    categoryName: "",
    customCategoryName: "",
    customCategoryDescription: "",
    expertType: "solo" as "solo" | "team",
    description: "",
    requirements: "",
    baseCity: "",
  });

  const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const isCustomCategory = formData.categorySlug === "create-your-own-category";
  const displayedImages = [...existingImageUrls, ...newImages.map((asset) => asset.uri)];
  const { data: categoriesData, isLoading: loadingCategories } = useGetCategoriesQuery();
  const { data: gigsData, isFetching: loadingGig } = useGetMyGigsQuery(undefined, { skip: !editId });
  const [createGig] = useCreateGigMutation();
  const [updateGig] = useUpdateGigMutation();

  useEffect(() => {
    const nextCategories = categoriesData?.data || [];
    setCategories(nextCategories);
    if (!editId && nextCategories[0]) {
      setFormData((current) => ({
        ...current,
        categorySlug: current.categorySlug || nextCategories[0].slug,
        categoryName: current.categoryName || nextCategories[0].name,
      }));
    }
  }, [categoriesData?.data, editId]);

  useEffect(() => {
    if (!editId) return;
    const allGigs = [
      ...(Array.isArray(gigsData?.data.publishedGigs) ? gigsData?.data.publishedGigs : []),
      ...(Array.isArray(gigsData?.data.pendingRequests) ? gigsData?.data.pendingRequests : []),
    ];
    const gig = allGigs.find((item: any) => String(item._id || item.id) === String(editId));
    if (!gig) return;

    const customSlug = String(gig.categorySlug || "");
    const isCustom = customSlug === "create-your-own-category" || gig.customCategoryName || gig.customCategoryDescription;
    const gigPackages = Array.isArray(gig.packages) ? gig.packages : [];

    setFormData({
      title: gig.title || "",
      categorySlug: isCustom ? "create-your-own-category" : customSlug,
      categoryName: gig.categoryName || "",
      customCategoryName: gig.customCategoryName || "",
      customCategoryDescription: gig.customCategoryDescription || "",
      expertType: gig.expertType === "team" ? "team" : "solo",
      description: gig.description || "",
      requirements: gig.requirements || "",
      baseCity: gig.baseCity || "",
    });
    setSelectedMapCoords({
      lat: typeof gig.locationLat === "number" ? gig.locationLat : DEFAULT_CENTER.lat,
      lng: typeof gig.locationLng === "number" ? gig.locationLng : DEFAULT_CENTER.lng,
    });
    setSelectedRadius(convertKmToNearestMilesOption(gig.travelRadiusKm));
    setExistingImageUrls(Array.isArray(gig.images) ? gig.images : []);
    setNewImages([]);
    setPackages({
      basic: {
        name: "Basic",
        title: "Basic Package",
        description: gigPackages[0]?.description || "",
        deliveryTime: String(gigPackages[0]?.deliveryTime || "1"),
        price: String(gigPackages[0]?.price || "15"),
      },
      standard: {
        name: "Standard",
        title: "Standard Package",
        description: gigPackages[1]?.description || "",
        deliveryTime: String(gigPackages[1]?.deliveryTime || "3"),
        price: String(gigPackages[1]?.price || "30"),
      },
      premium: {
        name: "Premium",
        title: "Premium Package",
        description: gigPackages[2]?.description || "",
        deliveryTime: String(gigPackages[2]?.deliveryTime || "5"),
        price: String(gigPackages[2]?.price || "60"),
      },
    });
  }, [editId, gigsData?.data.pendingRequests, gigsData?.data.publishedGigs]);

  const activeCategoryLabel = useMemo(() => {
    if (isCustomCategory) return formData.customCategoryName.trim() || "Custom Category";
    return categories.find((item) => item.slug === formData.categorySlug)?.name || formData.categoryName || "Category";
  }, [categories, formData.categoryName, formData.categorySlug, formData.customCategoryName, isCustomCategory]);

  const updatePackage = (field: keyof PackageData, value: string) => {
    setPackages((current) => ({
      ...current,
      [activePackage]: {
        ...current[activePackage],
        [field]: value,
      },
    }));
  };

  const selectCategory = (category: CategoryItem) => {
    setFormData((current) => ({
      ...current,
      categorySlug: category.slug,
      categoryName: category.name,
      customCategoryName: "",
      customCategoryDescription: "",
    }));
  };

  const pickImages = async () => {
    if (displayedImages.length >= 4) {
      Alert.alert("Limit reached", "You can upload up to 4 images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4 - displayedImages.length,
    });

    if (result.canceled) return;

    const selectedAssets = result.assets.slice(0, 4 - displayedImages.length).map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    }));
    setNewImages((current) => [...current, ...selectedAssets]);
  };

  const handleUseCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow location access to use your current location.");
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    const lat = current.coords.latitude;
    const lng = current.coords.longitude;
    setSelectedMapCoords({ lat, lng });
    setSettingAddress(true);
    try {
      const address = await resolveAddressFromCoordinates(lat, lng);
      setFormData((currentForm) => ({ ...currentForm, baseCity: address }));
    } finally {
      setSettingAddress(false);
    }
  };

  const setCenterAsLocation = async () => {
    setSettingAddress(true);
    try {
      const address = await resolveAddressFromCoordinates(selectedMapCoords.lat, selectedMapCoords.lng);
      setFormData((current) => ({ ...current, baseCity: address }));
    } finally {
      setSettingAddress(false);
    }
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        Alert.alert("Required", "Please add a gig title.");
        return false;
      }
      if (!formData.categorySlug) {
        Alert.alert("Required", "Please select a category.");
        return false;
      }
      if (isCustomCategory && !formData.customCategoryName.trim()) {
        Alert.alert("Required", "Please enter a custom category name.");
        return false;
      }
    }

    if (step === 2) {
      const hasInvalidPackage = PACKAGE_KEYS.some((key) => {
        const item = packages[key];
        return !item.description.trim() || !item.deliveryTime.trim() || !item.price.trim();
      });
      if (hasInvalidPackage) {
        Alert.alert("Required", "Please complete all package details.");
        return false;
      }
    }

    if (step === 3 && displayedImages.length < 1) {
      Alert.alert("Required", "Please select at least one image.");
      return false;
    }

    if (step === 4 && !formData.description.trim()) {
      Alert.alert("Required", "Please add your service description.");
      return false;
    }

    if (step === 5 && !formData.baseCity.trim()) {
      Alert.alert("Required", "Please set your service area.");
      return false;
    }

    return true;
  };

  const submitGig = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("categorySlug", formData.categorySlug);
      payload.append("categoryName", activeCategoryLabel);
      payload.append("customCategoryName", isCustomCategory ? formData.customCategoryName.trim() : "");
      payload.append("customCategoryDescription", isCustomCategory ? formData.customCategoryDescription.trim() : "");
      payload.append("expertType", formData.expertType);
      payload.append("description", formData.description.trim());
      payload.append("requirements", formData.requirements.trim());
      payload.append("baseCity", formData.baseCity.trim());
      payload.append("locationLat", String(selectedMapCoords.lat));
      payload.append("locationLng", String(selectedMapCoords.lng));
      payload.append("travelRadiusKm", String(convertMilesToKm(selectedRadius)));
      payload.append(
        "packages",
        JSON.stringify(
          PACKAGE_KEYS.map((key, index) => ({
            name: PACKAGE_NAMES[index],
            title: PACKAGE_TITLES[index],
            description: packages[key].description.trim(),
            deliveryTime: packages[key].deliveryTime.trim(),
            price: Number(packages[key].price) || 0,
          }))
        )
      );
      payload.append("images", JSON.stringify(existingImageUrls));
      newImages.forEach((asset, index) => {
        payload.append("images", {
          uri: asset.uri,
          name: asset.fileName || `gig-image-${index + 1}.jpg`,
          type: asset.mimeType || "image/jpeg",
        } as any);
      });

      if (editId) {
        await updateGig({ id: editId, formData: payload }).unwrap();
      } else {
        await createGig(payload).unwrap();
      }

      Alert.alert("Success", editId ? "Your gig has been updated." : "Your gig has been submitted.", [
        { text: "OK", onPress: () => router.replace("/(provider-tabs)/services" as any) },
      ]);
    } catch (error) {
      Alert.alert("Publish failed", error instanceof Error ? error.message : "Could not publish gig.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (step < 6) {
      setStep((current) => current + 1);
      return;
    }
    void submitGig();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title={editId ? "Edit Gig" : "Create Gig"} onBack={() => (step > 1 ? setStep(step - 1) : router.back())} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6 pt-4"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 130 }}
          >
          <ProgressBar step={step} />
          {loadingGig ? (
            <View className="py-24 items-center">
              <ActivityIndicator color="#2286BE" size="large" />
              <Text className="text-[#7C8B95] font-medium mt-4">Loading gig details...</Text>
            </View>
          ) : null}

          {!loadingGig && step === 1 ? (
            <View>
              <InputField
                label="Service Title"
                value={formData.title}
                onChange={(value) => setFormData((current) => ({ ...current, title: value }))}
                placeholder="I will provide deep house cleaning..."
                maxLength={80}
              />

              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {loadingCategories ? (
                  <ActivityIndicator color="#2286BE" />
                ) : (
                  <>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => selectCategory(category)}
                        className={`px-4 py-3 rounded-[18px] mr-3 ${formData.categorySlug === category.slug ? "bg-[#2286BE]" : "bg-white border border-gray-200"}`}
                      >
                        <Text className={`font-bold ${formData.categorySlug === category.slug ? "text-white" : "text-[#1A2C42]"}`}>{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => setFormData((current) => ({ ...current, categorySlug: "create-your-own-category", categoryName: "" }))}
                      className={`px-4 py-3 rounded-[18px] ${isCustomCategory ? "bg-[#1A2C42]" : "bg-white border border-gray-200"}`}
                    >
                      <Text className={`font-bold ${isCustomCategory ? "text-white" : "text-[#1A2C42]"}`}>Custom</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>

              {isCustomCategory ? (
                <>
                  <InputField
                    label="Custom Category Name"
                    value={formData.customCategoryName}
                    onChange={(value) => setFormData((current) => ({ ...current, customCategoryName: value }))}
                    placeholder="Example: Aquarium Cleaning"
                  />
                  <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">What is this category about?</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    value={formData.customCategoryDescription}
                    onChangeText={(value) => setFormData((current) => ({ ...current, customCategoryDescription: value }))}
                    className="w-full h-[120px] border border-gray-200 rounded-2xl p-4 text-[16px] bg-white text-[#2D3748] mb-5"
                    placeholder="Explain your custom category..."
                    textAlignVertical="top"
                  />
                </>
              ) : null}

              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Expert Type</Text>
              <View className="flex-row mb-6">
                {[
                  { key: "solo", label: "Solo", detail: "Handled by you alone" },
                  { key: "team", label: "Team", detail: "Delivered with a team" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setFormData((current) => ({ ...current, expertType: option.key as "solo" | "team" }))}
                    className={`flex-1 rounded-[20px] p-4 border mr-3 ${formData.expertType === option.key ? "border-[#2286BE] bg-[#EAF3FA]" : "border-gray-200 bg-white"}`}
                  >
                    <Text className="text-[16px] font-bold text-[#1A2C42]">{option.label}</Text>
                    <Text className="text-[13px] text-[#7C8B95] mt-1">{option.detail}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {!loadingGig && step === 2 ? (
            <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-6">
              <View className="flex-row bg-gray-50 border-b border-gray-100">
                {PACKAGE_KEYS.map((key, index) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setActivePackage(key)}
                    className={`flex-1 py-4 items-center ${activePackage === key ? "bg-white border-b-2 border-[#2B84B1]" : ""}`}
                  >
                    <Text className={`font-bold capitalize ${activePackage === key ? "text-[#2B84B1]" : "text-gray-400"}`}>{PACKAGE_NAMES[index]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="p-5">
                <Text className="text-[18px] font-bold text-[#1A2C42] mb-4">{packages[activePackage].title}</Text>
                <Text className="text-[12px] font-bold text-[#A0AEC0] mb-2 uppercase">Description</Text>
                <TextInput
                  placeholder="Detail what is included in this package..."
                  multiline
                  value={packages[activePackage].description}
                  onChangeText={(value) => updatePackage("description", value)}
                  className="text-[14px] text-[#1A2C42] h-[90px] mb-4 bg-gray-50 rounded-2xl p-4"
                  textAlignVertical="top"
                />

                <View className="flex-row mb-6">
                  <InputField
                    compact
                    label="Delivery Time"
                    value={packages[activePackage].deliveryTime}
                    onChange={(value) => updatePackage("deliveryTime", value)}
                    placeholder="3"
                    keyboardType="numeric"
                  />
                  <View className="w-4" />
                  <InputField
                    compact
                    label="Price (USD)"
                    value={packages[activePackage].price}
                    onChange={(value) => updatePackage("price", value)}
                    placeholder="25"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ) : null}

          {!loadingGig && step === 3 ? (
            <View>
              <Text className="text-[18px] font-bold text-[#1A2C42] mb-1">Gallery</Text>
              <Text className="text-[14px] text-[#7C8B95] mb-6">Upload at least one and up to four images.</Text>
              <TouchableOpacity
                onPress={pickImages}
                className="w-full h-[170px] border-2 border-dashed border-[#2B84B1]/30 rounded-[24px] bg-[#F4F9FC] items-center justify-center mb-6"
              >
                <Ionicons name="cloud-upload" size={36} color="#2B84B1" />
                <Text className="font-bold text-[#1A2C42] mt-2">Select Images</Text>
              </TouchableOpacity>

              <View className="flex-row flex-wrap gap-4">
                {displayedImages.map((image, index) => (
                  <View key={`${image}-${index}`} className="w-[100px] h-[80px] rounded-xl bg-gray-200 relative overflow-hidden">
                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => {
                        if (index < existingImageUrls.length) {
                          setExistingImageUrls((current) => current.filter((_, itemIndex) => itemIndex !== index));
                        } else {
                          const fileIndex = index - existingImageUrls.length;
                          setNewImages((current) => current.filter((_, itemIndex) => itemIndex !== fileIndex));
                        }
                      }}
                      className="absolute top-1 right-1 bg-black/55 rounded-full"
                    >
                      <Ionicons name="close-circle" size={22} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {!loadingGig && step === 4 ? (
            <View>
              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Description</Text>
              <TextInput
                multiline
                numberOfLines={6}
                value={formData.description}
                onChangeText={(value) => setFormData((current) => ({ ...current, description: value }))}
                className="w-full h-[160px] border border-gray-200 rounded-2xl p-4 text-[16px] bg-white text-[#2D3748] mb-5"
                placeholder="Describe your gig and why clients should book you..."
                textAlignVertical="top"
              />
              <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Client Requirements</Text>
              <TextInput
                multiline
                numberOfLines={5}
                value={formData.requirements}
                onChangeText={(value) => setFormData((current) => ({ ...current, requirements: value }))}
                className="w-full h-[130px] border border-gray-200 rounded-2xl p-4 text-[16px] bg-white text-[#2D3748]"
                placeholder="Tell the client what you need before starting..."
                textAlignVertical="top"
              />
            </View>
          ) : null}

          {!loadingGig && step === 5 ? (
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[14px] font-bold text-[#1A2C42] ml-1">Service Area</Text>
                <TouchableOpacity onPress={() => void handleUseCurrentLocation()} className="bg-[#EAF3FA] rounded-full px-4 py-2">
                  <Text className="text-[#2286BE] font-bold text-[12px]">Use Current Location</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={formData.baseCity}
                onChangeText={(value) => setFormData((current) => ({ ...current, baseCity: value }))}
                placeholder="Banani, Dhaka, Bangladesh"
                className="bg-white rounded-[18px] px-4 py-4 text-[15px] mb-4"
              />
              <MapboxLocationPicker
                token={mapboxToken}
                initialCenter={selectedMapCoords}
                onCenterChange={setSelectedMapCoords}
                badgeText="Move map and set center as service location"
                loadingText="Loading service area map..."
                fallbackHintText="Using fallback map tiles. Add EXPO_PUBLIC_MAPBOX_TOKEN for the same Mapbox styling as web."
              />
              <TouchableOpacity onPress={() => void setCenterAsLocation()} className="mt-3 bg-white border border-gray-200 rounded-[16px] px-4 py-3 self-start">
                <Text className="font-bold text-[#2286BE]">{settingAddress ? "Setting..." : "Set Center As Location"}</Text>
              </TouchableOpacity>

              <Text className="text-[14px] font-bold text-[#1A2C42] mt-6 mb-3 ml-1">Travel Radius</Text>
              <View className="flex-row flex-wrap">
                {RADIUS_OPTIONS.map((radius) => (
                  <TouchableOpacity
                    key={radius}
                    onPress={() => setSelectedRadius(radius)}
                    className={`px-4 py-3 rounded-[18px] mr-3 mb-3 ${selectedRadius === radius ? "bg-[#2286BE]" : "bg-white border border-gray-200"}`}
                  >
                    <Text className={`font-bold ${selectedRadius === radius ? "text-white" : "text-[#1A2C42]"}`}>Within {radius} miles</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {!loadingGig && step === 6 ? (
            <View className="items-center py-6">
              <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={60} color="#55A06F" />
              </View>
              <Text className="text-[26px] font-black text-[#1A2C42] mb-3 text-center">Ready to publish</Text>
              <Text className="text-[15px] text-[#7C8B95] text-center leading-[24px] px-4">
                Review your details once more before submitting your gig.
              </Text>

              <View className="w-full bg-[#F8FAFC] rounded-[24px] p-5 mt-8">
                <SummaryRow label="Title" value={formData.title || "Untitled gig"} />
                <SummaryRow label="Category" value={activeCategoryLabel} />
                <SummaryRow label="Expert Type" value={formData.expertType === "team" ? "Team" : "Solo"} />
                <SummaryRow label="Images" value={`${displayedImages.length} selected`} />
                <SummaryRow label="Location" value={formData.baseCity || "Not set"} />
                <SummaryRow label="Radius" value={`${selectedRadius} miles`} />
              </View>
            </View>
          ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Footer loading={loading} label={step === 6 ? (editId ? "Update Gig" : "Publish Gig") : "Save & Continue"} onPress={nextStep} />
    </SafeAreaView>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between mb-2 px-1">
        {["Basics", "Pricing", "Gallery", "Details", "Location", "Publish"].map((label, index) => (
          <Text key={label} className={`text-[11px] font-bold uppercase tracking-wider ${step > index ? "text-[#2B84B1]" : "text-gray-400"}`}>
            {label}
          </Text>
        ))}
      </View>
      <View className="flex-row gap-x-1.5">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <View key={index} className={`flex-1 h-1.5 rounded-full ${step >= index ? "bg-[#2B84B1]" : "bg-gray-100"}`} />
        ))}
      </View>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="px-6 py-3 flex-row items-center border-b border-gray-50">
      <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
        <Ionicons name="arrow-back" size={20} color="#1A2C42" />
      </TouchableOpacity>
      <Text className="text-[20px] font-bold text-[#1A2C42]">{title}</Text>
    </View>
  );
}

function Footer({ label, onPress, loading }: { label: string; onPress: () => void; loading: boolean }) {
  return (
    <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-8 border-t border-gray-50 shadow-2xl">
      <TouchableOpacity disabled={loading} onPress={onPress} className="w-full h-[60px] bg-[#2B84B1] rounded-2xl items-center justify-center flex-row">
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-[17px] font-bold">{label}</Text>}
      </TouchableOpacity>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-[#7C8B95] font-semibold">{label}</Text>
      <Text className="text-[#1A2C42] font-bold flex-1 text-right ml-4">{value}</Text>
    </View>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  compact = false,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  compact?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className={`mb-5 ${compact ? "flex-1" : ""}`}>
      <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        maxLength={maxLength}
        keyboardType={keyboardType}
        className="w-full h-[58px] border border-gray-200 rounded-2xl px-4 text-[16px] bg-white font-medium text-[#2D3748]"
      />
      {maxLength ? <Text className="text-[11px] text-[#A0AEC0] text-right mt-1">{value.length}/{maxLength}</Text> : null}
    </View>
  );
}
