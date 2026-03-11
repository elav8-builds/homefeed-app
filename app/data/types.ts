export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: "single_family" | "condo" | "townhouse" | "multi_family";
  status: "active" | "pending" | "sold";
  images: string[];
  description: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  agentId: string;
  neighborhoodId: string;
  matchScore: number;
  daysOnMarket: number;
  listDate: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  brokerage: string;
  yearsExp: number;
  licenseNumber: string;
  homesSoldYtd: number;
  avgDaysToClose: number;
  avgSaleVsList: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  neighborhoods: string[];
  followerCount: number;
  bio: string;
}

export interface Review {
  id: string;
  userName: string;
  yearsLived: number;
  rating: number;
  text: string;
  helpful: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
  medianPrice: number;
  priceChangeYoY: string;
  avgDaysOnMarket: number;
  activeListings: number;
  followerCount: number;
  residentCount: number;
  vibeScores: {
    walkability: number;
    schools: number;
    dining: number;
    safety: number;
    nightlife: number;
    familyFriendly: number;
    petFriendly: number;
    commute: number;
  };
  reviews: Review[];
  description: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  propertyId: string;
  text: string;
  timestamp: string;
  likeCount: number;
}

export interface Board {
  id: string;
  name: string;
  isPublic: boolean;
  propertyIds: string[];
  coverImage: string;
  description: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  likedPropertyIds: string[];
  savedBoards: string[];
  followedNeighborhoods: string[];
  followedAgents: string[];
  vibeProfile: {
    walkability: number;
    schools: number;
    dining: number;
    safety: number;
    nightlife: number;
    familyFriendly: number;
    petFriendly: number;
    commute: number;
  };
}
