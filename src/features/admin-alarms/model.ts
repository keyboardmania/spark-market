export const ALARM_TYPES = ["채팅", "가격하락", "거래", "네고", "공지"] as const;
export type AlarmType = (typeof ALARM_TYPES)[number];

export type AlarmRecord = {
  id: string;
  type: AlarmType;
  title: string;
  body: string;
};

export type AlarmDraft = {
  type: AlarmType;
  title: string;
  body: string;
};

export type AlarmHistoryRecord = {
  id: string;
  alarmId: string;
  userName: string;
  title: string;
  body: string;
  sentAt: string;
};

export const EMPTY_ALARM_DRAFT: AlarmDraft = { type: "거래", title: "", body: "" };

export const SEED_ALARMS: AlarmRecord[] = [
  { id: "alarm-chat", type: "채팅", title: "새 채팅", body: "보고 있지 않은 채팅방에 메시지가 도착하면 보냅니다." },
  { id: "alarm-trade", type: "거래", title: "결제 완료", body: "안전결제가 예치되면 구매자와 판매자에게 보냅니다." },
  { id: "alarm-price", type: "가격하락", title: "찜한 상품 가격", body: "찜한 상품 가격이 내려가면 보냅니다." },
];

export const SEED_ALARM_HISTORY: AlarmHistoryRecord[] = [
  { id: "hist-1", alarmId: "alarm-trade", userName: "김서연", title: "결제 완료", body: "먼작귀 우사기 미니 피규어 상품 결제가 완료되었습니다.", sentAt: "2026.11.14 09:02" },
  { id: "hist-2", alarmId: "alarm-chat", userName: "김서연", title: "새 채팅", body: "카드서랍님의 채팅 메시지가 도착했습니다.", sentAt: "2026.11.13 18:40" },
];
