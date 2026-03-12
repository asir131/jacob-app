import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform, ScrollView, Text, TextInput,
    TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types for better development
type PackageType = 'basic' | 'standard' | 'premium';

interface PackageData {
    name: string;
    description: string;
    deliveryTime: string;
    revisions: string;
    price: string;
}

export default function CreateServicePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // --- Dynamic States ---
    const [formData, setFormData] = useState({
        title: "",
        category: "AI Automation",
        tags: "",
        description: "",
        images: [] as string[],
    });

    const [activePackage, setActivePackage] = useState<PackageType>('basic');
    const [packages, setPackages] = useState<Record<PackageType, PackageData>>({
        basic: { name: "", description: "", deliveryTime: "3 Days", revisions: "1", price: "" },
        standard: { name: "", description: "", deliveryTime: "5 Days", revisions: "3", price: "" },
        premium: { name: "", description: "", deliveryTime: "7 Days", revisions: "Unlimited", price: "" },
    });

    // --- Handlers ---
    const updatePackage = (field: keyof PackageData, value: string) => {
        setPackages(prev => ({
            ...prev,
            [activePackage]: { ...prev[activePackage], [field]: value }
        }));
    };

    const pickImage = async () => {
        if (formData.images.length >= 3) {
            Alert.alert("Limit Reached", "You can only upload up to 3 images.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setFormData(prev => ({ ...prev, images: [...prev.images, result.assets[0].uri] }));
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", "Your gig is now live!", [
                { text: "OK", onPress: () => router.replace('/(provider-tabs)/services' as any) }
            ]);
        }, 2000);
    };

    const nextStep = () => {
        if (step === 1 && !formData.title) return Alert.alert("Required", "Please add a title.");
        if (step === 2 && !packages.basic.price) return Alert.alert("Required", "Basic price is mandatory.");

        if (step < 4) setStep(step + 1);
        else handlePublish();
    };

    // --- Sub-Components (Dynamic) ---
    const ProgressBar = () => (
        <View className="mb-6">
            <View className="flex-row justify-between mb-2 px-1">
                {['Overview', 'Pricing', 'Media', 'Publish'].map((label, idx) => (
                    <Text key={idx} className={`text-[11px] font-bold uppercase tracking-wider ${step > idx ? 'text-[#2B84B1]' : 'text-gray-400'}`}>
                        {label}
                    </Text>
                ))}
            </View>
            <View className="flex-row gap-x-1.5">
                {[1, 2, 3, 4].map(idx => (
                    <View key={idx} className={`flex-1 h-1.5 rounded-full ${step >= idx ? 'bg-[#2B84B1]' : 'bg-gray-100'}`} />
                ))}
            </View>
        </View>
    );

    const Step1 = () => (
        <View className="animate-in fade-in duration-500">
            <InputField label="Service Title" value={formData.title} onChange={(val: any) => setFormData({ ...formData, title: val })} placeholder="I will build a custom AI agent..." maxLength={80} />

            <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Category</Text>
            <TouchableOpacity className="w-full h-[58px] border border-gray-200 rounded-2xl px-4 flex-row items-center justify-between bg-white mb-6">
                <Text className="text-[16px] text-[#2D3748] font-medium">{formData.category}</Text>
                <Ionicons name="chevron-down" size={20} color="#A0AEC0" />
            </TouchableOpacity>

            <InputField label="Tags" value={formData.tags} onChange={(val: any) => setFormData({ ...formData, tags: val })} placeholder="AI, Automation, Python" />

            <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Description</Text>
            <TextInput
                multiline
                numberOfLines={6}
                value={formData.description}
                onChangeText={(val) => setFormData({ ...formData, description: val })}
                className="w-full h-[140px] border border-gray-200 rounded-2xl p-4 text-[16px] bg-white text-[#2D3748]"
                placeholder="Explain what you offer..."
                textAlignVertical="top"
            />
        </View>
    );

    const Step2 = () => (
        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-6">
            <View className="flex-row bg-gray-50 border-b border-gray-100">
                {(['basic', 'standard', 'premium'] as PackageType[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActivePackage(tab)}
                        className={`flex-1 py-4 items-center ${activePackage === tab ? 'bg-white border-b-2 border-[#2B84B1]' : ''}`}
                    >
                        <Text className={`font-bold capitalize ${activePackage === tab ? 'text-[#2B84B1]' : 'text-gray-400'}`}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="p-5">
                <TextInput
                    placeholder="Package Name (e.g. Silver Plan)"
                    value={packages[activePackage].name}
                    onChangeText={(val) => updatePackage('name', val)}
                    className="text-[18px] font-bold text-[#1A2C42] border-b border-gray-50 pb-2 mb-4"
                />
                <TextInput
                    placeholder="Describe specific features..."
                    multiline
                    value={packages[activePackage].description}
                    onChangeText={(val) => updatePackage('description', val)}
                    className="text-[14px] text-[#7C8B95] h-[70px] mb-4"
                />

                <View className="flex-row mb-6">
                    <DropdownSelect label="Delivery" value={packages[activePackage].deliveryTime} />
                    <View className="w-4" />
                    <DropdownSelect label="Revisions" value={packages[activePackage].revisions} />
                </View>

                <Text className="text-[12px] font-bold text-[#A0AEC0] mb-2 uppercase">Price ($)</Text>
                <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 bg-gray-50">
                    <Text className="text-[20px] font-bold text-[#2B84B1] mr-2">$</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={packages[activePackage].price}
                        onChangeText={(val) => updatePackage('price', val)}
                        placeholder="0.00"
                        className="flex-1 h-[55px] text-[22px] font-bold text-[#2B84B1]"
                    />
                </View>
            </View>
        </View>
    );

    const Step3 = () => (
        <View>
            <Text className="text-[18px] font-bold text-[#1A2C42] mb-1">Showcase your work</Text>
            <Text className="text-[14px] text-[#7C8B95] mb-6">Add up to 3 high-quality images to attract buyers.</Text>

            <TouchableOpacity
                onPress={pickImage}
                className="w-full h-[180px] border-2 border-dashed border-[#2B84B1]/30 rounded-[24px] bg-[#F4F9FC] items-center justify-center mb-6"
            >
                <Ionicons name="cloud-upload" size={36} color="#2B84B1" />
                <Text className="font-bold text-[#1A2C42] mt-2">Upload Images</Text>
            </TouchableOpacity>

            <View className="flex-row flex-wrap gap-4">
                {formData.images.map((img, i) => (
                    <View key={i} className="w-[100px] h-[80px] rounded-xl bg-gray-200 relative">
                        {/* Image display would go here with <Image source={{uri: img}} /> */}
                        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full">
                            <Ionicons name="close-circle" size={24} color="white" onPress={() => {
                                const newImgs = [...formData.images];
                                newImgs.splice(i, 1);
                                setFormData({ ...formData, images: newImgs });
                            }} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <Header onBack={() => step > 1 ? setStep(step - 1) : router.back()} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    <ProgressBar />
                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                    {step === 4 && <Step4 />}
                </ScrollView>
            </KeyboardAvoidingView>

            <Footer
                loading={loading}
                label={step === 4 ? 'Confirm & Publish' : 'Save & Continue'}
                onPress={nextStep}
            />
        </SafeAreaView>
    );
}

// --- Helper Components (For Clean Code) ---

const InputField = ({ label, value, onChange, placeholder, maxLength }: any) => (
    <View className="mb-5">
        <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">{label}</Text>
        <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            maxLength={maxLength}
            className="w-full h-[58px] border border-gray-200 rounded-2xl px-4 text-[16px] bg-white font-medium text-[#2D3748]"
        />
        {maxLength && <Text className="text-[11px] text-[#A0AEC0] text-right mt-1">{value.length}/{maxLength}</Text>}
    </View>
);

const DropdownSelect = ({ label, value }: any) => (
    <View className="flex-1">
        <Text className="text-[12px] font-bold text-[#A0AEC0] mb-1 uppercase tracking-tighter">{label}</Text>
        <TouchableOpacity className="h-[52px] border border-gray-200 rounded-xl flex-row items-center justify-between px-3 bg-white">
            <Text className="font-semibold text-[#1A2C42]">{value}</Text>
            <Ionicons name="chevron-down" size={14} color="#A0AEC0" />
        </TouchableOpacity>
    </View>
);

const Header = ({ onBack }: any) => (
    <View className="px-6 py-3 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
            <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42]">Create Gig</Text>
    </View>
);

const Footer = ({ label, onPress, loading }: any) => (
    <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-8 border-t border-gray-50 shadow-2xl">
        <TouchableOpacity
            disabled={loading}
            onPress={onPress}
            className="w-full h-[60px] bg-[#2B84B1] rounded-2xl items-center justify-center flex-row"
        >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-[17px] font-bold">{label}</Text>}
        </TouchableOpacity>
    </View>
);

const Step4 = () => (
    <View className="items-center py-6">
        <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={60} color="#55A06F" />
        </View>
        <Text className="text-[26px] font-black text-[#1A2C42] mb-3 text-center">Ready to go!</Text>
        <Text className="text-[15px] text-[#7C8B95] text-center leading-[24px] px-6">
            Review your details. Once you publish, buyers can start ordering your services immediately.
        </Text>
    </View>
);