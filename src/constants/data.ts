import { config } from '@/config/environment';

export interface NavLink {
  href: string;
  label: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  meta: string;
  emoji: string;
  featured: boolean;
  rating: number;
}

export interface Example {
  id: string;
  emoji: string;
  text: string;
  category: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
}

export interface ComparisonItem {
  id: string;
  icon: string;
  title: string;
  color: string;
  items: string[];
}

export interface ScienceItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
  category: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export const TESTIMONIALS: Testimonial[] = [
  { 
    id: "1",
    quote: "I felt lighter after just one call. Someone finally understood without trying to fix me.", 
    meta: "After relationship conflict", 
    emoji: "😌",
    featured: false,
    rating: 5
  },
  { 
    id: "2",
    quote: "Someone was finally 100% on my side. No judgment, just pure validation.", 
    meta: "After workplace criticism", 
    emoji: "🥺", 
    featured: true,
    rating: 5
  },
  { 
    id: "3",
    quote: "Instant reassurance that I wasn't alone. Worth every penny for my peace of mind.", 
    meta: "During family stress", 
    emoji: "😊",
    featured: false,
    rating: 5
  },
  { 
    id: "4",
    quote: "Affordable, discreet, and genuinely human. This service is a lifesaver.", 
    meta: "Regular user", 
    emoji: "🙂",
    featured: false,
    rating: 5
  },
];

export const EXAMPLES: Example[] = [
  { id: "1", emoji: "😔", text: "Nobody is mine... it's my fault.", category: "sadness" },
  { id: "2", emoji: "🤔", text: "Am I really that wrong about everything?", category: "confusion" },
  { id: "3", emoji: "🤗", text: "I wish someone could hug me until my soul melts.", category: "loneliness" },
  { id: "4", emoji: "😢", text: "Life took something that stole my smile.", category: "grief" },
  { id: "5", emoji: "😞", text: "I no longer want to prove I'm right.", category: "exhaustion" },
  { id: "6", emoji: "😤", text: "Nobody apologized; they blamed me for reacting.", category: "frustration" },
];

export const FEATURES: Feature[] = [
  { 
    id: "1",
    icon: "📅", 
    title: "Book Your Slot", 
    desc: "Choose a convenient date and time based on slot availability.",
    order: 1
  },
  { 
    id: "2",
    icon: "🤝", 
    title: "Get Matched", 
    desc: "A trained, empathetic listener will call you at your scheduled time.",
    order: 2
  },
  { 
    id: "3",
    icon: "💝", 
    title: "Feel Validated", 
    desc: "Leave every call feeling heard, understood, and knowing that your feelings matter.",
    order: 3
  },
];

export const DIFFERENT: ComparisonItem[] = [
  {
    id: "1",
    icon: "❌",
    title: "Traditional Therapy",
    color: "text-red-600",
    items: [
      "What childhood trauma caused this?",
      "Let's work on changing your thoughts",
      "Here are coping strategies to try",
      "We need to explore underlying patterns",
      "Weeks of sessions to see progress",
      "Focus on diagnosis & treatment plans",
    ],
  },
  {
    id: "2",
    icon: "✅",
    title: config.app.name,
    color: "text-blue-600",
    items: [
      "That sounds incredibly difficult",
      "Your reaction makes complete sense",
      "Anyone would feel that way",
      "You're not crazy or overreacting",
      "Feel better within 30 minutes",
      "Focus on validation & emotional support",
    ],
  },
];

export const SCIENCE: ScienceItem[] = [
  { 
    id: "1",
    icon: "🧠", 
    title: "Reduces Stress", 
    desc: "Being truly listened to lowers cortisol levels and calms your nervous system within minutes.",
    order: 1
  },
  { 
    id: "2",
    icon: "💪", 
    title: "Boosts Confidence", 
    desc: "Hearing \"your feelings are valid\" reinforces self-worth and emotional intelligence.",
    order: 2
  },
  { 
    id: "3",
    icon: "🛡️", 
    title: "Judgment-Free Zone", 
    desc: "Pure validation calms the mind first. Solutions can follow when you're ready.",
    order: 3
  },
];

export const FAQ: FAQItem[] = [
  {
    id: "1",
    q: "Is this therapy?",
    a: "No. This is an anonymous listening & validation service. We provide emotional support and validation, not clinical treatment. Our listeners are here to make you feel heard and understood, not to diagnose or treat mental health conditions.",
    category: "service"
  },
  {
    id: "2",
    q: "How is it anonymous?",
    a: "We never ask for real names or personal details. All calls are encrypted and confidential. You're just a voice to us, and we're just a listening ear to you. No registration, no forms, no tracking.",
    category: "privacy"
  },
  {
    id: "3",
    q: "What if I'm in crisis?",
    a: "If you're having thoughts of self-harm or are in immediate danger, please contact emergency services or a crisis helpline immediately. We're here for emotional support and validation, not crisis intervention.",
    category: "safety"
  },
  {
    id: "4",
    q: "Who are your listeners?",
    a: "Our listeners are trained volunteers who understand the power of validation. They're not therapists, but they are compassionate humans skilled in active listening and providing the emotional support you need.",
    category: "service"
  },
  {
    id: "5",
    q: "How much does it cost?",
    a: `It's ₹${config.pricing.perSessionPrice} per ${config.pricing.sessionDuration}-minute session (reduced from ₹${config.pricing.originalPrice}). No hidden fees, no contracts.`,
    category: "pricing"
  },
  {
    id: "6",
    q: "How does scheduling work?",
    a: "Simply click \"Book Session\" to see available time slots. Choose your preferred date and time, and we'll call you at the scheduled moment. Sessions are available based on slot availability.",
    category: "booking"
  },
];
