
import { Tabs } from "expo-router";
import BottomNavigation from "../../components/common/BottomNavigation";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: "transparent" },
            }}
            tabBar={(props) => <BottomNavigation {...props} />}
        >
            <Tabs.Screen name="home" options={{ title: "Home" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
    );
}
