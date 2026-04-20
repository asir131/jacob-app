export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "client" | "provider" | "superAdmin";
  avatar?: string;
  phone?: string;
  address?: string;
  preferredLanguage?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  businessBio?: string;
  experienceLevel?: string;
  serviceCity?: string;
  serviceLocationLat?: number | null;
  serviceLocationLng?: number | null;
  sellerLevel?: string;
  averageRating?: number;
  reviewCount?: number;
  payoutVerificationStatus?: string;
  savedServiceIds?: string[];
};

export type LoginResponse = ApiEnvelope<{
  accessToken: string;
  refreshToken: string;
  user: AppUser;
}>;

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type PublicServiceCard = {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  expertType: "solo" | "team";
  image: string;
  baseCity: string;
  zipCode?: string;
  avgPackagePrice: number;
  distanceKm?: number | null;
  providerTravelRadiusKm?: number | null;
  provider: {
    id: string;
    name: string;
    avatar?: string;
    level?: string;
    sellerLevel?: string;
    rating?: number;
    reviewCount?: number;
  };
};

export type PublicServiceDetail = {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  requirements: string;
  images: string[];
  baseCity: string;
  avgPackagePrice: number;
  packages: {
    name: string;
    title: string;
    description: string;
    deliveryTime: string;
    price: number;
  }[];
  provider: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    level?: string;
    rating?: number;
    reviewCount?: number;
  };
  reviews: {
    id: string;
    rating: number;
    review: string;
    createdAt?: string | null;
    client: {
      id: string;
      name: string;
      avatar?: string;
    };
  }[];
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  conversationId?: string | null;
  orderName: string;
  categoryName: string;
  status: string;
  packageName?: string;
  packageTitle?: string;
  packagePrice: number;
  scheduledDate?: string | null;
  scheduledTime?: string;
  serviceAddress?: string;
  specialInstructions?: string;
  paymentStatus?: string;
  paymentAmount?: number;
  providerEarningsAmount?: number;
  deliveryImages?: string[];
  deliveryNote?: string;
  revisionRequestNote?: string;
  clientRating?: number | null;
  clientReview?: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
    address?: string;
    phone?: string;
  };
  provider: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    sellerLevel?: string;
  };
  gig: {
    id: string;
    title: string;
    images: string[];
  };
};

export type ConversationSummary = {
  id: string;
  orderId?: string | null;
  orderNumber?: string;
  orderName?: string;
  packageTitle?: string;
  categoryName?: string;
  blockedBy?: string | null;
  lastMessage?: string;
  lastMessageAt?: string;
  otherUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  attachments: {
    url: string;
    fileName?: string;
    mimeType?: string;
    resourceType?: string;
  }[];
  createdAt: string;
  readAt?: string | null;
};
