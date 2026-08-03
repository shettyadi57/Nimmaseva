import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'kn' | 'hi';

export interface Translations {
  // Header
  appName: string;
  appSubtitle: string;
  navHome: string;
  navBook: string;
  navQueue: string;
  navSchemes: string;
  allSystems: string;
  installPwa: string;
  staffLogin: string;
  adminPanel: string;

  // Home Hero
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;
  bookNow: string;
  liveQueue: string;
  tokensIssued: string;
  avgProcessing: string;
  tatkalAccuracy: string;

  // Booking form
  bookTitle: string;
  fullName: string;
  mobile: string;
  age: string;
  gender: string;
  aadhaar: string;
  sendOtp: string;
  verifyOtp: string;
  next: string;
  back: string;
  submit: string;
  selectService: string;
  selectOffice: string;
  priorityPass: string;
  senior: string;
  pwd: string;
  pregnant: string;
  emergency: string;
  general: string;

  // Queue
  queueTitle: string;
  nowServing: string;
  yourToken: string;
  waitingAhead: string;
  estWait: string;

  // Schemes
  schemesTitle: string;
  schemesSubtitle: string;
  filterAge: string;
  filterIncome: string;
  filterGender: string;
  filterOccupation: string;
  applyNow: string;
  eligibility: string;

  // Footer
  helpline: string;
  emergency: string;
  copyright: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Nimma Seva',
    appSubtitle: 'Shivamogga GramOne & Seva Sindhu',
    navHome: 'Home & Map',
    navBook: 'Book Token',
    navQueue: 'Live Queue',
    navSchemes: 'Govt Schemes',
    allSystems: 'All Systems Operational',
    installPwa: 'Install PWA',
    staffLogin: 'Staff Login',
    adminPanel: 'Admin Panel',

    heroTitle: 'Your Government,\nAt Your Fingertips',
    heroSubtitle: 'Skip the Queue. Book Smart. Get Served Fast.',
    heroDesc: 'Shivamogga\'s first AI-powered civic token system. Book appointments for GramOne & Seva Sindhu instantly — no waiting, no hassle.',
    bookNow: 'Book Token Pass Now',
    liveQueue: 'View Live Queue',
    tokensIssued: 'Tokens Issued Today',
    avgProcessing: 'Avg. Processing Time',
    tatkalAccuracy: 'Tatkal Accuracy',

    bookTitle: 'Book Your Token Pass',
    fullName: 'Full Name',
    mobile: 'Mobile Number',
    age: 'Age',
    gender: 'Gender',
    aadhaar: 'Aadhaar Number',
    sendOtp: 'Send Mobile OTP',
    verifyOtp: 'Verify OTP',
    next: 'Next',
    back: 'Back',
    submit: 'Confirm & Book Token',
    selectService: 'Select Service',
    selectOffice: 'Select Office',
    priorityPass: 'Priority Pass',
    senior: 'Senior Citizen 60+',
    pwd: 'Person with Disability',
    pregnant: 'Pregnant / New Mother',
    emergency: 'Emergency',
    general: 'General',

    queueTitle: 'Live Token Queue',
    nowServing: 'Now Serving',
    yourToken: 'Your Token',
    waitingAhead: 'Waiting Ahead',
    estWait: 'Est. Wait',

    schemesTitle: 'Government Scheme Finder',
    schemesSubtitle: 'Find welfare schemes you are eligible for',
    filterAge: 'Your Age',
    filterIncome: 'Annual Income (₹)',
    filterGender: 'Gender',
    filterOccupation: 'Occupation',
    applyNow: 'Apply Now',
    eligibility: 'Eligibility',

