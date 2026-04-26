import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  type MediaStream,
  mediaDevices,
  registerGlobals,
} from "react-native-webrtc";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { useSocketNotifications } from "@/src/contexts/SocketContext";
import {
  useBlockConversationUserMutation,
  useClearConversationHistoryMutation,
  useCreateCustomOrderProposalMutation,
  useEnsureConversationByOrderMutation,
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useMarkConversationMessagesAsReadMutation,
  useRespondToCustomOrderProposalMutation,
  useSendConversationMessageMutation,
  useUnblockConversationUserMutation,
} from "@/src/store/services/apiSlice";
import type { ChatMessage, ConversationSummary } from "@/src/types/api";

registerGlobals();

type AttachmentAsset = {
  uri: string;
  name: string;
  type: string;
};

type CallType = "voice" | "video";
type CallStatus = "idle" | "ringing" | "connecting" | "active";

type CallInvitePayload = {
  conversationId: string;
  targetUserId?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  callType: CallType;
  offer?: RTCSessionDescriptionInit;
};

type CallSignalPayload = {
  conversationId: string;
  targetUserId?: string;
  senderId?: string;
  signalType?: "offer" | "answer" | "candidate";
  signal?: RTCSessionDescriptionInit | RTCIceCandidateInit;
  callType?: CallType;
};

type ActiveCallRef = {
  conversationId: string;
  targetUserId: string;
  callType: CallType;
};

const createPeerConnection = () =>
  new RTCPeerConnection({
    iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
  });

const formatCallDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
};

