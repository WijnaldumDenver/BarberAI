import type { BOOKING_STATUSES, PLANS, USER_ROLES } from "./constants";

export type UserRole = (typeof USER_ROLES)[number];
export type Plan = (typeof PLANS)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  plan: Plan;
  ai_requests_today: number;
  ai_requests_reset_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface Barber {
  id: string;
  user_id: string;
  shop_name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  barber_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
}

export interface Booking {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  scheduled_at: string;
  status: BookingStatus;
  notes: string | null;
  ai_recommendation: string | null;
  created_at: string;
}

export interface AiConsultation {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  created_at: string;
}

export interface BarberAvailability {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface BarberWithProfile extends Barber {
  profiles: Pick<Profile, "full_name" | "plan" | "avatar_url"> | null;
  services: Service[];
}

export interface BookingWithDetails extends Booking {
  services: Service | null;
  barbers: (Barber & { profiles: Pick<Profile, "full_name"> | null }) | null;
  profiles: Pick<Profile, "full_name" | "email"> | null;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ConsultResponse {
  id: string;
  response: string;
  remaining: number;
}

export interface CheckoutResponse {
  url: string;
}
