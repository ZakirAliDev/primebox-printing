export type FormFaq = {
  question: string;
  answer: string;
};

export function faqsFromFormData(formData: FormData): FormFaq[] {
  const raw = String(formData.get("faqsJson") ?? "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            const row = item as { question?: unknown; answer?: unknown };
            return {
              question: String(row?.question ?? "").trim(),
              answer: String(row?.answer ?? "").trim(),
            };
          })
          .filter((faq) => faq.question && faq.answer);
      }
    } catch {
      // Fall through to legacy field names.
    }
  }
  const questions = formData.getAll("faqQuestion").map(String);
  const answers = formData.getAll("faqAnswer").map(String);
  return questions
    .map((question, index) => ({
      question: question.trim(),
      answer: (answers[index] ?? "").trim(),
    }))
    .filter((faq) => faq.question && faq.answer);
}
