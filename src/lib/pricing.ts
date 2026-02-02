import type { Policy, Voucher } from "@prisma/client";

export type PricingBreakdown = {
  nights: number;
  baseAmount: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
};

type VoucherCheckResult =
  | { ok: true; voucher: Voucher; discount: number }
  | { ok: false; reason: string };

export function calculateBaseAmount(pricePerNight: number, nights: number) {
  return Math.max(0, pricePerNight * Math.max(1, nights));
}

export function calculateFees(baseAmount: number, policy?: Policy | null) {
  const serviceFeePercent = policy?.serviceFeePercent || 0;
  const taxPercent = policy?.taxPercent || 0;

  const serviceFee = Math.round((baseAmount * serviceFeePercent) / 100);
  const tax = Math.round((baseAmount * taxPercent) / 100);

  return { serviceFee, tax };
}

export function evaluateVoucher(voucher: Voucher, baseAmount: number): VoucherCheckResult {
  const now = new Date();
  if (voucher.endDate < now) return { ok: false, reason: "VOUCHER_EXPIRED" };
  if (voucher.usedCount >= voucher.usageLimit) return { ok: false, reason: "VOUCHER_LIMIT_REACHED" };
  if (voucher.minSpend && baseAmount < voucher.minSpend) return { ok: false, reason: "VOUCHER_MIN_SPEND" };

  let discount = 0;
  if (voucher.type === "PERCENT") {
    discount = Math.round((baseAmount * voucher.discount) / 100);
  } else if (voucher.type === "AMOUNT") {
    discount = Math.round(voucher.discount);
  }

  discount = Math.min(discount, baseAmount);
  return { ok: true, voucher, discount };
}

export function calculateTotal({
  baseAmount,
  serviceFee,
  tax,
  discount,
}: {
  baseAmount: number;
  serviceFee: number;
  tax: number;
  discount: number;
}): number {
  // Tổng tiền = (giá gốc - giảm giá) + phí dịch vụ + thuế
  return Math.max(0, Math.round(baseAmount - discount + serviceFee + tax));
}

