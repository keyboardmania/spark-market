"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FAQ_CATEGORIES, type Faq, type FaqCategory } from "@/data/mockData";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export type FaqFormValues = {
  category: FaqCategory;
  question: string;
  answer: string;
  visible: boolean;
};

const EMPTY_FORM: FaqFormValues = {
  category: "회원",
  question: "",
  answer: "",
  visible: true,
};

export function faqToFormValues(faq: Faq): FaqFormValues {
  return {
    category: faq.category,
    question: faq.question,
    answer: faq.answer,
    visible: faq.visible,
  };
}

export function formValuesToFaqPatch(values: FaqFormValues) {
  return {
    category: values.category,
    question: values.question.trim(),
    answer: values.answer.trim(),
    visible: values.visible,
  };
}

export function FaqFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Faq | null;
  onClose: () => void;
  onSubmit: (values: FaqFormValues) => void;
}) {
  const [form, setForm] = useState<FaqFormValues>(initial ? faqToFormValues(initial) : EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch<K extends keyof FaqFormValues>(key: K, value: FaqFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.question.trim()) {
      setError("질문을 입력해 주세요.");
      return;
    }
    if (!form.answer.trim()) {
      setError("답변을 입력해 주세요.");
      return;
    }
    setError("");
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-form-title"
        className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="faq-form-title" className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "FAQ 등록" : "FAQ 수정"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-50">
            닫기
          </button>
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="text-xs font-medium text-slate-500">노출 여부</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="faq-visible"
                  checked={form.visible}
                  onChange={() => patch("visible", true)}
                />
                노출
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="faq-visible"
                  checked={!form.visible}
                  onChange={() => patch("visible", false)}
                />
                비노출
              </label>
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-xs text-slate-500">
            <span>카테고리</span>
            <select
              value={form.category}
              onChange={(event) => patch("category", event.target.value as FaqCategory)}
              className={fieldClass}
            >
              {FAQ_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-xs text-slate-500">
            <span>질문</span>
            <input
              value={form.question}
              onChange={(event) => patch("question", event.target.value)}
              placeholder="질문 제목"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-2 text-xs text-slate-500">
            <span>답변</span>
            <textarea
              value={form.answer}
              onChange={(event) => patch("answer", event.target.value)}
              placeholder="답변 내용"
              rows={6}
              className={fieldClass}
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex gap-2 pt-1">
            <button type="button" className={`${ghostButtonClass} flex-1`} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={`${primaryButtonClass} flex-1`}>
              {mode === "create" ? "등록" : "수정 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
