import type { ChatMessage } from "@/data/mockData";
import { fill, type UiKey } from "@/features/i18n/ui";

export function systemBody(message: ChatMessage, t: (key: UiKey) => string) {
  if (!message.systemKey) return message.originalText || message.text || "";
  const params = { ...(message.systemParams ?? {}) };
  if (message.systemKey === "paymentRequest") {
    params.shipping = params.shippingIncluded === "1" ? t("shippingIncluded") : (params.shippingFee ?? "");
  }
  return fill(t(message.systemKey), params);
}
