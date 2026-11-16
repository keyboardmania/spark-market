import type { LocaleId } from "@/i18n";

export type IncomingSample = {
  label: string;
  text: string;
};

export const INCOMING_SAMPLES: IncomingSample[] = [
  { label: "English", text: "Is the box still sealed? I can pay today." },
  { label: "日本語", text: "箱の角に傷はありますか？明日まで取り置きできますか。" },
  { label: "中文", text: "这个还在出售吗？运费包含在价格里吗？" },
  { label: "Deutsch", text: "Ist die Figur originalverpackt? Ich würde sie sofort kaufen." },
  { label: "Čeština", text: "Je tahle karta v pořádku? Můžu zaplatit kartou." },
];

const PHRASES: Record<string, Partial<Record<LocaleId, string>>> = {
  "Is the box still sealed? I can pay today.": {
    ko: "상자는 아직 밀봉되어 있나요? 오늘 결제할 수 있어요.",
    en: "Is the box still sealed? I can pay today.",
    ja: "箱はまだシュリンクされたままですか？今日支払いできます。",
    zh: "盒子还是密封的吗？我今天可以付款。",
    de: "Ist die Schachtel noch versiegelt? Ich kann heute bezahlen.",
    cs: "Je krabice stále zapečetěná? Dnes můžu zaplatit.",
  },
  "箱の角に傷はありますか？明日まで取り置きできますか。": {
    ko: "상자 모서리에 흠집이 있나요? 내일까지 잡아 둘 수 있을까요?",
    en: "Is there a scratch on the box corner? Can you hold it until tomorrow?",
    ja: "箱の角に傷はありますか？明日まで取り置きできますか。",
    zh: "盒子边角有划痕吗？可以帮我留到明天吗？",
    de: "Ist die Schachtecke beschädigt? Können Sie sie bis morgen zurücklegen?",
    cs: "Je roh krabice poškrábaný? Můžete ji podržet do zítřka?",
  },
  "这个还在出售吗？运费包含在价格里吗？": {
    ko: "아직 판매 중인가요? 배송비가 가격에 포함되어 있나요?",
    en: "Is this still for sale? Is shipping included in the price?",
    ja: "まだ販売中ですか？送料は価格に含まれていますか？",
    zh: "这个还在出售吗？运费包含在价格里吗？",
    de: "Ist das noch zu verkaufen? Ist der Versand im Preis enthalten?",
    cs: "Je to ještě na prodej? Je doprava v ceně?",
  },
  "Ist die Figur originalverpackt? Ich würde sie sofort kaufen.": {
    ko: "피규어가 미개봉인가요? 바로 구매하고 싶어요.",
    en: "Is the figure still sealed? I would buy it right away.",
    ja: "フィギュアは未開封ですか？すぐに購入したいです。",
    zh: "手办还是原封吗？我想马上买下。",
    de: "Ist die Figur originalverpackt? Ich würde sie sofort kaufen.",
    cs: "Je figurka stále v originálním balení? Koupil bych ji hned.",
  },
  "Je tahle karta v pořádku? Můžu zaplatit kartou.": {
    ko: "이 카드 상태 괜찮은가요? 카드로 결제할 수 있어요.",
    en: "Is this card in good shape? I can pay by card.",
    ja: "このカードの状態は良いですか？カードで支払えます。",
    zh: "这张卡品相好吗？我可以用银行卡付款。",
    de: "Ist diese Karte in Ordnung? Ich kann mit Karte zahlen.",
    cs: "Je tahle karta v pořádku? Můžu zaplatit kartou.",
  },
  "Hi friend, is this card in really good condition?": {
    ko: "안녕하세요, 이 카드 상태가 정말 좋은가요?",
    en: "Hi friend, is this card in really good condition?",
    ja: "こんにちは。このカードの状態は本当に良いですか？",
    zh: "你好，这张卡的品相真的很好吗？",
    de: "Hallo, ist diese Karte wirklich in gutem Zustand?",
    cs: "Ahoj, je tahle karta opravdu v dobrém stavu?",
  },
  "택배는 우체국이고, 완충재 이중으로 포장합니다.": {
    ko: "택배는 우체국이고, 완충재 이중으로 포장합니다.",
    en: "I ship by post and pack with two layers of padding.",
    ja: "配送は郵便局で、緩衝材を二重にして梱包します。",
    zh: "用邮局寄出，会垫两层缓冲材料。",
    de: "Ich versende per Post und polstere doppelt.",
    cs: "Posílám poštou a balím do dvou vrstev výplně.",
  },
  "네, 네 면 다 찍어 두었어요. 눌림 없는 쪽만 골라 올려드릴게요.": {
    ko: "네, 네 면 다 찍어 두었어요. 눌림 없는 쪽만 골라 올려드릴게요.",
    en: "Yes, I photographed all four sides. I'll upload the ones without dents.",
    ja: "はい、四面とも撮ってあります。凹みのない面だけ選びます。",
    zh: "好的，四面都拍了。我挑没有压痕的发给你。",
    de: "Ja, alle vier Seiten sind fotografiert. Ich lade die ohne Dellen hoch.",
    cs: "Ano, nafotil jsem všechny čtyři strany. Nahraju ty bez promáčklin.",
  },
};

const FALLBACK: Record<LocaleId, (text: string) => string> = {
  ko: (text) => `번역: ${text}`,
  en: (text) => `Translated: ${text}`,
  ja: (text) => `翻訳: ${text}`,
  zh: (text) => `译文: ${text}`,
  de: (text) => `Übersetzung: ${text}`,
  cs: (text) => `Překlad: ${text}`,
};

export function translateMessage(text: string, locale: LocaleId) {
  const known = PHRASES[text]?.[locale];
  if (known) return Promise.resolve(known);
  return new Promise<string>((resolve) => {
    window.setTimeout(() => {
      if (text.includes("구매를 신청합니다")) {
        const line: Record<LocaleId, string> = {
          ko: text,
          en: "I would like to buy this item. Please approve the sale.",
          ja: "この商品の購入を申請します。販売を承認してください。",
          zh: "我想购买这件商品，请批准出售。",
          de: "Ich möchte diesen Artikel kaufen. Bitte genehmigen Sie den Verkauf.",
          cs: "Chci koupit tuto položku. Schvalte prosím prodej.",
        };
        resolve(line[locale]);
        return;
      }
      if (text.includes("결제를 진행해 주세요") || text.includes("구매를 승인했습니다")) {
        const line: Record<LocaleId, string> = {
          ko: text,
          en: "The seller approved the purchase. Please review the amount and pay.",
          ja: "販売者が購入を承認しました。金額を確認して支払ってください。",
          zh: "卖家已同意购买。请确认金额并付款。",
          de: "Der Verkäufer hat den Kauf genehmigt. Bitte Betrag prüfen und bezahlen.",
          cs: "Prodejce nákup schválil. Zkontrolujte částku a zaplaťte.",
        };
        resolve(line[locale]);
        return;
      }
      resolve(FALLBACK[locale](text));
    }, 420);
  });
}
