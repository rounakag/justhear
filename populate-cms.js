// Script to populate CMS with sample data
const API_BASE = 'https://justhear-backend.onrender.com/api/cms';

const sampleData = {
  testimonials: [
    {
      name: "Sarah Johnson",
      text: "JustHear has been a lifesaver for me. The anonymous listening sessions helped me through a really tough time. I felt truly heard without any judgment.",
      rating: 5,
      avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      sort_order: 1
    },
    {
      name: "Michael Chen",
      text: "I was skeptical at first, but the trained listeners are amazing. They really understand what you're going through and provide genuine support.",
      rating: 5,
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      sort_order: 2
    },
    {
      name: "Emily Rodriguez",
      text: "The anonymity aspect made all the difference. I could be completely honest about my feelings without worrying about being judged.",
      rating: 4,
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      sort_order: 3
    }
  ],
  features: [
    {
      title: "Anonymous Listening",
      description: "Speak freely without fear of judgment. Our trained listeners provide a safe, confidential space for you to be heard.",
      icon: "ear",
      sort_order: 1
    },
    {
      title: "Trained Professionals",
      description: "Our listeners are carefully selected and trained to provide empathetic, non-judgmental support.",
      icon: "shield-check",
      sort_order: 2
    },
    {
      title: "24/7 Availability",
      description: "Book sessions at any time that works for you. We're here when you need us most.",
      icon: "clock",
      sort_order: 3
    },
    {
      title: "No Therapy, Just Support",
      description: "This isn't therapy - it's genuine human connection and emotional support when you need it.",
      icon: "heart",
      sort_order: 4
    }
  ],
  faq: [
    {
      question: "Is this therapy?",
      answer: "No, JustHear is not therapy. We provide anonymous listening sessions with trained listeners who offer emotional support and validation. If you need professional therapy, we recommend consulting with a licensed therapist.",
      category: "General",
      sort_order: 1
    },
    {
      question: "How anonymous is it really?",
      answer: "Completely anonymous. We don't record sessions, take notes, or store any personal information. You can use any name you want, and we never ask for identifying details.",
      category: "Privacy",
      sort_order: 2
    },
    {
      question: "What if I'm in crisis?",
      answer: "If you're experiencing a mental health crisis or having thoughts of self-harm, please contact emergency services immediately. JustHear is for emotional support, not crisis intervention.",
      category: "Safety",
      sort_order: 3
    },
    {
      question: "How do I book a session?",
      answer: "Simply click 'Book Session' on our homepage, choose a date and time that works for you, and confirm your booking. You'll receive a meeting link to join your session.",
      category: "Booking",
      sort_order: 4
    }
  ],
  pricing: [
    {
      name: "Single Session",
      price: 25.00,
      currency: "USD",
      billing_period: "session",
      description: "Perfect for when you need someone to talk to right now.",
      features: ["1-hour anonymous listening session", "Trained listener", "Secure meeting link", "No recordings or notes"],
      is_popular: false,
      sort_order: 1
    },
    {
      name: "Monthly Plan",
      price: 75.00,
      currency: "USD",
      billing_period: "month",
      description: "Regular support with 4 sessions per month.",
      features: ["4 sessions per month", "Priority booking", "Same listener option", "Flexible scheduling"],
      is_popular: true,
      sort_order: 2
    },
    {
      name: "Annual Plan",
      price: 750.00,
      currency: "USD",
      billing_period: "year",
      description: "Best value for ongoing support throughout the year.",
      features: ["48 sessions per year", "Premium listener access", "24/7 booking priority", "Personalized support plan"],
      is_popular: false,
      sort_order: 3
    }
  ]
};

async function populateCMS() {
  console.log('🚀 Starting CMS population...');
  
  for (const [section, items] of Object.entries(sampleData)) {
    console.log(`📝 Populating ${section}...`);
    
    for (const item of items) {
      try {
        const response = await fetch(`${API_BASE}/${section}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Added ${section} item:`, data[section.slice(0, -1)] || data.item);
        } else {
          console.error(`❌ Failed to add ${section} item:`, await response.text());
        }
      } catch (error) {
        console.error(`❌ Error adding ${section} item:`, error);
      }
    }
  }
  
  console.log('🎉 CMS population complete!');
}

// Run the script
populateCMS();
