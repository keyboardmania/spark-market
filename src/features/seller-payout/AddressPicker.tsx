import type { ShippingAddress } from "@/data/mockData";
import { fieldClass } from "@/components/spark/styles";
import { FieldLabel } from "@/features/wireframe/FieldLabel";

export function AddressPicker({
  addresses,
  value,
  onChange,
}: {
  addresses: ShippingAddress[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <FieldLabel label="주소">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
          <option value="">배송지를 선택해 주세요</option>
          {addresses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.address} {item.detail}
              {item.isDefault ? " · 기본" : ""}
            </option>
          ))}
        </select>
      </FieldLabel>
    </section>
  );
}
