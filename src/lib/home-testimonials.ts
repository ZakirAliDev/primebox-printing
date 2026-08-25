export type HomeTestimonial = {
  id: string;
  name: string;
  text: string;
};

export type HomeTestimonialsSettings = {
  starIcon: string;
  items: HomeTestimonial[];
};

export const DEFAULT_TESTIMONIAL_STAR_ICON = "/home/testimonial-stars.png";

export function createHomeTestimonial(input?: Partial<HomeTestimonial>): HomeTestimonial {
  return {
    id:
      typeof input?.id === "string" && input.id.trim()
        ? input.id.trim()
        : `review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: typeof input?.name === "string" ? input.name.trim() : "",
    text: typeof input?.text === "string" ? input.text.trim() : "",
  };
}

export const DEFAULT_HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    id: "emma-willson",
    name: "Emma Willson",
    text: "Absolutely love Prime Box Printing! Their gift boxes are elegant, durable, and perfect for any occasion. From food packaging to jewelry gift boxes, they deliver quality every time. Highly recommend their services!",
  },
  {
    id: "olivia-parker",
    name: "Olivia Parker",
    text: "Prime Box Printing made my Christmas gifting easy! Their festive gift boxes and custom packaging options are top-notch. The small gift boxes were a huge hit with my guests. Great quality and fast delivery!",
  },
  {
    id: "sophia-james",
    name: "Sophia James",
    text: "Best packaging service ever! I ordered meat gift boxes and plastic boxes for my business, and the quality was beyond expectations. Prime Box Printing truly understands customer needs. Thank you!",
  },
  {
    id: "ava-morgan",
    name: "Ava Morgan",
    text: "Prime Box Printing is my go-to for custom packaging. Their gift boxes for women are stylish and well-crafted, perfect for special occasions. The jewelry gift boxes were a big hit too. Highly professional team!",
  },
];

export const HOME_TESTIMONIALS = DEFAULT_HOME_TESTIMONIALS;

export function normalizeHomeTestimonial(input?: Partial<HomeTestimonial> | null): HomeTestimonial | null {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const text = typeof input?.text === "string" ? input.text.trim() : "";
  if (!name && !text) {
    return null;
  }
  return createHomeTestimonial({
    id: input?.id,
    name,
    text,
  });
}

export function normalizeHomeTestimonialsSettings(
  input?: Partial<HomeTestimonialsSettings> | null,
): HomeTestimonialsSettings {
  const items = Array.isArray(input?.items)
    ? input.items.map((item) => normalizeHomeTestimonial(item)).filter((item): item is HomeTestimonial => Boolean(item))
    : DEFAULT_HOME_TESTIMONIALS.map((item) => ({ ...item }));

  return {
    starIcon:
      typeof input?.starIcon === "string" && input.starIcon.trim()
        ? input.starIcon.trim()
        : DEFAULT_TESTIMONIAL_STAR_ICON,
    items,
  };
}

export const DEFAULT_HOME_TESTIMONIALS_SETTINGS: HomeTestimonialsSettings =
  normalizeHomeTestimonialsSettings();
