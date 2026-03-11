import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePage() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-white">
      {/* Fixed Header */}
      <SafeAreaView
        className="bg-white rounded-b-[30px] px-6 pb-6 pt-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          zIndex: 20,
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity>
            <Ionicons name="menu" size={32} color="#2B84B1" />
          </TouchableOpacity>

          <View className="ml-4 flex-1">
            <Text className="text-[10px] font-bold tracking-widest text-[#7C8B95] uppercase">
              Current Location
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-[15px] font-bold text-[#2B84B1]">
                15A, JAMES STREET
              </Text>
              <Ionicons
                name="caret-down"
                size={14}
                color="#2B84B1"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100 ml-4 relative"
          >
            <Ionicons name="notifications-outline" size={22} color="#1A2C42" />
            <View className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FF4757] border-2 border-white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 bg-[#FAFCFD]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        bounces={true}
      >
        {/* Reduced spacer - was 110, now 80 → less gap */}
        <View style={{ height: 40 }} />

        {/* Greeting Section */}
        <View className="px-6 pt-2 pb-6">
          <Text className="text-[12px] font-bold tracking-[0.15em] text-[#7C8B95] uppercase mb-3">
            HELLO JOYBOY <Text className="text-sm">👋</Text>
          </Text>
          <Text className="text-[34px] font-black text-[#1A2C42] leading-[42px] tracking-tight">
            What you are looking{"\n"}for today
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-8">
          <View
            className="flex-row items-center bg-white rounded-3xl pl-5 pr-2 py-2 border border-gray-100"
            style={{
              shadowColor: "#1A2C42",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.06,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <TextInput
              placeholder="Search what you need..."
              placeholderTextColor="#A0AEC0"
              className="flex-1 text-[15px] font-medium text-[#1A2C42] h-12"
              autoCapitalize="none"
            />
            <TouchableOpacity className="bg-[#2B84B1] w-12 h-12 rounded-[18px] items-center justify-center">
              <Ionicons name="search" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Offers Horizontal Scroll */}
        <View className="pl-6 mb-10">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={316}
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {/* Offer Card 1 */}
            <View className="w-[300px] h-[190px] bg-[#EEF7EF] rounded-[32px] p-7 mr-5 relative overflow-hidden justify-center">
              <View className="z-10">
                <View className="flex-row items-center mb-1">
                  <Text className="text-[14px] font-bold text-[#3B4C5A] mr-1.5">
                    Offer AC Service
                  </Text>
                  <Ionicons name="information-circle" size={16} color="#3B4C5A" />
                </View>
                <Text className="text-[48px] font-black text-[#1A2C42] tracking-tighter mb-4 -ml-1">
                  Get 25%
                </Text>
                <TouchableOpacity className="bg-white px-5 py-3 rounded-full flex-row items-center self-start">
                  <Text className="text-[#62A677] font-bold text-[14px] mr-1.5">
                    Grab Offer
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#62A677" />
                </TouchableOpacity>
              </View>
              <View className="absolute -right-12 top-8 w-40 h-40 bg-[#E2F2E4] rounded-full opacity-70" />
            </View>

            {/* Offer Card 2 */}
            <View className="w-[300px] h-[190px] bg-[#EAF3FA] rounded-[32px] p-7 mr-5 relative overflow-hidden justify-center">
              <View className="z-10">
                <View className="flex-row items-center mb-1">
                  <Text className="text-[14px] font-bold text-[#3B4C5A] mr-1.5">
                    Plumbing Fixes
                  </Text>
                  <Ionicons name="information-circle" size={16} color="#3B4C5A" />
                </View>
                <Text className="text-[48px] font-black text-[#1A2C42] tracking-tighter mb-4 -ml-1">
                  Save 15%
                </Text>
                <TouchableOpacity className="bg-white px-5 py-3 rounded-full flex-row items-center self-start">
                  <Text className="text-[#5B9DD9] font-bold text-[14px] mr-1.5">
                    Grab Offer
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#5B9DD9" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Categories */}
        <View className="px-6 mb-12 flex-row justify-between items-center">
          <View className="items-center">
            <TouchableOpacity className="w-[58px] h-[58px] rounded-full bg-[#FFDFB3] items-center justify-center mb-3">
              <Ionicons name="snow" size={32} color="#C46000" />
            </TouchableOpacity>
            <Text className="text-[14px] font-semibold text-[#4A5568]">AC Repair</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity className="w-[58px] h-[58px] rounded-full bg-[#DCCFFD] items-center justify-center mb-3">
              <Ionicons name="sparkles" size={30} color="#553098" />
            </TouchableOpacity>
            <Text className="text-[14px] font-semibold text-[#4A5568]">Beauty</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity className="w-[58px] h-[58px] rounded-full bg-[#B1EBF2] items-center justify-center mb-3">
              <Ionicons name="cube" size={30} color="#008EA6" />
            </TouchableOpacity>
            <Text className="text-[14px] font-semibold text-[#4A5568]">Appliance</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity
              onPress={() => router.push('/categories')}
              className="w-[58px] h-[58px] rounded-full bg-gray-50 border border-gray-100 items-center justify-center mb-3"
            >
              <Ionicons name="arrow-forward" size={26} color="#718096" />
            </TouchableOpacity>
            <Text className="text-[14px] font-semibold text-[#4A5568]">See All</Text>
          </View>
        </View>

        {/* Cleaning Services */}
        <View className="mb-12">
          <View className="px-6 mb-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-1.5 h-7 bg-[#2B84B1] rounded-full mr-3.5" />
              <Text className="text-[22px] font-bold text-[#1A2C42]">Cleaning Services</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/services', params: { title: 'Cleaning Services' } })}
              className="flex-row items-center border border-gray-200 rounded-full px-4 py-2"
            >
              <Text className="text-[13px] font-semibold text-[#4A5568] mr-1.5">See All</Text>
              <Ionicons name="chevron-forward" size={12} color="#4A5568" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
            {/* Card 1 */}
            <TouchableOpacity className="w-[172px] mr-5">
              <View className="w-full h-[220px] rounded-3xl overflow-hidden mb-4 bg-gray-100 relative">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute top-3 left-3 bg-[#FF4757] rounded-full px-3 py-1">
                  <Text className="text-[11px] font-bold text-white">10% OFF</Text>
                </View>
              </View>
              <Text className="text-[16px] font-bold text-[#1A2C42] text-center">
                Home Cleaning
              </Text>
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity className="w-[172px] mr-5">
              <View className="w-full h-[220px] rounded-3xl overflow-hidden mb-4 bg-gray-100">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-[16px] font-bold text-[#1A2C42] text-center">
                Carpet Cleaning
              </Text>
            </TouchableOpacity>

            {/* Card 3 */}
            <TouchableOpacity className="w-[172px]">
              <View className="w-full h-[220px] rounded-3xl overflow-hidden mb-4 bg-gray-100">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-[16px] font-bold text-[#1A2C42] text-center">
                Deep Cleaning
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}