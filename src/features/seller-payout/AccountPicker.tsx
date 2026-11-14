import type { BankAccount } from "@/data/mockData";
import { fieldClass } from "@/components/spark/styles";
import { FieldLabel } from "@/features/wireframe/FieldLabel";

export function AccountPicker({
  accounts,
  value,
  onChange,
}: {
  accounts: BankAccount[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <FieldLabel label="정산 계좌">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
          <option value="">계좌를 선택해 주세요</option>
          {accounts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.bank} · {item.holder} · {item.number}
              {item.isDefault ? " · 기본" : ""}
            </option>
          ))}
        </select>
      </FieldLabel>
    </section>
  );
}
