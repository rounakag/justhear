import React, { useState } from "react";
import { Button } from "@/components/ui/Button/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';
import { BubbleBackground } from '@/components/BubbleBackground';
import { SharpButton } from '@/components/SharpButton';
import { ReachOut } from '@/components/sections/ReachOut';
import { SchedulerModal } from '@/components/SchedulerModal';

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const TESTIMONIALS = [
  { quote: "I felt lighter after just one call. Someone finally understood without trying to fix me.", meta: "After relationship conflict", emoji: "😌" },
  { quote: "Someone was finally 100% on my side. No judgment, just pure validation.", meta: "After workplace criticism", emoji: "🥺", featured: true },
  { quote: "Instant reassurance that I wasn't alone. Worth every penny for my peace of mind.", meta: "During family stress", emoji: "😊" },
  { quote: "Affordable, discreet, and genuinely human. This service is a lifesaver.", meta: "Regular user", emoji: "🙂" },
];

const EXAMPLES = [
  { emoji: "😔", text: "Nobody is mine... it's my fault." },
  { emoji: "🤔", text: "Am I really that wrong about everything?" },
  { emoji: "🤗", text: "I wish someone could hug me until my soul melts." },
  { emoji: "😢", text: "Life took something that stole my smile." },
  { emoji: "😞", text: "I no longer want to prove I'm right." },
  { emoji: "😤", text: "Nobody apologized; they blamed me for reacting." },
];

const FEATURES = [
  { icon: "📅", title: "Book Your Slot", desc: "Choose a convenient date and time based on slot availability." },
  { icon: "🤝", title: "Get Matched", desc: "A trained, empathetic listener will call you at your scheduled time." },
  { icon: "💝", title: "Feel Validated", desc: "Leave every call feeling heard, understood, and knowing that your feelings matter." },
];

