import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateServicePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // States
    const [title, setTitle] = useState("");
    const [category] = useState("AI Automation");
    const [desc, setDesc] = useState("");

    const ProgressBar = () => (
        <View className="mb-6">
            <View className="flex-row justify-between mb-2">
                {['Overview', 'Pricing', 'Media', 'Publish'].map((label, idx) => (
                    <Text key={idx} className={`text-[12px] font-bold ${step > idx ? 'text-[#2B84B1]' : 'text-[#A0AEC0]'}`}>{label}</Text>
                ))}
            </View>
            <View className="flex-row gap-x-2">
                {[1, 2, 3, 4].map(idx => (
                    <View key={idx} className={`flex-1 h-2 rounded-full ${step >= idx ? 'bg-[#2B84B1]' : 'bg-gray-100'}`} />
                ))}
            </View>
        </View>
    );

    const Step1 = () => (
        <View>
            <View className="mb-6">
                <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Service Title</Text>
                <TextInput
                    placeholder="I will..."
                    value={title}
                    onChangeText={setTitle}
                    className="w-full h-[60px] border border-gray-200 rounded-[16px] px-4 text-[16px] bg-white font-medium"
                />
                <Text className="text-[12px] text-[#A0AEC0] ml-1 mt-1 text-right">0/80 max</Text>
            </View>

            <View className="mb-6">
                <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Category</Text>
                <TouchableOpacity className="w-full h-[60px] border border-gray-200 rounded-[16px] px-4 flex-row items-center justify-between bg-white">
                    <Text className="text-[16px] text-[#2D3748] font-medium">{category}</Text>
                    <Ionicons name="chevron-down" size={20} color="#A0AEC0" />
                </TouchableOpacity>
            </View>

            <View className="mb-6">
                <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Tags (Up to 5)</Text>
                <TextInput
                    placeholder="e.g. Next.js, AI, Figma"
                    className="w-full h-[60px] border border-gray-200 rounded-[16px] px-4 text-[16px] bg-white font-medium"
                />
            </View>

            <View className="mb-6">
                <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Description</Text>
                <TextInput
                    placeholder="Describe your service in detail..."
                    value={desc}
                    onChangeText={setDesc}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    className="w-full h-[150px] border border-gray-200 rounded-[16px] p-4 text-[16px] bg-white font-medium"
                />
            </View>
        </View>
    );

    const Step2 = () => (
        <View>
            <View className="bg-white rounded-[24px] border border-gray-200 shadow-sm shadow-black/5 overflow-hidden mb-6">
                <View className="flex-row bg-[#2B84B1]">
                    <TouchableOpacity className="flex-1 py-4 items-center bg-white border-b-4 border-[#2B84B1]">
                        <Text className="font-bold text-[#2B84B1]">Basic</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-4 items-center">
                        <Text className="font-bold text-white/70">Standard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-4 items-center">
                        <Text className="font-bold text-white/70">Premium</Text>
                    </TouchableOpacity>
                </View>

                <View className="p-5">
                    <TextInput placeholder="Name your package" className="text-[18px] font-bold text-[#1A2C42] border-b border-gray-100 pb-2 mb-4" />
                    <TextInput placeholder="Describe the details of your offering..." multiline className="text-[14px] text-[#7C8B95] h-[80px] mb-4" textAlignVertical="top" />

                    <View className="flex-row mb-4">
                        <View className="flex-1 mr-2">
                            <Text className="text-[12px] font-bold text-[#A0AEC0] mb-1">Delivery Time</Text>
                            <TouchableOpacity className="h-[50px] border border-gray-200 rounded-[12px] flex-row items-center justify-between px-3">
                                <Text className="font-medium text-[#1A2C42]">3 Days</Text>
                                <Ionicons name="chevron-down" size={16} color="#A0AEC0" />
                            </TouchableOpacity>
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-[12px] font-bold text-[#A0AEC0] mb-1">Revisions</Text>
                            <TouchableOpacity className="h-[50px] border border-gray-200 rounded-[12px] flex-row items-center justify-between px-3">
                                <Text className="font-medium text-[#1A2C42]">1</Text>
                                <Ionicons name="chevron-down" size={16} color="#A0AEC0" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text className="text-[12px] font-bold text-[#A0AEC0] mb-2">Price ($)</Text>
                    <TextInput keyboardType="numeric" placeholder="$50" className="w-full h-[60px] border border-gray-200 rounded-[16px] px-4 text-[24px] font-bold text-[#2B84B1]" />
                </View>
            </View>
        </View>
    );

    const Step3 = () => (
        <View>
            <Text className="text-[14px] font-bold text-[#1A2C42] mb-2 ml-1">Service Covers & Media</Text>
            <Text className="text-[13px] text-[#7C8B95] mb-6 ml-1 leading-[20px]">
                Get noticed by the right buyers with visual examples of your services. Max 3 images.
            </Text>

            <TouchableOpacity className="w-full h-[180px] border-2 border-dashed border-gray-300 rounded-[24px] bg-[#FAFCFD] items-center justify-center mb-6">
                <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Ionicons name="cloud-upload" size={32} color="#2B84B1" />
                </View>
                <Text className="font-bold text-[#1A2C42] text-[16px]">Browse Files</Text>
                <Text className="text-[13px] text-[#A0AEC0] mt-1">JPEG, PNG, max 10MB</Text>
            </TouchableOpacity>

            <View className="flex-row gap-x-4">
                <View className="w-[100px] h-[80px] rounded-[16px] bg-gray-100 border border-gray-200 items-center justify-center overflow-hidden">
                    <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                </View>
                <View className="w-[100px] h-[80px] rounded-[16px] bg-gray-100 border border-gray-200 border-dashed items-center justify-center">
                    <Ionicons name="add" size={24} color="#A0AEC0" />
                </View>
            </View>
        </View>
    );

    const Step4 = () => (
        <View className="items-center py-10">
            <Ionicons name="checkmark-circle" size={120} color="#55A06F" className="mb-6" />
            <Text className="text-[28px] font-black text-[#1A2C42] mb-3 text-center">Ready to Publish!</Text>
            <Text className="text-[15px] text-[#7C8B95] text-center leading-[24px] px-4 mb-8">
                Your service is ready to go live. Once published, it will be visible to thousands of buyers actively looking for your skills.
            </Text>
        </View>
    );

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1 />;
            case 2: return <Step2 />;
            case 3: return <Step3 />;
            case 4: return <Step4 />;
            default: return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Create Gig</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <ProgressBar />
                    {renderStep()}
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => {
                        if (step < 4) setStep(step + 1);
                        else router.push('/(provider-tabs)/services' as any);
                    }}
                    className="w-full h-[60px] bg-[#2B84B1] rounded-[20px] items-center justify-center shadow-lg shadow-[#2B84B1]/30"
                >
                    <Text className="text-white text-[16px] font-bold">{step === 4 ? 'Publish Gig' : 'Save & Continue'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
