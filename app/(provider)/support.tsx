import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportPage() {
    const router = useRouter();

    const FaqItem = ({ q, a }: any) => (
        <TouchableOpacity className="bg-white rounded-[20px] p-5 mb-3 border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row justify-between items-center">
                <Text className="text-[15px] font-bold text-[#1A2C42] flex-1 pr-4">{q}</Text>
                <Ionicons name="chevron-down" size={20} color="#A0AEC0" />
            </View>
        </TouchableOpacity>
    );

    const SupportAction = ({ icon, title, desc, color }: any) => (
        <TouchableOpacity className="flex-row items-center p-5 bg-white rounded-[20px] border border-gray-100 shadow-sm shadow-gray-100 mb-4">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${color}15` }}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-[16px] font-bold text-[#1A2C42] mb-1">{title}</Text>
                <Text className="text-[13px] text-[#7C8B95]">{desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10 w-full mb-2">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <Ionicons name="arrow-back" size={20} color="#1A2C42" />
                </TouchableOpacity>
                <Text className="text-[20px] font-bold text-[#1A2C42]">Help & Support</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero */}
                <View className="bg-[#2B84B1] rounded-[24px] p-6 mb-8 shadow-lg shadow-[#2B84B1]/30">
                    <Ionicons name="help-buoy" size={48} color="white" className="mb-4" />
                    <Text className="text-white text-[24px] font-bold mb-2">How can we help?</Text>
                    <Text className="text-white/80 text-[14px] leading-[22px]">
                        Our support team is here for you 24/7. Find answers to common seller questions or contact us directly.
                    </Text>
                </View>

                {/* Direct Contact */}
                <Text className="text-[16px] font-bold text-[#1A2C42] mb-4">Contact Methods</Text>
                <SupportAction
                    icon="chatbubbles"
                    title="Live Chat Support"
                    desc="Typically replies in 5 mins"
                    color="#2B84B1"
                />
                <SupportAction
                    icon="mail"
                    title="Submit a Ticket"
                    desc="Email our resolution center"
                    color="#55A06F"
                />
                <SupportAction
                    icon="warning"
                    title="Report a Problem"
                    desc="Report problematic orders or users"
                    color="#FF4757"
                />

                {/* FAQs */}
                <Text className="text-[16px] font-bold text-[#1A2C42] mt-4 mb-4">Seller FAQs</Text>
                <FaqItem q="How do I withdraw my earnings?" a="..." />
                <FaqItem q="When will my funds clear?" a="..." />
                <FaqItem q="What happens if a buyer requests a cancellation?" a="..." />
                <FaqItem q="How can I improve my seller level?" a="..." />
            </ScrollView>
        </SafeAreaView>
    );
}
