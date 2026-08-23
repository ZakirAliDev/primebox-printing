export const SITE_NAME = "Prime Box Printing";
export const SITE_URL = "https://primeboxprinting.com";
export const SITE_TAGLINE = "Custom Packaging Solutions";

export const CONTACT = {
  phoneUs: "+1 (833) 824-1990",
  phoneUsTel: "+18338241990",
  phoneWa: "+1 (647) 205-5889",
  phoneWaLink: "https://wa.me/16472055887",
  salesEmail: "sales@primeboxprinting.com",
  adminEmail: "admin@primeboxprinting.com",
  addressUs: "10685B Hazelhurst DR 39377 Houston, TX 77043 USA",
  addressCa: "6865 Main St W, Milton, ON L9T 7Z5",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/package-category/best-selling", label: "Best Selling" },
  { href: "/package-category/industries", label: "Industries" },
  { href: "/package-category/box-styles", label: "Box Styles" },
  { href: "/package-category/collection", label: "Collections" },
  { href: "/package-category/promotions", label: "Promotions" },
] as const;

export const FOOTER = {
  company: [
    { href: "/about-us", label: "About Us" },
    { href: "/why-pbp", label: "Why PBP" },
    { href: "/contact-us", label: "Contact Us" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
  ],
  services: [
    { href: "/packaging-services", label: "Packaging Services" },
    { href: "/structural-engineering", label: "Structural Engineering" },
    { href: "/packaging-artwork-design", label: "Packaging Artwork" },
  ],
  resources: [
    { href: "/blog", label: "Blog" },
    { href: "/artwork-guidelines", label: "Artwork Guidelines" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/customer-stories", label: "Customer Stories" },
  ],
  help: [
    { href: "/faqs", label: "FAQ" },
    { href: "/quote", label: "Get a Quote" },
  ],
} as const;

export const BOX_STYLES = [
  "Magnetic Closure Boxes",
  "Tuck End Box Style",
  "Display Boxes",
  "Pillow Boxes",
  "Mailer Boxes",
  "Tray and Sleeve Boxes",
  "Mylar Bags",
  "Hang Tabs",
] as const;

export const UNITS = ["inch", "mm", "cm"] as const;

export const ADDONS = [
  "Debossing",
  "Embossing",
  "Foiling",
  "Gloss",
  "Matte",
  "Soft Touch",
  "Spot-UV",
  "UV Finish",
] as const;
