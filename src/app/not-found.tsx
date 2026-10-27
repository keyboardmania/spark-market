import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-serif text-4xl italic text-slate-900">Spark</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-slate-500">주소가 바뀌었거나 매물이 내려갔을 수 있어요.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
        홈으로
      </Link>
    </div>
  );
}
