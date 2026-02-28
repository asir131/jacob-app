import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Tabs screenOptions={{ headerShown: false, tabBarStyle: { borderColor: "#0C0C0D1A", borderTopEndRadius: 16, borderTopStartRadius: 16, shadowRadius: 40, height: 72, alignItems: 'center', justifyContent: 'center' }, tabBarItemStyle: { flex: 1, justifyContent: 'center', paddingVertical: 10 } }}>
                <Tabs.Screen name="index" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="home-outline" size={24} color={focused ? "#000" : "#999"} /> }} />
                <Tabs.Screen name="booking" options={{ title: "", tabBarIcon: ({ focused }) => <Foundation name="page-copy" size={24} color={focused ? "#000" : "#999"} /> }} />
                <Tabs.Screen name="notification" options={{ title: "", tabBarIcon: ({ focused }) => <Ionicons name="notifications-outline" size={24} color={focused ? "#000" : "#999"} /> }} />
                <Tabs.Screen name="message" options={{ title: "", tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="message-text-outline" size={24} color={focused ? "#000" : "#999"} /> }} />
            </Tabs>
        </>
    );
}