    helpline: 'Helpline',
    copyright: '© 2026 Nimma Seva — Shivamogga Smart Governance. All rights reserved.',
  },

  kn: {
    appName: 'ನಿಮ್ಮ ಸೇವಾ',
    appSubtitle: 'ಶಿವಮೊಗ್ಗ GramOne & ಸೇವಾ ಸಿಂಧು',
    navHome: 'ಮುಖಪುಟ & ನಕ್ಷೆ',
    navBook: 'ಟೋಕನ್ ಬುಕ್ ಮಾಡಿ',
    navQueue: 'ನೇರ ಸರದಿ',
    navSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆ',
    allSystems: 'ಎಲ್ಲಾ ವ್ಯವಸ್ಥೆಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ',
    installPwa: 'ಅಪ್ಲಿಕೇಶನ್ ಸ್ಥಾಪಿಸಿ',
    staffLogin: 'ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್',
    adminPanel: 'ನಿರ್ವಾಹಕ ಫಲಕ',

    heroTitle: 'ನಿಮ್ಮ ಸರ್ಕಾರ,\nನಿಮ್ಮ ಕೈ ಬೆರಳ ತುದಿಯಲ್ಲಿ',
    heroSubtitle: 'ಸರದಿ ಬಿಡಿ. ಸ್ಮಾರ್ಟ್ ಆಗಿ ಬುಕ್ ಮಾಡಿ. ತ್ವರಿತ ಸೇವೆ ಪಡೆಯಿರಿ.',
    heroDesc: 'ಶಿವಮೊಗ್ಗದ ಮೊದಲ AI-ಚಾಲಿತ ನಾಗರಿಕ ಟೋಕನ್ ವ್ಯವಸ್ಥೆ. GramOne & ಸೇವಾ ಸಿಂಧುಗಾಗಿ ತಕ್ಷಣ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ.',
    bookNow: 'ಈಗಲೇ ಟೋಕನ್ ಪಾಸ್ ಬುಕ್ ಮಾಡಿ',
    liveQueue: 'ನೇರ ಸರದಿ ನೋಡಿ',
    tokensIssued: 'ಇಂದು ನೀಡಿದ ಟೋಕನ್‌ಗಳು',
    avgProcessing: 'ಸರಾಸರಿ ಸಂಸ್ಕರಣ ಸಮಯ',
    tatkalAccuracy: 'ತತ್‌ಕಾಲ್ ನಿಖರತೆ',

    bookTitle: 'ನಿಮ್ಮ ಟೋಕನ್ ಪಾಸ್ ಬುಕ್ ಮಾಡಿ',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    age: 'ವಯಸ್ಸು',
    gender: 'ಲಿಂಗ',
    aadhaar: 'ಆಧಾರ್ ಸಂಖ್ಯೆ',
    sendOtp: 'ಮೊಬೈಲ್ OTP ಕಳುಹಿಸಿ',
    verifyOtp: 'OTP ಪರಿಶೀಲಿಸಿ',
    next: 'ಮುಂದೆ',
    back: 'ಹಿಂದೆ',
    submit: 'ದೃಢೀಕರಿಸಿ & ಟೋಕನ್ ಬುಕ್ ಮಾಡಿ',
    selectService: 'ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ',
    selectOffice: 'ಕಚೇರಿ ಆಯ್ಕೆ ಮಾಡಿ',
    priorityPass: 'ಆದ್ಯತಾ ಪಾಸ್',
    senior: 'ಹಿರಿಯ ನಾಗರಿಕ 60+',
    pwd: 'ವಿಕಲಾಂಗ ವ್ಯಕ್ತಿ',
    pregnant: 'ಗರ್ಭಿಣಿ / ನವ ತಾಯಿ',
    emergency: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ',
    general: 'ಸಾಮಾನ್ಯ',

    queueTitle: 'ನೇರ ಟೋಕನ್ ಸರದಿ',
    nowServing: 'ಈಗ ಸೇವೆ ನೀಡಲಾಗುತ್ತಿದೆ',
    yourToken: 'ನಿಮ್ಮ ಟೋಕನ್',
    waitingAhead: 'ನಿಮ್ಮ ಮುಂದೆ ಕಾಯುತ್ತಿರುವವರು',
    estWait: 'ಅಂದಾಜು ಕಾಯುವ ಸಮಯ',

    schemesTitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆ ಹುಡುಕಿ',
    schemesSubtitle: 'ನೀವು ಅರ್ಹರಾದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
    filterAge: 'ನಿಮ್ಮ ವಯಸ್ಸು',
    filterIncome: 'ವಾರ್ಷಿಕ ಆದಾಯ (₹)',
    filterGender: 'ಲಿಂಗ',
    filterOccupation: 'ವೃತ್ತಿ',
    applyNow: 'ಈಗ ಅರ್ಜಿ ಹಾಕಿ',
    eligibility: 'ಅರ್ಹತೆ',

    helpline: 'ಸಹಾಯವಾಣಿ',
    copyright: '© 2026 ನಿಮ್ಮ ಸೇವಾ — ಶಿವಮೊಗ್ಗ ಸ್ಮಾರ್ಟ್ ಆಡಳಿತ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
  },

  hi: {
    appName: 'निम्म सेवा',
    appSubtitle: 'शिवमोग्गा GramOne & सेवा सिंधु',
    navHome: 'होम & मानचित्र',
    navBook: 'टोकन बुक करें',
    navQueue: 'लाइव कतार',
    navSchemes: 'सरकारी योजनाएं',
    allSystems: 'सभी सिस्टम चालू हैं',
    installPwa: 'ऐप इंस्टॉल करें',
    staffLogin: 'स्टाफ लॉगिन',
    adminPanel: 'एडमिन पैनल',

    heroTitle: 'आपकी सरकार,\nआपकी उंगलियों पर',
    heroSubtitle: 'कतार छोड़ें। स्मार्ट बुकिंग करें। तेज़ सेवा पाएं।',
    heroDesc: 'शिवमोग्गा का पहला AI-संचालित नागरिक टोकन सिस्टम। GramOne & सेवा सिंधु के लिए तुरंत अपॉइंटमेंट बुक करें।',
    bookNow: 'अभी टोकन पास बुक करें',
    liveQueue: 'लाइव कतार देखें',
    tokensIssued: 'आज जारी टोकन',
    avgProcessing: 'औसत प्रसंस्करण समय',
    tatkalAccuracy: 'तत्काल सटीकता',

    bookTitle: 'अपना टोकन पास बुक करें',
    fullName: 'पूरा नाम',
    mobile: 'मोबाइल नंबर',
    age: 'उम्र',
    gender: 'लिंग',
    aadhaar: 'आधार नंबर',
    sendOtp: 'मोबाइल OTP भेजें',
    verifyOtp: 'OTP सत्यापित करें',
    next: 'आगे',
    back: 'पीछे',
    submit: 'पुष्टि करें & टोकन बुक करें',
    selectService: 'सेवा चुनें',
    selectOffice: 'कार्यालय चुनें',
    priorityPass: 'प्राथमिकता पास',
    senior: 'वरिष्ठ नागरिक 60+',
    pwd: 'दिव्यांग व्यक्ति',
    pregnant: 'गर्भवती / नई माँ',
    emergency: 'आपातकाल',
    general: 'सामान्य',

    queueTitle: 'लाइव टोकन कतार',
    nowServing: 'अभी सेवा',
    yourToken: 'आपका टोकन',
    waitingAhead: 'आपसे पहले प्रतीक्षा',
    estWait: 'अनुमानित प्रतीक्षा',

    schemesTitle: 'सरकारी योजना खोजें',
    schemesSubtitle: 'उन कल्याण योजनाओं को खोजें जिनके लिए आप पात्र हैं',
    filterAge: 'आपकी उम्र',
    filterIncome: 'वार्षिक आय (₹)',
    filterGender: 'लिंग',
    filterOccupation: 'व्यवसाय',
    applyNow: 'अभी आवेदन करें',
    eligibility: 'पात्रता',

    helpline: 'हेल्पलाइन',
    copyright: '© 2026 निम्म सेवा — शिवमोग्गा स्मार्ट शासन। सर्वाधिकार सुरक्षित।',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'kn',
  setLang: () => {},
  t: translations.kn,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('nimmaseva-lang') as Language) ?? 'kn';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('nimmaseva-lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
