export type BoardRecord = {
  id: string;
  category: string;
  name: string;
  userWrite: boolean;
  media: boolean;
  fixed: boolean;
  reservation: boolean;
  used: boolean;
};

export type BoardDraft = Omit<BoardRecord, "id">;

export const EMPTY_BOARD_DRAFT: BoardDraft = {
  category: "고객센터",
  name: "",
  userWrite: false,
  media: false,
  fixed: false,
  reservation: false,
  used: true,
};

export const SEED_BOARDS: BoardRecord[] = [
  { id: "board-notice", category: "고객센터", name: "공지사항", userWrite: false, media: true, fixed: true, reservation: true, used: true },
  { id: "board-faq", category: "고객센터", name: "FAQ", userWrite: false, media: false, fixed: false, reservation: false, used: true },
  { id: "board-inquiry", category: "고객센터", name: "1:1 문의", userWrite: true, media: true, fixed: false, reservation: false, used: true },
  { id: "board-event", category: "고객센터", name: "이벤트", userWrite: false, media: true, fixed: true, reservation: true, used: true },
];
