export const CATEGORIES = ["피규어/프라모델", "TCG", "레고", "아트토이", "인형", "스퀴시/피젯토이"] as const;
export type Category = (typeof CATEGORIES)[number];
export type CategoryFilter = "전체" | Category;

export const ORIGINS = ["일본", "중국", "대만", "미국", "덴마크", "체코", "독일"] as const;
export type Origin = (typeof ORIGINS)[number];

export const CATEGORY_ROUTES = [
  { slug: "figure", label: "피규어/프라모델" },
  { slug: "tcg", label: "TCG" },
  { slug: "lego", label: "레고" },
  { slug: "art-toy", label: "아트토이" },
  { slug: "doll", label: "인형" },
  { slug: "fidget", label: "스퀴시/피젯토이" },
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
  shippingIncluded?: boolean;
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
  membership?: "vip";
  photoUrl?: string;
};

export const TEST_VERIFICATION_CODE = "5825";

export function averageSoldPrice(category: Category, products: Product[]) {
  const sold = products.filter((product) => product.category === category && product.saleStatus === "판매완료");
  if (sold.length === 0) return null;
  const total = sold.reduce((sum, product) => sum + product.price, 0);
  return Math.round((total / sold.length) * 100) / 100;
}

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
  originalText?: string;
  translatedText?: string;
  imageUrl?: string;
  videoUrl?: string;
  at: string;
  sentAt?: string;
  kind?: "purchase";
};

export type PurchaseStatus = "대기" | "거절" | "승인" | "결제완료";

export type PurchaseRequest = {
  status: PurchaseStatus;
  requestedAt: string;
  sellerAddress?: string;
  sellerAccount?: string;
  feeRate?: number;
  payout?: number;
};

export type ChatActivity = "활성" | "종료";

export type ChatRoom = {
  id: string;
  productId: string;
  sellerName: string;
  sellerHandle: string;
  unread: number;
  messages: ChatMessage[];
  purchase?: PurchaseRequest;
  buyerName?: string;
  buyerEmail?: string;
  sellerEmail?: string;
  activity?: ChatActivity;
  updatedAt?: string;
};

