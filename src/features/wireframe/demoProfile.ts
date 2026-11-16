import type { BankAccount, ShippingAddress } from "@/data/mockData";

export const WIREFRAME_LOGIN = {
  name: "김스파크",
  email: "tester@spark.market",
  password: "SparkTest1!",
};

export const QUICK_ADDRESS = {
  name: "김스파크",
  phone: "010-1234-5678",
  address: "서울 성동구 연무장길 18",
  detail: "2층",
  postalCode: "04782",
};

export const QUICK_BANK = {
  holder: "KIM SPARK",
  bank: "KOOKMIN BANK",
  number: "110-224-881234",
};

export const QUICK_CUSTOMS = "P230012345678";

export const WIREFRAME_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-wireframe",
    name: "김스파크 (더미)",
    phone: "010-0000-0000",
    address: "서울 성동구 연무장길 18",
    detail: "1층",
    postalCode: "04782",
    isDefault: true,
  },
];

export const WIREFRAME_BANKS: BankAccount[] = [
  {
    id: "bank-wireframe",
    holder: "KIM SPARK",
    bank: "KOOKMIN BANK",
    number: "110-224-881234",
    isDefault: true,
  },
];