export default function ChatDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocketNotifications();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId?: string;
    orderId?: string;
    sourceOrderId?: string;
    proposalType?: string;
    name?: string;
    avatar?: string;
    info?: string;
    blockedBy?: string;
    targetUserId?: string;
  }>();

  const readParam = (value?: string | string[]) => {
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const activeCallRef = useRef<ActiveCallRef | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachmentAssets, setAttachmentAssets] = useState<AttachmentAsset[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockedBy, setBlockedBy] = useState<string | null>(null);
  const [resolvedConversationId, setResolvedConversationId] = useState("");
  const [showProposalComposer, setShowProposalComposer] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalAddress, setProposalAddress] = useState("");
  const [proposalDate, setProposalDate] = useState("");
  const [proposalTime, setProposalTime] = useState("");

  const [activeCall, setActiveCall] = useState<CallType | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallInvitePayload | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callError, setCallError] = useState("");
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);
  const [ensureConversationByOrder, { isLoading: ensuringConversation }] =
    useEnsureConversationByOrderMutation();
  const { data: conversationsPayload } = useGetConversationsQuery();
  const [createCustomOrderProposal, { isLoading: creatingProposal }] = useCreateCustomOrderProposalMutation();
  const [respondToCustomOrderProposal, { isLoading: respondingProposal }] = useRespondToCustomOrderProposalMutation();

  const conversationIdParam = readParam(params.conversationId);
  const orderId = readParam(params.orderId);
  const sourceOrderIdParam = readParam(params.sourceOrderId);
  const proposalTypeParam = readParam(params.proposalType);
  const name = readParam(params.name) || "User";
  const avatar = readParam(params.avatar);
  const info = readParam(params.info);
  const blockedByParam = readParam(params.blockedBy);
  const targetUserIdParam = readParam(params.targetUserId);
  const conversationId = resolvedConversationId || conversationIdParam;
  const conversations = useMemo(() => conversationsPayload?.data || [], [conversationsPayload]);
  const selectedConversation = useMemo(
    () => (conversations as ConversationSummary[]).find((item) => item.id === conversationId) || null,
    [conversationId, conversations]
  );
  const selectedGigId = String(selectedConversation?.gigId || "");

  const { data, isLoading } = useGetConversationMessagesQuery(
    { conversationId, page: 1, limit: 100 },
    { skip: !conversationId }
  );
  const [markRead] = useMarkConversationMessagesAsReadMutation();
  const [sendMessage, { isLoading: sending }] = useSendConversationMessageMutation();
  const [clearHistory, { isLoading: clearingHistory }] = useClearConversationHistoryMutation();
  const [blockUser, { isLoading: blockingUser }] = useBlockConversationUserMutation();
  const [unblockUser, { isLoading: unblockingUser }] = useUnblockConversationUserMutation();

  const initialMessages = useMemo(() => data?.data.items || [], [data]);
  const displayAvatar = typeof avatar === "string" ? avatar : "";
  const targetUserId = typeof targetUserIdParam === "string" ? targetUserIdParam : "";
  const isBlockedByMe = Boolean(blockedBy && blockedBy === user?.id);
  const isBlockedByOther = Boolean(blockedBy && blockedBy !== user?.id);
  const canSend = !blockedBy;
  const repeatSourceOrderId =
    sourceOrderIdParam ||
    (selectedConversation?.orderStatus === "completed" && selectedConversation?.orderId
      ? String(selectedConversation.orderId)
      : "");
  const isRepeatProposalMode = proposalTypeParam === "repeat_order" || Boolean(repeatSourceOrderId);
  const canCreateProposal =
    user?.role === "provider" &&
    Boolean(conversationId);
  const canCreateCustomProposal = canCreateProposal && !selectedConversation?.orderId;
  const canCreateRepeatProposal = canCreateProposal && Boolean(repeatSourceOrderId);
  const canOpenProposalComposer = canCreateCustomProposal || canCreateRepeatProposal;
  const callDurationLabel = useMemo(() => formatCallDuration(callSeconds), [callSeconds]);
  const callModalVisible = Boolean(activeCall || incomingCall);
  const callTitle =
    incomingCall && callStatus === "ringing"
      ? `${incomingCall.senderName || "Incoming caller"}`
      : typeof name === "string"
        ? name
        : "User";

  useEffect(() => {
    setResolvedConversationId(conversationIdParam);
  }, [conversationIdParam]);

  useEffect(() => {
    if (conversationIdParam || !orderId) return;

    let active = true;
    void ensureConversationByOrder(orderId)
      .unwrap()
      .then((payload) => {
        if (!active) return;
        const nextConversationId = String(payload.data?.id || "");
        if (nextConversationId) {
          setResolvedConversationId(nextConversationId);
        }
      })
      .catch(() => {
        if (!active) return;
        Alert.alert("Chat unavailable", "We could not load the conversation history for this order.");
      });

    return () => {
      active = false;
    };
  }, [conversationIdParam, ensureConversationByOrder, orderId]);

  useEffect(() => {
    setMessages(initialMessages);
    if (conversationId) {
      void markRead(conversationId);
    }
  }, [conversationId, initialMessages, markRead]);

  useEffect(() => {
    setBlockedBy(blockedByParam ? String(blockedByParam) : null);
  }, [blockedByParam]);

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  const stopStream = useCallback((stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  }, []);

  const resetCallState = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    stopStream(localStreamRef.current);
    stopStream(remoteStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    activeCallRef.current = null;
    setLocalStreamUrl(null);
    setRemoteStreamUrl(null);
    setIncomingCall(null);
    setActiveCall(null);
    setCallStatus("idle");
    setCallStartedAt(null);
    setCallSeconds(0);
    setCallError("");
  }, [stopStream]);

  const cleanupCall = useCallback(
    (shouldNotifyPeer = false) => {
      const call = activeCallRef.current;
      if (shouldNotifyPeer && socket && call) {
        socket.emit("call:end", {
          conversationId: call.conversationId,
          targetUserId: call.targetUserId,
          callType: call.callType,
        });
      }
      resetCallState();
    },
    [resetCallState, socket]
  );

  useEffect(() => () => cleanupCall(false), [cleanupCall]);

  useEffect(() => {
    if (callStatus !== "active" || !callStartedAt) return;
    const timer = setInterval(() => {
      setCallSeconds(Math.floor((Date.now() - callStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [callStartedAt, callStatus]);

  const requestCallPermissions = useCallback(async (callType: CallType) => {
    if (Platform.OS !== "android") return true;

    const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
    if (callType === "video") {
      permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
    }

    const result = await PermissionsAndroid.requestMultiple(permissions);
    return permissions.every((permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED);
  }, []);

  const attachPeerListeners = useCallback(
    (peer: RTCPeerConnection, callType: CallType) => {
      peer.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) return;
        remoteStreamRef.current = stream;
        setRemoteStreamUrl(stream.toURL());
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate || !socket || !activeCallRef.current) return;
        socket.emit("call:signal", {
          conversationId: activeCallRef.current.conversationId,
          targetUserId: activeCallRef.current.targetUserId,
          signalType: "candidate",
          signal: event.candidate.toJSON(),
          callType,
        });
      };
    },
    [socket]
  );

  const createLocalStream = useCallback(
    async (callType: CallType) => {
      const granted = await requestCallPermissions(callType);
      if (!granted) {
        throw new Error("Microphone or camera permission was denied.");
      }

      try {
        return await mediaDevices.getUserMedia({
          audio: true,
          video:
            callType === "video"
              ? {
                  facingMode: "user",
                  frameRate: 30,
                }
              : false,
        });
      } catch (error) {
        if (callType === "video") {
          return mediaDevices.getUserMedia({ audio: true, video: false });
        }
        throw error;
      }
    },
    [requestCallPermissions]
  );

  const startOutgoingCall = useCallback(
    async (callType: CallType) => {
      if (!conversationId || !targetUserId || !socket) {
        Alert.alert("Call unavailable", "We could not find the other participant for this chat yet.");
        return;
      }

      try {
        resetCallState();
        setActiveCall(callType);
        setCallStatus("connecting");

        const stream = await createLocalStream(callType);
        localStreamRef.current = stream;
        setLocalStreamUrl(stream.toURL());

        const peer = createPeerConnection();
        peerRef.current = peer;
        activeCallRef.current = {
          conversationId,
          targetUserId,
          callType,
        };

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        attachPeerListeners(peer, callType);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("call:invite", {
          conversationId,
          targetUserId,
          callType,
          offer,
          senderName:
            user?.firstName || user?.lastName
              ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
              : user?.email || "User",
          senderAvatar: user?.avatar || "",
        } satisfies CallInvitePayload);

        setCallStatus("ringing");
      } catch (error) {
        resetCallState();
        const message = error instanceof Error ? error.message : "Could not start the call.";
        setCallError(message);
        Alert.alert("Call failed", message);
      }
    },
    [attachPeerListeners, conversationId, createLocalStream, resetCallState, socket, targetUserId, user?.avatar, user?.email, user?.firstName, user?.lastName]
  );

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall || !socket) return;

    const nextTargetUserId = incomingCall.senderId || "";
    if (!incomingCall.conversationId || !nextTargetUserId) {
      Alert.alert("Call unavailable", "This incoming call is missing participant details.");
      return;
    }

    try {
      resetCallState();
      setIncomingCall(incomingCall);
      setActiveCall(incomingCall.callType);
      setCallStatus("connecting");

      const stream = await createLocalStream(incomingCall.callType);
      localStreamRef.current = stream;
      setLocalStreamUrl(stream.toURL());

      const peer = createPeerConnection();
      peerRef.current = peer;
      activeCallRef.current = {
        conversationId: incomingCall.conversationId,
        targetUserId: nextTargetUserId,
        callType: incomingCall.callType,
      };

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      attachPeerListeners(peer, incomingCall.callType);

      if (incomingCall.offer) {
        await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call:signal", {
        conversationId: incomingCall.conversationId,
        targetUserId: nextTargetUserId,
        signalType: "answer",
        signal: answer,
        callType: incomingCall.callType,
      } satisfies CallSignalPayload);

      setIncomingCall(null);
      setCallStatus("active");
      setCallStartedAt(Date.now());
      setCallSeconds(0);
    } catch (error) {
      resetCallState();
      const message = error instanceof Error ? error.message : "Could not join the call.";
      setCallError(message);
      Alert.alert("Call failed", message);
    }
  }, [attachPeerListeners, createLocalStream, incomingCall, resetCallState, socket]);

  const declineIncomingCall = useCallback(() => {
    if (socket && incomingCall?.senderId) {
      socket.emit("call:end", {
        conversationId: incomingCall.conversationId,
        targetUserId: incomingCall.senderId,
        callType: incomingCall.callType,
      });
    }
    resetCallState();
  }, [incomingCall, resetCallState, socket]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (payload: ChatMessage) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((current) => {
        if (current.some((message) => message.id === payload.id)) return current;
        return [...current, payload];
      });
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
    };

    socket.on("chat:message:new", handleNewMessage);
    return () => {
      socket.off("chat:message:new", handleNewMessage);
    };
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleInvite = (payload: CallInvitePayload) => {
      const isRelevantConversation =
        payload.conversationId === conversationId ||
        (payload.senderId && payload.senderId === targetUserId);

      if (!isRelevantConversation) return;
      resetCallState();
      setIncomingCall(payload);
      setActiveCall(payload.callType);
      setCallStatus("ringing");
    };

    const handleSignal = async (payload: CallSignalPayload) => {
      const isSameConversation =
        payload.conversationId === activeCallRef.current?.conversationId ||
        payload.conversationId === incomingCall?.conversationId;

      if (!isSameConversation || !payload.signalType || !payload.signal) return;

      if (payload.signalType === "answer") {
        if (!peerRef.current) return;
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(payload.signal as RTCSessionDescriptionInit)
        );
        setCallStatus("active");
        setCallStartedAt(Date.now());
        setCallSeconds(0);
        return;
      }

      if (payload.signalType === "candidate") {
        if (!peerRef.current) return;
        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(payload.signal as RTCIceCandidateInit)
          );
        } catch {
          // Ignore late ICE candidates after teardown.
        }
        return;
      }

      if (payload.signalType === "offer") {
        setIncomingCall((current) => ({
          ...(current || {
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            senderName: typeof name === "string" ? name : "User",
            senderAvatar: displayAvatar,
            callType: payload.callType || "voice",
          }),
          offer: payload.signal as RTCSessionDescriptionInit,
        }));
      }
    };

    const handleEnd = (payload: CallSignalPayload) => {
      const isCurrentConversation =
        payload.conversationId === activeCallRef.current?.conversationId ||
        payload.conversationId === incomingCall?.conversationId;

      if (!isCurrentConversation) return;
      resetCallState();
    };

    socket.on("call:invite", handleInvite);
    socket.on("call:signal", handleSignal);
    socket.on("call:end", handleEnd);

    return () => {
      socket.off("call:invite", handleInvite);
      socket.off("call:signal", handleSignal);
      socket.off("call:end", handleEnd);
    };
  }, [conversationId, displayAvatar, incomingCall?.conversationId, name, resetCallState, socket, targetUserId]);

  const handlePickAttachments = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to attach images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.8,
    });

    if (result.canceled) return;

    setAttachmentAssets((current) => {
      const next = [...current];
      result.assets.slice(0, Math.max(0, 4 - current.length)).forEach((asset, index) => {
        next.push({
          uri: asset.uri,
          name: asset.fileName || `attachment-${Date.now()}-${index + 1}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
      });
      return next.slice(0, 4);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachmentAssets.length) || !conversationId || !canSend) return;
    const formData = new FormData();
    formData.append("text", input.trim());
    attachmentAssets.forEach((asset) => {
      formData.append("attachments", {
        uri: asset.uri,
        name: asset.name,
        type: asset.type,
      } as never);
    });

    try {
      const payload = await sendMessage({ conversationId, formData }).unwrap();
      setMessages((current) => {
        if (current.some((message) => message.id === payload.data.id)) return current;
        return [...current, payload.data];
      });
      setInput("");
      setAttachmentAssets([]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // Keep the current composer state if sending fails.
    }
  };

  const handleClearHistory = async () => {
    if (!conversationId) return;
    try {
      await clearHistory(conversationId).unwrap();
      setMessages([]);
      setMenuOpen(false);
    } catch (error) {
      Alert.alert("Could not clear chat", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleToggleBlock = async () => {
    if (!conversationId) return;
    try {
      if (isBlockedByMe) {
        const payload = await unblockUser(conversationId).unwrap();
        setBlockedBy(payload.data.blockedBy || null);
      } else {
        const payload = await blockUser(conversationId).unwrap();
        setBlockedBy(payload.data.blockedBy || user?.id || "me");
      }
      setMenuOpen(false);
    } catch (error) {
      Alert.alert(
        "Could not update block status",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const resetProposalComposer = () => {
    setProposalTitle("");
    setProposalDescription("");
    setProposalPrice("");
    setProposalAddress("");
    setProposalDate("");
    setProposalTime("");
    setShowProposalComposer(false);
  };

  const handleCreateProposal = async () => {
    const numericPrice = Number(proposalPrice);
    if (!canOpenProposalComposer || !proposalTitle.trim() || !proposalAddress.trim() || !proposalDate || !proposalTime || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert("Missing fields", `Complete all ${isRepeatProposalMode ? "repeat order" : "custom order"} fields first.`);
      return;
    }

    try {
      const payload = await createCustomOrderProposal({
        conversationId,
        gigId: selectedGigId || undefined,
        proposalType: isRepeatProposalMode ? "repeat_order" : "custom",
        sourceOrderId: repeatSourceOrderId || undefined,
        title: proposalTitle.trim(),
        description: proposalDescription.trim(),
        price: numericPrice,
        serviceAddress: proposalAddress.trim(),
        scheduledDate: proposalDate,
        scheduledTime: proposalTime,
      }).unwrap();
      setMessages((current) => {
        if (current.some((message) => message.id === payload.data.id)) return current;
        return [...current, payload.data];
      });
      resetProposalComposer();
    } catch (error) {
      Alert.alert("Could not send request", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleRespondProposal = async (proposalId: string, action: "accept" | "decline") => {
    try {
      const payload = await respondToCustomOrderProposal({ proposalId, action }).unwrap();
      const proposalType = payload.data?.message?.customOrderProposal?.proposalType || "custom";
      if (payload.data?.message) {
        setMessages((current) => {
          if (current.some((message) => message.id === payload.data.message.id)) return current;
          return [...current, payload.data.message];
        });
      }
      Alert.alert(
        action === "accept" ? "Accepted" : "Declined",
        action === "accept"
          ? proposalType === "repeat_order"
            ? "Repeat order started."
            : "Custom order started."
          : proposalType === "repeat_order"
            ? "Repeat order request declined."
            : "Custom order request declined."
      );
    } catch (error) {
      Alert.alert("Could not update request", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          zIndex: 10,
        }}
        className="bg-white rounded-b-[40px] px-6"
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4 pt-2">
          <Ionicons name="arrow-back" size={24} color="#2286BE" />
          <Text className="text-[#2286BE] font-bold text-[18px] ml-2">Go Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-between pb-2">
          <View className="flex-row items-center flex-1 pr-4">
            <Image
              source={{ uri: displayAvatar || "https://i.pravatar.cc/150?u=guest" }}
              className="w-[52px] h-[52px] rounded-full mr-4"
            />
            <View className="flex-1">
              <Text className="text-[20px] font-bold text-[#2286BE]" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-[14px] font-medium text-[#7C8B95] mt-1" numberOfLines={1}>
                {info}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => void startOutgoingCall("voice")}
              className="w-11 h-11 rounded-full bg-[#EAF3FA] items-center justify-center mr-2"
            >
              <Ionicons name="call" size={20} color="#2286BE" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void startOutgoingCall("video")}
              className="w-11 h-11 rounded-full bg-[#EAF3FA] items-center justify-center mr-2"
            >
              <Ionicons name="videocam" size={21} color="#2286BE" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              className="w-11 h-11 rounded-full bg-[#F8FAFC] items-center justify-center"
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#1A2C42" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        {ensuringConversation || (!conversationId && orderId) ? (
          <View className="flex-1 items-center justify-center px-8">
            <ActivityIndicator size="large" color="#2286BE" />
            <Text className="text-[#7C8B95] text-[14px] font-medium mt-4 text-center">
              Loading your conversation history...
            </Text>
          </View>
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2286BE" />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-6 pt-6"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {!messages.length ? (
              <View className="items-center justify-center px-8 py-20">
                <View className="w-16 h-16 rounded-full bg-[#EAF3FA] items-center justify-center mb-5">
                  <Ionicons name="chatbubble-ellipses-outline" size={28} color="#2286BE" />
                </View>
                <Text className="text-[20px] font-bold text-[#1A2C42] text-center">
                  No chat history yet
                </Text>
                <Text className="text-[14px] text-[#7C8B95] text-center mt-2 leading-6">
                  Previous messages will appear here as soon as this conversation has activity.
                </Text>
              </View>
            ) : null}
            {messages.map((item) => {
              const isMe = item.senderId === user?.id;
              return (
                <View
                  key={item.id}
                  className={`flex-row mb-8 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <Image
                      source={{ uri: displayAvatar || "https://i.pravatar.cc/150?u=guest" }}
                      className="w-8 h-8 rounded-full mr-3 mt-1"
                    />
                  )}
                  <View className="max-w-[75%]">
                    <View
                      style={{
                        borderBottomLeftRadius: isMe ? 20 : 4,
                        borderBottomRightRadius: isMe ? 4 : 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                      }}
                      className={`px-5 py-4 ${isMe ? "bg-[#2286BE]" : "bg-white border border-[#F2F2F2]"}`}
                    >
                      {item.text ? (
                        <Text
                          className={`text-[15px] leading-[22px] font-medium ${isMe ? "text-white" : "text-[#4A5568]"}`}
                        >
                          {item.text}
                        </Text>
                      ) : null}
                      {item.customOrderProposal ? (
                        <View className={`mt-3 rounded-[20px] border px-4 py-4 ${isMe ? "border-white/20 bg-white/10" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                          <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-3">
                              <Text className={`text-[11px] font-bold uppercase tracking-[2px] ${isMe ? "text-white/70" : "text-[#2286BE]"}`}>
                                {item.customOrderProposal.proposalType === "repeat_order" ? "Repeat Order" : "Custom Order"}
                              </Text>
                              <Text className={`text-[16px] font-bold mt-2 ${isMe ? "text-white" : "text-[#1A2C42]"}`}>
                                {item.customOrderProposal.title}
                              </Text>
                            </View>
                            <View className={`rounded-full px-3 py-1 ${
                              item.customOrderProposal.status === "accepted"
                                ? "bg-emerald-100"
                                : item.customOrderProposal.status === "declined"
                                  ? "bg-rose-100"
                                  : "bg-amber-100"
                            }`}>
                              <Text className={`text-[10px] font-bold uppercase ${
                                item.customOrderProposal.status === "accepted"
                                  ? "text-emerald-700"
                                  : item.customOrderProposal.status === "declined"
                                    ? "text-rose-700"
                                    : "text-amber-700"
                              }`}>
                                {item.customOrderProposal.status}
                              </Text>
                            </View>
                          </View>
                          {item.customOrderProposal.description ? (
                            <Text className={`text-[14px] leading-[21px] mt-3 ${isMe ? "text-white/85" : "text-[#5F7182]"}`}>
                              {item.customOrderProposal.description}
                            </Text>
                          ) : null}
                          <Text className={`text-[14px] font-bold mt-3 ${isMe ? "text-white" : "text-[#1A2C42]"}`}>
                            ${Number(item.customOrderProposal.price || 0).toFixed(2)}
                          </Text>
                          <Text className={`text-[13px] font-medium mt-1 ${isMe ? "text-white/80" : "text-[#5F7182]"}`}>
                            {item.customOrderProposal.scheduledTime} • {item.customOrderProposal.serviceAddress}
                          </Text>
                          {!isMe && user?.role === "client" && item.customOrderProposal.status === "pending" ? (
                            <View className="flex-row mt-4">
                              <TouchableOpacity
                                onPress={() => void handleRespondProposal(item.customOrderProposal!.id, "accept")}
                                disabled={respondingProposal}
                                className="flex-1 bg-[#2286BE] rounded-[16px] py-3 items-center mr-2"
                              >
                                <Text className="text-white font-bold">Accept</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => void handleRespondProposal(item.customOrderProposal!.id, "decline")}
                                disabled={respondingProposal}
                                className="flex-1 bg-white border border-[#CBD5E1] rounded-[16px] py-3 items-center"
                              >
                                <Text className="text-[#1A2C42] font-bold">Decline</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                      {Array.isArray(item.attachments) && item.attachments.length > 0 ? (
                        <View className={item.text ? "mt-3" : ""}>
                          {item.attachments.map((attachment, index) => {
                            const isImage = String(attachment.mimeType || "").startsWith("image/");
                            return isImage ? (
                              <Image
                                key={`${item.id}-${index}`}
                                source={{ uri: attachment.url }}
                                className="w-[180px] h-[140px] rounded-[16px] mb-2 bg-slate-100"
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                key={`${item.id}-${index}`}
                                className={`rounded-[14px] px-3 py-3 mb-2 ${isMe ? "bg-white/10" : "bg-[#F8FAFC]"}`}
                              >
                                <Text
                                  className={`text-[13px] font-bold ${isMe ? "text-white" : "text-[#1A2C42]"}`}
                                >
                                  {attachment.fileName || "Attachment"}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : null}
                      <Text
                        className={`text-[12px] mt-2 font-medium ${isMe ? "text-white/70" : "text-[#7C8B95]"}`}
                      >
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {isBlockedByOther ? (
              <View className="rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4 mb-6">
                <Text className="text-[14px] font-bold text-amber-800">
                  You can no longer send messages to this user.
                </Text>
              </View>
            ) : null}

            <View className="h-4" />
            <View style={{ height: insets.bottom + 12 }} />
          </ScrollView>
        )}

        {attachmentAssets.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="px-6 py-3 bg-white border-t border-[#F2F2F2]"
          >
            {attachmentAssets.map((asset) => (
              <View key={asset.uri} className="mr-3 relative">
                <Image
                  source={{ uri: asset.uri }}
                  className="w-[74px] h-[74px] rounded-[18px] bg-slate-100"
                />
                <TouchableOpacity
                  onPress={() =>
                    setAttachmentAssets((current) =>
                      current.filter((item) => item.uri !== asset.uri)
                    )
                  }
                  className="absolute -top-1 -right-1 bg-[#1A2C42] rounded-full"
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {canOpenProposalComposer && showProposalComposer ? (
          <View className="bg-white border-t border-[#F2F2F2] px-6 py-4">
            <Text className="text-[12px] font-bold uppercase tracking-[2px] text-[#2286BE] mb-3">
              {isRepeatProposalMode ? "Create Repeat Order" : "Create Custom Order"}
            </Text>
            <TextInput value={proposalTitle} onChangeText={setProposalTitle} placeholder="Order title" placeholderTextColor="#7C8B95" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] mb-3 text-[#1A2C42]" />
            <TextInput value={proposalPrice} onChangeText={setProposalPrice} keyboardType="decimal-pad" placeholder="Price" placeholderTextColor="#7C8B95" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] mb-3 text-[#1A2C42]" />
            <TextInput value={proposalAddress} onChangeText={setProposalAddress} placeholder="Service address" placeholderTextColor="#7C8B95" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] mb-3 text-[#1A2C42]" />
            <View className="flex-row mb-3">
              <TextInput value={proposalDate} onChangeText={setProposalDate} placeholder="YYYY-MM-DD" placeholderTextColor="#7C8B95" className="flex-1 bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] mr-3 text-[#1A2C42]" />
              <TextInput value={proposalTime} onChangeText={setProposalTime} placeholder="14:00" placeholderTextColor="#7C8B95" className="flex-1 bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] text-[#1A2C42]" />
            </View>
            <TextInput value={proposalDescription} onChangeText={setProposalDescription} multiline textAlignVertical="top" placeholder={isRepeatProposalMode ? "Describe the updated repeat order details" : "Describe the custom work"} placeholderTextColor="#7C8B95" className="bg-[#F8FAFC] rounded-[18px] px-4 py-4 text-[15px] min-h-[88px] text-[#1A2C42]" />
            <View className="flex-row mt-4">
              <TouchableOpacity onPress={() => void handleCreateProposal()} disabled={creatingProposal} className="flex-1 bg-[#2286BE] rounded-[18px] py-4 items-center mr-3">
                {creatingProposal ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">{isRepeatProposalMode ? "Send Offer" : "Send Request"}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={resetProposalComposer} className="px-5 rounded-[18px] border border-[#CBD5E1] items-center justify-center">
                <Text className="text-[#1A2C42] font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 10,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: Math.max(insets.bottom + 12, 24),
          }}
          className="bg-white px-6 pt-4 border-t border-[#F2F2F2] flex-row items-center"
        >
          {canOpenProposalComposer ? (
            <TouchableOpacity
              onPress={() => setShowProposalComposer((current) => !current)}
              className="mr-3 w-[48px] h-[48px] rounded-full bg-[#F8FAFC] items-center justify-center"
            >
              <Ionicons name="document-text-outline" size={21} color="#2286BE" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => void handlePickAttachments()}
            className="mr-3 w-[48px] h-[48px] rounded-full bg-[#EAF3FA] items-center justify-center"
          >
            <Ionicons name="attach" size={22} color="#2286BE" />
          </TouchableOpacity>
          <View className="flex-1 mr-4 overflow-hidden rounded-[20px] border border-[#7C8B95]/30">
            <TextInput
              placeholder={
                isBlockedByOther
                  ? "You can no longer message this user."
                  : isBlockedByMe
                    ? "Unblock this user to continue."
                    : "Type a message..."
              }
              placeholderTextColor="#7C8B95"
              className="px-5 py-4 text-[16px] font-medium text-[#1A2C42]"
              value={input}
              onChangeText={setInput}
              multiline
              editable={canSend}
            />
          </View>

          <TouchableOpacity
            onPress={() => void handleSend()}
            disabled={sending || !canSend}
            className={`w-[54px] h-[54px] rounded-full items-center justify-center ${canSend ? "bg-[#2286BE]" : "bg-[#CBD5E1]"}`}
          >
            {sending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="send" size={24} color="white" style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={menuOpen} animationType="slide" transparent onRequestClose={() => setMenuOpen(false)}>
        <View className="flex-1 justify-end bg-black/35">
          <View className="bg-white rounded-t-[32px] px-6 pt-6 pb-10">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-[22px] font-bold text-[#1A2C42]">Conversation Options</Text>
              <TouchableOpacity
                onPress={() => setMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#1A2C42" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => void handleToggleBlock()}
              disabled={blockingUser || unblockingUser}
              className="bg-white border border-gray-200 rounded-[18px] px-5 py-4 mb-3"
            >
              <Text className="text-[16px] font-bold text-[#1A2C42]">
                {blockingUser || unblockingUser ? "Updating..." : isBlockedByMe ? "Unblock User" : "Block User"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => void handleClearHistory()}
              disabled={clearingHistory}
              className="bg-white border border-red-100 rounded-[18px] px-5 py-4"
            >
              <Text className="text-[16px] font-bold text-[#FF4757]">
                {clearingHistory ? "Clearing..." : "Clear Conversation History"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={callModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (incomingCall && callStatus === "ringing") {
            declineIncomingCall();
            return;
          }
          cleanupCall(true);
        }}
      >
        <View className="flex-1 bg-[#06131D]/90 px-5 py-8 justify-center">
          <View className="bg-white rounded-[34px] overflow-hidden">
            <View className="px-6 pt-6 pb-5 bg-[#2286BE]">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-white text-[24px] font-bold" numberOfLines={1}>
                    {callTitle}
                  </Text>
                  <Text className="text-white/80 text-[14px] font-medium mt-2">
                    {(activeCall || incomingCall?.callType) === "video" ? "Video call" : "Voice call"}{" "}
                    {callStatus === "active"
                      ? `live • ${callDurationLabel}`
                      : callStatus === "ringing"
                        ? "ringing"
                        : "connecting"}
                  </Text>
                </View>
                <View className="w-14 h-14 rounded-full bg-white/15 items-center justify-center">
                  <Ionicons
                    name={(activeCall || incomingCall?.callType) === "video" ? "videocam" : "call"}
                    size={26}
                    color="white"
                  />
                </View>
              </View>
            </View>

            <View className="p-5">
              <View className="rounded-[28px] bg-[#08131B] overflow-hidden mb-4">
                {(activeCall || incomingCall?.callType) === "video" && remoteStreamUrl ? (
                  <RTCView streamURL={remoteStreamUrl} className="w-full h-[280px]" objectFit="cover" />
                ) : (
                  <View className="h-[280px] items-center justify-center px-8 bg-[#08131B]">
                    <Image
                      source={{
                        uri:
                          incomingCall?.senderAvatar ||
                          displayAvatar ||
                          "https://i.pravatar.cc/180?u=call-user",
                      }}
                      className="w-[96px] h-[96px] rounded-full mb-5"
                    />
                    <Text className="text-white text-[22px] font-bold text-center">{callTitle}</Text>
                    <Text className="text-white/65 text-[14px] mt-2 text-center">
                      {remoteStreamUrl
                        ? "Call connected."
                        : callStatus === "ringing"
                          ? "Waiting for the other person to respond."
                          : "Setting up the secure connection."}
                    </Text>
                  </View>
                )}
              </View>

              <View className="rounded-[24px] border border-[#E2E8F0] px-4 py-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-[11px] font-bold tracking-[2px] text-[#7C8B95] uppercase">
                      Your Preview
                    </Text>
                    <Text className="text-[15px] font-bold text-[#1A2C42] mt-2">
                      {localStreamUrl
                        ? (activeCall || incomingCall?.callType) === "video"
                          ? "Camera and microphone are ready."
                          : "Microphone is ready."
                        : "Preparing your device."}
                    </Text>
                  </View>
                  <View className="w-[110px] h-[160px] rounded-[22px] overflow-hidden bg-[#0F172A]">
                    {(activeCall || incomingCall?.callType) === "video" && localStreamUrl ? (
                      <RTCView streamURL={localStreamUrl} className="w-full h-full" objectFit="cover" mirror />
                    ) : (
                      <View className="flex-1 items-center justify-center px-4">
                        <Ionicons name="mic" size={28} color="white" />
                        <Text className="text-white/70 text-[12px] font-medium mt-3 text-center">
                          Voice only
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View className="rounded-[22px] bg-[#F8FAFC] px-4 py-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[11px] font-bold tracking-[2px] text-[#7C8B95] uppercase">
                      Status
                    </Text>
                    <Text className="text-[16px] font-bold text-[#1A2C42] mt-2">
                      {callStatus === "active"
                        ? "Connected"
                        : callStatus === "ringing"
                          ? "Ringing"
                          : "Connecting"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[11px] font-bold tracking-[2px] text-[#7C8B95] uppercase">
                      Duration
                    </Text>
                    <Text className="text-[20px] font-black text-[#1A2C42] mt-2">
                      {callDurationLabel}
                    </Text>
                  </View>
                </View>
              </View>

              {callError ? (
                <View className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 mt-4">
                  <Text className="text-red-700 font-bold">{callError}</Text>
                </View>
              ) : null}

              <View className="flex-row items-center justify-center mt-6">
                {incomingCall && callStatus === "ringing" ? (
                  <>
                    <TouchableOpacity
                      onPress={() => void acceptIncomingCall()}
                      className="bg-[#18A957] px-6 py-4 rounded-full mr-3"
                    >
                      <Text className="text-white font-bold text-[16px]">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={declineIncomingCall}
                      className="bg-[#E11D48] px-6 py-4 rounded-full"
                    >
                      <Text className="text-white font-bold text-[16px]">Decline</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => cleanupCall(true)}
                    className="bg-[#E11D48] px-8 py-4 rounded-full"
                  >
                    <Text className="text-white font-bold text-[16px]">End Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
