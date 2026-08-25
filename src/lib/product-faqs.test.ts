import assert from "node:assert/strict";
import test from "node:test";
import { faqsFromFormData } from "./product-faqs.ts";

test("faqsFromFormData reads multiple FAQs from faqsJson", () => {
  const formData = new FormData();
  formData.set(
    "faqsJson",
    JSON.stringify([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
      { question: "Q3", answer: "A3" },
    ]),
  );
  assert.deepEqual(faqsFromFormData(formData), [
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
    { question: "Q3", answer: "A3" },
  ]);
});

test("faqsFromFormData drops incomplete FAQ rows", () => {
  const formData = new FormData();
  formData.set(
    "faqsJson",
    JSON.stringify([
      { question: "Q1", answer: "A1" },
      { question: "Missing answer", answer: "  " },
      { question: "", answer: "No question" },
    ]),
  );
  assert.deepEqual(faqsFromFormData(formData), [{ question: "Q1", answer: "A1" }]);
});
