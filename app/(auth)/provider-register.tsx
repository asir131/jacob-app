import { Redirect } from "expo-router";

export default function ProviderRegisterScreen() {
    return <Redirect href="/(auth)/register?role=provider" />;
}
