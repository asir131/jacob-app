import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useSocketNotifications } from "@/src/contexts/SocketContext";
import { formatCurrency, formatDateLabel, formatStatusLabel, formatTimeLabel } from "@/src/lib/formatters";
import {
  useCancelClientRevisionMutation,
  useConfirmClientCheckoutPaymentMutation,
  useCreateClientCheckoutSessionMutation,
  useEnsureConversationByOrderMutation,
  useGetClientOrderDetailQuery,
  useGetProviderOrderDetailQuery,
  useRequestClientRevisionMutation,
  useSendClientResolutionMessageMutation,
  useSubmitClientOrderReviewMutation,
} from "@/src/store/services/apiSlice";

type ActiveModal = null | "review" | "revision" | "cancel" | "checkout";

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; role?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] || "" : params.id || "";
  const roleParam = Array.isArray(params.role) ? params.role[0] || "client" : params.role || "client";
  const role = roleParam === "provider" ? "provider" : "client";
  const { socket } = useSocketNotifications();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [revisionText, setRevisionText] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [revisionMode, setRevisionMode] = useState<"delivery" | "after_sell">("delivery");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [handledSessionId, setHandledSessionId] = useState("");

  const providerQuery = useGetProviderOrderDetailQuery(id, {
    skip: !id || role !== "provider",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const clientQuery = useGetClientOrderDetailQuery(id, {
    skip: !id || role === "provider",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [ensureConversationByOrder] = useEnsureConversationByOrderMutation();
  const [createCheckoutSession, { isLoading: creatingCheckout }] = useCreateClientCheckoutSessionMutation();
  const [confirmCheckoutPayment, { isLoading: confirmingCheckout }] = useConfirmClientCheckoutPaymentMutation();
  const [requestClientRevision, { isLoading: requestingRevision }] = useRequestClientRevisionMutation();
  const [cancelClientRevision, { isLoading: cancellingRevision }] = useCancelClientRevisionMutation();
  const [sendResolutionMessage, { isLoading: sendingResolution }] = useSendClientResolutionMessageMutation();
  const [submitReview, { isLoading: submittingReview }] = useSubmitClientOrderReviewMutation();
  const order = (role === "provider" ? providerQuery.data?.data.order : clientQuery.data?.data.order) || null;
  const loading = role === "provider" ? providerQuery.isLoading : clientQuery.isLoading;
  const refetchOrder = role === "provider" ? providerQuery.refetch : clientQuery.refetch;

  useEffect(() => {
    setReviewText(order?.clientReview || "");
    setRating(Number(order?.clientRating || 0));
  }, [order?.clientRating, order?.clientReview]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      void refetchOrder();
    }, [id, refetchOrder])
  );

  useEffect(() => {
    if (!socket || !id) return;

    const handleRealtimeRefresh = (payload?: { data?: { orderId?: string; notificationType?: string } }) => {
      const payloadOrderId = String(payload?.data?.orderId || "");
      const notificationType = String(payload?.data?.notificationType || "");
      const sameOrder = payloadOrderId && payloadOrderId === String(id);
      const relevantType =
        notificationType === "order_delivery_submitted" ||
        notificationType === "order_revision_requested" ||
        notificationType === "order_revision_accepted" ||
        notificationType === "order_revision_declined" ||
        notificationType === "order_revision_cancelled" ||
        notificationType === "order_after_sell_revision_requested" ||
        notificationType === "order_after_sell_revision_accepted" ||
        notificationType === "order_after_sell_revision_declined" ||
        notificationType === "order_after_sell_revision_cancelled" ||
        notificationType === "order_after_sell_revision_completed" ||
        notificationType === "order_paid";

      if (sameOrder || relevantType) {
        void refetchOrder();
      }
    };

    socket.on("notification:new", handleRealtimeRefresh);
    socket.on("chat:conversation:updated", handleRealtimeRefresh);

    return () => {
      socket.off("notification:new", handleRealtimeRefresh);
      socket.off("chat:conversation:updated", handleRealtimeRefresh);
    };
  }, [id, refetchOrder, socket]);

  const progress = useMemo(() => {
    const status = order?.status || "pending";
    if (status === "completed") return 4;
    if (
      ["accepting_delivery", "revision_requested", "under_revision", "after_sell_revision_requested", "under_after_sell_revision"].includes(
        status
      )
    ) {
      return 3;
    }
    if (status === "accepted") return 2;
    return 1;
  }, [order?.status]);

  const personAddress = order && role === "provider" ? order.client.address : undefined;
  const person = role === "provider" ? order?.client : order?.provider;
  const canFinalize = role !== "provider" && order?.status === "accepting_delivery";
  const canRequestAfterSellRevision =
    role !== "provider" &&
    order?.status === "completed" &&
    order?.paymentStatus === "paid" &&
    !["after_sell_revision_requested", "under_after_sell_revision"].includes(order?.status || "");
  const canReview = role !== "provider" && order?.status === "completed" && !order?.clientRating;
  const canCancelRevision =
    role !== "provider" &&
    ["revision_requested", "under_revision", "after_sell_revision_requested", "under_after_sell_revision"].includes(order?.status || "");
  const submitting = requestingRevision;

  const openChat = async () => {
    if (!order || !person) return;
    let conversationId = order.conversationId || "";
    try {
      if (!conversationId) {
        const payload = await ensureConversationByOrder(order.id).unwrap();
        conversationId = payload.data.id;
      }
      router.push({
        pathname: "/chat-details",
        params: {
          conversationId,
          name: person.name,
          avatar: person.avatar || "",
          info: order.orderName,
          blockedBy: "",
          targetUserId: person.id,
        },
      });
    } catch (error) {
      Alert.alert("Chat unavailable", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const finalizeOrder = async () => {
    if (!order) return;
    try {
      const payload = await createCheckoutSession({ id: order.id }).unwrap();
      const nextCheckoutUrl = String(payload.data?.checkoutUrl || "");
      if (!nextCheckoutUrl) {
        Alert.alert("Payment unavailable", "We could not start the payment session right now.");
        return;
      }
      setCheckoutUrl(nextCheckoutUrl);
      setActiveModal("checkout");
    } catch (error) {
      Alert.alert("Payment failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleCheckoutNavigation = async (url?: string) => {
    if (!url || !order || confirmingPayment) return;

    const parsed = Linking.parse(url);
    const sessionId =
      typeof parsed.queryParams?.session_id === "string"
        ? parsed.queryParams.session_id
        : typeof parsed.queryParams?.sessionId === "string"
          ? parsed.queryParams.sessionId
          : "";

    if (!sessionId || sessionId === handledSessionId) return;

    try {
      setConfirmingPayment(true);
      setHandledSessionId(sessionId);
      await confirmCheckoutPayment({ id: order.id, sessionId }).unwrap();
      setActiveModal(null);
      setCheckoutUrl("");
      await clientQuery.refetch();

      if (!order.clientRating) {
        setActiveModal("review");
        Alert.alert("Payment completed", "Payment completed successfully. Please rate your provider.");
      } else {
        Alert.alert("Payment completed", "Your order payment was completed successfully.");
      }
    } catch (error) {
      Alert.alert("Confirmation failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  const requestRevision = async () => {
    if (!order) return;
    if (!revisionText.trim()) {
      Alert.alert("Revision note required", "Please add a short note for the provider.");
      return;
    }
    if (revisionMode === "delivery" && order.status !== "accepting_delivery") {
      Alert.alert("Revision unavailable", "Delivery revision can only be requested while delivery is pending approval.");
      return;
    }
    if (revisionMode === "after_sell" && !(order.status === "completed" && order.paymentStatus === "paid")) {
      Alert.alert("Revision unavailable", "After-sale revision can only be requested after payment is completed.");
      return;
    }
    try {
      await requestClientRevision({ id: order.id, note: revisionText.trim() }).unwrap();
      setActiveModal(null);
      setRevisionText("");
      setRevisionMode("delivery");
      Alert.alert("Sent", revisionMode === "after_sell" ? "After-sale revision request sent." : "Revision request sent.");
      clientQuery.refetch();
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const submitClientReview = async () => {
    if (!order) return;
    if (!rating) {
      Alert.alert("Rating required", "Please select a rating first.");
      return;
    }
    try {
      await submitReview({ id: order.id, rating, review: reviewText.trim() }).unwrap();
      setActiveModal(null);
      Alert.alert("Thanks", "Your review has been submitted.");
      clientQuery.refetch();
    } catch (error) {
      Alert.alert("Review failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const cancelRevision = async () => {
    if (!order) return;
    if (!cancelReason.trim()) {
      Alert.alert("Reason required", "Please share why you are cancelling the revision request.");
      return;
    }
    try {
      await cancelClientRevision(order.id).unwrap();
      setActiveModal(null);
      setCancelReason("");
      setRevisionMode("delivery");
      Alert.alert(
        "Cancelled",
        ["after_sell_revision_requested", "under_after_sell_revision"].includes(order.status)
          ? "After-sale revision request cancelled."
          : "Revision request cancelled."
      );
      clientQuery.refetch();
    } catch (error) {
      Alert.alert("Cancel failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const talkWithProvider = async () => {
    if (!order) return;
    try {
      await sendResolutionMessage({
        id: order.id,
        text: `Resolution discussion for ${order.orderNumber}: ${order.revisionRequestNote || "Please review the latest issue."}`,
      }).unwrap();
      await openChat();
    } catch (error) {
      Alert.alert("Message failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2B84B1" />
      </View>
    );
  }

  if (!order || !person) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-[18px] font-bold text-[#1A2C42] mb-3">Booking not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#2B84B1] px-5 py-3 rounded-[18px]">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCFD]" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center bg-white shadow-sm shadow-black/5 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4">
          <Ionicons name="arrow-back" size={20} color="#1A2C42" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1A2C42] flex-1">Booking Details</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 170 }}>
        <View className="bg-white px-6 py-8 mb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A0AEC0]">{order.orderNumber}</Text>
              <Text className="text-[24px] font-black text-[#1A2C42] mt-2">{order.orderName}</Text>
            </View>
            <View className="bg-[#EAF6ED] px-4 py-2 rounded-full">
              <Text className="text-[12px] font-bold text-[#55A06F] uppercase">{formatStatusLabel(order.status)}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between px-2 mt-4">
            {["Pending", "Accepted", "Working", "Done"].map((step, index) => {
              const active = progress >= index + 1;
              return (
                <View key={step} className="items-center flex-1">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mb-2 border-4 border-white ${active ? "bg-[#55A06F]" : "bg-gray-200"}`}
                  >
                    {active ? <Ionicons name="checkmark" size={16} color="white" /> : null}
                  </View>
                  <Text className={`text-[12px] font-bold ${active ? "text-[#1A2C42]" : "text-[#A0AEC0]"}`}>{step}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="bg-[#1A2C42] rounded-[28px] p-6">
            <Text className="text-white/65 text-[12px] font-bold tracking-[0.18em] uppercase">Price Summary</Text>
            <Text className="text-white text-[34px] font-black mt-3">{formatCurrency(order.paymentAmount || order.packagePrice)}</Text>
            <Text className="text-white/75 text-[14px] mt-1">Includes service charge and platform fee.</Text>
          </View>
        </View>

        <Section title="Service Information">
          <InfoRow icon={<FontAwesome5 name="briefcase" size={20} color="#E89F65" />} label="Category" value={order.categoryName || "General service"} tint="#FEF3EA" />
          <InfoRow icon={<Ionicons name="calendar-outline" size={22} color="#2B84B1" />} label="Schedule" value={`${formatDateLabel(order.scheduledDate)}, ${formatTimeLabel(order.scheduledTime)}`} tint="#EAF3FA" />
          <InfoRow icon={<Ionicons name="location-outline" size={22} color="#A865E8" />} label="Location" value={order.serviceAddress || personAddress || "Location unavailable"} tint="#F3EAFE" />
        </Section>

        <Section title={role === "provider" ? "Client" : "Service Provider"}>
          <View className="flex-row items-center">
            {person.avatar ? (
              <Image source={{ uri: person.avatar }} className="w-[56px] h-[56px] rounded-full mr-4 border border-gray-100" />
            ) : (
              <View className="w-[56px] h-[56px] rounded-full mr-4 bg-[#EAF3FA] items-center justify-center">
                <Ionicons name="person" size={22} color="#2286BE" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-[18px] font-bold text-[#1A2C42] mb-1">{person.name}</Text>
              <Text className="text-[13px] text-[#7C8B95]">{person.phone || personAddress || "Contact info unavailable"}</Text>
            </View>
            <TouchableOpacity onPress={() => void openChat()} className="w-12 h-12 bg-[#EAF3FA] rounded-full items-center justify-center">
              <Ionicons name="chatbubble-ellipses" size={22} color="#2B84B1" />
            </TouchableOpacity>
          </View>
        </Section>

        {(order.deliveryNote || (order.deliveryImages || []).length) ? (
          <Section title="Delivery">
            {order.deliveryNote ? <Text className="text-[15px] text-[#1A2C42] leading-[22px] mb-4">{order.deliveryNote}</Text> : null}
            {(order.deliveryImages || []).map((image: string) => (
              <Image key={image} source={{ uri: image }} className="w-full h-[180px] rounded-[20px] mb-3 bg-slate-100" />
            ))}
          </Section>
        ) : null}

        {canCancelRevision ? (
          <View className="px-6 mb-6">
            <View className="bg-red-50 border border-red-100 rounded-[24px] p-5">
              <Text className="text-[14px] font-bold tracking-[0.18em] uppercase text-red-500 mb-3">Resolution Center</Text>
              <Text className="text-[15px] leading-[22px] text-red-800">
                This booking is currently in a revision flow. You can talk with the provider or cancel the active revision request.
              </Text>
              <View className="flex-row mt-5">
                <TouchableOpacity
                  onPress={() => void talkWithProvider()}
                  disabled={sendingResolution}
                  className="flex-1 mr-3 bg-white rounded-[18px] py-4 items-center"
                >
                  {sendingResolution ? <ActivityIndicator color="#1A2C42" /> : <Text className="font-bold text-[#1A2C42]">Talk With Provider</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveModal("cancel")} className="flex-1 bg-red-600 rounded-[18px] py-4 items-center">
                  <Text className="font-bold text-white">Cancel Revision</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        <View className="px-6 mb-8">
          <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">Price Details</Text>
          <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5">
            <View className="flex-row justify-between mb-4">
              <Text className="text-[15px] font-medium text-[#7C8B95]">Service Charge</Text>
              <Text className="text-[16px] font-bold text-[#1A2C42]">{formatCurrency(order.packagePrice)}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-[15px] font-medium text-[#7C8B95]">Platform Fee</Text>
              <Text className="text-[16px] font-bold text-[#1A2C42]">{formatCurrency(order.paymentAmount ? order.paymentAmount - order.packagePrice : 0)}</Text>
            </View>
            <View className="h-[1px] bg-gray-100 my-2" />
            <View className="flex-row justify-between mt-2">
              <Text className="text-[18px] font-bold text-[#1A2C42]">Total</Text>
              <Text className="text-[22px] font-black text-[#2B84B1]">{formatCurrency(order.paymentAmount || order.packagePrice)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white px-6 pt-4 pb-10 border-t border-gray-100">
        {role === "provider" ? (
          <View className="flex-row">
            <TouchableOpacity onPress={() => void openChat()} className="bg-[#EAF3FA] flex-1 py-5 rounded-[18px] mr-4 items-center">
              <Text className="text-[#2B84B1] font-bold text-[17px]">Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(provider)/deliver-order", params: { id: order.id } } as never)}
              className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center"
            >
              <Text className="text-white font-bold text-[17px]">Deliver</Text>
            </TouchableOpacity>
          </View>
        ) : canFinalize ? (
          <>
            <View className="flex-row mb-3">
              <TouchableOpacity onPress={() => void openChat()} className="bg-[#EAF3FA] flex-1 py-5 rounded-[18px] mr-4 items-center">
                <Text className="text-[#2B84B1] font-bold text-[17px]">Message</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveModal("revision")} className="bg-[#F8FAFC] border border-[#D8E3EC] flex-1 py-5 rounded-[18px] items-center">
                <Text className="text-[#1A2C42] font-bold text-[17px]">Request Revision</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => void finalizeOrder()} disabled={submitting || creatingCheckout} className="bg-[#2B84B1] py-5 rounded-[18px] items-center">
              {creatingCheckout ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[17px]">Pay Now</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <View className="flex-row">
            <TouchableOpacity onPress={() => void openChat()} className="bg-[#EAF3FA] flex-1 py-5 rounded-[18px] mr-4 items-center">
              <Text className="text-[#2B84B1] font-bold text-[17px]">Message</Text>
            </TouchableOpacity>
            {canRequestAfterSellRevision ? (
              <TouchableOpacity
                onPress={() => {
                  setRevisionMode("after_sell");
                  setActiveModal("revision");
                }}
                className="bg-[#F59E0B] flex-1 py-5 rounded-[18px] items-center"
              >
                <Text className="text-white font-bold text-[17px]">After-Sale Revision</Text>
              </TouchableOpacity>
            ) : canReview ? (
              <TouchableOpacity onPress={() => setActiveModal("review")} className="bg-[#2B84B1] flex-1 py-5 rounded-[18px] items-center">
                <Text className="text-white font-bold text-[17px]">Leave Review</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.push("/resolution-center" as never)} className="bg-gray-200 flex-1 py-5 rounded-[18px] items-center">
                <Text className="text-[#1A2C42] font-bold text-[17px]">Resolution Center</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Modal visible={activeModal === "revision"} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0} className="flex-1">
            <BottomSheet
              title={revisionMode === "after_sell" ? "Request After-Sale Revision" : "Request Revision"}
              onClose={() => {
                setActiveModal(null);
                setRevisionMode("delivery");
              }}
            >
              <Text className="text-[14px] leading-[22px] text-[#7C8B95] mb-4">
                {revisionMode === "after_sell"
                  ? "Describe what still needs to be adjusted after the order has already been completed."
                  : "Describe what needs to be adjusted so the provider can respond clearly."}
              </Text>
              <TextInput
                value={revisionText}
                onChangeText={setRevisionText}
                placeholder={
                  revisionMode === "after_sell"
                    ? "Describe the follow-up changes you still need..."
                    : "Describe the changes you need..."
                }
                multiline
                textAlignVertical="top"
                className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42] min-h-[140px]"
              />
              <TouchableOpacity onPress={() => void requestRevision()} disabled={requestingRevision} className="bg-[#2B84B1] mt-5 py-4 rounded-[18px] items-center">
                {requestingRevision ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-[16px]">
                    {revisionMode === "after_sell" ? "Send After-Sale Revision" : "Send Revision Request"}
                  </Text>
                )}
              </TouchableOpacity>
            </BottomSheet>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={activeModal === "review"} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0} className="flex-1">
            <BottomSheet title="Rate Your Provider" onClose={() => setActiveModal(null)}>
              <View className="flex-row justify-center mb-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <TouchableOpacity key={item} onPress={() => setRating(item)} className="mx-1">
                    <Ionicons name={item <= rating ? "star" : "star-outline"} size={34} color="#F59E0B" />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Share your feedback..."
                multiline
                textAlignVertical="top"
                className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42] min-h-[120px]"
              />
              <TouchableOpacity onPress={() => void submitClientReview()} disabled={submittingReview} className="bg-[#2B84B1] mt-5 py-4 rounded-[18px] items-center">
                {submittingReview ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Submit Review</Text>}
              </TouchableOpacity>
            </BottomSheet>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={activeModal === "cancel"} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0} className="flex-1">
            <BottomSheet title="Cancel Revision Request" onClose={() => setActiveModal(null)}>
              <Text className="text-[14px] leading-[22px] text-[#7C8B95] mb-4">
                Share why you want to cancel this revision request. The order itself will remain active.
              </Text>
              <TextInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Reason for cancelling..."
                multiline
                textAlignVertical="top"
                className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42] min-h-[120px]"
              />
              <TouchableOpacity onPress={() => void cancelRevision()} disabled={cancellingRevision} className="bg-red-600 mt-5 py-4 rounded-[18px] items-center">
                {cancellingRevision ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Cancel Revision</Text>}
              </TouchableOpacity>
            </BottomSheet>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={activeModal === "checkout"} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
            <TouchableOpacity
              onPress={() => {
                setActiveModal(null);
                setCheckoutUrl("");
              }}
              className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4"
            >
              <Ionicons name="close" size={20} color="#1A2C42" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-[20px] font-bold text-[#1A2C42]">Secure Payment</Text>
              <Text className="text-[13px] text-[#7C8B95] mt-1">Complete your Stripe checkout to finish this order.</Text>
            </View>
          </View>

          {checkoutUrl ? (
            <View className="flex-1">
              <WebView
                source={{ uri: checkoutUrl }}
                onNavigationStateChange={(state) => {
                  void handleCheckoutNavigation(state.url);
                }}
                startInLoadingState
                renderLoading={() => (
                  <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#2B84B1" />
                    <Text className="text-[#7C8B95] text-[14px] font-medium mt-4">Loading secure checkout...</Text>
                  </View>
                )}
              />
              {(confirmingPayment || confirmingCheckout) ? (
                <View className="absolute inset-x-0 bottom-0 px-6 py-5 bg-white/95 border-t border-gray-100">
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#2B84B1" />
                    <Text className="text-[#1A2C42] font-bold ml-3">Confirming payment...</Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-[18px] font-bold text-[#1A2C42] text-center">Checkout link unavailable</Text>
              <Text className="text-[14px] text-[#7C8B95] text-center mt-2">Please try starting the payment again.</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="px-6 mb-6">
      <Text className="text-[14px] font-bold tracking-widest text-[#A0AEC0] uppercase mb-4 ml-2">{title}</Text>
      <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5">{children}</View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View className="flex-row items-center mb-6 last:mb-0">
      <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: tint }}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[13px] text-[#7C8B95] font-medium mb-0.5">{label}</Text>
        <Text className="text-[16px] font-bold text-[#1A2C42]">{value}</Text>
      </View>
    </View>
  );
}

function BottomSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <View className="flex-1 justify-end bg-black/35">
      <View className="bg-white rounded-t-[32px] px-6 pt-6 pb-10">
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-[22px] font-bold text-[#1A2C42]">{title}</Text>
          <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="close" size={20} color="#1A2C42" />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </View>
  );
}
