import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { StatusBar } from 'expo-status-bar';

export default function ProviderTabLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Tabs screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    borderTopEndRadius: 32,
                    borderTopStartRadius: 32,
                    height: 85,
                    paddingBottom: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -20,
                    },
                    shadowOpacity: 0.08,
                    shadowRadius: 30,
                    elevation: 24,
                },
                tabBarItemStyle: { flex: 1, justifyContent: 'center', paddingTop: 12 }
            }}>
                <Tabs.Screen name="index" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="home-outline" size={24} color={focused ? "#2286BE" : "#999"} /> }} />
                <Tabs.Screen name="orders" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="list-outline" size={24} color={focused ? "#2286BE" : "#999"} /> }} />
                <Tabs.Screen name="messages" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="chatbubble-outline" size={24} color={focused ? "#2286BE" : "#999"} /> }} />
                <Tabs.Screen name="services" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="briefcase-outline" size={24} color={focused ? "#2286BE" : "#999"} /> }} />
                <Tabs.Screen name="settings" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="settings-outline" size={24} color={focused ? "#2286BE" : "#999"} /> }} />
            </Tabs>
        </>
    );
}
