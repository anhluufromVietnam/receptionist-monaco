export interface User {
  authUid?: string;
  username?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  points: number;
  createdAt: number;
  birthday?: string;
  role?: 'admin' | 'receptionist' | 'customer';
  password?: string;
}

export type BookingStatus = 'Chờ xác nhận' | 'Đã xác nhận' | 'Chờ đến' | 'Đã đến' | 'Đang dùng' | 'Chờ thanh toán' | 'Đã thanh toán' | 'Đã hủy';

export interface Booking {
  id: string;
  userId: string;
  type: "karaoke" | "massage" | "restaurant";
  facilityId?: string;
  facilityName?: string;
  roomId?: string;
  roomName?: string;
  items?: any[];
  services?: any[];
  note?: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;      // Tổng tiền gốc (roomPrice + services)
  roomPrice?: number;        // Tiền phòng (lễ tân nhập)
  finalAmount?: number;      // Tổng thanh toán cuối cùng (sau giảm giá)
  paidAmount?: number;       // Số tiền khách đã thanh toán thực tế
  pointsEarned?: number;     // Số điểm tích lũy từ đơn hàng này (để đồng bộ)
  pendingAt?: number;
  confirmedAt?: number;
  waitingAt?: number;
  arrivedAt?: number;
  startedAt?: number;
  paymentPendingAt?: number;
  completedAt?: number;      // Thời điểm thanh toán
  cancelledAt?: number;
  guestCount?: number;
  guests?: string;
  appliedVoucher?: {
    code: string;
    title?: string;
    discountAmount?: number | null;
    discountRate?: number | null;
    minTotal?: number;
  };
  appliedRewardId?: string | null;
  status: BookingStatus;
  createdAt: number;
  // Backward compatibility fields
  name?: string;
  phone?: string;
  room?: string;
  roomType?: string;
  facilityType?: string;
  totalEst?: number;
  paidAt?: number;
  paymentStatus?: 'pending' | 'paid';
  arrivalTime?: string;
  endTime?: string;
  startTime?: string;
  updatedAt?: number;
}

export interface News {
  title: string;
  subtitle?: string;
  content: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  isActive: boolean;
  rules?: string[];
}

export interface Service {
  name: string;
  qty?: number;
  price: number;
  quantity?: number;
}

export interface AppliedVoucher {
  code: string;
  title?: string;
  discountAmount?: number | null;
  discountRate?: number | null;
  minTotal?: number;
}

export interface AppliedReward {
  id: string;
  title: string;
  description?: string;
  discountAmount?: number;
  discountRate?: number;
  minTotal?: number;
}

export interface PointExchange {
  exchangeTime: number;
  pointsUsed: number;
  userId: string;
  status: "pending" | "completed" | "cancelled";
  description: string;
  bookingId?: string;
}

export interface PointHistoryEntry {
  type: "earn" | "spend";
  points: number;
  timestamp: number;
  description: string;
  bookingId?: string;
  voucherCode?: string;
}

export interface RoomItem {
  id: string;
  name: string;
  type: "karaoke" | "massage" | "restaurant";
  category: string;
  capacity: number;
  price: number;
  priceNote: string;
  image: string;
  description: string;
  status: "available" | "occupied" | "maintenance";
  // Backward compatibility
  facilityId?: string;
  facilityName?: string;
}

export interface Facility {
  name: string;
  type: "karaoke" | "massage" | "restaurant";
  createdAt: number;
  rooms: Record<string, RoomItem>;
}

export interface FacilityData {
  id: string;
  name: string;
  type: 'karaoke' | 'massage' | 'restaurant';
  rooms: Record<string, RoomItem>;
  roomCount: number;
}