const DIFFERENT = [
  {
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
    icon: "✅",
    title: "justhear.me",
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

const SCIENCE = [
  { icon: "🧠", title: "Reduces Stress", desc: "Being truly listened to lowers cortisol levels and calms your nervous system within minutes." },
  { icon: "💪", title: "Boosts Confidence", desc: "Hearing \"your feelings are valid\" reinforces self-worth and emotional intelligence." },
  { icon: "🛡️", title: "Judgment-Free Zone", desc: "Pure validation calms the mind first. Solutions can follow when you're ready." },
];

const FAQ = [
  {
    q: "Is this therapy?",
    a: "No. This is an anonymous listening & validation service. We provide emotional support and validation, not clinical treatment. Our listeners are here to make you feel heard and understood, not to diagnose or treat mental health conditions.",
  },
  {
    q: "How is it anonymous?",
    a: "We never ask for real names or personal details. All calls are encrypted and confidential. You're just a voice to us, and we're just a listening ear to you. No registration, no forms, no tracking.",
  },
  {
    q: "What if I'm in crisis?",
    a: "If you're having thoughts of self-harm or are in immediate danger, please contact emergency services or a crisis helpline immediately. We're here for emotional support and validation, not crisis intervention.",
  },
  {
    q: "Who are your listeners?",
    a: "Our listeners are trained volunteers who understand the power of validation. They're not therapists, but they are compassionate humans skilled in active listening and providing the emotional support you need.",
  },
  {
    q: "How much does it cost?",
    a: "It's ₹49 per 30-minute session (reduced from ₹150). No hidden fees, no contracts.",
  },
  {
    q: "How does scheduling work?",
    a: "Simply click \"Book Session\" to see available time slots. Choose your preferred date and time, and we'll call you at the scheduled moment. Sessions are available based on slot availability.",
  },
];

function AppHeader() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 bg-white/95 backdrop-blur border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-3 px-3 md:px-6">
        <a href="#top" className="font-bold text-lg md:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          justhear.me
        </a>
        
        <nav className="hidden lg:flex gap-6 items-center">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-gray-600 hover:text-blue-600 transition font-medium">
              {l.label}
            </a>
          ))}
          <SchedulerModal />
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">👤 {user.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <AuthModal>
              <SharpButton>Login / Sign Up</SharpButton>
            </AuthModal>
          )}
        </nav>

        <div className="lg:hidden">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <span className="sr-only">Open menu</span>
                ☰
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col gap-6 mt-8">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-lg block py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setNavOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                  {user ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">👤 {user.username}</p>
                      <Button variant="outline" size="sm" onClick={logout} className="w-full">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <AuthModal>
                      <SharpButton className="w-full">Login / Sign Up</SharpButton>
                    </AuthModal>
                  )}
                  <SchedulerModal />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="font-sans min-h-screen bg-neutral-50">
        <AppHeader />
        
        {/* Hidden AuthModal trigger for programmatic access */}
        <AuthModal>
          <button data-auth-trigger style={{ display: 'none' }}>
            Hidden Login Trigger
          </button>
        </AuthModal>

        {/* Hero */}
        <section
          id="top"
          className="min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-yellow-100 text-blue-900 relative overflow-hidden"
        >
          <BubbleBackground />
          <div className="max-w-2xl mx-auto text-center px-3 sm:px-6 pt-16 pb-8 md:pb-24 relative z-10">
            <h1 className="text-3xl xs:text-4xl md:text-6xl font-bold mb-5 leading-tight">
              Feeling{" "}
              <span className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
                upset?
              </span>
              <br />
              We're here to listen.
            </h1>
            <p className="text-base md:text-xl mb-8 text-blue-700 max-w-2xl mx-auto">
              Talk anonymously with trained listeners who understand.<br />
              <strong>Not therapy</strong> — just you, truly <em>heard</em>.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <SchedulerModal />
              <Button variant="secondary" className="rounded-full text-blue-600 bg-white hover:bg-gray-50" size="lg" asChild>
                <a href="#how">See How It Works</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials: horizontal scroll on mobile, grid on desktop */}
        <section id="testimonials" className="py-10 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Real stories, real validation</h2>
            <p className="text-center text-gray-600 mb-6 md:mb-12 text-base md:text-lg">See how a simple conversation changed everything</p>
            <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto scrollbar-hide snap-x md:snap-none pb-2 md:pb-0">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-white rounded-2xl shadow-sm p-6 min-w-[280px] max-w-[320px] shrink-0 snap-center transition-transform hover:-translate-y-1",
                    t.featured && "border-2 border-blue-500 shadow-lg relative"
                  )}
                  style={t.featured ? { overflow: 'visible' } : {}}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap z-10">
                      ✨ Most helpful
                    </span>
                  )}
                  <div className="text-yellow-400 mb-3 text-lg">⭐⭐⭐⭐⭐</div>
                  <blockquote className="italic mb-4 text-gray-700 leading-relaxed">"{t.quote}"</blockquote>
                  <div className="flex gap-3 items-center">
                    <span className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 text-xl">
                      {t.emoji}
                    </span>
                    <div>
                      <strong className="block text-gray-800">Anonymous user</strong>
                      <small className="text-gray-500">{t.meta}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reach Out: geometric/radial on desktop, horizontal scroll on mobile */}
        <section id="examples" className="py-10 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Reach out to us, when u feel</h2>
            <div className="sm:hidden flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2">
              {EXAMPLES.map((ex, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 min-w-[170px] max-w-[200px] text-center hover:shadow-lg transition border border-blue-100 snap-center">
                  <div className="text-3xl mb-2">{ex.emoji}</div>
                  <div className="text-gray-700 text-sm italic">"{ex.text}"</div>
                </div>
              ))}
            </div>
            <div className="hidden sm:flex justify-center">
              <ReachOut feelings={EXAMPLES} />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-10 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">How it works</h2>
            <div className="grid md:grid-cols-3 gap-4 md:gap-8">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-lg transition">
                  <div className="text-4xl mb-6">{f.icon}</div>
                  <h3 className="font-bold mb-4 text-xl text-gray-800">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Not Therapy / Comparison */}
        <section id="different" className="py-10 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">We're not therapy — we're something different</h2>
            <p className="text-center text-gray-600 mb-12 text-base md:text-lg max-w-3xl mx-auto">
              Sometimes you don't need to be "fixed" or analyzed. You just need someone to say:{" "}
              <em>"Your feelings make complete sense."</em>
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {DIFFERENT.map((d, i) => (
                <div key={i} className={cn(
                  "bg-white rounded-2xl shadow-sm p-8",
                  i === 0 ? "border-l-4 border-red-500" : "border-l-4 border-blue-500 transform md:-translate-y-4"
                )}>
                  <h3 className={cn("font-bold mb-4 text-xl", d.color)}>
                    {d.icon} {d.title}
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    {d.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2 text-gray-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="text-center bg-blue-50 rounded-2xl border border-blue-200 p-8">
              <h3 className="font-bold text-blue-600 mb-6 text-xl">💡 Think of it this way...</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">🔧</span>
                  <div>
                    <strong className="text-gray-800">Therapy:</strong><br />
                    <span className="text-gray-600">A mechanic who fixes your car's engine</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-4xl mb-4 block">🤗</span>
                  <div>
                    <strong className="text-gray-800">justhear.me:</strong><br />
                    <span className="text-gray-600">
                      A friend who says "Your car breaking down sucks, and you're handling it amazingly"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Science / Why it helps */}
        <section id="science" className="py-10 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Why validation works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {SCIENCE.map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl shadow-sm p-8 text-center hover:shadow-lg transition">
                  <div className="text-4xl mb-6">{f.icon}</div>
                  <h3 className="font-bold mb-4 text-xl text-gray-800">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-10 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">Choose your plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per session */}
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center relative border-2 border-blue-500 shadow-lg transform scale-105">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
                <h3 className="font-bold mb-4 text-xl text-gray-800">Per Session</h3>
                <div className="text-lg line-through text-gray-400 mb-2">₹150</div>
                <div className="text-4xl font-bold text-blue-600 mb-4">₹49</div>
                <p className="text-gray-600 mb-8">30 minutes of validation</p>
                <SchedulerModal />
              </div>
              
              {/* Monthly "Coming soon" */}
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center relative opacity-60">
                <h3 className="font-bold mb-4 text-xl text-gray-800">Monthly Package</h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">Coming Soon</div>
                <p className="text-gray-600 mb-8">15 sessions per month</p>
                <Button disabled className="w-full rounded-lg">
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-10 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-3 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {FAQ.map((f, i) => (
                <AccordionItem value={`item-${i}`} key={i} className="bg-gray-50 rounded-2xl px-6 border-0">
                  <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline hover:text-blue-600">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-8 md:py-16">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-xl">justhear.me</h3>
              <p className="text-gray-300 leading-relaxed">Your on-demand safe space to be heard and validated.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-xl">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <a href="#how" className="text-gray-300 hover:text-white transition">How it works</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                <a href="#faq" className="text-gray-300 hover:text-white transition">FAQ</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-xl">Contact</h3>
              <div className="flex flex-col gap-2">
                <a href="tel:+1999999999" className="text-gray-300 hover:text-white transition">Call: +1 (999) 999-9999</a>
                <a href="mailto:hello@justhear.me" className="text-gray-300 hover:text-white transition">hello@justhear.me</a>
              </div>
            </div>
          </div>
          <div className="text-center py-6 border-t border-gray-700 text-gray-400">
            © 2025 justhear.me · All rights reserved
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