export const ORDER_STATUSES = ["결제완료", "배송중", "배송완료", "구매확정", "거래취소"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CANCEL_REASONS = ["단순 변심", "상품 정보와 다름", "배송 지연", "판매자와 협의", "기타"] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

export type CancelRequest = {
  reason: string;
  detail: string;
  requestedAt: string;
  autoCancelled?: boolean;
};

export type Order = {
  id: string;
  role: "purchase" | "sale";
  productId: string;
  title: string;
  ip: string;
  price: number;
  quantity?: number;
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
  cancelRequest?: CancelRequest;
  itemPrice?: number;
  shippingFee?: number;
  feeRate?: number;
  feeAmount?: number;
  payoutAmount?: number;
  customsNumber?: string;
  pgStatus?: "예치완료";
  priceLocked?: boolean;
  ownerEmail?: string;
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
  {
    id: "seoyeon",
    name: "김서연",
    handle: "@seoyeon.spark",
    rating: 4.9,
    sales: 12,
    bio: "포켓몬 카드와 레고를 주로 사고팔아요. 수령 사진을 후기에 남겨요.",
    city: "서울 성동",
  },
  {
    id: "minji",
    name: "박민지",
    handle: "@minji.spark",
    rating: 4.7,
    sales: 6,
    bio: "산리오와 먼작귀 인형만 모아요.",
    city: "부산 해운대",
  },
  {
    id: "sora",
    name: "소라",
    handle: "@sora.spark",
    rating: 4.6,
    sales: 4,
    bio: "블리치 굿즈를 정리하고 있어요.",
    city: "서울 마포",
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

const SHELF_SELLERS = ["haru", "momo", "slab", "chii", "orange"] as const;
const SHELF_PALETTES = [court, bleach, sky, ribbon, night, ember, bolt, cream, hachi, usagi];

type ShelfSpec = {
  title: string;
  ip: string;
  category: Category;
  motif: Motif;
  imageUrl: string;
  country: Origin;
  price: number;
  condition: Condition;
  description: string;
  saleStatus?: SaleStatus;
};

const SHELF_SPECS: ShelfSpec[] = [
  {
    title: "하이큐!! 히나타 뉴 카라스노 넨도로이드",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20200717/9795/72100/large/a487fe6bb9e40e517ce4c9bd5f9e9f48.jpg",
    country: "일본",
    price: 78,
    condition: "S급 미개봉",
    description: "2nd 유니폼 히나타입니다. 배구공, 네트, 계란덮밥 파츠가 밀봉된 채로 들어 있고 박스 광택이 살아 있어요.",
  },
  {
    title: "하이큐!! 보쿠토 코타로 넨도로이드",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20170105/6162/43091/large/7657cdb3d9819d6555bb6b0a31964a4b.jpg",
    country: "일본",
    price: 96,
    condition: "S급",
    description: "후쿠로다니 에이스 보쿠토입니다. 올빼미 표정과 배구 파츠를 진열만 했고, 도색 긁힘은 없습니다.",
  },
  {
    title: "하이큐!! 코즈메 켄마 넨도로이드",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20160122/5471/37410/large/3c256e22fc6046921cbf578ee86c8069.jpg",
    country: "일본",
    price: 110,
    condition: "A급",
    description: "게임기 파츠가 포함된 켄마입니다. 머리 도색은 깨끗하고, 박스 옆면에 약한 모서리 눌림만 있어요.",
  },
  {
    title: "하이큐!! 오이와카 토오루 넨도로이드",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20150910/5222/35450/large/aed380a4deffc184dd50045e637c5ce7.jpg",
    country: "일본",
    price: 124,
    condition: "S급",
    description: "아오바조사이 세터 오이와카입니다. 무릎 보호대와 배구공 파츠가 전부 있고 관절이 탄탄해요.",
  },
  {
    title: "블리치 히츠가야 토시로 넨도로이드",
    ip: "블리치",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20190910/8782/63539/large/6fb945d3cd61b939bdc13f8c2119415d.jpg",
    country: "일본",
    price: 88,
    condition: "S급 미개봉",
    description: "빙륜환 히츠가야입니다. 얼음 검 이펙트와 망토 파츠가 미개봉 트레이에 그대로 들어 있어요.",
  },
  {
    title: "블리치 이시다 우류 POP UP PARADE",
    ip: "블리치",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20231222/15375/125232/large/46933adda0b2d05545520fb256c83c0a.jpg",
    country: "일본",
    price: 62,
    condition: "S급",
    description: "활을 든 우류 피규어입니다. 흰 망토 음영이 고르고, 받침대와 박스를 같이 드립니다.",
  },
  {
    title: "포켓몬 레드와 그린 넨도로이드",
    ip: "포켓몬",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20160224/5512/37802/large/d6151cd48807ea478ce97e282743f587.jpg",
    country: "일본",
    price: 145,
    condition: "A급",
    description: "레드와 그린이 한 상자인 세트입니다. 모자 파츠 두 개와 스탠드가 있고, 진열 외 사용감은 없어요.",
  },
  {
    title: "먼작귀 치이카와 넨도로이드",
    ip: "먼작귀",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230602/14452/116034/large/2a093446166d86853155c779469dfe40.jpg",
    country: "일본",
    price: 72,
    condition: "S급 미개봉",
    description: "치이카와 넨도로이드 미개봉입니다. 표정 파츠 트레이 실링이 붙어 있고 박스 눌림이 없어요.",
  },
  {
    title: "산리오 시나모롤 넨도로이드",
    ip: "산리오",
    category: "피규어/프라모델",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20221207/13646/108567/large/41c193de8e27306af97a82ddeceecac6.jpg",
    country: "일본",
    price: 84,
    condition: "S급",
    description: "시나모롤 본체와 꼬리, 구름 받침대가 모두 있습니다. 귀 도색이 맑고 직사광선 없이 보관했어요.",
  },
  {
    title: "포켓몬 베이스 세트 거북왕",
    ip: "포켓몬",
    category: "TCG",
    motif: "card",
    imageUrl: "https://assets.tcgdex.net/en/base/base1/2/high.webp",
    country: "미국",
    price: 310,
    condition: "S급",
    description: "영어판 베이스 세트 거북왕입니다. 등껍질 홀로그램이 선명하고 모서리 화이트닝은 없어요.",
  },
  {
    title: "포켓몬 베이스 세트 이상해꽃",
    ip: "포켓몬",
    category: "TCG",
    motif: "card",
    imageUrl: "https://assets.tcgdex.net/en/base/base1/15/high.webp",
    country: "미국",
    price: 265,
    condition: "A급",
    description: "꽃잎 홀로가 살아 있는 이상해꽃입니다. 하단 모서리 하나만 살짝 둥글고 표면 기스는 없습니다.",
  },
  {
    title: "포켓몬 정글 잠만보",
    ip: "포켓몬",
    category: "TCG",
    motif: "card",
    imageUrl: "https://assets.tcgdex.net/en/base/base2/11/high.webp",
    country: "일본",
    price: 54,
    condition: "A급",
    description: "정글 세트 잠만보입니다. 더블 슬리브에 넣어 두었고, 뒷면 얼룩 없이 중앙이 깨끗해요.",
  },
  {
    title: "유희왕 블랙 매지션",
    ip: "유희왕",
    category: "TCG",
    motif: "card",
    imageUrl: "https://images.ygoprodeck.com/images/cards/46986414.jpg",
    country: "일본",
    price: 42,
    condition: "S급",
    description: "블랙 매지션 울트라 레어입니다. 이름 박 스크래치가 없고 슬리브에서 빼 둔 적이 거의 없어요.",
  },
  {
    title: "유희왕 스타더스트 드래곤",
    ip: "유희왕",
    category: "TCG",
    motif: "card",
    imageUrl: "https://images.ygoprodeck.com/images/cards/44508094.jpg",
    country: "미국",
    price: 28,
    condition: "A급",
    description: "싱크로 몬스터 스타더스트입니다. 홀로 포일이 고르고 모서리 흰 점이 하나 있어요.",
  },
  {
    title: "유희왕 레드아이즈 블랙 드래곤",
    ip: "유희왕",
    category: "TCG",
    motif: "card",
    imageUrl: "https://images.ygoprodeck.com/images/cards/74677422.jpg",
    country: "일본",
    price: 36,
    condition: "S급",
    description: "붉은 눈의 흑룡입니다. 프레임 휨이 없고 앞면 광택을 천으로만 관리했습니다.",
  },
  {
    title: "레고 보태니컬 난초 10311",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/10311-1.jpg",
    country: "덴마크",
    price: 58,
    condition: "S급 미개봉",
    description: "10311 난초 미개봉입니다. 박스 테이프가 그대로이고 꽃잎 봉투 번호가 모두 보여요.",
  },
  {
    title: "레고 스타워즈 밀레니엄 팔콘 75375",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/75375-1.jpg",
    country: "덴마크",
    price: 189,
    condition: "S급 미개봉",
    description: "75375 팔콘입니다. 대형 박스 모서리가 곧고 실링을 뜯지 않았어요. 설명서 비닐도 붙어 있습니다.",
  },
  {
    title: "레고 해리포터 호그와트 성 71043",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/71043-1.jpg",
    country: "덴마크",
    price: 420,
    condition: "A급",
    description: "71043 호그와트입니다. 미니피겨 봉투는 개봉하지 않았고, 박스 윗면에 택배 밴드 자국만 있어요.",
  },
  {
    title: "레고 테크닉 페라리 데이토나 SP3 42143",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/42143-1.jpg",
    country: "덴마크",
    price: 310,
    condition: "S급 미개봉",
    description: "42143 데이토나입니다. 오렌지 박스 광택이 남아 있고 부품 봉투를 확인하지 않은 새 제품이에요.",
  },
  {
    title: "레고 아키텍처 도쿄 21051",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/21051-1.jpg",
    country: "덴마크",
    price: 64,
    condition: "S급",
    description: "21051 도쿄 스카이라인입니다. 한 번 조립했다가 분해해 넘버백에 돌려 넣었고 분실 부품은 없어요.",
  },
  {
    title: "레고 아이디어 타자기 21327",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/21327-1.jpg",
    country: "덴마크",
    price: 210,
    condition: "S급 미개봉",
    saleStatus: "예약중",
    description: "21327 타자기 미개봉입니다. 옆면 아트 스크래치가 없고 예약 중인 컬렉터 보관품이에요.",
  },
  {
    title: "레고 아이콘 타이타닉 10294",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/10294-1.jpg",
    country: "덴마크",
    price: 640,
    condition: "S급 미개봉",
    description: "10294 타이타닉입니다. 롱박스 양 끝이 찌그러지지 않았고 내부 트레이 실링을 유지하고 있어요.",
  },
  {
    title: "레고 아이콘 콜로세움 10276",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/10276-1.jpg",
    country: "덴마크",
    price: 520,
    condition: "A급",
    description: "10276 콜로세움입니다. 설명서에 접힌 자국이 없고, 외박스만 이사하며 모서리가 살짝 눌렸어요.",
  },
  {
    title: "레고 보태니컬 분재 10281",
    ip: "레고",
    category: "레고",
    motif: "figure",
    imageUrl: "https://images.brickset.com/sets/images/10281-1.jpg",
    country: "덴마크",
    price: 49,
    condition: "S급 미개봉",
    description: "10281 분재입니다. 분홍 꽃 파츠 봉투가 밀봉되어 있고 화분 스티커 시트도 미사용이에요.",
  },
  {
    title: "하이큐!! 카게야마 넨도로이드 핀",
    ip: "하이큐!!",
    category: "아트토이",
    motif: "pouch",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20221116/13556/107323/large/ccad2077d4cdf48192ec3dd8e32d4382.png",
    country: "일본",
    price: 18,
    condition: "S급 미개봉",
    description: "카게야마 얼굴 핀입니다. 블리스터 카드가 휘지 않았고 뒷면 핀 캡이 붙어 있어요.",
  },
  {
    title: "하이큐!! 히나타 이벤트 핀",
    ip: "하이큐!!",
    category: "아트토이",
    motif: "pouch",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230120/13845/110412/large/c0963709dc84e736999561bc5dba14ab.png",
    country: "일본",
    price: 34,
    condition: "S급",
    description: "이벤트 한정 히나타 핀입니다. 배경 시트 색이 바래지 않았고 케이스 기스 없이 보관했어요.",
  },
  {
    title: "포켓몬 피카츄 페이스 파츠 케이스",
    ip: "포켓몬",
    category: "아트토이",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20170622/6517/46395/large/330f6afc4f3473e47ab1fe0c0319cb09.jpg",
    country: "일본",
    price: 46,
    condition: "A급",
    description: "피카츄 얼굴 파츠를 넣는 케이스입니다. 볼 터치 프린트가 선명하고 경첩이 부드럽게 닫혀요.",
  },
  {
    title: "하츠네 미쿠 시나모롤 콜라보 넨도로이드",
    ip: "산리오",
    category: "아트토이",
    motif: "figure",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20231120/15245/123617/large/3993a92217f9075c2e491e01893a5256.jpg",
    country: "일본",
    price: 132,
    condition: "S급 미개봉",
    description: "시나모롤 후드를 쓴 미쿠 콜라보입니다. 귀 파츠와 특전 시트가 미개봉 봉투에 들어 있어요.",
  },
  {
    title: "산리오 마이멜로디 키구루미 파자마 돌",
    ip: "산리오",
    category: "인형",
    motif: "plush",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230118/13814/110169/large/bdfe13b87c1a20c9ece16f0e43595c3e.jpg",
    country: "일본",
    price: 44,
    condition: "S급 미개봉",
    description: "마이멜로디 후드 파자마입니다. 귀 안감 색이 균일하고 포장 비닐을 개봉하지 않았어요.",
  },
  {
    title: "산리오 폼폼푸린 키구루미 파자마 돌",
    ip: "산리오",
    category: "인형",
    motif: "plush",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20221019/13433/111126/large/99efa5f94688134efd3b3d9fbf2b9cde.jpg",
    country: "일본",
    price: 41,
    condition: "S급",
    description: "폼폼푸린 베레모 파자마입니다. 노란 천에 보풀이 없고 단추 파츠가 봉투에 남아 있어요.",
  },
  {
    title: "먼작귀 치이카와 인형",
    ip: "먼작귀",
    category: "인형",
    motif: "plush",
    imageUrl: "https://chiikawamarket.jp/cdn/shop/files/4571609387930_1_grande.jpg",
    country: "일본",
    price: 38,
    condition: "S급 미개봉",
    description: "기본형 치이카와 인형입니다. 발바닥 태그가 달려 있고 솜이 한쪽으로 몰리지 않았어요.",
  },
  {
    title: "먼작귀 하치와레 인형",
    ip: "먼작귀",
    category: "인형",
    motif: "plush",
    imageUrl: "https://chiikawamarket.jp/cdn/shop/files/4571609387947_1_grande.jpg",
    country: "일본",
    price: 36,
    condition: "S급",
    description: "하치와레 인형입니다. 줄무늬 귀와 눈 자수가 사진과 같고, 진열만 한 상태예요.",
  },
  {
    title: "먼작귀 우사기 인형",
    ip: "먼작귀",
    category: "인형",
    motif: "plush",
    imageUrl: "https://chiikawamarket.jp/cdn/shop/files/4571609387954_1.jpg",
    country: "일본",
    price: 39,
    condition: "A급",
    description: "우사기 인형입니다. 긴 귀 봉제가 곧고, 한쪽 발에 아주 약한 진열 눌림만 있어요.",
  },
  {
    title: "먼작귀 우사기 선물 인형",
    ip: "먼작귀",
    category: "인형",
    motif: "plush",
    imageUrl: "https://cdn.shopify.com/s/files/1/0626/7142/1681/files/4571609378655_1.jpg?v=1763539801",
    country: "일본",
    price: 58,
    condition: "S급 미개봉",
    description: "Present for You 우사기입니다. 선물 보넷과 리본이 달린 별도 의상 인형이고 태그가 붙어 있어요.",
  },
  {
    title: "슈타이프 피카츄 인형",
    ip: "포켓몬",
    category: "인형",
    motif: "plush",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20151112/5328/36740/large/22de2db5547ffcef329a6607bfd47822.jpg",
    country: "독일",
    price: 240,
    condition: "S급",
    description: "슈타이프 봉제 피카츄입니다. 가슴 버튼과 귀 단추 심이 온전하고 모헤어 눌림이 없어요.",
  },
  {
    title: "피젯 큐브 블랙",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Fidget_Cube_nero_e_rosso.jpeg",
    country: "독일",
    price: 19,
    condition: "A급",
    description: "검은 바디에 빨간 버튼이 있는 큐브입니다. 다섯 면의 스위치가 모두 걸리지 않고 움직여요.",
  },
  {
    title: "데스크 피젯 토이 세트",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Fidget_Toys_1.jpg",
    country: "미국",
    price: 27,
    condition: "S급",
    description: "클릭 바와 롤러가 섞인 데스크 세트입니다. 스프링 탄성이 남아 있고 도금 벗겨짐은 없어요.",
  },
  {
    title: "바이크 체인 피젯",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/A_%22bike_chain%22_type_fidget_toy.jpg",
    country: "체코",
    price: 16,
    condition: "A급",
    description: "자전거 체인형 피젯입니다. 마디가 부드럽게 접히고 금속 이음에 녹은 없습니다.",
  },
  {
    title: "베글레리 세트",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Modern_begleri_assortment.jpg",
    country: "체코",
    price: 22,
    condition: "S급",
    saleStatus: "예약중",
    description: "구슬 무게가 다른 베글레리 여러 개입니다. 줄 올풀림이 없고 예약 확정 전에 개별 사진을 보내 드려요.",
  },
  {
    title: "지오 피젯 스피너 블루",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Geometric_fidget_toys_04.jpg",
    country: "중국",
    price: 14,
    condition: "B급",
    description: "파란 기하 스피너입니다. 베어링은 잘 도는데 한쪽 날개에 가벼운 사용 기스가 있어요.",
  },
  {
    title: "지오 피젯 링",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Geometric_fidget_toys_05.jpg",
    country: "대만",
    price: 15,
    condition: "A급",
    description: "링형 피젯입니다. 회전축이 중심에서 벗어나지 않고 표면 코팅이 균일해요.",
  },
  {
    title: "지오 피젯 스택",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    motif: "figure",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Geometric_fidget_toys_17.jpg",
    country: "중국",
    price: 17,
    condition: "S급",
    saleStatus: "판매완료",
    description: "겹쳐 돌리는 스택 피젯입니다. 층 사이 유격이 일정했고, 이 매물은 판매가 끝났어요.",
  },
];

function shelfProducts(): Product[] {
  return SHELF_SPECS.map((item, index) => ({
    id: `shelf-${index + 1}`,
    title: item.title,
    ip: item.ip,
    category: item.category,
    country: item.country,
    price: item.price,
    condition: item.condition,
    saleStatus: item.saleStatus ?? (index % 13 === 0 ? "예약중" : "판매중"),
    description: item.description,
    sellerId: SHELF_SELLERS[index % SHELF_SELLERS.length],
    likes: 12 + ((index * 17) % 180),
    motif: item.motif,
    palette: SHELF_PALETTES[index % SHELF_PALETTES.length],
    shippingFee: index % 4 === 0 ? 0 : 2 + (index % 3),
    location: `${item.country} 발송 · 택배`,
    postedOrder: 80 - index,
    imageUrl: item.imageUrl,
    postedLabel: index < 3 ? "오늘" : `${(index % 18) + 2}일 전`,
  }));
}

export const PRODUCTS: Product[] = [
  {
    id: "hq-hinata-nendo",
    title: "하이큐!! 히나타 쇼요 넨도로이드",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20140929/4644/30706/large/dfcccc79f269b2f3ec5f58a60226a2ef.jpg",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    country: "일본",
    price: 92,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "초판 히나타 넨도로이드입니다. 배구공과 네트, 코트 스탠드가 들어 있고 슈링크가 팽팽해요. 특전 얼굴 파츠까지 박스에 있습니다.",
    sellerId: "haru",
    likes: 328,
    motif: "figure",
    palette: court,
    shippingFee: 3,
    location: "서울 마포 · 택배",
    postedOrder: 16,
    postedLabel: "2시간 전",
  },
  {
    id: "hq-kageyama-scale",
    title: "하이큐!! 카게야마 토비오 POP UP PARADE",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20210422/11122/84179/large/6eada3ff8f0f2c823cbad3d14ec2919c.jpg",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    country: "일본",
    price: 186,
    condition: "A급",
    saleStatus: "예약중",
    description:
      "POP UP PARADE 카게야마입니다. 토스 자세 도색이 깨끗하고 받침대가 포함되어 있어요. 박스 모서리만 약하게 눌렸습니다.",
    sellerId: "haru",
    likes: 154,
    motif: "figure",
    palette: { base: "#f8fafc", ink: "#1e293b", accent: "#38bdf8", soft: "#e2e8f0" },
    shippingFee: 4,
    location: "서울 마포 · 직거래 가능",
    postedOrder: 15,
    postedLabel: "5시간 전",
  },
  {
    id: "hq-karasuno-bgs",
    title: "유희왕 푸른 눈의 백룡",
    imageUrl: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
    ip: "유희왕",
    category: "TCG",
    country: "일본",
    price: 74,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "초기 일러스트 푸른 눈의 백룡입니다. 더블 슬리브 보관이고 표면 흠과 휨이 없어요. 앞면 확대 사진을 채팅으로 보내 드립니다.",
    sellerId: "slab",
    likes: 96,
    motif: "card",
    palette: court,
    shippingFee: 2.5,
    location: "서울 성동 · 택배",
    postedOrder: 14,
    postedLabel: "어제",
  },
  {
    id: "bl-ichigo-figure",
    title: "블리치 쿠로사키 이치고 넨도로이드",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20180831/7581/54250/large/a7b4ac16e7ea57610c867b5f7ac7dbd7.jpg",
    ip: "블리치",
    category: "피규어/프라모델",
    country: "일본",
    price: 68,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "참월 이치고 넨도로이드입니다. 검 파츠와 표정 세 종이 모두 있고, 유리장에서만 진열해 관절이 탄탄해요.",
    sellerId: "orange",
    likes: 121,
    motif: "figure",
    palette: bleach,
    shippingFee: 3,
    location: "서울 마포 · 택배",
    postedOrder: 13,
    postedLabel: "어제",
  },
  {
    id: "bl-ichigo-sp",
    title: "블리치 쿠로사키 이치고 POP UP PARADE",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20231222/15374/125225/large/2e033625d59f9069d2a48715bb5a531e.jpg",
    ip: "블리치",
    category: "피규어/프라모델",
    country: "일본",
    price: 420,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "POP UP PARADE 이치고입니다. 넨도로이드와 다른 비율이고, 코트 음영과 참월 검 도색에 긁힘이 없어요.",
    sellerId: "slab",
    likes: 240,
    motif: "figure",
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
    category: "아트토이",
    country: "일본",
    price: 28,
    condition: "A급",
    saleStatus: "판매중",
    description:
      "보호 필름을 붙인 채 보관했습니다. 모서리 흰색 벗겨짐이 없고, 받침대 포함입니다. 소량 먼지는 출고 전에 정리해요.",
    sellerId: "me",
    likes: 44,
    motif: "pouch",
    palette: bleach,
    shippingFee: 2.5,
    location: "서울 마포 · 택배",
    postedOrder: 11,
    postedLabel: "2일 전",
  },
  {
    id: "sanrio-cinnamoroll",
    title: "산리오 시나모롤 키구루미 파자마 돌",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230202/13924/111156/large/4478906f4e54aa718662dc86068f4f9f.jpg",
    ip: "산리오",
    category: "인형",
    country: "일본",
    price: 54,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "시나모롤 귀와 꼬리가 달린 키구루미입니다. 구름 무늬 천이 보풀 없이 접혀 있고 포장 비닐을 열지 않았어요.",
    sellerId: "momo",
    likes: 412,
    motif: "plush",
    palette: sky,
    shippingFee: 3,
    location: "경기 성남 · 택배",
    postedOrder: 10,
    postedLabel: "3일 전",
  },
  {
    id: "sanrio-kitty-pouch",
    title: "산리오 헬로키티 키구루미 파자마 돌",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230202/13923/111150/large/22e5cb8523386e79f12a40f89f4c6169.jpg",
    ip: "산리오",
    category: "인형",
    country: "일본",
    price: 36,
    condition: "A급",
    saleStatus: "판매중",
    description:
      "헬로키티 리본 후드 파자마입니다. 귀 심지가 탄탄하고 리본 프린트가 선명해요. 단추 파츠 봉투가 남아 있습니다.",
    sellerId: "momo",
    likes: 188,
    motif: "plush",
    palette: ribbon,
    shippingFee: 2.5,
    location: "경기 성남 · 택배",
    postedOrder: 9,
    postedLabel: "3일 전",
  },
  {
    id: "sanrio-kuromi-set",
    title: "산리오 쿠로미 키구루미 파자마 돌",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230118/13815/110174/large/8f7ce8138ac6983aa6451177042db670.jpg",
    ip: "산리오",
    category: "인형",
    country: "일본",
    price: 42,
    condition: "S급 미개봉",
    saleStatus: "판매완료",
    description:
      "쿠로미 해골 후드 키구루미입니다. 검은 후드와 분홍 체크가 사진과 같고, 판매가 끝난 미개봉 구성이에요.",
    sellerId: "momo",
    likes: 503,
    motif: "plush",
    palette: night,
    shippingFee: 3,
    location: "경기 성남 · 택배",
    postedOrder: 8,
    postedLabel: "4일 전",
  },
  {
    id: "pkmn-charizard-psa10",
    title: "포켓몬 베이스 세트 리자몽",
    imageUrl: "https://assets.tcgdex.net/en/base/base1/4/high.webp",
    ip: "포켓몬",
    category: "TCG",
    country: "미국",
    price: 1280,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "영어판 베이스 세트 리자몽입니다. 날개 홀로그램이 살아 있고 모서리 화이트닝은 없어요. 슬리브에 넣어 보관했습니다.",
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
    title: "포켓몬 베이스 세트 피카츄",
    imageUrl: "https://assets.tcgdex.net/en/base/base1/58/high.webp",
    ip: "포켓몬",
    category: "TCG",
    country: "미국",
    price: 186,
    condition: "S급",
    saleStatus: "예약중",
    description:
      "베이스 세트 피카츄입니다. 노란 테두리와 뺨 빨강이 선명하고 표면 기스는 없어요. 예약 확정 전 뒷면 사진도 보내 드립니다.",
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
    title: "포켓몬 지우와 피카츄 넨도로이드",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20170622/6516/46453/large/ac374fbf649cd6a6232c5a972b10eb31.jpg",
    ip: "포켓몬",
    category: "피규어/프라모델",
    country: "일본",
    price: 75,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "지우와 피카츄가 한 세트입니다. 모자 교체 파츠와 스탠드가 들어 있고, 박스 광택을 해치지 않게 세워 두었어요.",
    sellerId: "chii",
    likes: 205,
    motif: "figure",
    palette: { base: "#fff7ed", ink: "#9a3412", accent: "#fb923c", soft: "#ffedd5" },
    shippingFee: 3,
    location: "부산 수영 · 택배",
    postedOrder: 5,
    postedLabel: "5일 전",
  },
  {
    id: "pkmn-eevee-promo",
    title: "포켓몬 정글 쥬피썬더",
    imageUrl: "https://assets.tcgdex.net/en/base/base2/4/high.webp",
    ip: "포켓몬",
    category: "TCG",
    country: "일본",
    price: 45,
    condition: "A급",
    saleStatus: "판매중",
    description:
      "정글 세트 쥬피썬더입니다. 가시 홀로가 맑고 화이트닝은 없어요. 오른쪽 아래 모서리만 아주 약하게 둥글어요.",
    sellerId: "slab",
    likes: 77,
    motif: "card",
    palette: bolt,
    shippingFee: 2,
    location: "서울 성동 · 택배",
    postedOrder: 4,
    postedLabel: "지난주",
  },
  {
    id: "chii-secret-plush",
    title: "먼작귀 치이카와 선물 인형",
    imageUrl: "https://cdn.shopify.com/s/files/1/0626/7142/1681/files/4571609378631_1.jpg?v=1763539703",
    ip: "먼작귀",
    category: "인형",
    country: "일본",
    price: 98,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "Present for You 치이카와입니다. 하얀 보넷과 리본이 달린 별도 의상 인형이고, 태그와 비닐이 그대로예요.",
    sellerId: "chii",
    likes: 734,
    motif: "plush",
    palette: cream,
    shippingFee: 3,
    location: "부산 수영 · 택배",
    postedOrder: 3,
    postedLabel: "지난주",
  },
  {
    id: "chii-hachiware-key",
    title: "먼작귀 하치와레 선물 인형",
    imageUrl: "https://cdn.shopify.com/s/files/1/0626/7142/1681/files/4571609378648_1.jpg?v=1763539801",
    ip: "먼작귀",
    category: "인형",
    country: "일본",
    price: 56,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description:
      "Present for You 하치와레입니다. 기본 인형과 다른 선물 의상이 달려 있고, 귀 자수와 태그가 온전해요.",
    sellerId: "chii",
    likes: 39,
    motif: "plush",
    palette: hachi,
    shippingFee: 2,
    location: "부산 수영 · 택배",
    postedOrder: 2,
    postedLabel: "지난주",
  },
  {
    id: "chii-usagi-mini",
    title: "먼작귀 우사기 넨도로이드",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230602/14454/116145/large/1fd573724aaf289898247d906fcbd25a.jpg",
    ip: "먼작귀",
    category: "피규어/프라모델",
    country: "일본",
    price: 32,
    condition: "S급",
    saleStatus: "판매중",
    description:
      "우사기 넨도로이드입니다. 긴 귀 파츠와 표정, 받침대가 들어 있고 도색 번짐은 없어요.",
    sellerId: "chii",
    likes: 143,
    motif: "figure",
    palette: usagi,
    shippingFee: 2.5,
    location: "부산 수영 · 택배",
    postedOrder: 1,
    postedLabel: "지난주",
  },
  {
    id: "lego-botanical",
    title: "레고 아이콘 플라워 부케 10280",
    imageUrl: "https://images.brickset.com/sets/images/10280-1.jpg",
    ip: "레고",
    category: "레고",
    country: "덴마크",
    price: 120,
    condition: "S급 미개봉",
    saleStatus: "판매중",
    description: "10280 꽃다발 미개봉입니다. 장미와 라벤더 봉투가 밀봉되어 있고 박스 실링을 뜯지 않았어요.",
    sellerId: "momo",
    likes: 88,
    motif: "figure",
    palette: cream,
    shippingFee: 4,
    location: "경기 성남 · 택배",
    postedOrder: 9,
    postedLabel: "3일 전",
  },
  {
    id: "cn-art-cat",
    title: "하이큐!! 전국대회 서프라이즈 넨도로이드",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230124/13869/110820/large/dd22651e8600d1acf379276658ed4d7e.jpg",
    ip: "하이큐!!",
    category: "아트토이",
    country: "일본",
    price: 64,
    condition: "S급",
    saleStatus: "판매중",
    description: "전국대회 편 랜덤 박스입니다. 슈링크가 팽팽해 어떤 선수인지는 개봉 전이고, 외박스 눌림은 없어요.",
    sellerId: "orange",
    likes: 41,
    motif: "figure",
    palette: ember,
    shippingFee: 3,
    location: "서울 마포 · 택배",
    postedOrder: 8,
    postedLabel: "4일 전",
  },
  {
    id: "tw-tcg-pack",
    title: "포켓몬 네오 제네시스 루기아",
    imageUrl: "https://assets.tcgdex.net/en/neo/neo1/9/high.webp",
    ip: "포켓몬",
    category: "TCG",
    country: "대만",
    price: 220,
    condition: "S급",
    saleStatus: "판매중",
    description: "대만에서 보관하던 네오 제네시스 루기아입니다. 날개 홀로그램이 맑고 모서리 눌림이 없어요.",
    sellerId: "slab",
    likes: 57,
    motif: "card",
    palette: bolt,
    shippingFee: 2,
    location: "서울 성동 · 택배",
    postedOrder: 7,
    postedLabel: "4일 전",
  },
  {
    id: "cz-figure-glass",
    title: "하이큐!! 히나타 쇼요 POP UP PARADE",
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20210422/11123/84176/large/4500b348336afe75e8dfaed02bfcef65.jpg",
    ip: "하이큐!!",
    category: "피규어/프라모델",
    country: "일본",
    price: 86,
    condition: "S급",
    saleStatus: "판매중",
    description: "POP UP PARADE 히나타입니다. 점프 포즈의 머리와 유니폼 도색이 고르고, 받침대까지 함께 드려요.",
    sellerId: "haru",
    likes: 22,
    motif: "figure",
    palette: sky,
    shippingFee: 5,
    location: "서울 마포 · 택배",
    postedOrder: 6,
    postedLabel: "5일 전",
  },
  {
    id: "de-fidget-cube",
    title: "피젯 큐브 옐로",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/Fidget_cube_yellow_and_white.jpg",
    ip: "피젯",
    category: "스퀴시/피젯토이",
    country: "독일",
    price: 22,
    condition: "A급",
    saleStatus: "예약중",
    description: "노란 바디의 피젯 큐브입니다. 조이스틱과 다이얼, 클릭 버튼이 모두 움직이고 모서리 오염은 없어요.",
    sellerId: "chii",
    likes: 19,
    motif: "pouch",
    palette: hachi,
    shippingFee: 2,
    location: "부산 수영 · 택배",
    postedOrder: 5,
    postedLabel: "5일 전",
  },
  ...shelfProducts(),
];

export const CHAT_ROOMS: ChatRoom[] = [
  {
    id: "room-hinata",
    productId: "hq-hinata-nendo",
    sellerName: "하루",
    sellerHandle: "@haru.court",
    unread: 2,
    buyerName: "김서연",
    buyerEmail: "seoyeon@spark.market",
    sellerEmail: "haru.court@spark.market",
    activity: "활성",
    updatedAt: "2026-10-27T19:45:00+09:00",
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
    id: "room-rukia-sale",
    productId: "bl-rukia-stand",
    sellerName: "소라",
    sellerHandle: "@sora",
    unread: 1,
    buyerName: "소라",
    buyerEmail: "sora@spark.market",
    sellerEmail: "me@spark.market",
    activity: "활성",
    updatedAt: "2026-10-27T19:46:00+09:00",
    messages: [
      {
        id: "m-rukia-en",
        sender: "seller",
        originalText: "Hi friend, is this card in really good condition?",
        translatedText: "안녕하세요 친구, 이 카드 상태가 진짜 좋습니까?",
        text: "안녕하세요 친구, 이 카드 상태가 진짜 좋습니까?",
        at: "오후 7:46",
      },
    ],
  },
  {
    id: "room-charizard",
    productId: "pkmn-charizard-psa10",
    sellerName: "카드서랍",
    sellerHandle: "@slab.drawer",
    unread: 0,
    buyerName: "김서연",
    buyerEmail: "seoyeon@spark.market",
    sellerEmail: "slab.drawer@spark.market",
    activity: "활성",
    updatedAt: "2026-10-27T18:20:00+09:00",
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
    buyerName: "박민지",
    buyerEmail: "minji@spark.market",
    sellerEmail: "chii.pocket@spark.market",
    activity: "종료",
    updatedAt: "2026-10-20T20:05:00+09:00",
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

const WATCH_STILL = "https://images.goodsmile.info/cgm/images/product/20180831/7581/54250/large/a7b4ac16e7ea57610c867b5f7ac7dbd7.jpg";
const WATCH_CLIP = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

/** Moderation transcripts. Kept off the member inbox so a monitoring sample does not become the buyer's room. */
export const ADMIN_WATCH_ROOMS: ChatRoom[] = [
  {
    id: "room-orange-offplatform",
    productId: "bl-ichigo-figure",
    sellerName: "오렌지코트",
    sellerHandle: "@orange.coat",
    unread: 0,
    buyerName: "모모",
    buyerEmail: "momo.ribbon@spark.market",
    sellerEmail: "orange.coat@spark.market",
    activity: "활성",
    updatedAt: "2026-10-27T21:40:00+09:00",
    messages: [
      {
        id: "watch-1",
        sender: "me",
        text: "이치고 넨도로이드 검 파츠 사진만 한 장 더 부탁드려요.",
        at: "21:31",
        sentAt: "2026-10-27T21:31:00+09:00",
      },
      {
        id: "watch-2",
        sender: "seller",
        text: "씨발 또 물어보네. 안전결제 말고 계좌로 선입금하면 만 원 깎아 줄게.",
        at: "21:34",
        sentAt: "2026-10-27T21:34:00+09:00",
      },
      {
        id: "watch-3",
        sender: "seller",
        text: "카톡 orange_trade 로 와. 통장 화면이야.",
        imageUrl: WATCH_STILL,
        at: "21:36",
        sentAt: "2026-10-27T21:36:00+09:00",
      },
      {
        id: "watch-4",
        sender: "seller",
        text: "실물 영상도 보냈어. 여기서 더 얘기하지 마.",
        videoUrl: WATCH_CLIP,
        at: "21:40",
        sentAt: "2026-10-27T21:40:00+09:00",
      },
    ],
  },
  {
    id: "room-lego-archive",
    productId: "lego-botanical",
    sellerName: "모모",
    sellerHandle: "@momo.ribbon",
    unread: 0,
    buyerName: "치이",
    buyerEmail: "chii.pocket@spark.market",
    sellerEmail: "momo.ribbon@spark.market",
    activity: "종료",
    updatedAt: "2026-10-12T11:02:00+09:00",
    messages: [
      {
        id: "arch-1",
        sender: "me",
        text: "부케 실링 사진 확인했어요. 안전결제로 진행할게요.",
        at: "11:00",
        sentAt: "2026-10-12T11:00:00+09:00",
      },
      {
        id: "arch-2",
        sender: "seller",
        text: "네, 출고하면 운송장 남겨 둘게요.",
        at: "11:02",
        sentAt: "2026-10-12T11:02:00+09:00",
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
    price: 36,
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
    price: 47,
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
    price: 74,
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
    price: 32,
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
    price: 28,
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
  {
    id: "SPK-239901",
    role: "sale",
    productId: "cz-figure-glass",
    title: "하이큐!! 히나타 쇼요 POP UP PARADE",
    ip: "하이큐!!",
    price: 86,
    condition: "S급",
    motif: "figure",
    palette: sky,
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20210422/11123/84176/large/4500b348336afe75e8dfaed02bfcef65.jpg",
    status: "결제완료",
    orderedAt: "2026.10.27",
    counterpart: "박민지",
    address: "경기 고양시 일산동구 중앙로 44, 1201호",
    paymentMethod: "신용/체크카드",
    tracking: null,
    review: null,
  },
  {
    id: "SPK-239640",
    role: "sale",
    productId: "bl-ichigo-sp",
    title: "블리치 쿠로사키 이치고 POP UP PARADE",
    ip: "블리치",
    price: 420,
    condition: "S급",
    motif: "figure",
    palette: bleach,
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20231222/15374/125225/large/2e033625d59f9069d2a48715bb5a531e.jpg",
    status: "구매확정",
    orderedAt: "2026.10.08",
    counterpart: "하루",
    address: "서울 마포구 성산로 12, 302호",
    paymentMethod: "토스페이",
    tracking: "SPK3830104",
    review: null,
  },
  {
    id: "SPK-240050",
    role: "purchase",
    productId: "chii-usagi-mini",
    title: "먼작귀 우사기 미니 피규어",
    ip: "먼작귀",
    price: 18,
    quantity: 1,
    condition: "S급",
    motif: "figure",
    palette: usagi,
    imageUrl: "https://images.goodsmile.info/cgm/images/product/20230602/14454/116145/large/1fd573724aaf289898247d906fcbd25a.jpg",
    status: "결제완료",
    orderedAt: "2026.10.18",
    counterpart: "치이",
    address: "서울특별시 성동구 연무장길 12, 4층",
    paymentMethod: "신용/체크카드",
    tracking: null,
    review: null,
    cancelRequest: {
      reason: "배송 지연",
      detail: "약속한 출고일이 지났는데 송장이 없습니다.",
      requestedAt: "2026-10-20T00:00:00+09:00",
    },
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

export function findSeller(id: string) {
  return SELLERS.find((seller) => seller.id === id) ?? null;
}

/** Product, order, and settlement amounts are stored as USD. */
export const MAX_LIST_PRICE = 1_000_000;

export function formatPrice(price: number) {
  const dollars = Math.round(price * 100) / 100;
  const hasCents = Math.abs(dollars % 1) > 0.001;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(dollars);
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

export type MembershipStatus = "구독 중" | "미구독";

export type MemberRole = "회원" | "관리자";

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  adultVerified: boolean;
  joinedAt: string;
  joinedTime: string;
  country: string;
  membership: MembershipStatus;
  ip: string;
  os: string;
  lastSeen: string;
  role: MemberRole;
  suspended: boolean;
  reports: number;
};

export const ADMIN_MEMBERS: AdminMember[] = [
  { id: "mem-seoyeon", name: "김서연", email: "seoyeon@spark.market", adultVerified: true, joinedAt: "2026.10.27", joinedTime: "09:40", country: "한국", membership: "구독 중", ip: "211.234.18.42", os: "Windows 11 · Chrome 131", lastSeen: "2026.10.27 22:10", role: "회원", suspended: false, reports: 0 },
  { id: "mem-minji", name: "박민지", email: "minji@spark.market", adultVerified: false, joinedAt: "2026.10.27", joinedTime: "08:15", country: "한국", membership: "미구독", ip: "121.140.72.15", os: "iOS 18.2 · Safari", lastSeen: "2026.10.27 18:02", role: "회원", suspended: false, reports: 0 },
  { id: "mem-haru", name: "하루", email: "haru.court@spark.market", adultVerified: true, joinedAt: "2024.03.12", joinedTime: "11:20", country: "일본", membership: "구독 중", ip: "126.102.44.9", os: "macOS 15.1 · Safari", lastSeen: "2026.10.26 07:41", role: "회원", suspended: false, reports: 0 },
  { id: "mem-momo", name: "모모", email: "momo.ribbon@spark.market", adultVerified: true, joinedAt: "2024.11.02", joinedTime: "16:05", country: "일본", membership: "구독 중", ip: "133.32.18.77", os: "Android 15 · Chrome", lastSeen: "2026.10.27 12:33", role: "회원", suspended: false, reports: 0 },
  { id: "mem-slab", name: "카드서랍", email: "slab.drawer@spark.market", adultVerified: true, joinedAt: "2025.01.19", joinedTime: "13:48", country: "미국", membership: "미구독", ip: "104.28.91.6", os: "Windows 10 · Edge 131", lastSeen: "2026.10.25 20:18", role: "회원", suspended: false, reports: 1 },
  { id: "mem-chii", name: "치이", email: "chii.pocket@spark.market", adultVerified: true, joinedAt: "2023.08.30", joinedTime: "10:02", country: "한국", membership: "구독 중", ip: "175.223.40.118", os: "iPadOS 18.1 · Safari", lastSeen: "2026.10.27 09:55", role: "회원", suspended: false, reports: 0 },
  { id: "mem-orange", name: "오렌지코트", email: "orange.coat@spark.market", adultVerified: true, joinedAt: "2025.06.14", joinedTime: "19:27", country: "미국", membership: "미구독", ip: "172.56.11.203", os: "Android 14 · Samsung Internet", lastSeen: "2026.10.24 21:10", role: "회원", suspended: false, reports: 3 },
  { id: "mem-sora", name: "소라", email: "sora@spark.market", adultVerified: false, joinedAt: "2026.09.03", joinedTime: "14:36", country: "중국", membership: "미구독", ip: "39.7.22.154", os: "macOS 14.6 · Chrome 130", lastSeen: "2026.10.22 11:04", role: "회원", suspended: false, reports: 0 },
];

export function sellerAccount(sellerId: string) {
  const seller = SELLERS.find((item) => item.id === sellerId);
  const member = ADMIN_MEMBERS.find((item) => item.id === `mem-${sellerId}`);
  return {
    name: member?.name ?? seller?.name ?? sellerId,
    email: member?.email ?? (sellerId === "me" ? "me@spark.market" : ""),
  };
}

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
  { id: "cat-figure", name: "피규어/프라모델", slug: "figure" },
  { id: "cat-tcg", name: "TCG", slug: "tcg" },
  { id: "cat-lego", name: "레고", slug: "lego" },
  { id: "cat-art", name: "아트토이", slug: "art-toy" },
  { id: "cat-doll", name: "인형", slug: "doll" },
  { id: "cat-fidget", name: "스퀴시/피젯토이", slug: "fidget" },
];

export const PRODUCT_FLAGS = [
  { productId: "sanrio-kuromi-set", flag: "신고" as const, reason: "가품 의심 제보" },
  { productId: "bl-ichigo-sp", flag: "금지" as const, reason: "거래 불가 이미지 포함" },
];

export const ADMIN_TRADE_STATUSES = ["결제완료", "배송중", "배송완료", "구매확정", "거래취소", "분쟁"] as const;
export type AdminTradeStatus = (typeof ADMIN_TRADE_STATUSES)[number];

export type TradeSettlementSnapshot = {
  amount: number;
  holderEn: string;
  account: string;
  bankEn: string;
  bankCode: string;
  status: "정산 전" | SettlementStatus;
};

export type AdminTrade = {
  id: string;
  productId: string;
  title: string;
  buyer: string;
  seller: string;
  buyerEmail: string;
  sellerEmail: string;
  buyerAddress: string;
  sellerAddress: string;
  amount: number;
  paymentMethod: string;
  status: AdminTradeStatus;
  orderedAt: string;
  settlement: TradeSettlementSnapshot;
};

export const ADMIN_TRADES: AdminTrade[] = [
  { id: "SPK-240318", productId: "pkmn-charizard-psa10", title: "포켓몬 리자몽 ex SAR PSA10", buyer: "김서연", seller: "카드서랍", buyerEmail: "seoyeon@spark.market", sellerEmail: "slab.drawer@spark.market", buyerAddress: "서울 마포구 성산로 12, 302호", sellerAddress: "서울 성동구 연무장길 18, 1층", amount: 1280, paymentMethod: "신용/체크카드", status: "결제완료", orderedAt: "2026.10.27", settlement: { amount: 1152, holderEn: "CARD DRAWER", account: "110-224-881234", bankEn: "KOOKMIN BANK", bankCode: "004", status: "정산 전" } },
  { id: "SPK-240317", productId: "chii-secret-plush", title: "먼작귀 치이카와 인형 시크릿", buyer: "박민지", seller: "치이", buyerEmail: "minji@spark.market", sellerEmail: "chii.pocket@spark.market", buyerAddress: "경기 고양시 일산동구 중앙로 44, 1201호", sellerAddress: "부산 수영구 광안해변로 8", amount: 98, paymentMethod: "페이팔", status: "결제완료", orderedAt: "2026.10.27", settlement: { amount: 88.2, holderEn: "CHII POCKET", account: "3333-01-998812", bankEn: "SHINHAN BANK", bankCode: "088", status: "정산 전" } },
  { id: "SPK-240221", productId: "sanrio-kitty-pouch", title: "산리오 헬로키티 빈티지 파우치", buyer: "김서연", seller: "모모", buyerEmail: "seoyeon@spark.market", sellerEmail: "momo.ribbon@spark.market", buyerAddress: "서울 마포구 성산로 12, 302호", sellerAddress: "경기 성남시 분당구 판교역로 90", amount: 36, paymentMethod: "애플페이", status: "결제완료", orderedAt: "2026.10.26", settlement: { amount: 32.4, holderEn: "MOMO RIBBON", account: "1002-456-778901", bankEn: "WOORI BANK", bankCode: "020", status: "정산 전" } },
  { id: "SPK-240198", productId: "pkmn-eevee-promo", title: "포켓몬 이브이 프로모 카드", buyer: "김서연", seller: "카드서랍", buyerEmail: "seoyeon@spark.market", sellerEmail: "slab.drawer@spark.market", buyerAddress: "서울 마포구 성산로 12, 302호", sellerAddress: "서울 성동구 연무장길 18, 1층", amount: 47, paymentMethod: "구글페이", status: "배송중", orderedAt: "2026.10.24", settlement: { amount: 42.3, holderEn: "CARD DRAWER", account: "110-224-881234", bankEn: "KOOKMIN BANK", bankCode: "004", status: "정산 전" } },
  { id: "SPK-240144", productId: "hq-karasuno-bgs", title: "하이큐!! 카라스노 유니폼 카드 BGS 9.5", buyer: "김서연", seller: "카드서랍", buyerEmail: "seoyeon@spark.market", sellerEmail: "slab.drawer@spark.market", buyerAddress: "서울 마포구 성산로 12, 302호", sellerAddress: "서울 성동구 연무장길 18, 1층", amount: 74, paymentMethod: "휴대폰", status: "배송완료", orderedAt: "2026.10.20", settlement: { amount: 66.6, holderEn: "CARD DRAWER", account: "110-224-881234", bankEn: "KOOKMIN BANK", bankCode: "004", status: "정산 전" } },
  { id: "SPK-239880", productId: "bl-rukia-stand", title: "블리치 루키아 아크릴 스탠드", buyer: "소라", seller: "나", buyerEmail: "sora@spark.market", sellerEmail: "me@spark.market", buyerAddress: "인천 연수구 송도과학로 32, 803호", sellerAddress: "서울 용산구 한강대로 100", amount: 28, paymentMethod: "신용/체크카드", status: "분쟁", orderedAt: "2026.10.23", settlement: { amount: 25.2, holderEn: "SPARK ME", account: "110-000-000001", bankEn: "KOOKMIN BANK", bankCode: "004", status: "보류" } },
  { id: "SPK-240090", productId: "chii-usagi-mini", title: "먼작귀 우사기 미니 피규어", buyer: "김서연", seller: "치이", buyerEmail: "seoyeon@spark.market", sellerEmail: "chii.pocket@spark.market", buyerAddress: "서울 마포구 성산로 12, 302호", sellerAddress: "부산 수영구 광안해변로 8", amount: 32, paymentMethod: "페이팔", status: "구매확정", orderedAt: "2026.10.12", settlement: { amount: 28.8, holderEn: "CHII POCKET", account: "3333-01-998812", bankEn: "SHINHAN BANK", bankCode: "088", status: "정산대기" } },
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
  holderEn: string;
  account: string;
  bankEn: string;
  bankCode: string;
};

export const ADMIN_SETTLEMENTS: AdminSettlement[] = [
  { id: "stl-1042", seller: "카드서랍", email: "slab.drawer@spark.market", amount: 1860, trades: 4, requestedAt: "2026.10.27", status: "정산대기", holderEn: "CARD DRAWER", account: "110-224-881234", bankEn: "KOOKMIN BANK", bankCode: "004" },
  { id: "stl-1041", seller: "치이", email: "chii.pocket@spark.market", amount: 130, trades: 2, requestedAt: "2026.10.27", status: "정산대기", holderEn: "CHII POCKET", account: "3333-01-998812", bankEn: "SHINHAN BANK", bankCode: "088" },
  { id: "stl-1033", seller: "모모", email: "momo.ribbon@spark.market", amount: 54, trades: 1, requestedAt: "2026.10.25", status: "보류", holderEn: "MOMO RIBBON", account: "1002-456-778901", bankEn: "WOORI BANK", bankCode: "020" },
  { id: "stl-1020", seller: "하루", email: "haru.court@spark.market", amount: 92, trades: 1, requestedAt: "2026.10.18", status: "승인완료", holderEn: "HARU COURT", account: "302-1100-4455", bankEn: "HANA BANK", bankCode: "081" },
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

export const REPORT_STATUSES = ["접수", "검토", "수락", "거절"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type ReportCategory = "상품" | "유저" | "리뷰";

export type ReportMedia = {
  id: string;
  name: string;
  url: string;
};

/** Soft-deleted rows stay in storage until hardDeleteAt, which is deletedAt plus five years. */
export type SoftDeleteRetention = {
  deletedAt: string | null;
  hardDeleteAt: string | null;
};

export const REPORT_RETENTION_YEARS = 5;

export function hardDeleteAtFrom(deletedAt: string) {
  const date = new Date(deletedAt);
  date.setFullYear(date.getFullYear() + REPORT_RETENTION_YEARS);
  return date.toISOString();
}

export function formatRetentionDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export function formatLocalStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${formatRetentionDate(iso)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export type AdminReport = {
  id: string;
  category: ReportCategory;
  targetType: ReportCategory;
  targetId: string;
  targetLabel: string;
  reason: string;
  media: ReportMedia[];
  reporter: string;
  createdAt: string;
  status: ReportStatus;
};

const KUROMI_EVIDENCE = "https://images.goodsmile.info/cgm/images/product/20230118/13815/110174/large/8f7ce8138ac6983aa6451177042db670.jpg";

export const ADMIN_REPORTS: AdminReport[] = [
  { id: "rpt-sanrio-1", category: "상품", targetType: "상품", targetId: "sanrio-kuromi-set", targetLabel: "산리오 쿠로미 키구루미 파자마 돌", reason: "태그와 봉제선이 정품과 달라요.", media: [], reporter: "하루", createdAt: "2026.10.01 09:10", status: "수락" },
  { id: "rpt-sanrio-2", category: "상품", targetType: "상품", targetId: "sanrio-kuromi-set", targetLabel: "산리오 쿠로미 키구루미 파자마 돌", reason: "같은 사진이 다른 상점에도 올라와 있어요.", media: [], reporter: "치이", createdAt: "2026.10.05 11:24", status: "수락" },
  { id: "rpt-sanrio-3", category: "상품", targetType: "상품", targetId: "sanrio-kuromi-set", targetLabel: "산리오 쿠로미 키구루미 파자마 돌", reason: "실물 로고 폰트가 달라 가품으로 보여요.", media: [{ id: "media-sanrio-3", name: "태그 비교.jpg", url: KUROMI_EVIDENCE }], reporter: "김서연", createdAt: "2026.10.10 15:02", status: "수락" },
  { id: "rpt-70", category: "상품", targetType: "상품", targetId: "chii-hachiware-key", targetLabel: "먼작귀 하치와레 아크릴 키링", reason: "공식 이미지 도용 의심", media: [], reporter: "하루", createdAt: "2026.10.19 10:22", status: "거절" },
  { id: "rpt-orange-1", category: "유저", targetType: "유저", targetId: "orange", targetLabel: "오렌지코트", reason: "거래 약속 후 연락이 끊겼어요.", media: [], reporter: "모모", createdAt: "2026.10.20 12:18", status: "수락" },
  { id: "rpt-orange-2", category: "유저", targetType: "유저", targetId: "orange", targetLabel: "오렌지코트", reason: "채팅에서 욕설을 했어요.", media: [], reporter: "하루", createdAt: "2026.10.21 18:40", status: "수락" },
  { id: "rpt-orange-3", category: "유저", targetType: "유저", targetId: "orange", targetLabel: "오렌지코트", reason: "외부 결제를 반복해서 유도해요.", media: [], reporter: "카드서랍", createdAt: "2026.10.22 09:05", status: "수락" },
  { id: "rpt-review-1", category: "리뷰", targetType: "리뷰", targetId: "rv-9", targetLabel: "오렌지코트의 피카츄 카드 후기", reason: "거래와 무관한 내용이에요.", media: [], reporter: "카드서랍", createdAt: "2026.10.23 08:12", status: "수락" },
  { id: "rpt-review-2", category: "리뷰", targetType: "리뷰", targetId: "rv-9", targetLabel: "오렌지코트의 피카츄 카드 후기", reason: "별점과 본문이 서로 달라요.", media: [], reporter: "치이", createdAt: "2026.10.23 14:47", status: "수락" },
  { id: "rpt-review-3", category: "리뷰", targetType: "리뷰", targetId: "rv-9", targetLabel: "오렌지코트의 피카츄 카드 후기", reason: "다른 상점 후기를 그대로 붙였어요.", media: [], reporter: "모모", createdAt: "2026.10.23 19:33", status: "수락" },
  { id: "rpt-79", category: "유저", targetType: "유저", targetId: "orange", targetLabel: "오렌지코트", reason: "채팅에서 욕설 후 거래를 일방 취소했어요.", media: [], reporter: "소라", createdAt: "2026.10.24 21:03", status: "접수" },
  { id: "rpt-review-open", category: "리뷰", targetType: "리뷰", targetId: "rv-9", targetLabel: "오렌지코트의 피카츄 카드 후기", reason: "상품을 받아 보지도 않은 내용이에요.", media: [], reporter: "김서연", createdAt: "2026.10.25 16:20", status: "접수" },
  { id: "rpt-84", category: "상품", targetType: "상품", targetId: "bl-ichigo-sp", targetLabel: "블리치 쿠로사키 이치고 POP UP PARADE", reason: "슬랩 사진이 다른 매물과 동일해요.", media: [], reporter: "카드서랍", createdAt: "2026.10.26 19:48", status: "검토" },
  { id: "rpt-88", category: "상품", targetType: "상품", targetId: "sanrio-kuromi-set", targetLabel: "산리오 쿠로미 키구루미 파자마 돌", reason: "가품 의심. 태그 폰트가 달라요.", media: [{ id: "media-88", name: "실물 태그.jpg", url: KUROMI_EVIDENCE }], reporter: "모모", createdAt: "2026.10.27 13:12", status: "접수" },
  { id: "rpt-cat-1", category: "상품", targetType: "상품", targetId: "cn-art-cat", targetLabel: "하이큐!! 전국대회 서프라이즈 넨도로이드", reason: "같은 슈링크 사진이 다른 상점에 있어요.", media: [], reporter: "하루", createdAt: "2026.10.11 09:18", status: "수락" },
  { id: "rpt-cat-2", category: "상품", targetType: "상품", targetId: "cn-art-cat", targetLabel: "하이큐!! 전국대회 서프라이즈 넨도로이드", reason: "박스 홀로그램이 정품과 달라요.", media: [], reporter: "치이", createdAt: "2026.10.14 16:40", status: "수락" },
  { id: "rpt-cat-3", category: "상품", targetType: "상품", targetId: "cn-art-cat", targetLabel: "하이큐!! 전국대회 서프라이즈 넨도로이드", reason: "개봉품을 미개봉으로 올렸어요.", media: [], reporter: "김서연", createdAt: "2026.10.18 12:05", status: "수락" },
  { id: "rpt-cat-4", category: "상품", targetType: "상품", targetId: "cn-art-cat", targetLabel: "하이큐!! 전국대회 서프라이즈 넨도로이드", reason: "신고가 쌓인 뒤에도 같은 사진으로 다시 올렸어요.", media: [], reporter: "모모", createdAt: "2026.10.26 20:11", status: "수락" },
];

export const ADMIN_TODAY = "2026.10.27";

export const STANDARD_FEE_RATE = 0.1;
export const VIP_FEE_RATE = 0.06;

export function settlementOf(itemPrice: number, vip: boolean) {
  const feeRate = vip ? VIP_FEE_RATE : STANDARD_FEE_RATE;
  const feeAmount = Math.round(itemPrice * feeRate * 100) / 100;
  const payoutAmount = Math.round((itemPrice - feeAmount) * 100) / 100;
  return { feeRate, feeAmount, payoutAmount };
}

export const INQUIRY_TYPES = ["배송", "결제", "상품", "회원", "기타"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];
export const USER_INQUIRY_STATUSES = ["접수 완료", "확인중", "답변완료"] as const;
export type UserInquiryStatus = (typeof USER_INQUIRY_STATUSES)[number];

export type UserInquiry = {
  id: string;
  type: InquiryType;
  body: string;
  photoName?: string;
  status: UserInquiryStatus;
  createdAt: string;
  reply: string;
};

export const USER_INQUIRIES: UserInquiry[] = [
  {
    id: "inq-user-1",
    type: "배송",
    body: "운송장 등록이 아직 안 된 것 같아요.",
    status: "확인중",
    createdAt: "2026.10.26",
    reply: "",
  },
];

export type NoticeCategory = "일반" | "정책변경" | "사기예방";

export type Notice = {
  id: string;
  category: NoticeCategory;
  title: string;
  body: string;
  createdAt: string;
  deletedAt: string | null;
};

export const NOTICES: Notice[] = [
  { id: "nt-3", category: "사기예방", title: "외부 메신저 결제 유도에 주의하세요", body: "Spark 채팅 밖 결제 요청은 사기일 수 있습니다. 안전결제만 이용해 주세요.", createdAt: "2026.10.27", deletedAt: null },
  { id: "nt-2", category: "정책변경", title: "중개 수수료 안내", body: "판매자 정산 시 비구독 10%, Spark VIP 6%가 상품 금액에 적용됩니다. 요율은 결제 시점에 고정됩니다.", createdAt: "2026.10.20", deletedAt: null },
  { id: "nt-1", category: "일반", title: "Spark 오픈 안내", body: "수집가 간 거래를 위한 C2C 마켓이 열렸습니다.", createdAt: "2026.10.01", deletedAt: null },
];

export type Faq = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  deletedAt: string | null;
};

export const FAQS: Faq[] = [
  { id: "faq-3", question: "구매는 어디서 신청하나요?", answer: "상품 상세의 1:1 채팅에서 구매 신청을 보냅니다. 판매자가 승인하면 결제 정보를 입력합니다.", createdAt: "2026.10.27", deletedAt: null },
  { id: "faq-2", question: "정산 수수료는 얼마인가요?", answer: "상품 금액 기준 비구독 10%, VIP 6%입니다. 배송비에는 수수료를 매기지 않습니다.", createdAt: "2026.10.18", deletedAt: null },
  { id: "faq-1", question: "판매완료 상품은 목록에 나오나요?", answer: "기본 목록에서는 숨깁니다. 예약중 상품은 보입니다.", createdAt: "2026.10.12", deletedAt: null },
];

export type TermVersion = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export const TERMS_VERSIONS: TermVersion[] = [
  { id: "term-1", title: "Spark 이용약관", body: "거래 대금은 구매 확정까지 안전결제로 예치됩니다. 약관은 추가만 가능하고 수정·삭제하지 않습니다.", createdAt: "2026.10.01" },
];

export type Review = {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  author: string;
  authorId: string;
  rating: number;
  text: string;
  media: { id: string; name: string; url: string; kind?: "photo" | "video" }[];
  createdAt: string;
  mediaExpiresAt: string;
  deletedAt: string | null;
  /** Filled when a report sanction soft-deletes the review. Hard delete is allowed at this time. */
  hardDeleteAt?: string | null;
};

export const REVIEWS: Review[] = [
  {
    id: "rv-1",
    orderId: "SPK-240090",
    productId: "chii-usagi-mini",
    sellerId: "chii",
    author: "김서연",
    authorId: "seoyeon",
    rating: 5,
    text: "설명과 같은 상태였고 포장도 꼼꼼했습니다.",
    media: [{ id: "rv-1-photo", name: "포장 사진.jpg", url: "https://images.goodsmile.info/cgm/images/product/20230602/14454/116145/large/1fd573724aaf289898247d906fcbd25a.jpg" }],
    createdAt: "2026.10.21",
    mediaExpiresAt: "2027.01.21",
    deletedAt: null,
  },
  {
    id: "rv-2",
    orderId: "SPK-240091",
    productId: "chii-secret-plush",
    sellerId: "chii",
    author: "하루",
    authorId: "haru",
    rating: 5,
    text: "치이카와 인형 털 상태가 사진 그대로였어요. 다음에도 여기서 살게요.",
    media: [],
    createdAt: "2026.10.18",
    mediaExpiresAt: "2027.01.18",
    deletedAt: null,
  },
  {
    id: "rv-3",
    orderId: "SPK-240092",
    productId: "chii-hachiware-key",
    sellerId: "chii",
    author: "박민지",
    authorId: "minji",
    rating: 4,
    text: "하치와레 귀 색이 진하고 봉제가 단정합니다. 배송은 하루 늦었어요.",
    media: [],
    createdAt: "2026.09.30",
    mediaExpiresAt: "2026.12.30",
    deletedAt: null,
  },
  {
    id: "rv-4",
    orderId: "SPK-240110",
    productId: "hq-hinata-nendo",
    sellerId: "haru",
    author: "모모",
    authorId: "momo",
    rating: 5,
    text: "히나타 넨도로이드 슈링크가 깨끗했습니다. 응대도 빨랐어요.",
    media: [],
    createdAt: "2026.10.11",
    mediaExpiresAt: "2027.01.11",
    deletedAt: null,
  },
  {
    id: "rv-5",
    orderId: "SPK-240111",
    productId: "hq-kageyama-scale",
    sellerId: "haru",
    author: "김서연",
    authorId: "seoyeon",
    rating: 4,
    text: "카게야마 스케일 도색은 좋았고, 박스 모서리만 살짝 눌려 있었습니다.",
    media: [],
    createdAt: "2026.09.02",
    mediaExpiresAt: "2026.12.02",
    deletedAt: null,
  },
  {
    id: "rv-6",
    orderId: "SPK-240120",
    productId: "sanrio-cinnamoroll",
    sellerId: "momo",
    author: "치이",
    authorId: "chii",
    rating: 5,
    text: "시나모롤 20주년 태그가 그대로였어요. 선물용으로 딱입니다.",
    media: [],
    createdAt: "2026.10.08",
    mediaExpiresAt: "2027.01.08",
    deletedAt: null,
  },
  {
    id: "rv-7",
    orderId: "SPK-240121",
    productId: "sanrio-kitty-pouch",
    sellerId: "momo",
    author: "박민지",
    authorId: "minji",
    rating: 5,
    text: "헬로키티 파우치 프린트가 선명하고 지퍼도 부드러워요.",
    media: [],
    createdAt: "2026.08.19",
    mediaExpiresAt: "2026.11.19",
    deletedAt: null,
  },
  {
    id: "rv-8",
    orderId: "SPK-240130",
    productId: "pkmn-charizard-psa10",
    sellerId: "slab",
    author: "김서연",
    authorId: "seoyeon",
    rating: 5,
    text: "리자몽 카드 표면이 깨끗하고 설명과 같은 카드였습니다.",
    media: [],
    createdAt: "2026.10.02",
    mediaExpiresAt: "2027.01.02",
    deletedAt: null,
  },
  {
    id: "rv-9",
    orderId: "SPK-240131",
    productId: "pkmn-pikachu-psa10",
    sellerId: "slab",
    author: "오렌지코트",
    authorId: "orange",
    rating: 4,
    text: "피카츄 카드 모서리가 약하게 둥글지만 미리 고지해 주셨어요.",
    media: [],
    createdAt: "2026.07.14",
    mediaExpiresAt: "2026.10.14",
    deletedAt: null,
  },
  {
    id: "rv-10",
    orderId: "SPK-240140",
    productId: "bl-ichigo-figure",
    sellerId: "orange",
    author: "소라",
    authorId: "sora",
    rating: 5,
    text: "이치고 피규어 관절이 튼튼하고 검 파츠도 다 있었습니다.",
    media: [],
    createdAt: "2026.10.16",
    mediaExpiresAt: "2027.01.16",
    deletedAt: null,
  },
  {
    id: "rv-11",
    orderId: "SPK-240141",
    productId: "lego-botanical",
    sellerId: "momo",
    author: "하루",
    authorId: "haru",
    rating: 5,
    text: "레고 부케 실링이 그대로였고 봉투 누락이 없었어요.",
    media: [],
    createdAt: "2026.09.21",
    mediaExpiresAt: "2026.12.21",
    deletedAt: null,
  },
  {
    id: "rv-12",
    orderId: "SPK-240150",
    productId: "bl-rukia-stand",
    sellerId: "me",
    author: "모모",
    authorId: "momo",
    rating: 5,
    text: "루키아 스탠드 필름이 붙어 있었고 받침대도 포함이었습니다.",
    media: [],
    createdAt: "2026.10.05",
    mediaExpiresAt: "2027.01.05",
    deletedAt: null,
  },
  {
    id: "rv-13",
    orderId: "SPK-240160",
    productId: "sanrio-cinnamoroll",
    sellerId: "seoyeon",
    author: "치이",
    authorId: "chii",
    rating: 5,
    text: "카드 거래 후기도 친절하고 포장이 이중이었어요.",
    media: [],
    createdAt: "2026.10.09",
    mediaExpiresAt: "2027.01.09",
    deletedAt: null,
  },
  {
    id: "rv-14",
    orderId: "SPK-240161",
    productId: "chii-secret-plush",
    sellerId: "minji",
    author: "모모",
    authorId: "momo",
    rating: 4,
    text: "인형 상태가 좋고 채팅 답장이 빨라요.",
    media: [],
    createdAt: "2026.09.12",
    mediaExpiresAt: "2026.12.12",
    deletedAt: null,
  },
  {
    id: "rv-15",
    orderId: "SPK-240162",
    productId: "bl-ichigo-figure",
    sellerId: "sora",
    author: "오렌지코트",
    authorId: "orange",
    rating: 5,
    text: "블리치 굿즈 설명이 정확했습니다.",
    media: [],
    createdAt: "2026.08.28",
    mediaExpiresAt: "2026.11.28",
    deletedAt: null,
  },
  {
    id: "rv-16",
    orderId: "SPK-240170",
    productId: "pkmn-charizard-psa10",
    sellerId: "slab",
    author: "오렌지코트",
    authorId: "orange",
    rating: 1,
    text: "사기예요. 카드 모서리가 뭉개졌고 채팅에서 욕만 했습니다.",
    media: [{ id: "rv-16-photo", name: "모서리.jpg", url: "https://assets.tcgdex.net/en/base/base2/4/high.webp", kind: "photo" }],
    createdAt: "2026.10.27",
    mediaExpiresAt: "2027.01.27",
    deletedAt: null,
  },
  {
    id: "rv-17",
    orderId: "SPK-240171",
    productId: "sanrio-kuromi-set",
    sellerId: "momo",
    author: "소라",
    authorId: "sora",
    rating: 2,
    text: "쿠로미 태그 폰트가 사진이랑 달라요. 영상으로 남깁니다.",
    media: [{ id: "rv-17-clip", name: "태그 비교.mp4", url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", kind: "video" }],
    createdAt: "2026.08.02",
    mediaExpiresAt: "2026.11.02",
    deletedAt: null,
  },
];

export type Sanction = {
  id: string;
  limitedAt: string;
  releasedAt: string;
  period: string;
  reason: string;
  violation: string;
};

export const SANCTIONS: Sanction[] = [
  { id: "sn-1", limitedAt: "2026.10.24 21:03", releasedAt: "2026.10.27 21:03", period: "3일", reason: "신고 3회 누적", violation: "거래 방해" },
];

export type BankAccount = {
  id: string;
  holder: string;
  bank: string;
  number: string;
  isDefault: boolean;
};

export const BANK_LIMIT = 5;

export type NotificationKind = "채팅" | "가격하락" | "거래" | "네고";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  text: string;
  createdAt: string;
  isRead: boolean;
  href: string;
};

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-nego-rukia",
    kind: "네고",
    text: "소라님이 '블리치 루키아 아크릴 스탠드' 상품에 가격 제안(네고)을 했습니다.",
    createdAt: "10:24",
    isRead: false,
    href: "/chat/room-rukia-sale",
  },
  {
    id: "ntf-pay-usagi",
    kind: "거래",
    text: "먼작귀 우사기 미니 피규어 상품 결제가 완료되었습니다.",
    createdAt: "09:02",
    isRead: false,
    href: "/orders/SPK-240050",
  },
  {
    id: "ntf-chat-slab",
    kind: "채팅",
    text: "카드서랍님의 채팅 메시지가 도착했습니다.",
    createdAt: "어제",
    isRead: true,
    href: "/chat/room-charizard",
  },
];

export type NotifyMode = "소리" | "진동" | "무음";

export type StoredReport = {
  id: string;
  targetType: "상품" | "채팅" | "리뷰";
  targetId: string;
  targetLabel: string;
  body: string;
  photoCount: number;
  reporter: string;
  createdAt: string;
  status: "접수" | "수락" | "거절";
};
