import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'pa' | 'ta' | 'te' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    'welcome': 'Welcome to Farm-Connect',
    'browse_produce': 'Browse Produce',
    'add_produce': 'Add Produce',
    'my_orders': 'My Orders',
    'dashboard': 'Dashboard',
    'login': 'Login',
    'logout': 'Logout',
    'search': 'Search produce...',
    'location': 'Location',
    'sort_by': 'Sort by',
    'price_low_high': 'Price: Low to High',
    'price_high_low': 'Price: High to Low',
    'rating_high_low': 'Rating: High to Low',
    'order_now': 'Order Now',
    'out_of_stock': 'Out of Stock',
    'per_kg': '₹ per kg',
    'available': 'Available',
    'kg': 'kg',
  },
  hi: {
    'welcome': 'फार्म-कनेक्ट में आपका स्वागत है',
    'browse_produce': 'उत्पाद देखें',
    'add_produce': 'उत्पाद जोड़ें',
    'my_orders': 'मेरे ऑर्डर',
    'dashboard': 'डैशबोर्ड',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    'search': 'उत्पाद खोजें...',
    'location': 'स्थान',
    'sort_by': 'क्रमबद्ध करें',
    'price_low_high': 'कीमत: कम से ज्यादा',
    'price_high_low': 'कीमत: ज्यादा से कम',
    'rating_high_low': 'रेटिंग: उच्च से निम्न',
    'order_now': 'अभी ऑर्डर करें',
    'out_of_stock': 'स्टॉक में नहीं',
    'per_kg': '₹ प्रति किलो',
    'available': 'उपलब्ध',
    'kg': 'किलो',
  },
  mr: {
    'welcome': 'फार्म-कनेक्टमध्ये आपले स्वागत आहे',
    'browse_produce': 'उत्पादने पहा',
    'add_produce': 'उत्पादन जोडा',
    'my_orders': 'माझे ऑर्डर',
    'dashboard': 'डॅशबोर्ड',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    'search': 'उत्पादने शोधा...',
    'location': 'स्थान',
    'sort_by': 'क्रमवारी',
    'price_low_high': 'किंमत: कमी ते जास्त',
    'price_high_low': 'किंमत: जास्त ते कमी',
    'rating_high_low': 'रेटिंग: उच्च ते कमी',
    'order_now': 'आता ऑर्डर करा',
    'out_of_stock': 'स्टॉकमध्ये नाही',
    'per_kg': '₹ प्रति किलो',
    'available': 'उपलब्ध',
    'kg': 'किलो',
  },
  pa: {
    'welcome': 'ਫਾਰਮ-ਕਨੈਕਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    'browse_produce': 'ਉਤਪਾਦ ਵੇਖੋ',
    'add_produce': 'ਉਤਪਾਦ ਸ਼ਾਮਲ ਕਰੋ',
    'my_orders': 'ਮੇਰੇ ਆਰਡਰ',
    'dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'login': 'ਲਾਗਿਨ',
    'logout': 'ਲਾਗਆਉਟ',
    'search': 'ਉਤਪਾਦ ਖੋਜੋ...',
    'location': 'ਸਥਾਨ',
    'sort_by': 'ਕ੍ਰਮਬੱਧ ਕਰੋ',
    'price_low_high': 'ਕੀਮਤ: ਘੱਟ ਤੋਂ ਵੱਧ',
    'price_high_low': 'ਕੀਮਤ: ਵੱਧ ਤੋਂ ਘੱਟ',
    'rating_high_low': 'ਰੇਟਿੰਗ: ਉੱਚ ਤੋਂ ਘੱਟ',
    'order_now': 'ਹੁਣੇ ਆਰਡਰ ਕਰੋ',
    'out_of_stock': 'ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ',
    'per_kg': '₹ ਪ੍ਰਤੀ ਕਿਲੋ',
    'available': 'ਉਪਲਬਧ',
    'kg': 'ਕਿਲੋ',
  },
  ta: {
    'welcome': 'ஃபார்ம்-கனெக்ட்டில் உங்களை வரவேற்கிறோம்',
    'browse_produce': 'பொருட்களைப் பார்க்கவும்',
    'add_produce': 'பொருளைச் சேர்க்கவும்',
    'my_orders': 'எனது ஆர்டர்கள்',
    'dashboard': 'டாஷ்போர்டு',
    'login': 'உள்நுழைவு',
    'logout': 'வெளியேறு',
    'search': 'பொருட்களைத் தேடு...',
    'location': 'இடம்',
    'sort_by': 'வரிசைப்படுத்து',
    'price_low_high': 'விலை: குறைவு முதல் அதிகம்',
    'price_high_low': 'விலை: அதிகம் முதல் குறைவு',
    'rating_high_low': 'மதிப்பீடு: அதிகம் முதல் குறைவு',
    'order_now': 'இப்போது ஆர்டர் செய்யுங்கள்',
    'out_of_stock': 'கையிருப்பில் இல்லை',
    'per_kg': '₹ ஒரு கிலோ',
    'available': 'கிடைக்கிறது',
    'kg': 'கிலோ',
  },
  te: {
    'welcome': 'ఫార్మ్-కనెక్ట్‌కు స్వాగతం',
    'browse_produce': 'ఉత్పత్తులను చూడండి',
    'add_produce': 'ఉత్పత్తిని జోడించండి',
    'my_orders': 'నా ఆర్డర్‌లు',
    'dashboard': 'డాష్‌బోర్డ్',
    'login': 'లాగిన్',
    'logout': 'లాగ్అవుట్',
    'search': 'ఉత్పత్తులను వెతకండి...',
    'location': 'స్థానం',
    'sort_by': 'క్రమబద్ధీకరించు',
    'price_low_high': 'ధర: తక్కువ నుండి ఎక్కువ',
    'price_high_low': 'ధర: ఎక్కువ నుండి తక్కువ',
    'rating_high_low': 'రేటింగ్: ఎక్కువ నుండి తక్కువ',
    'order_now': 'ఇప్పుడే ఆర్డర్ చేయండి',
    'out_of_stock': 'స్టాక్‌లో లేదు',
    'per_kg': '₹ ప్రతి కిలో',
    'available': 'అందుబాటులో ఉంది',
    'kg': 'కిలో',
  },
  bn: {
    'welcome': 'ফার্ম-কানেক্টে আপনাকে স্বাগতম',
    'browse_produce': 'পণ্য দেখুন',
    'add_produce': 'পণ্য যোগ করুন',
    'my_orders': 'আমার অর্ডার',
    'dashboard': 'ড্যাশবোর্ড',
    'login': 'লগইন',
    'logout': 'লগআউট',
    'search': 'পণ্য খুঁজুন...',
    'location': 'অবস্থান',
    'sort_by': 'সাজান',
    'price_low_high': 'মূল্য: কম থেকে বেশি',
    'price_high_low': 'মূল্য: বেশি থেকে কম',
    'rating_high_low': 'রেটিং: উচ্চ থেকে নিম্ন',
    'order_now': 'এখনই অর্ডার করুন',
    'out_of_stock': 'স্টকে নেই',
    'per_kg': '₹ প্রতি কেজি',
    'available': 'উপলব্ধ',
    'kg': 'কেজি',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('farmconnect_language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('farmconnect_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
