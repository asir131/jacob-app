import { authStorage } from "@/src/lib/storage";
import { API_BASE_URL } from "@/src/lib/env";
import type {
  ApiEnvelope,
  AppUser,
  CategoryItem,
  ChatMessage,
  ConversationSummary,
  OrderSummary,
  PublicServiceCard,
  PublicServiceDetail,
} from "@/src/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

type Paginated<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> => {
  const token = options.token ?? (await authStorage.getAccessToken());
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message || "Request failed.", response.status);
  }

  return payload;
};

const mapCategory = (item: any): CategoryItem => ({
  id: String(item?._id || item?.id || ""),
  name: String(item?.name || ""),
  slug: String(item?.slug || ""),
  description: String(item?.description || ""),
});

export const mobileApi = {
  request,
  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string; user: AppUser }>("/api/auth/login", {
      method: "POST",
      body,
    }),
  signup: (body: { firstName: string; lastName: string; email: string; password: string; role: "client" | "provider" }) =>
    request<{ email: string; otpExpiresInMinutes: number }>("/api/auth/signup", { method: "POST", body }),
  verifySignupOtp: (body: { email: string; otp: string }) =>
    request<{ id: string; firstName: string; lastName: string; email: string; role: string }>("/api/auth/verify-signup-otp", {
      method: "POST",
      body,
    }),
  getMyProfile: () => request<{ user: AppUser }>("/api/profile/me"),
  getCategories: async () => {
    const payload = await request<any[]>("/api/categories");
    return {
      ...payload,
      data: Array.isArray(payload.data) ? payload.data.map(mapCategory) : [],
    };
  },
  getPublicServices: (query = "") =>
    request<Paginated<PublicServiceCard>>(`/api/gigs/public${query ? `?${query}` : ""}`),
  getPublicServiceById: (id: string) => request<PublicServiceDetail>(`/api/gigs/public/${id}`),
  getProviderProfile: (providerId: string) =>
    request<any>(`/api/profile/provider/${providerId}/public`),
  getClientOrders: (query = "page=1&limit=8&status=all") =>
    request<Paginated<OrderSummary>>(`/api/orders/client?${query}`),
  getProviderOrders: (query = "page=1&limit=8&status=all") =>
    request<Paginated<OrderSummary>>(`/api/orders/provider?${query}`),
  createOrder: (body: {
    gigId: string;
    packageName: string;
    packageTitle: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceAddress: string;
    specialInstructions?: string;
  }) => request<{ order: OrderSummary }>("/api/orders", { method: "POST", body }),
  acceptProviderOrder: (id: string) => request<unknown>(`/api/orders/provider/${id}/accept`, { method: "PATCH" }),
  declineProviderOrder: (id: string) => request<unknown>(`/api/orders/provider/${id}/decline`, { method: "PATCH" }),
  getMyGigs: () => request<{ publishedGigs?: any[]; pendingRequests?: any[] }>("/api/gigs/mine"),
  createGig: (body: FormData) => request<unknown>("/api/gigs", { method: "POST", body }),
  updateGig: (id: string, body: FormData) => request<unknown>(`/api/gigs/${id}`, { method: "PUT", body }),
  deleteGig: (id: string) => request<unknown>(`/api/gigs/${id}`, { method: "DELETE" }),
  getConversations: () => request<ConversationSummary[]>("/api/chats/conversations"),
  ensureConversationByOrder: (orderId: string) =>
    request<ConversationSummary>(`/api/chats/conversations/order/${orderId}`, { method: "POST" }),
  getConversationMessages: (conversationId: string, query = "page=1&limit=50") =>
    request<Paginated<ChatMessage>>(`/api/chats/conversations/${conversationId}/messages?${query}`),
  sendConversationMessage: (conversationId: string, body: FormData) =>
    request<ChatMessage>(`/api/chats/conversations/${conversationId}/messages`, { method: "POST", body }),
  markConversationRead: (conversationId: string) =>
    request<{ modifiedCount?: number }>(`/api/chats/conversations/${conversationId}/read`, { method: "POST" }),
};

export { ApiError };

