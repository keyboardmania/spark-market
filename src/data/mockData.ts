export const CATEGORIES = ["TCG", "피규어", "산리오/굿즈"] as const;
export type Category = (typeof CATEGORIES)[number];
export type CategoryFilter = "전체" | Category;

export const ORIGINS = ["한국", "일본", "미국", "중국", "유럽"] as const;
export type Origin = (typeof ORIGINS)[number];

export const CATEGORY_ROUTES = [
  { slug: "tcg", label: "TCG" },
  { slug: "figure", label: "피규어" },
  { slug: "goods", label: "산리오/굿즈" },
] as const;

export type CategorySlug = (typeof CATEGORY_ROUTES)[number]["slug"];

export const CONDITIONS = ["PSA10", "BGS", "S급 미개봉", "S급", "A급", "B급"] as const;
export type Condition = (typeof CONDITIONS)[number];
export const GRADE_FILTERS = ["전체", ...CONDITIONS] as const;
export type GradeFilter = (typeof GRADE_FILTERS)[number];

export const SALE_STATUSES = ["판매중", "예약중", "판매완료"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export const IPS = ["하이큐!!", "블리치", "산리오", "포켓몬", "먼작귀"] as const;
export type IpName = (typeof IPS)[number];
export const IP_FILTERS = ["전체", ...IPS] as const;
export type IpFilter = (typeof IP_FILTERS)[number];

export type Motif = "card" | "figure" | "plush" | "pouch";

export type Palette = {
  base: string;
  ink: string;
  accent: string;
  soft: string;
};

export type Seller = {
  id: string;
  name: string;
  handle: string;
  rating: number;
  sales: number;
  bio: string;
  city: string;
};

export type ProductMedia = {
  id: string;
  name: string;
  kind: "image" | "video";
  url: string;
};

export type Product = {
  id: string;
  title: string;
  ip: IpName | string;
  category: Category;
  country?: Origin;
  price: number;
  condition: Condition;
  saleStatus: SaleStatus;
  description: string;
  sellerId: string;
  likes: number;
  motif: Motif;
  palette: Palette;
  shippingFee: number;
  location: string;
  postedOrder: number;
  postedLabel: string;
  imageUrl?: string;
  media?: ProductMedia[];
};

export type SparkUser = {
  name: string;
  email: string;
  provider: "email" | "line" | "google" | "x" | "apple";
};

const NICKNAME_PREFIXES = ["컬렉터", "Spark", "수집가", "선반"] as const;

export function createNickname() {
  const prefix = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${number}`;
}

export type ChatMessage = {
  id: string;
  sender: "me" | "seller";
  text?: string;
  imageUrl?: string;
  at: string;
};

export type ChatRoom = {
  id: string;
  productId: string;
  sellerName: string;
  sellerHandle: string;
  unread: number;
  messages: ChatMessage[];
};

export const ORDER_STATUSES = ["결제완료", "배송중", "배송완료", "구매확정", "거래취소"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  role: "purchase" | "sale";
  productId: string;
  title: string;
  ip: string;
  price: number;
  condition: Condition;
  motif: Motif;
  palette: Palette;
  imageUrl?: string;
  status: OrderStatus;
  orderedAt: string;
  counterpart: string;
  address: string;
  paymentMethod: string;
  tracking: string | null;
  review: { rating: number; text: string } | null;
};

export const SELLERS: Seller[] = [
  {
    id: "haru",
    name: "하루",
    handle: "@haru.court",
    rating: 4.9,
    sales: 128,
    bio: "하이큐!! 덕질 8년차. 박스와 구성품을 정성껏 보관해요.",
    city: "서울 마포",
  },
  {
    id: "momo",
    name: "모모",
    handle: "@momo.ribbon",
    rating: 4.8,
    sales: 86,
    bio: "산리오와 파스텔 굿즈만 모아요. 슈링크 상태 사진을 함께 보내요.",
    city: "경기 성남",
  },
  {
    id: "slab",
    name: "카드서랍",
    handle: "@slab.drawer",
    rating: 5,
    sales: 54,
    bio: "감정 완료 카드만 취급합니다. 슬랩 앞뒷면과 팝 리포트를 드려요.",
    city: "서울 성동",
  },
  {
    id: "chii",
    name: "치이",
    handle: "@chii.pocket",
    rating: 4.9,
    sales: 210,
    bio: "먼작귀 최애. 미개봉은 모서리 사진까지 찍어서 안내해요.",
    city: "부산 수영",
  },
  {
    id: "orange",
    name: "오렌지코트",
    handle: "@orange.coat",
    rating: 4.7,
    sales: 63,
    bio: "블리치 컬렉션을 정리하고 있어요. 직거래는 합정에서 가능해요.",
    city: "서울 마포",
  },
  {
    id: "me",
    name: "나",
    handle: "@spark.me",
    rating: 5,
    sales: 3,
    bio: "Spark에 직접 올린 매물이에요.",
    city: "서울",
  },
];

const court: Palette = { base: "#fff7f3", ink: "#3f2a24", accent: "#ff7a45", soft: "#ffd8c7" };
const bleach: Palette = { base: "#f6f6f7", ink: "#18181b", accent: "#f97316", soft: "#ffedd5" };
const sky: Palette = { base: "#f8fbff", ink: "#475569", accent: "#7dd3fc", soft: "#e0f2fe" };
const ribbon: Palette = { base: "#fff5f7", ink: "#9f1239", accent: "#fb7185", soft: "#ffe4e6" };
const night: Palette = { base: "#faf7ff", ink: "#581c87", accent: "#c084fc", soft: "#f3e8ff" };
const ember: Palette = { base: "#fff7ed", ink: "#9a3412", accent: "#fb7185", soft: "#ffedd5" };
const bolt: Palette = { base: "#fffbeb", ink: "#1e3a8a", accent: "#facc15", soft: "#fef3c7" };
const cream: Palette = { base: "#fffaf5", ink: "#78716c", accent: "#fdba74", soft: "#ffedd5" };
const hachi: Palette = { base: "#f8fafc", ink: "#334155", accent: "#93c5fd", soft: "#e2e8f0" };
const usagi: Palette = { base: "#fff7fb", ink: "#9d174d", accent: "#f9a8d4", soft: "#fce7f3" };

export const PRODUCTS: Product[] = [
  {
    id: "hq-hinata-nendo",
    title: "하이큐!! 히나타 쇼요 넨도로이드",
    imageUrl: "https://image.aladin.co.kr/product/35949/74/cover500/f762037802_1.jpg",
    ip: "하이큐!!",
    category: "피규어",
    price: 92000,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "국내 정발 미개봉입니다. 슈링크가 팽팽하고 박스 모서리 눌림이 없어요. 특전 얼굴 파츠 포함, 택배 완충 포장으로 보냅니다.",
    sellerId: "haru",
    likes: 328,
    motif: "figure",
    palette: court,
    shippingFee: 3000,
    location: "서울 마포 · 택배",
    postedOrder: 16,
    postedLabel: "2시간 전",
  },
  {
    id: "hq-kageyama-scale",
    title: "하이큐!! 카게야마 토비오 스케일 피규어",
    imageUrl: "https://image.aladin.co.kr/product/33296/58/cover500/f182938381_1.jpg",
    ip: "하이큐!!",
    category: "피규어",
    price: 186000,
    condition: "A급",
    saleStatus: "예약중",
    description:
      "디스플레이 후 분해 보관했습니다. 도색 긁힘 없고 스탠드와 교체 손이 모두 있어요. 박스에 약한 모서리 눌림이 있습니다.",
    sellerId: "haru",
    likes: 154,
    motif: "figure",
    palette: { base: "#f8fafc", ink: "#1e293b", accent: "#38bdf8", soft: "#e2e8f0" },
    shippingFee: 4000,
    location: "서울 마포 · 직거래 가능",
    postedOrder: 15,
    postedLabel: "5시간 전",
  },
  {
    id: "hq-karasuno-bgs",
    title: "하이큐!! 카라스노 유니폼 카드 BGS 9.5",
    imageUrl: "https://d1c5n4ri2guedi.cloudfront.net/post/3118/contents/37790/819.png",
    ip: "하이큐!!",
    category: "TCG",
    price: 74000,
    condition: "BGS",
    saleStatus: "판매중",
    description:
      "서브그레이드 센터링 9.5. 케이스 스크래치 없는 국내 보관품이고, 감정 라벨 사진과 팝 리포트를 채팅으로 보내 드려요.",
    sellerId: "slab",
    likes: 96,
    motif: "card",
    palette: court,
    shippingFee: 2500,
    location: "서울 성동 · 택배",
    postedOrder: 14,
    postedLabel: "어제",
  },
  {
    id: "bl-ichigo-figure",
    title: "블리치 쿠로사키 이치고 피규어",
    imageUrl: "https://image.aladin.co.kr/product/19028/18/cover500/f402635193_1.jpg",
    ip: "블리치",
    category: "피규어",
    price: 68000,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "검과 코트 파츠가 모두 있습니다. 관절 느슨함 없고, 진열은 유리장 안에서만 했어요. 박스와 설명서를 함께 드립니다.",
    sellerId: "orange",
    likes: 121,
    motif: "figure",
    palette: bleach,
    shippingFee: 3000,
    location: "서울 마포 · 택배",
    postedOrder: 13,
    postedLabel: "어제",
  },
  {
    id: "bl-ichigo-sp",
    title: "블리치 카드 이치고 SP BGS 블랙 라벨",
    imageUrl: "https://chitoroshop.com/cdn/shop/files/OnePieceTCG-2026-08-29T134809.657.jpg?v=1787978895&width=493",
    ip: "블리치",
    category: "TCG",
    price: 420000,
    condition: "BGS",
    saleStatus: "판매중",
    description:
      "블랙 라벨 서브그레이드입니다. 케이스 택을 유지한 채 보관했고, 직거래 시 슬랩 실물을 확인하실 수 있어요.",
    sellerId: "slab",
    likes: 240,
    motif: "card",
    palette: bleach,
    shippingFee: 0,
    location: "서울 성동 · 안전결제",
    postedOrder: 12,
    postedLabel: "2일 전",
  },
  {
    id: "bl-rukia-stand",
    title: "블리치 루키아 아크릴 스탠드",
    imageUrl: "https://animate.godohosting.com/Goods/4550621254727.jpg",
    ip: "블리치",
    category: "산리오/굿즈",
    price: 28000,
    condition: "A급",
    saleStatus: "판매중",
    description:
      "보호 필름을 붙인 채 보관했습니다. 모서리 흰색 벗겨짐이 없고, 받침대 포함입니다. 소량 먼지는 출고 전에 정리해요.",
    sellerId: "orange",
    likes: 44,
    motif: "pouch",
    palette: bleach,
    shippingFee: 2500,
    location: "서울 마포 · 택배",
    postedOrder: 11,
    postedLabel: "2일 전",
  },
  {
    id: "sanrio-cinnamoroll",
    title: "산리오 시나모롤 20주년 인형",
    imageUrl: "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/4982133431/A2.jpg?867000000",
    ip: "산리오",
    category: "산리오/굿즈",
    price: 54000,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "20주년 태그가 그대로인 미개봉 인형입니다. 비닐 구김이 적고 먼지 없는 서랍 보관품이에요. 선물용 포장도 가능합니다.",
    sellerId: "momo",
    likes: 412,
    motif: "plush",
    palette: sky,
    shippingFee: 3000,
    location: "경기 성남 · 택배",
    postedOrder: 10,
    postedLabel: "3일 전",
  },
  {
    id: "sanrio-kitty-pouch",
    title: "산리오 헬로키티 빈티지 파우치",
    imageUrl: "https://asset.m-gs.kr/prod/1103755406/1/550",
    ip: "산리오",
    category: "산리오/굿즈",
    price: 36000,
    condition: "A급",
    saleStatus: "판매중",
    description:
      "안감 오염 없고 지퍼가 부드럽게 움직입니다. 겉면 프린트가 선명하고, 금속 장식 변색은 없어요. 실사용 사진 3장을 올려 두었어요.",
    sellerId: "momo",
    likes: 188,
    motif: "pouch",
    palette: ribbon,
    shippingFee: 2500,
    location: "경기 성남 · 택배",
    postedOrder: 9,
    postedLabel: "3일 전",
  },
  {
    id: "sanrio-kuromi-set",
    title: "산리오 쿠로미 페이스 파우치 세트",
    imageUrl: "https://kittyya.com/web/product/big/202502/4d2baab89f5b7230d130baeff134b549.jpg",
    ip: "산리오",
    category: "산리오/굿즈",
    price: 42000,
    condition: "S급 미개봉",
    saleStatus: "판매완료",
    description:
      "페이스 파우치와 미니 참이 한 세트입니다. 미개봉 실링이 유지되어 있고, 한정수량 태그가 부착되어 있어요.",
    sellerId: "momo",
    likes: 503,
    motif: "pouch",
    palette: night,
    shippingFee: 3000,
    location: "경기 성남 · 택배",
    postedOrder: 8,
    postedLabel: "4일 전",
  },
  {
    id: "pkmn-charizard-psa10",
    title: "포켓몬 리자몽 ex SAR PSA10",
    imageUrl: "https://image.wyyyes.com/svc/sellers/xoNCbbMaIgbUcGoBqbPAasn5XPt1/stock/49628226_4b0b22f4-06c9-4417-86ad-251d336b2632.jpg",
    ip: "포켓몬",
    category: "TCG",
    price: 1280000,
    condition: "PSA10",
    saleStatus: "판매중",
    description:
      "젬민트 슬랩입니다. 홀로그램이 선명하고 케이스 모서리 찍힘이 없어요. 최근 팝 리포트와 구매 영수증을 함께 전달합니다.",
    sellerId: "slab",
    likes: 860,
    motif: "card",
    palette: ember,
    shippingFee: 0,
    location: "서울 성동 · 안전결제",
    postedOrder: 7,
    postedLabel: "4일 전",
  },
  {
    id: "pkmn-pikachu-psa10",
    title: "포켓몬 151 피카츄 마스터볼 미러 PSA10",
    imageUrl: "https://image.wyyyes.com/svc/sellers/YyfrdBC52JT0vKeNlX9bPAAGq1Vw/stock/49607578_30768006-5b2c-4105-9fc6-8f7ec190e3b4.jpg",
    ip: "포켓몬",
    category: "TCG",
    price: 860000,
    condition: "PSA10",
    saleStatus: "예약중",
    description:
      "151 마스터볼 미러 피카츄 PSA10. 라벨 선명하고 슬랩 내부 먼지가 없습니다. 예약 확정 전 추가 사진을 보내 드려요.",
    sellerId: "slab",
    likes: 640,
    motif: "card",
    palette: bolt,
    shippingFee: 0,
    location: "서울 성동 · 직거래 가능",
    postedOrder: 6,
    postedLabel: "5일 전",
  },
  {
    id: "pkmn-eevee-figure",
    title: "포켓몬 이브이 프라임 피규어",
    imageUrl: "https://dstone.co.kr/wp-content/uploads/2025/08/hobbypokemon_funism9_thumnail.jpg",
    ip: "포켓몬",
    category: "피규어",
    price: 75000,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "정품 실링 미개봉입니다. 박스 광택이 살아 있고 눌림이 없어요. 컬렉터 선반에서 세워서만 보관했습니다.",
    sellerId: "chii",
    likes: 205,
    motif: "figure",
    palette: { base: "#fff7ed", ink: "#9a3412", accent: "#fb923c", soft: "#ffedd5" },
    shippingFee: 3000,
    location: "부산 수영 · 택배",
    postedOrder: 5,
    postedLabel: "5일 전",
  },
  {
    id: "pkmn-eevee-promo",
    title: "포켓몬 이브이 프로모 카드",
    imageUrl: "https://image.wyyyes.com/svc/sellers/GyddoFInq2hJAtUMyndaBk04GW72/stock/49447461_0fa996fe-a66a-447f-9507-f9f6d7bd39d8.jpg",
    ip: "포켓몬",
    category: "TCG",
    price: 45000,
    condition: "A급",
    saleStatus: "판매중",
    description:
      "더블 슬리브에 넣어 둔 프로모입니다. 화이트닝은 없고 모서리 하나가 아주 약하게 둥글어요. 표면 사진은 채팅으로 보내 드립니다.",
    sellerId: "slab",
    likes: 77,
    motif: "card",
    palette: bolt,
    shippingFee: 2000,
    location: "서울 성동 · 택배",
    postedOrder: 4,
    postedLabel: "지난주",
  },
  {
    id: "chii-secret-plush",
    title: "먼작귀 치이카와 인형 시크릿",
    imageUrl: "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/9674085407/B.jpg?185939818",
    ip: "먼작귀",
    category: "산리오/굿즈",
    price: 98000,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "시크릿 확정 인형입니다. 비닐과 태그가 그대로이고 박스 눌림이 없어요. 먼작귀 최애 라인만 모으던 컬렉션에서 나왔어요.",
    sellerId: "chii",
    likes: 734,
    motif: "plush",
    palette: cream,
    shippingFee: 3000,
    location: "부산 수영 · 택배",
    postedOrder: 3,
    postedLabel: "지난주",
  },
  {
    id: "chii-hachiware-key",
    title: "먼작귀 하치와레 아크릴 키링",
    imageUrl: "https://arekore.co.kr/web/product/big/202208/9319af40e51bb9a85e2c0c25b4eff44e.jpg",
    ip: "먼작귀",
    category: "산리오/굿즈",
    price: 18000,
    condition: "B급",
    saleStatus: "판매중",
    description:
      "사용감이 있는 키링입니다. 아크릴 면에 잔기스가 있고 고리는 교체했어요. 프린트 벗겨짐은 없어서 데일리로 쓰기 좋아요.",
    sellerId: "chii",
    likes: 39,
    motif: "pouch",
    palette: hachi,
    shippingFee: 2000,
    location: "부산 수영 · 택배",
    postedOrder: 2,
    postedLabel: "지난주",
  },
  {
    id: "chii-usagi-mini",
    title: "먼작귀 우사기 미니 피규어",
    imageUrl: "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/9685761281/B.jpg?675239897",
    ip: "먼작귀",
    category: "피규어",
    price: 32000,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "미니 피규어 본체와 받침대가 모두 있습니다. 도색 번짐이 없고 박스도 함께 드려요. 진열 외 사용 흔적은 없습니다.",
    sellerId: "chii",
    likes: 143,
    motif: "figure",
    palette: usagi,
    shippingFee: 2500,
    location: "부산 수영 · 택배",
    postedOrder: 1,
    postedLabel: "지난주",
  },
];

export const CHAT_ROOMS: ChatRoom[] = [
  {
    id: "room-hinata",
    productId: "hq-hinata-nendo",
    sellerName: "하루",
    sellerHandle: "@haru.court",
    unread: 2,
    messages: [
      {
        id: "m1",
        sender: "me",
        text: "슈링크 모서리 사진 한 장만 더 부탁드려도 될까요?",
        at: "오후 7:41",
      },
      {
        id: "m2",
        sender: "seller",
        text: "네, 네 면 다 찍어 두었어요. 눌림 없는 쪽만 골라 올려드릴게요.",
        at: "오후 7:44",
      },
      {
        id: "m3",
        sender: "seller",
        text: "택배는 우체국이고, 완충재 이중으로 포장합니다.",
        at: "오후 7:45",
      },
    ],
  },
  {
    id: "room-charizard",
    productId: "pkmn-charizard-psa10",
    sellerName: "카드서랍",
    sellerHandle: "@slab.drawer",
    unread: 0,
    messages: [
      {
        id: "m4",
        sender: "seller",
        text: "리자몽 SAR PSA10 실물 앞면이에요. 케이스 택도 그대로입니다.",
        at: "오후 6:12",
      },
      {
        id: "m5",
        sender: "me",
        text: "팝 리포트도 같이 볼 수 있을까요?",
        at: "오후 6:18",
      },
      {
        id: "m6",
        sender: "seller",
        text: "방금 캡처해서 다음에 첨부해 둘게요. 직거래는 성수에서 가능해요.",
        at: "오후 6:20",
      },
    ],
  },
  {
    id: "room-chiikawa",
    productId: "chii-secret-plush",
    sellerName: "치이",
    sellerHandle: "@chii.pocket",
    unread: 1,
    messages: [
      {
        id: "m7",
        sender: "me",
        text: "시크릿 태그 색이 맞는지 한 번만 확인해 주실래요? ✨",
        at: "오후 8:02",
      },
      {
        id: "m8",
        sender: "seller",
        text: "맞아요. 시크릿 확정 태그이고 비닐도 안 열었어요.",
        at: "오후 8:05",
      },
    ],
  },
];

export const ORDERS: Order[] = [
  {
    id: "SPK-240221",
    role: "purchase",
    productId: "sanrio-kitty-pouch",
    title: "산리오 헬로키티 빈티지 파우치",
    ip: "산리오",
    price: 36000,
    condition: "A급",
    motif: "pouch",
    palette: ribbon,
    status: "결제완료",
    orderedAt: "2026.10.26",
    counterpart: "모모",
    address: "서울특별시 성동구 연무장길 12, 4층",
    paymentMethod: "카카오페이",
    tracking: null,
    review: null,
  },
  {
    id: "SPK-240198",
    role: "purchase",
    productId: "pkmn-eevee-promo",
    title: "포켓몬 이브이 프로모 카드",
    ip: "포켓몬",
    price: 47000,
    condition: "A급",
    motif: "card",
    palette: bolt,
    status: "배송중",
    orderedAt: "2026.10.24",
    counterpart: "카드서랍",
    address: "서울특별시 성동구 연무장길 12, 4층",
    paymentMethod: "신용/체크카드",
    tracking: "SPK3849201",
    review: null,
  },
  {
    id: "SPK-240144",
    role: "purchase",
    productId: "hq-karasuno-bgs",
    title: "하이큐!! 카라스노 유니폼 카드 BGS 9.5",
    ip: "하이큐!!",
    price: 74000,
    condition: "BGS",
    motif: "card",
    palette: court,
    status: "배송완료",
    orderedAt: "2026.10.20",
    counterpart: "카드서랍",
    address: "서울특별시 마포구 양화로 45",
    paymentMethod: "토스페이",
    tracking: "SPK3841102",
    review: null,
  },
  {
    id: "SPK-240090",
    role: "purchase",
    productId: "chii-usagi-mini",
    title: "먼작귀 우사기 미니 피규어",
    ip: "먼작귀",
    price: 32000,
    condition: "S급",
    motif: "figure",
    palette: usagi,
    status: "구매확정",
    orderedAt: "2026.10.12",
    counterpart: "치이",
    address: "서울특별시 성동구 연무장길 12, 4층",
    paymentMethod: "네이버페이",
    tracking: "SPK3833008",
    review: null,
  },
  {
    id: "SPK-239880",
    role: "sale",
    productId: "bl-rukia-stand",
    title: "블리치 루키아 아크릴 스탠드",
    ip: "블리치",
    price: 28000,
    condition: "A급",
    motif: "pouch",
    palette: bleach,
    status: "배송중",
    orderedAt: "2026.10.23",
    counterpart: "소라",
    address: "경기 성남시 분당구 판교역로 15",
    paymentMethod: "무통장입금",
    tracking: "SPK3845510",
    review: null,
  },
];

export const SELLER_REPLIES = [
  "네, 확인해 보고 바로 답드릴게요.",
  "실물 사진이 더 필요하면 어느 부분인지 알려 주세요.",
  "택배는 우체국이고, 배송비는 상품 정보에 적힌 그대로예요.",
  "직거래는 주말 오후에 맞춰 볼 수 있어요.",
];

export function categoryFromSlug(slug: string): Category | null {
  return CATEGORY_ROUTES.find((route) => route.slug === slug)?.label ?? null;
}

export function categoryHref(category: Category) {
  return `/c/${CATEGORY_ROUTES.find((route) => route.label === category)?.slug ?? "tcg"}`;
}

export function getProductById(id: string) {
  return PRODUCTS.find((product) => product.id === id) ?? null;
}

export function getSeller(id: string) {
  return SELLERS.find((seller) => seller.id === id) ?? SELLERS[0];
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

export function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(date);
}

export const ADMIN_DEMO = {
  email: "admin@spark.market",
  password: "sparkadmin",
} as const;

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: "슈퍼 관리자" | "운영" | "고객지원";
  lastSeen: string;
};

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  { id: "admin-ceo", name: "여도원", email: "admin@spark.market", role: "슈퍼 관리자", lastSeen: "2026.10.27 21:12" },
  { id: "admin-ops", name: "하나", email: "hana@spark.market", role: "운영", lastSeen: "2026.10.27 18:40" },
  { id: "admin-cs", name: "린", email: "rin@spark.market", role: "고객지원", lastSeen: "2026.10.26 22:15" },
];

export type MembershipTier = "스파크" | "실버" | "골드" | "플래티넘";

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  adultVerified: boolean;
  joinedAt: string;
  country: string;
  membership: MembershipTier;
  ip: string;
  os: string;
  suspended: boolean;
  reports: number;
};

export const ADMIN_MEMBERS: AdminMember[] = [
  { id: "mem-seoyeon", name: "김서연", email: "seoyeon@spark.market", adultVerified: true, joinedAt: "2026.10.27", country: "한국", membership: "골드", ip: "211.234.18.42", os: "Windows 11 · Chrome 131", suspended: false, reports: 0 },
  { id: "mem-minji", name: "박민지", email: "minji@spark.market", adultVerified: false, joinedAt: "2026.10.27", country: "한국", membership: "스파크", ip: "121.140.72.15", os: "iOS 18.2 · Safari", suspended: false, reports: 0 },
  { id: "mem-haru", name: "하루", email: "haru.court@spark.market", adultVerified: true, joinedAt: "2024.03.12", country: "일본", membership: "플래티넘", ip: "126.102.44.9", os: "macOS 15.1 · Safari", suspended: false, reports: 0 },
  { id: "mem-momo", name: "모모", email: "momo.ribbon@spark.market", adultVerified: true, joinedAt: "2024.11.02", country: "일본", membership: "골드", ip: "133.32.18.77", os: "Android 15 · Chrome", suspended: false, reports: 0 },
  { id: "mem-slab", name: "카드서랍", email: "slab.drawer@spark.market", adultVerified: true, joinedAt: "2025.01.19", country: "미국", membership: "실버", ip: "104.28.91.6", os: "Windows 10 · Edge 131", suspended: false, reports: 1 },
  { id: "mem-chii", name: "치이", email: "chii.pocket@spark.market", adultVerified: true, joinedAt: "2023.08.30", country: "한국", membership: "플래티넘", ip: "175.223.40.118", os: "iPadOS 18.1 · Safari", suspended: false, reports: 0 },
  { id: "mem-orange", name: "오렌지코트", email: "orange.coat@spark.market", adultVerified: true, joinedAt: "2025.06.14", country: "미국", membership: "스파크", ip: "172.56.11.203", os: "Android 14 · Samsung Internet", suspended: true, reports: 2 },
  { id: "mem-sora", name: "소라", email: "sora@spark.market", adultVerified: false, joinedAt: "2026.09.03", country: "중국", membership: "실버", ip: "39.7.22.154", os: "macOS 14.6 · Chrome 130", suspended: false, reports: 0 },
];

export const ADDRESS_LIMIT = 10;
export const ADDRESS_LIMIT_MESSAGE = "다른 주소를 삭제 후 등록하세요.";

export type ShippingAddress = {
  id: string;
  name: string;
  phone: string;
  address: string;
  detail: string;
  postalCode: string;
  isDefault: boolean;
};

export type AddressDraft = {
  name: string;
  phone: string;
  address: string;
  detail: string;
  postalCode: string;
  isDefault: boolean;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export const ADMIN_CATEGORIES: AdminCategory[] = [
  { id: "cat-tcg", name: "TCG", slug: "tcg" },
  { id: "cat-figure", name: "피규어", slug: "figure" },
  { id: "cat-goods", name: "산리오/굿즈", slug: "goods" },
];

export const PRODUCT_FLAGS = [
  { productId: "sanrio-kuromi-set", flag: "신고" as const, reason: "가품 의심 제보" },
  { productId: "bl-ichigo-sp", flag: "금지" as const, reason: "거래 불가 이미지 포함" },
];

export const ADMIN_TRADE_STATUSES = ["결제완료", "배송중", "배송완료", "구매확정", "거래취소", "분쟁"] as const;
export type AdminTradeStatus = (typeof ADMIN_TRADE_STATUSES)[number];

export type AdminTrade = {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  amount: number;
  status: AdminTradeStatus;
  orderedAt: string;
};

export const ADMIN_TRADES: AdminTrade[] = [
  { id: "SPK-240318", title: "포켓몬 리자몽 ex SAR PSA10", buyer: "김서연", seller: "카드서랍", amount: 1280000, status: "결제완료", orderedAt: "2026.10.27" },
  { id: "SPK-240317", title: "먼작귀 치이카와 인형 시크릿", buyer: "박민지", seller: "치이", amount: 98000, status: "결제완료", orderedAt: "2026.10.27" },
  { id: "SPK-240221", title: "산리오 헬로키티 빈티지 파우치", buyer: "김서연", seller: "모모", amount: 36000, status: "결제완료", orderedAt: "2026.10.26" },
  { id: "SPK-240198", title: "포켓몬 이브이 프로모 카드", buyer: "김서연", seller: "카드서랍", amount: 47000, status: "배송중", orderedAt: "2026.10.24" },
  { id: "SPK-240144", title: "하이큐!! 카라스노 유니폼 카드 BGS 9.5", buyer: "김서연", seller: "카드서랍", amount: 74000, status: "배송완료", orderedAt: "2026.10.20" },
  { id: "SPK-239880", title: "블리치 루키아 아크릴 스탠드", buyer: "소라", seller: "오렌지코트", amount: 28000, status: "분쟁", orderedAt: "2026.10.23" },
  { id: "SPK-240090", title: "먼작귀 우사기 미니 피규어", buyer: "김서연", seller: "치이", amount: 32000, status: "구매확정", orderedAt: "2026.10.12" },
];

export const SETTLEMENT_STATUSES = ["정산대기", "승인완료", "보류"] as const;
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number];

export type AdminSettlement = {
  id: string;
  seller: string;
  email: string;
  amount: number;
  trades: number;
  requestedAt: string;
  status: SettlementStatus;
};

export const ADMIN_SETTLEMENTS: AdminSettlement[] = [
  { id: "stl-1042", seller: "카드서랍", email: "slab.drawer@spark.market", amount: 1860000, trades: 4, requestedAt: "2026.10.27", status: "정산대기" },
  { id: "stl-1041", seller: "치이", email: "chii.pocket@spark.market", amount: 130000, trades: 2, requestedAt: "2026.10.27", status: "정산대기" },
  { id: "stl-1033", seller: "모모", email: "momo.ribbon@spark.market", amount: 54000, trades: 1, requestedAt: "2026.10.25", status: "보류" },
  { id: "stl-1020", seller: "하루", email: "haru.court@spark.market", amount: 92000, trades: 1, requestedAt: "2026.10.18", status: "승인완료" },
];

export type InquiryStatus = "미답변" | "답변완료";

export type AdminInquiry = {
  id: string;
  member: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
  status: InquiryStatus;
  reply: string;
};

export const ADMIN_INQUIRIES: AdminInquiry[] = [
  {
    id: "inq-331",
    member: "김서연",
    email: "seoyeon@spark.market",
    subject: "리자몽 카드 배송이 아직 출발 전이에요",
    body: "어제 결제했는데 판매자 운송장 안내가 없어요. 확인 부탁드려요.",
    createdAt: "2026.10.27 14:20",
    status: "미답변",
    reply: "",
  },
  {
    id: "inq-328",
    member: "박민지",
    email: "minji@spark.market",
    subject: "성인 인증 번호가 오지 않아요",
    body: "회원가입 중 인증번호 받기를 눌렀는데 문자가 안 옵니다.",
    createdAt: "2026.10.27 11:05",
    status: "미답변",
    reply: "",
  },
  {
    id: "inq-301",
    member: "치이",
    email: "chii.pocket@spark.market",
    subject: "정산 계좌를 바꾸고 싶어요",
    body: "부산은행 계좌로 변경 요청합니다. 통장 사본은 메일로 보냈어요.",
    createdAt: "2026.10.22 16:40",
    status: "답변완료",
    reply: "계좌 변경은 다음 정산분부터 반영됩니다. 사본 확인했어요.",
  },
];

export const REPORT_STATUSES = ["접수", "처리중", "조치완료", "기각"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type AdminReport = {
  id: string;
  targetType: "매물" | "회원";
  targetLabel: string;
  productId?: string;
  reason: string;
  reporter: string;
  createdAt: string;
  status: ReportStatus;
};

export const ADMIN_REPORTS: AdminReport[] = [
  { id: "rpt-88", targetType: "매물", targetLabel: "산리오 쿠로미 페이스 파우치 세트", productId: "sanrio-kuromi-set", reason: "가품 의심. 태그 폰트가 달라요.", reporter: "모모", createdAt: "2026.10.27 13:12", status: "접수" },
  { id: "rpt-84", targetType: "매물", targetLabel: "블리치 카드 이치고 SP BGS 블랙 라벨", productId: "bl-ichigo-sp", reason: "슬랩 사진이 다른 매물과 동일해요.", reporter: "카드서랍", createdAt: "2026.10.26 19:48", status: "처리중" },
  { id: "rpt-79", targetType: "회원", targetLabel: "오렌지코트", reason: "채팅에서 욕설 후 거래를 일방 취소했어요.", reporter: "소라", createdAt: "2026.10.24 21:03", status: "접수" },
  { id: "rpt-70", targetType: "매물", targetLabel: "먼작귀 하치와레 아크릴 키링", productId: "chii-hachiware-key", reason: "공식 이미지 도용 의심", reporter: "하루", createdAt: "2026.10.19 10:22", status: "기각" },
];

export const ADMIN_TODAY = "2026.10.27";
