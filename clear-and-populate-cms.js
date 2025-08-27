// Script to clear CMS and populate with only website-visible content
const API_BASE = 'https://justhear-backend.onrender.com/api/cms';

// First, let's clear all existing data
async function clearAllData() {
  console.log('🧹 Clearing all CMS data...');
  
  const sections = ['testimonials', 'features', 'faq', 'pricing'];
  
  for (const section of sections) {
    try {
      // Get all items
      const response = await fetch(`${API_BASE}/${section}`);
      if (response.ok) {
        const data = await response.json();
        const items = data[section] || data.items || [];
        
        // Delete each item
        for (const item of items) {
          if (item.id) {
            const deleteResponse = await fetch(`${API_BASE}/${section}/${item.id}`, {
              method: 'DELETE',
            });
            if (deleteResponse.ok) {
              console.log(`🗑️ Deleted ${section} item:`, item.id);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error clearing ${section}:`, error);
    }
  }
  
  console.log('✅ All data cleared');
}

// Now add only the content that's visible on the website
const websiteContent = {
  testimonials: [
    {
      name: "Alex Thompson",
      text: "JustHear helped me through a really difficult time. The anonymous listening sessions gave me the space to be completely honest about my feelings.",
      rating: 5,
      avatar_url: "",
      sort_order: 1
    },
    {
      name: "Maria Garcia",
      text: "I was skeptical at first, but the trained listeners are amazing. They really understand what you're going through.",
      rating: 5,
      avatar_url: "",
      sort_order: 2
    },
    {
      name: "David Kim",
      text: "The anonymity aspect made all the difference. I could be completely honest without worrying about being judged.",
      rating: 4,
      avatar_url: "",
      sort_order: 3
    }
  ],
  features: [
    {
      title: "Anonymous Listening",
      description: "Speak freely without fear of judgment. Our trained listeners provide a safe, confidential space.",
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
    }
  ],
  faq: [
    {
      question: "Is this therapy?",
      answer: "No, JustHear is not therapy. We provide anonymous listening sessions with trained listeners who offer emotional support and validation.",
      category: "General",
      sort_order: 1
    },
    {
      question: "How anonymous is it really?",
      answer: "Completely anonymous. We don't record sessions, take notes, or store any personal information.",
      category: "Privacy",
      sort_order: 2
    },
    {
      question: "How do I book a session?",
      answer: "Simply click 'Book Session' on our homepage, choose a date and time, and confirm your booking.",
      category: "Booking",
      sort_order: 3
    }
  ],
  pricing: [
    {
      name: "Single Session",
      price: 50.00,
      currency: "USD",
      billing_period: "session",
      description: "Perfect for when you need someone to talk to right now.",
      features: ["1-hour anonymous listening session", "Trained listener", "Secure meeting link"],
      is_popular: false,
      sort_order: 1
    }
  ]
};

async function populateWithWebsiteContent() {
  console.log('📝 Adding website-visible content...');
  
  for (const [section, items] of Object.entries(websiteContent)) {
    console.log(`📝 Adding ${section}...`);
    
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
  
  console.log('🎉 Website content added!');
}

async function main() {
  await clearAllData();
  await populateWithWebsiteContent();
}

main();
