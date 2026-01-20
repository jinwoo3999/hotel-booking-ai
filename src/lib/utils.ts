import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hàm cn (className) giúp merge class Tailwind thông minh.
 * Ví dụ: cn("bg-red-500", condition && "bg-blue-500") -> sẽ lấy cái sau cùng đúng logic.
 * Giúp tránh bug giao diện khi logic phức tạp.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm format tiền tệ (VND/USD) dùng chung toàn app
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}