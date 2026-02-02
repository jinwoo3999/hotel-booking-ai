import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  enumerateNights,
  getRoomAvailabilitySummary,
  releaseRoomInventory,
  reserveRoomInventoryOrThrow,
} from "@/lib/inventory";
import { calculateBaseAmount, calculateFees, calculateTotal, evaluateVoucher } from "@/lib/pricing";

type Intent =
  | "SEARCH_HOTEL"
  | "SEARCH_ROOM"
  | "BOOK_ROOM"
  | "BOOKING_HISTORY"
  | "CHECK_VOUCHERS"
  | "POLICY_INFO"
  | "HELP"
  | "UNKNOWN";

const stopWords = new Set([
  "khach", "san", "hotel", "tai", "o", "cho", "to", "toi", "muon", "tim",
  "kiem", "gia", "re", "view", "phong", "phong", "duoc", "gi", "giup",
  "help", "huong", "dan", "thanh", "pho", "thanh", "pho", "diem", "den",
  "den", "duoi", "tren", "tren", "tu", "tu",
]);

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTokens(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function parseMoney(raw: string): number | null {
  const normalized = normalizeText(raw);
  const match = normalized.match(/(\d+(?:[.,]\d+)?)(\s?(trieu|tr|m|nghin|ngan|k))?/);
  if (!match) return null;
  const amount = Number(match[1].replace(",", "."));
  if (Number.isNaN(amount)) return null;
  const suffix = match[3];
  if (suffix === "trieu" || suffix === "tr" || suffix === "m") return amount * 1000000;
  if (suffix === "nghin" || suffix === "ngan" || suffix === "k") return amount * 1000;
  return amount;
}

function extractBudget(text: string): { min?: number; max?: number } {
  const normalized = normalizeText(text);
  let min: number | undefined;
  let max: number | undefined;

  const maxMatch = normalized.match(/(duoi|max|toi da|toi da)\s+(\d+[a-z0-9\s.,]*)/);
  if (maxMatch && maxMatch[2]) {
    const value = parseMoney(maxMatch[2]);
    if (value) max = value;
  }

  const minMatch = normalized.match(/(tren|min|tu|tu)\s+(\d+[a-z0-9\s.,]*)/);
  if (minMatch && minMatch[2]) {
    const value = parseMoney(minMatch[2]);
    if (value) min = value;
  }

  if (!min && !max) {
    const anyMatch = normalized.match(/(\d+[a-z0-9\s.,]*)/);
    const value = anyMatch ? parseMoney(anyMatch[1]) : null;
    if (value && value >= 100000) {
      max = value;
    }
  }

  return { min, max };
}

function extractCapacity(text: string): number | undefined {
  const normalized = normalizeText(text);
  const match = normalized.match(/(\d+)\s*(nguoi|ng)/);
  return match ? Number(match[1]) : undefined;
}

function parseDateParts(day: number, month: number, year?: number): Date | null {
  const now = new Date();
  const resolvedYear = year ?? now.getFullYear();
  const date = new Date(resolvedYear, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null;
  return date;
}

function extractDateCandidates(text: string): Date[] {
  const normalized = normalizeText(text);
  const dates: Date[] = [];

  const yyyyMmDd = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/g);
  if (yyyyMmDd) {
    for (const match of yyyyMmDd) {
      const parts = match.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (parts) {
        const year = Number(parts[1]);
        const month = Number(parts[2]);
        const day = Number(parts[3]);
        const date = parseDateParts(day, month, year);
        if (date) dates.push(date);
      }
    }
  }

  const ddMm = normalized.match(/(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/g);
  if (ddMm) {
    for (const match of ddMm) {
      const parts = match.match(/(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/);
      if (parts) {
        const day = Number(parts[1]);
        const month = Number(parts[2]);
        const rawYear = parts[3] ? Number(parts[3]) : undefined;
        const year = rawYear ? (rawYear < 100 ? 2000 + rawYear : rawYear) : undefined;
        const date = parseDateParts(day, month, year);
        if (date) dates.push(date);
      }
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function extractDateRange(text: string): { checkIn: Date; checkOut: Date } | null {
  const normalized = normalizeText(text);
  const candidates = extractDateCandidates(normalized);
  if (candidates.length >= 2) {
    return { checkIn: candidates[0], checkOut: candidates[1] };
  }

  const rangeMatch = normalized.match(/tu\s+(.+?)\s+den\s+(.+)/);
  if (rangeMatch) {
    const startCandidates = extractDateCandidates(rangeMatch[1]);
    const endCandidates = extractDateCandidates(rangeMatch[2]);
    if (startCandidates[0] && endCandidates[0]) {
      return { checkIn: startCandidates[0], checkOut: endCandidates[0] };
    }
  }

  return null;
}

function detectIntent(message: string): Intent {
  const text = normalizeText(message);
  if (/(lich su|booking|don dat|reservation)/i.test(text)) return "BOOKING_HISTORY";
  if (/(dat phong|dat phong|book phong|book room|dat ngay)/i.test(text)) return "BOOK_ROOM";
  if (/(voucher|ma giam|khuyen mai|uu dai|coupon|promo)/i.test(text)) return "CHECK_VOUCHERS";
  if (/(chinh sach|policy|check in|check-in|check out|check-out|hoan tien|huy phong|refund)/i.test(text)) return "POLICY_INFO";
  if (/(giup|help|huong dan|chao|hello|hi)/i.test(text)) return "HELP";
  if (/(khach san|hotel|dia diem|thanh pho|phu quoc|da lat|ha noi|sai gon)/i.test(text)) return "SEARCH_HOTEL";
  if (/(phong|room|gia|tien|price|budget|re|view|suite|deluxe)/i.test(text)) return "SEARCH_ROOM";
  return "UNKNOWN";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

async function fetchActiveVouchers() {
  const now = new Date();
  const vouchers = await prisma.voucher.findMany({
    where: { endDate: { gte: now } },
    take: 5,
    orderBy: { discount: "desc" },
  });
  return vouchers;
}

function isExplicitHotelMention(message: string, hotelName: string): boolean {
  const normalizedMessage = normalizeText(message);
  const normalizedName = normalizeText(hotelName);
  if (!normalizedName) return false;
  return normalizedMessage.includes(normalizedName);
}

function extractSelectionIndex(message: string): number | null {
  const normalized = normalizeText(message);
  const match = normalized.match(/^(\d{1,2})$/) || normalized.match(/chon\s+(\d{1,2})/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

type AssistantOption = { type: "hotel" | "room" | "booking"; label: string };

function parseAssistantOptions(lastAssistant: string | null): AssistantOption[] {
  if (!lastAssistant) return [];
  const lines = lastAssistant.split("\n").map((line) => line.trim());
  const options: AssistantOption[] = [];
  for (const line of lines) {
    if (!line) continue;
    const cleanedLine = line.replace(/^•\s+/, "").replace(/^-+s+/, "").replace(/^\d+\)\s+/, "").replace(/^\d+\.\s+/, "").trim();
    if (!cleanedLine) continue;
    const bookingMatch = cleanedLine.match(/ma\s*:?\s*([a-z0-9_-]+)/i);
    if (bookingMatch && bookingMatch[1]) {
      options.push({ type: "booking", label: bookingMatch[1] });
      continue;
    }
    if (cleanedLine.includes(":")) {
      const roomLabel = cleanedLine.split(":")[0].trim();
      if (roomLabel) options.push({ type: "room", label: roomLabel });
      continue;
    }
    const rawLabel = cleanedLine.split(" - ")[0];
    const cleanedLabel = rawLabel.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (cleanedLabel) options.push({ type: "hotel", label: cleanedLabel });
  }
  return options;
}

function formatVoucherShort(voucher: { code: string; discount: number; type: string }): string {
  return voucher.type === "PERCENT"
    ? `ma ${voucher.code} giam ${voucher.discount}%`
    : `ma ${voucher.code} giam ${formatCurrency(voucher.discount)}`;
}

async function logAIConversation(params: {
  sessionId: string;
  userId?: string | null;
  intent: Intent;
  inputText: string;
  meta: Record<string, unknown>;
}) {
  try {
    const id = crypto.randomUUID();
    const metaJson = JSON.stringify(params.meta ?? {});
    await prisma.$executeRaw`
      INSERT INTO "AI_Conversation" ("id", "sessionId", "userId", "intent", "params", "inputText")
      VALUES (${id}, ${params.sessionId}, ${params.userId ?? null}, ${params.intent}, ${metaJson}::jsonb, ${params.inputText})
    `;
  } catch (error) {
    console.warn("AI conversation log failed:", error);
  }
}

type PreferenceSet = { seaView: boolean; nearCenter: boolean; family: boolean };

function extractPreferences(message: string): PreferenceSet {
  const normalized = normalizeText(message);
  return {
    seaView: /bien|biển|sea|ocean/.test(normalized),
    nearCenter: /trung tam|trung tam|center|downtown/.test(normalized),
    family: /gia dinh|gia dinh|family|tre em|tre em|kids/.test(normalized),
  };
}

function buildRoomPreferenceTags(
  room: { name: string; description?: string | null; amenities?: string[]; maxGuests: number },
  hotel: { address?: string | null },
  preferences: PreferenceSet
): string[] {
  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const haystack = normalizeText(`${room.name} ${room.description ?? ""} ${amenities.join(" ")} ${hotel.address ?? ""}`);
  const tags: string[] = [];
  if (preferences.seaView && haystack.includes("bien")) tags.push("view bien");
  if (preferences.nearCenter && (haystack.includes("trung tam") || haystack.includes("center"))) tags.push("gan trung tam");
  if (preferences.family && (room.maxGuests >= 4 || /family|kid|tre em|gia dinh/.test(haystack))) tags.push("phu hop gia dinh");
  return tags;
}

function scoreRoomPreference(
  room: { name: string; description?: string | null; amenities?: string[]; maxGuests: number },
  hotel: { address?: string | null },
  preferences: PreferenceSet
): number {
  return buildRoomPreferenceTags(room, hotel, preferences).length;
}

function isCancelRequest(message: string): boolean {
  const normalized = normalizeText(message);
  return normalized.includes("huy") || normalized.includes("cancel");
}

function isBookingRequest(message: string): boolean {
  const normalized = normalizeText(message);
  return normalized.includes("dat phong") || normalized.includes("book room") || normalized.includes("book phong");
}

function looksLikeVoucherCode(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (trimmed.length > 30) return false;
  return /^[a-z0-9_-]+$/i.test(trimmed);
}

function isVoucherFollowUp(lastAssistant: string | null): boolean {
  if (!lastAssistant) return false;
  const normalized = normalizeText(lastAssistant);
  return /(ap dung|dung|chon).*voucher|voucher.*nao/i.test(normalized);
}

function extractVoucherCode(message: string): string | null {
  const match =
    message.match(/voucher\s*[:\-]?\s*([a-z0-9_-]+)/i) ||
    message.match(/ma\s*(?:giam|giám)\s*[:\-]?\s*([a-z0-9_-]+)/i) ||
    message.match(/code\s*[:\-]?\s*([a-z0-9_-]+)/i);
  return match && match[1] ? match[1].toUpperCase() : null;
}

function extractRoomContextFromAssistant(lastAssistant: string | null): { roomName: string | null; hotelName: string | null } {
  if (!lastAssistant) return { roomName: null, hotelName: null };
  const detailMatch = lastAssistant.match(/Chi tiet phong\s+(.+?)\s+-\s+(.+?)\s*\(/i);
  if (detailMatch && detailMatch[1]) return { roomName: detailMatch[1].trim(), hotelName: detailMatch[2]?.trim() ?? null };
  const roomOnlyMatch = lastAssistant.match(/Chi tiet phong\s+(.+?)(?:\n|$)/i);
  if (roomOnlyMatch && roomOnlyMatch[1]) return { roomName: roomOnlyMatch[1].trim(), hotelName: null };
  const firstRoomLine = lastAssistant.split("\n").map((line) => line.trim()).find((line) => line.startsWith("• ") && line.includes(":"));
  if (firstRoomLine) return { roomName: firstRoomLine.replace(/^•\s+/, "").split(":")[0].trim(), hotelName: null };
  return { roomName: null, hotelName: null };
}

function extractBookingIdFromAssistant(lastAssistant: string | null): string | null {
  if (!lastAssistant) return null;
  const match = lastAssistant.match(/ma(?:\s*don)?\s*[:\-]?\s*([a-z0-9_-]+)/i) || lastAssistant.match(/don\s*[:\-]?\s*([a-z0-9_-]+)/i);
  return match && match[1] ? match[1] : null;
}

type AttractionSummary = { id: string; name: string; city: string; category: string | null; address: string | null };

async function fetchAttractions(message: string): Promise<AttractionSummary[]> {
  if (message.trim().length < 2) return [];
  const term = `%${message}%`;
  try {
    return await prisma.$queryRaw<AttractionSummary[]>`SELECT id, name, city, category, address FROM "Attraction" WHERE status = 'PUBLISHED' AND (name ILIKE ${term} OR city ILIKE ${term} OR address ILIKE ${term}) LIMIT 3`;
  } catch {
    try {
      return await prisma.$queryRaw<AttractionSummary[]>`SELECT id, name, city, category, address FROM attraction WHERE status = 'PUBLISHED' AND (name ILIKE ${term} OR city ILIKE ${term} OR address ILIKE ${term}) LIMIT 3`;
    } catch {
      return [];
    }
  }
}

async function findRoomUpgradeSuggestion(room: { hotelId: string; price: number; maxGuests: number; amenities?: string[] }): Promise<{ id: string; name: string; price: number; maxGuests: number; amenities?: string[] } | null> {
  const candidates = await prisma.room.findMany({ where: { hotelId: room.hotelId, price: { gt: room.price } }, orderBy: { price: "asc" }, take: 4 });
  if (!candidates.length) return null;
  const currentAmenities = Array.isArray(room.amenities) ? room.amenities : [];
  const better = candidates.find((candidate) => {
    const candidateAmenities = Array.isArray(candidate.amenities) ? candidate.amenities : [];
    return candidate.maxGuests > room.maxGuests || candidateAmenities.length > currentAmenities.length;
  });
  return better ?? candidates[0];
}

function buildUpgradeLine(current: { price: number; maxGuests: number; amenities?: string[] }, candidate: { name: string; price: number; maxGuests: number; amenities?: string[] }): string {
  const currentAmenities = Array.isArray(current.amenities) ? current.amenities : [];
  const candidateAmenities = Array.isArray(candidate.amenities) ? candidate.amenities : [];
  const delta = Math.max(candidate.price - current.price, 0);
  const benefit = candidateAmenities.length > currentAmenities.length ? "tien ich nhieu hon" : candidate.maxGuests > current.maxGuests ? "rong hon" : "cao cap hon";
  return `Go y nang cap: ${candidate.name} (${formatCurrency(candidate.price)}/dem, +${formatCurrency(delta)}, ${benefit})`;
}

const smallTalkSignals = new Set(["ok", "oke", "okay", "cam on", "thank", "thanks", "tks", "hi", "hello", "chao", "xin chao", "da", "da", "u", "uh", "um", "hihi", "haha", "good", "nice"]);

function isSmallTalk(message: string): boolean {
  const normalized = normalizeText(message);
  return smallTalkSignals.has(normalized);
}

function buildContainsOr(tokens: string[], fields: string[]): Record<string, unknown> | undefined {
  if (!tokens.length) return undefined;
  const or: Record<string, unknown>[] = [];
  for (const token of tokens) {
    for (const field of fields) {
      or.push({ [field]: { contains: token, mode: "insensitive" } });
    }
  }
  return or.length ? { OR: or } : undefined;
}

function uniqueBy<T, K extends string | number>(items: T[], getKey: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildDbAnswer(message: string, tokens: string[]): Promise<string | null> {
  const normalized = normalizeText(message);
  const [hotels, rooms, vouchers, posts, flights, attractions] = await Promise.all([
    prisma.hotel.findMany({ where: buildContainsOr(tokens, ["name", "city", "address"]) ?? (normalized.length >= 3 ? { OR: [{ name: { contains: message, mode: "insensitive" } }, { city: { contains: message, mode: "insensitive" } }, { address: { contains: message, mode: "insensitive" } }] } : undefined), take: 6, orderBy: { rating: "desc" } }),
    prisma.room.findMany({ where: buildContainsOr(tokens, ["name", "description"]) ?? (normalized.length >= 3 ? { name: { contains: message, mode: "insensitive" } } : undefined), include: { hotel: { select: { name: true, city: true } } }, take: 6, orderBy: { price: "asc" } }),
    prisma.voucher.findMany({ where: buildContainsOr(tokens, ["code", "description"]) ?? (normalized.length >= 3 ? { OR: [{ code: { contains: message, mode: "insensitive" } }, { description: { contains: message, mode: "insensitive" } }] } : undefined), take: 5, orderBy: { discount: "desc" } }),
    prisma.blogPost.findMany({ where: buildContainsOr(tokens, ["title", "excerpt", "content"]) ?? (normalized.length >= 3 ? { OR: [{ title: { contains: message, mode: "insensitive" } }, { excerpt: { contains: message, mode: "insensitive" } }] } : undefined), take: 4, orderBy: { createdAt: "desc" } }),
    prisma.flight.findMany({ where: buildContainsOr(tokens, ["airline", "fromCity", "toCity", "flightNumber"]) ?? (normalized.length >= 3 ? { OR: [{ airline: { contains: message, mode: "insensitive" } }, { fromCity: { contains: message, mode: "insensitive" } }, { toCity: { contains: message, mode: "insensitive" } }] } : undefined), take: 4, orderBy: { price: "asc" } }),
    fetchAttractions(message),
  ]);

  const hotelLines = uniqueBy(hotels, (h) => h.id).map((hotel) => `• ${hotel.name} (${hotel.city}) - rating ${hotel.rating}`);
  const roomLines = uniqueBy(rooms, (r) => r.id).map((room) => `• ${room.name} - ${room.hotel.name} (${room.hotel.city}): ${formatCurrency(room.price)}/dem`);
  const voucherLines = vouchers.filter((voucher) => voucher.endDate && voucher.endDate >= new Date()).map((voucher) => {
    const discountText = voucher.type === "PERCENT" ? `${voucher.discount}%` : formatCurrency(voucher.discount);
    return `• ${voucher.code} - giam ${discountText}`;
  });
  const postLines = posts.map((post) => `• ${post.title}`);
  const attractionLines = attractions.map((item) => {
    const category = item.category ? ` (${item.category})` : "";
    return `• ${item.name}${category} (${item.city})`;
  });
  const flightLines = flights.map((flight) => `• ${flight.airline} ${flight.flightNumber} ${flight.fromCity} → ${flight.toCity} (${formatCurrency(flight.price)})`);

  const sections: string[] = [];
  if (hotelLines.length) sections.push(`Khach san:\n${hotelLines.join("\n")}`);
  if (roomLines.length) sections.push(`Phong:\n${roomLines.join("\n")}`);
  if (voucherLines.length) sections.push(`Voucher:\n${voucherLines.join("\n")}`);
  if (attractionLines.length) sections.push(`Diem vui choi:\n${attractionLines.join("\n")}`);
  if (postLines.length) sections.push(`Bai viet huu ich:\n${postLines.join("\n")}`);
  if (flightLines.length) sections.push(`Ve may bay:\n${flightLines.join("\n")}`);

  if (sections.length) return `Minh tim thay thong tin phu hop trong he thong:\n${sections.join("\n\n")}\nBan muon minh tu van sau phan nao?`;

  const promoHotels = await prisma.hotel.findMany({ where: { status: "ACTIVE" }, take: 3, orderBy: { rating: "desc" } });
  const promoVouchers = await prisma.voucher.findMany({ where: { endDate: { gte: new Date() } }, take: 2, orderBy: { discount: "desc" } });
  const promoLines = [
    promoHotels.length ? `Khach san noi bat:\n${promoHotels.map((h) => `• ${h.name} (${h.city}) - rating ${h.rating}`).join("\n")}` : "",
    promoVouchers.length ? `Uu dai hien co:\n${promoVouchers.map((v) => `• ${v.code} - giam ${v.type === "PERCENT" ? `${v.discount}%` : formatCurrency(v.discount)}`).join("\n")}` : "",
  ].filter(Boolean);

  if (promoLines.length) return `Minh chua thay du lieu trung khop truc tiep, nhung co the ban quan tam:\n${promoLines.join("\n\n")}\nBan muon tim theo diem den, gia hay so nguoi?`;

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message?: string; context?: { lastAssistant?: string | null; sessionId?: string | null; selectedLabel?: string } };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ reply: "Ban vui long nhap noi dung cau hoi." }, { status: 400 });

    const selectionIndex = extractSelectionIndex(message);
    const lastAssistant = body.context?.lastAssistant ?? null;
    const lastOptions = parseAssistantOptions(lastAssistant);
    const selectedLabel = body.context?.selectedLabel?.trim();
    const effectiveMessage = selectionIndex && (!lastOptions.length || selectionIndex > lastOptions.length) && selectedLabel ? selectedLabel : message;
    const intent = detectIntent(effectiveMessage);
    const tokens = extractTokens(effectiveMessage);
    const normalizedMessage = normalizeText(effectiveMessage);
    const session = await auth();
    const sessionId = body.context?.sessionId || `anon-${crypto.randomUUID()}`;

    void logAIConversation({ sessionId, userId: session?.user?.id ?? null, intent, inputText: message, meta: { tokens, selectionIndex, selectedLabel: selectedLabel ?? null, hasContext: Boolean(lastAssistant) } });

    if (isSmallTalk(effectiveMessage)) {
      if (lastOptions.length) return NextResponse.json({ reply: "Ban muon chon muc nao? Ban co the bam nut hoac go ten khach san/phong." });
      return NextResponse.json({ reply: "Ban muon tim khach san o dau hoac can goi y phong theo muc gia/diem den?" });
    }

    if (isVoucherFollowUp(lastAssistant) && looksLikeVoucherCode(effectiveMessage)) {
      const code = effectiveMessage.trim().toUpperCase();
      const voucher = await prisma.voucher.findUnique({ where: { code } });
      if (!voucher) return NextResponse.json({ reply: "Ma voucher khong ton tai. Ban kiem tra lai giup minh nhe." });
      const now = new Date();
      if (voucher.endDate && voucher.endDate < now) return NextResponse.json({ reply: "Voucher nay da het han. Ban muon dung ma khac khong?" });
      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return NextResponse.json({ reply: "Voucher nay da het luot su dung. Ban muon dung ma khac khong?" });
      const minSpend = voucher.minSpend && voucher.minSpend > 0 ? ` (don toi thieu ${formatCurrency(voucher.minSpend)})` : "";
      const discountText = voucher.type === "PERCENT" ? `${voucher.discount}%` : formatCurrency(voucher.discount);
      return NextResponse.json({ reply: `Da ghi nhan voucher ${code} - giam ${discountText}${minSpend}.\nBan muon dat phong nao? Go: dat phong DD/MM - DD/MM voucher ${code}` });
    }

    if (isCancelRequest(effectiveMessage)) {
      if (!lastAssistant || !lastAssistant.includes("Chi tiet don dat phong")) return NextResponse.json({ reply: "Ban muon huy don nao? Vui long chon don tu danh sach lich su dat phong." });
      const bookingId = extractBookingIdFromAssistant(lastAssistant);
      if (!bookingId) return NextResponse.json({ reply: "Ban muon huy don nao? Vui long chon don tu danh sach lich su dat phong." });
      if (!session?.user?.id) return NextResponse.json({ reply: "Ban can dang nhap de huy don dat phong." });
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true, hotel: { select: { name: true } }, voucher: true } });
      if (!booking || booking.userId !== session.user.id) return NextResponse.json({ reply: "Minh khong tim thay don dat phong phu hop de huy." });
      if (booking.status === "CANCELLED") return NextResponse.json({ reply: `Don ${booking.id} da duoc huy truoc do.` });

      try {
        await prisma.$transaction(async (tx) => {
          const policy = await tx.policy.findUnique({ where: { id: "default" } });
          if (policy) {
            const deadline = new Date(booking.checkIn.getTime() - policy.cancellationDeadlineHours * 60 * 60 * 1000);
            if (new Date() > deadline) throw new Error("CANCELLATION_DEADLINE_PASSED");
          }
          const nights = enumerateNights(booking.checkIn, booking.checkOut);
          await releaseRoomInventory(tx, booking.roomId, nights);
          await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
          if (booking.payment && booking.payment.id) await tx.payment.update({ where: { id: booking.payment.id }, data: { status: "CANCELLED" } });
          if (booking.voucherId) await tx.voucher.updateMany({ where: { id: booking.voucherId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
        });
        return NextResponse.json({ reply: `Da huy don ${booking.id} tai ${booking.hotel.name}. Ban muon minh ho tro them gi?` });
      } catch (error) {
        const err = error as Error;
        if (err.message === "CANCELLATION_DEADLINE_PASSED") return NextResponse.json({ reply: "Da qua han huy theo chinh sach, ban khong the huy don nay." });
        throw error;
      }
    }

    if (selectionIndex && lastOptions.length >= selectionIndex) {
      const selected = lastOptions[selectionIndex - 1];
      if (selected.type === "hotel") {
        const hotel = await prisma.hotel.findFirst({ where: { name: { contains: selected.label, mode: "insensitive" } } });
        if (hotel) {
          const rooms = await prisma.room.findMany({ where: { hotelId: hotel.id }, orderBy: { price: "asc" }, take: 6 });
          const roomLines = rooms.map((room) => `• ${room.name}: ${formatCurrency(room.price)}/dem`).join("\n");
          return NextResponse.json({ reply: `Gioi thieu ${hotel.name} (${hotel.city}).\n${hotel.description ? `${hotel.description}\n` : ""}Cac loai phong hien co:\n${roomLines}\nBan muon xem phong nao?` });
        }
        return NextResponse.json({ reply: `Khong tim thay khach san "${selected.label}". Ban co the chon lai tu danh sach.` });
      }
      if (selected.type === "room") {
        const room = await prisma.room.findFirst({ where: { name: { contains: selected.label, mode: "insensitive" } }, include: { hotel: { select: { name: true, city: true, address: true } } } });
        if (room) {
          const upgrade = await findRoomUpgradeSuggestion(room);
          const upgradeLine = upgrade ? `\n${buildUpgradeLine(room, upgrade)}` : "";
          return NextResponse.json({ reply: `Chi tiet phong ${room.name} - ${room.hotel.name} (${room.hotel.city}):\n• Gia: ${formatCurrency(room.price)}/dem\n• Suc chua: ${room.maxGuests} nguoi\n• Tien ich: ${room.amenities && room.amenities.length ? room.amenities.join(", ") : "Dang cap nhat"}\n• Mo ta: ${room.description || "Dang cap nhat"}${upgradeLine}\nBan muon dat phong nay khong?\nGo: dat phong DD/MM - DD/MM (co the kem voucher: VOUCHER ABC123)` });
        }
        return NextResponse.json({ reply: `Khong tim thay phong "${selected.label}". Ban co the chon lai tu danh sach.` });
      }
      if (selected.type === "booking") {
        if (!session?.user?.id) return NextResponse.json({ reply: "Ban can dang nhap de xem chi tiet don dat phong." });
        const booking = await prisma.booking.findFirst({ where: { id: selected.label }, include: { hotel: { select: { name: true, city: true } }, room: { select: { name: true } }, voucher: { select: { code: true } }, payment: true } });
        if (!booking || booking.userId !== session.user.id) return NextResponse.json({ reply: "Minh khong tim thay don dat phong phu hop." });
        return NextResponse.json({ reply: `Chi tiet don dat phong:\n• Ma don: ${booking.id}\n• Khach san: ${booking.hotel.name} (${booking.hotel.city})\n• Phong: ${booking.room.name}\n• Nhan phong: ${booking.checkIn.toLocaleDateString("vi-VN")}\n• Tra phong: ${booking.checkOut.toLocaleDateString("vi-VN")}\n• Tong tien: ${formatCurrency(booking.totalPrice)}\n• Trang thai: ${booking.status}${booking.voucher?.code ? `\n• Voucher: ${booking.voucher.code}` : ""}\nBan muon huy don nay khong? (go: huy don)` });
      }
    }

    if (intent === "BOOK_ROOM" || isBookingRequest(effectiveMessage)) {
      if (!session?.user?.id) return NextResponse.json({ reply: "Ban can dang nhap de dat phong." });
      const dateRange = extractDateRange(effectiveMessage);
      if (!dateRange) return NextResponse.json({ reply: "Ban muon dat phong tu ngay nao den ngay nao? (VD: 12/02 - 14/02)" });
      const roomContext = extractRoomContextFromAssistant(lastAssistant);
      if (!roomContext.roomName) return NextResponse.json({ reply: "Ban can chon phong cu the truoc khi dat. Vui long xem chi tiet phong va thu lai." });
      const room = await prisma.room.findFirst({ where: { name: { contains: roomContext.roomName, mode: "insensitive" }, ...(roomContext.hotelName ? { hotel: { name: { contains: roomContext.hotelName, mode: "insensitive" } } } : {}) }, include: { hotel: true } });
      if (!room) return NextResponse.json({ reply: "Minh chua xac dinh duoc phong can dat. Ban chon phong cu the truoc giup minh nhe." });

      try {
        const availability = await getRoomAvailabilitySummary(room.id, dateRange.checkIn, dateRange.checkOut);
        if (!availability.available) return NextResponse.json({ reply: `Phong ${room.name} hien da het vao khoang ngay ban chon. Ban muon minh goi y phong khac khong?` });
      } catch (error) {
        console.error("Availability check failed:", error);
        return NextResponse.json({ reply: "Khong the kiem tra ton kho phong. Vui long thu lai sau." });
      }

      let booking;
      try {
        booking = await prisma.$transaction(async (tx) => {
          const nights = enumerateNights(dateRange.checkIn, dateRange.checkOut);
          if (nights.length <= 0) throw new Error("INVALID_DATE_RANGE");
          const policy = await tx.policy.findUnique({ where: { id: "default" } });
          const baseAmount = calculateBaseAmount(room.price, nights.length);
          const { serviceFee, tax } = calculateFees(baseAmount, policy);
          const voucherCode = extractVoucherCode(effectiveMessage);
          let discount = 0;
          let appliedVoucherId: string | null = null;
          if (voucherCode) {
            const voucher = await tx.voucher.findUnique({ where: { code: voucherCode } });
            if (!voucher) throw new Error("VOUCHER_NOT_FOUND");
            const evaluation = evaluateVoucher(voucher, baseAmount);
            if (!evaluation.ok) throw new Error(evaluation.reason);
            discount = evaluation.discount;
            appliedVoucherId = voucher.id;
            await tx.voucher.update({ where: { id: voucher.id }, data: { usedCount: { increment: 1 }, users: { connect: { id: session.user.id } } } });
          }
          const totalPrice = calculateTotal({ baseAmount, serviceFee, tax, discount });
          await reserveRoomInventoryOrThrow(tx, room.id, nights);
          const created = await tx.booking.create({ data: { userId: session.user.id, hotelId: room.hotelId, roomId: room.id, checkIn: dateRange.checkIn, checkOut: dateRange.checkOut, originalPrice: baseAmount, discount, totalPrice, paymentMethod: "PAY_AT_HOTEL", status: "PENDING", guestName: session.user.name || "Khach", guestPhone: "", note: "", voucherId: appliedVoucherId } });
          await tx.payment.create({ data: { bookingId: created.id, amount: totalPrice, currency: "VND", method: "API_PAY_AT_HOTEL", status: "PENDING" } });
          return created;
        });
      } catch (error) {
        const err = error as Error;
        if (err.message === "VOUCHER_NOT_FOUND") return NextResponse.json({ reply: "Ma voucher khong ton tai. Ban kiem tra lai giup minh nhe." });
        if (err.message === "VOUCHER_EXPIRED") return NextResponse.json({ reply: "Voucher nay da het han. Ban muon dung ma khac khong?" });
        if (err.message === "VOUCHER_LIMIT_REACHED") return NextResponse.json({ reply: "Voucher nay da het luot su dung. Ban muon dung ma khac khong?" });
        if (err.message === "VOUCHER_MIN_SPEND") return NextResponse.json({ reply: "Don dat chua du dieu kien toi thieu de dung voucher nay." });
        if (err.message === "ROOM_NOT_AVAILABLE") return NextResponse.json({ reply: "Phong da het trong khoang ngay ban chon. Ban muon doi ngay hoac chon phong khac khong?" });
        if (err.message === "INVALID_DATE_RANGE") return NextResponse.json({ reply: "Ngay ban chon chua hop le. Vui long nhap lai theo dang 12/02 - 14/02." });
        throw error;
      }

      const appliedVoucher = extractVoucherCode(effectiveMessage);
      return NextResponse.json({ reply: `Da tao don dat phong:\n• Ma don: ${booking.id}\n• Khach san: ${room.hotel.name} (${room.hotel.city})\n• Phong: ${room.name}\n• Nhan phong: ${booking.checkIn.toLocaleDateString("vi-VN")}\n• Tra phong: ${booking.checkOut.toLocaleDateString("vi-VN")}\n• Tong tien: ${formatCurrency(booking.totalPrice)}${appliedVoucher ? `\n• Voucher: ${appliedVoucher}` : ""}\nNeu can huy, go: huy don` });
    }

    if (intent === "SEARCH_HOTEL") {
      const topVoucher = await fetchActiveVouchers().then(v => v[0]);
      const hotels = await prisma.hotel.findMany({ where: { status: "ACTIVE" }, include: { rooms: { select: { price: true } } }, take: 50, orderBy: { rating: "desc" } });
      const filtered = hotels.filter((hotel) => {
        const haystack = normalizeText(`${hotel.name} ${hotel.city} ${hotel.address}`);
        if (!tokens.length) return true;
        return tokens.some((token) => haystack.includes(token));
      });
      const explicitMatch = filtered.find((hotel) => isExplicitHotelMention(message, hotel.name));
      const selected = explicitMatch ? [explicitMatch] : filtered.slice(0, 8);
      if (!selected.length) return NextResponse.json({ reply: "Hien chua tim thay khach san phu hop voi yeu cau cua ban." });

      if (explicitMatch) {
        const rooms = await prisma.room.findMany({ where: { hotelId: explicitMatch.id }, orderBy: { price: "asc" }, take: 6 });
        if (!rooms.length) return NextResponse.json({ reply: `Gioi thieu ${explicitMatch.name} (${explicitMatch.city}).\n${explicitMatch.description ? `${explicitMatch.description}\n` : ""}Hien khach san chua co phong nao.` });
        const roomLines = rooms.map((room) => `• ${room.name}: ${formatCurrency(room.price)}/dem`).join("\n");
        const comboLine = topVoucher && rooms.length ? `\nGoi y combo: ${rooms[0].name} + ${formatVoucherShort(topVoucher)}` : "";
        return NextResponse.json({ reply: `Gioi thieu ${explicitMatch.name} (${explicitMatch.city}).\n${explicitMatch.description ? `${explicitMatch.description}\n` : ""}Cac loai phong hien co:\n${roomLines}${comboLine}${topVoucher ? `\nUu dai hien tai: ma ${topVoucher.code} giam ${topVoucher.discount}${topVoucher.type === "PERCENT" ? "%" : "d"}` : ""}\nBan muon xem phong nao? (co the bam so)\nSau khi xem phong, go: dat phong DD/MM - DD/MM (voucher: VOUCHER ${topVoucher?.code ?? "ABC123"})` });
      }

      const attractions = await fetchAttractions(message);
      const attractionLines = attractions.map((item) => {
        const category = item.category ? ` (${item.category})` : "";
        return `• Diem vui choi: ${item.name}${category}`;
      });
      const suggestions = selected.map((hotel) => {
        const prices = hotel.rooms.map((room) => room.price).filter((value) => value > 0);
        const minPrice = prices.length ? Math.min(...prices) : null;
        return `• ${hotel.name} (${hotel.city})${minPrice ? ` - tu ${formatCurrency(minPrice)}` : ""}`;
      }).join("\n");
      const comboLine = topVoucher && selected.length ? `\nGoi y combo: ${selected[0].name} + ${formatVoucherShort(topVoucher)}` : "";
      const attractionSection = attractionLines.length ? `\nGoi y diem vui choi:\n${attractionLines.join("\n")}` : "";
      return NextResponse.json({ reply: `Minh tim thay mot so khach san phu hop:\n${suggestions}${comboLine}${attractionSection}\nBan muon xem chi tiet khach san nao?` });
    }

    if (intent === "SEARCH_ROOM") {
      const topVoucher = await fetchActiveVouchers().then(v => v[0]);
      const budget = extractBudget(message);
      const capacity = extractCapacity(message);
      const dateRange = extractDateRange(message);
      const hotels = await prisma.hotel.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true, city: true, address: true, description: true, rating: true } });
      const explicitHotel = hotels.find((hotel) => isExplicitHotelMention(message, hotel.name));
      const explicitRoom = await prisma.room.findFirst({ where: { name: { contains: message, mode: "insensitive" } }, include: { hotel: { select: { name: true, city: true, address: true } } } });

      if (explicitRoom && message.length > 4) {
        const upgrade = await findRoomUpgradeSuggestion(explicitRoom);
        const upgradeLine = upgrade ? `\n${buildUpgradeLine(explicitRoom, upgrade)}` : "";
        return NextResponse.json({ reply: `Chi tiet phong ${explicitRoom.name} - ${explicitRoom.hotel.name} (${explicitRoom.hotel.city}):\n• Gia: ${formatCurrency(explicitRoom.price)}/dem\n• Suc chua: ${explicitRoom.maxGuests} nguoi\n• Tien ich: ${explicitRoom.amenities && explicitRoom.amenities.length ? explicitRoom.amenities.join(", ") : "Dang cap nhat"}\n• Mo ta: ${explicitRoom.description || "Dang cap nhat"}${upgradeLine}${topVoucher ? `\nUu dai hien tai: ma ${topVoucher.code} giam ${topVoucher.discount}${topVoucher.type === "PERCENT" ? "%" : "d"}` : ""}\nBan muon dat phong nay khong?\nGo: dat phong DD/MM - DD/MM (co the kem voucher: VOUCHER ${topVoucher?.code ?? "ABC123"})` });
      }

      const rooms = await prisma.room.findMany({ where: explicitHotel ? { hotelId: explicitHotel.id } : undefined, include: { hotel: { select: { name: true, city: true, address: true } } }, take: 80 });
      const preferences = extractPreferences(message);
      const hasPreferences = preferences.seaView || preferences.nearCenter || preferences.family;
      const filtered = rooms.filter((room) => {
        const amenities = Array.isArray(room.amenities) ? room.amenities : [];
        const haystack = normalizeText(`${room.name} ${room.description ?? ""} ${amenities.join(" ")} ${room.hotel.name} ${room.hotel.city} ${room.hotel.address ?? ""}`);
        const matchesTokens = tokens.length ? tokens.some((token) => haystack.includes(token)) : true;
        const matchesBudget = (budget.min ? room.price >= budget.min : true) && (budget.max ? room.price <= budget.max : true);
        const matchesCapacity = capacity ? room.maxGuests >= capacity : true;
        if (normalizedMessage.includes("bien") || normalizedMessage.includes("bien")) return matchesTokens || haystack.includes("bien");
        return matchesTokens && matchesBudget && matchesCapacity;
      });

      const scored = filtered.map((room) => ({ room, score: scoreRoomPreference(room, { address: room.hotel.address }, preferences) })).sort((a, b) => {
        if (hasPreferences && b.score !== a.score) return b.score - a.score;
        return a.room.price - b.room.price;
      }).map((item) => item.room);

      const grouped = scored.reduce<Record<string, typeof filtered>>((acc, room) => {
        acc[room.hotel.name] = acc[room.hotel.name] || [];
        acc[room.hotel.name].push(room);
        return acc;
      }, {});

      const hotelNames = Object.keys(grouped);
      if (!hotelNames.length) return NextResponse.json({ reply: "Hien chua co phong nao phu hop. Ban muon minh goi y theo muc gia hoac so nguoi khong?" });

      const suggestions = await Promise.all(hotelNames.slice(0, explicitHotel ? 1 : 4).map(async (hotelName) => {
        const roomsByHotel = grouped[hotelName].slice(0, 3);
        const lines = await Promise.all(roomsByHotel.map(async (room) => {
          const tags = buildRoomPreferenceTags(room, { address: room.hotel.address }, preferences);
          const tagText = tags.length ? ` (${tags.join(", ")})` : "";
          if (dateRange) {
            try {
              const availability = await getRoomAvailabilitySummary(room.id, dateRange.checkIn, dateRange.checkOut);
              const status = availability.available ? `con ${availability.remainingMin} phong` : "het phong";
              return `  - ${room.name}: ${formatCurrency(room.price)}/dem (${status})${tagText}`;
            } catch { return `  - ${room.name}: ${formatCurrency(room.price)}/dem (chua co ton kho)${tagText}`; }
          }
          return `  - ${room.name}: ${formatCurrency(room.price)}/dem${tagText}`;
        }));
        const location = roomsByHotel[0]?.hotel.city || "";
        return `• ${hotelName}${location ? ` (${location})` : ""}\n${lines.join("\n")}`;
      }));

      const cheapestRoom = filtered.sort((a, b) => a.price - b.price)[0];
      const comboLine = topVoucher && cheapestRoom ? `\nGoi y combo: ${cheapestRoom.name} + ${formatVoucherShort(topVoucher)}` : "";
      const preferenceLine = hasPreferences ? `\nUu tien: ${[preferences.seaView ? "view bien" : null, preferences.nearCenter ? "gan trung tam" : null, preferences.family ? "phu hop gia dinh" : null].filter(Boolean).join(", ")}` : "";

      if (dateRange) {
        return NextResponse.json({ reply: `Minh da kiem tra theo ngay ${dateRange.checkIn.toLocaleDateString("vi-VN")} - ${dateRange.checkOut.toLocaleDateString("vi-VN")}:\n${suggestions.join("\n")}${comboLine}${preferenceLine}${topVoucher ? `\nUu dai hien tai: ma ${topVoucher.code} giam ${topVoucher.discount}${topVoucher.type === "PERCENT" ? "%" : "d"}` : ""}\nBan muon dat phong nao? (co the bam so)\nSau khi xem phong, go: dat phong DD/MM - DD/MM (voucher: VOUCHER ${topVoucher?.code ?? "ABC123"})` });
      }

      return NextResponse.json({ reply: explicitHotel ? `Gioi thieu ${explicitHotel.name} (${explicitHotel.city}).\n${explicitHotel.description ? `${explicitHotel.description}\n` : ""}Cac loai phong hien co:\n${suggestions.join("\n")}${comboLine}${preferenceLine}${topVoucher ? `\nUu dai hien tai: ma ${topVoucher.code} giam ${topVoucher.discount}${topVoucher.type === "PERCENT" ? "%" : "d"}` : ""}\nBan muon dat phong nao? (co the bam so)\nSau khi xem phong, go: dat phong DD/MM - DD/MM (voucher: VOUCHER ${topVoucher?.code ?? "ABC123"})` : `Minh tim thay phong theo tung khach san:\n${suggestions.join("\n")}${comboLine}${preferenceLine}${topVoucher ? `\nUu dai hien tai: ma ${topVoucher.code} giam ${topVoucher.discount}${topVoucher.type === "PERCENT" ? "%" : "d"}` : ""}\nBan muon xem chi tiet khach san nao? (co the bam so)` });
    }

    if (intent === "BOOKING_HISTORY") {
      if (!session?.user?.id) return NextResponse.json({ reply: "Ban vui long dang nhap de xem lich su dat phong." });
      const bookings = await prisma.booking.findMany({ where: { userId: session.user.id }, include: { hotel: { select: { name: true, city: true } }, room: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 });
      if (!bookings.length) return NextResponse.json({ reply: "Ban chua co don dat phong nao. Ban muon minh goi y khach san phu hop khong?" });
      const items = bookings.map((booking, index) => `• ${index + 1}) ${booking.hotel.name} (${booking.hotel.city}) - ${booking.status} (Ma: ${booking.id})`).join("\n");
      return NextResponse.json({ reply: `Don dat phong gan day:\n${items}\nBan muon xem chi tiet don nao? (go so thu tu)` });
    }

    if (intent === "CHECK_VOUCHERS") {
      try {
        const vouchers = await fetchActiveVouchers();
        if (!vouchers.length) return NextResponse.json({ reply: "Hien chua co voucher nao dang hoat dong." });
        const items = vouchers.map((voucher) => {
          const discountText = voucher.type === "PERCENT" ? `${voucher.discount}%` : formatCurrency(voucher.discount);
          const minSpend = voucher.minSpend ? `, toi thieu ${formatCurrency(voucher.minSpend)}` : "";
          const expiry = voucher.endDate ? voucher.endDate.toLocaleDateString("vi-VN") : "khong ro";
          return `• ${voucher.code} - giam ${discountText}${minSpend} (han: ${expiry})`;
        }).join("\n");
        return NextResponse.json({ reply: `Uu dai hien co:\n${items}\nBan muon ap dung voucher nao cho don dat phong?` });
      } catch { return NextResponse.json({ reply: "Hien chua the lay danh sach voucher. Ban thu lai sau nhe." }); }
    }

    if (intent === "POLICY_INFO") {
      const policy = await prisma.policy.findUnique({ where: { id: "default" } });
      if (!policy) return NextResponse.json({ reply: "Hien chua co chinh sach luu tru duoc cap nhat." });
      const refundText = policy.refundPercent > 0 ? `Hoan ${policy.refundPercent}% neu huy truoc ${policy.cancellationDeadlineHours} gio.` : `Khong hoan tien neu huy truoc ${policy.cancellationDeadlineHours} gio.`;
      return NextResponse.json({ reply: `Thong tin luu tru:\n• Check-in: ${policy.checkInTime}\n• Check-out: ${policy.checkOutTime}\n• Chinh sach huy: ${refundText}\n• Mo ta: ${policy.refundPolicyText}` });
    }

    if (intent === "HELP") {
      return NextResponse.json({ reply: "Minh co the ho tro: tim khach san theo dia diem, goi y phong, xem lich su dat phong, kiem tra voucher, va chinh sach check-in/check-out/huy phong. Ban muon bat dau tu dau?" });
    }

    if (intent === "UNKNOWN" && normalizedMessage.length >= 3) {
      const topVoucher = await fetchActiveVouchers().then(v => v[0]);
      const locationHotels = await prisma.hotel.findMany({ where: { status: "ACTIVE", OR: [{ city: { contains: message, mode: "insensitive" } }, { address: { contains: message, mode: "insensitive" } }, { name: { contains: message, mode: "insensitive" } }] }, include: { rooms: { select: { price: true } } }, take: 5, orderBy: { rating: "desc" } });
      if (locationHotels.length) {
        const attractions = await fetchAttractions(message);
        const hotelLines = locationHotels.map((hotel) => {
          const prices = hotel.rooms.map((room) => room.price).filter((value) => value > 0);
          const minPrice = prices.length ? Math.min(...prices) : null;
          return `• ${hotel.name} (${hotel.city})${minPrice ? ` - tu ${formatCurrency(minPrice)}` : ""}`;
        });
        const attractionLines = attractions.map((item) => {
          const category = item.category ? ` (${item.category})` : "";
          return `• Diem vui choi: ${item.name}${category}`;
        });
        const comboLine = topVoucher && locationHotels.length ? `\nGoi y combo: ${locationHotels[0].name} + ${formatVoucherShort(topVoucher)}` : "";
        const attractionSection = attractionLines.length ? `\nGoi y diem vui choi:\n${attractionLines.join("\n")}` : "";
        return NextResponse.json({ reply: `Minh tim thay mot so khach san phu hop:\n${hotelLines.join("\n")}${comboLine}${attractionSection}\nBan muon xem chi tiet khach san nao?` });
      }
    }

    if (tokens.length >= 2 || normalizedMessage.length >= 4) {
      const dbAnswer = await buildDbAnswer(message, tokens);
      if (dbAnswer) return NextResponse.json({ reply: dbAnswer });
    }

    return NextResponse.json({ reply: "Minh chua hieu ro yeu cau. Ban co the noi ro hon ve diem den hoac loai phong mong muon khong?" });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ reply: "Xin loi, he thong gap loi khi xu ly yeu cau." }, { status: 500 });
  }
}
