export const ALARM_TYPES = ["채팅", "가격 하락"] as const;
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
  type: AlarmType;
  userName: string;
  title: string;
  body: string;
  sentAt: string;
};

export const EMPTY_ALARM_DRAFT: AlarmDraft = { type: "채팅", title: "", body: "" };

export const SEED_ALARMS: AlarmRecord[] = [
  { id: "alarm-chat", type: "채팅", title: "새 채팅", body: "보고 있지 않은 채팅방에 메시지가 도착하면 보냅니다." },
  { id: "alarm-price", type: "가격 하락", title: "찜한 상품 가격", body: "찜한 상품 가격이 내려가면 보냅니다." },
];

export const SEED_ALARM_HISTORY: AlarmHistoryRecord[] = [
  { id: "hist-2", alarmId: "alarm-chat", type: "채팅", userName: "김서연", title: "새 채팅", body: "카드서랍님의 채팅 메시지가 도착했습니다.", sentAt: "2026.11.13 18:40" },
  { id: "hist-3", alarmId: "alarm-price", type: "가격 하락", userName: "모모", title: "찜한 상품 가격", body: "블리치 루키아 아크릴 스탠드 가격이 내려갔어요.", sentAt: "2026.11.12 11:15" },
  { id: "hist-4", alarmId: "alarm-chat", type: "채팅", userName: "하루", title: "새 채팅", body: "치이님의 채팅 메시지가 도착했습니다.", sentAt: "2026.11.11 20:08" },
];
