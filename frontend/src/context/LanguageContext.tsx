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
  navLogin: string;
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
  footerEmergency: string;
  copyright: string;

  // Footer & Compliance Section
  aboutBrandingTitle: string;
  portalDescription: string;
  quickLinksTitle: string;
  navBookToken: string;
  navTrackQueue: string;
  navSchemeSearch: string;
  navMyBookings: string;
  navGrievance: string;
  policiesTitle: string;
  termsOfService: string;
  privacyPolicy: string;
  accessibilityStatement: string;
  hyperlinkingPolicy: string;
  sitemap: string;
  contactSupportTitle: string;
  districtAddress: string;
  supportEmail: string;
  supportPhone: string;
  officeHoursTitle: string;
  officeHoursSchedule: string;
  lunchBreakSchedule: string;
  closedHolidays: string;
  viewOfficeMap: string;
  installAppLabel: string;
  legalReviewFlagText: string;
  copyrightGovt: string;

  // Server Outage Alert Modal
  serverDownTitle: string;
  serviceMaintenanceTitle: string;
  serverDownNoticeMsg: string;
  notifyMeWhenBackOnline: string;
  chooseAlternativeService: string;
  serviceStatusActive: string;
  serviceStatusDown: string;
  serviceStatusMaintenance: string;
  alertRegisteredMsg: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Nimma Seva',
    appSubtitle: 'Shivamogga GramOne & Seva Sindhu',
    navHome: 'Home & Map',
    navBook: 'Book Token',
    navQueue: 'Live Queue',
    navSchemes: 'Govt Schemes',
    navLogin: 'Citizen Login',
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
    footerEmergency: 'Emergency',
    copyright: '© 2026 Nimma Seva — Shivamogga Smart Governance. All rights reserved.',

    aboutBrandingTitle: 'About Portal',
    portalDescription: 'Official Progressive Web Application for GramOne and Seva Sindhu centers across Shivamogga District, Government of Karnataka.',
    quickLinksTitle: 'Quick Links',
    navBookToken: 'Book a Token',
    navTrackQueue: 'Track Queue',
    navSchemeSearch: 'Scheme Search',
    navMyBookings: 'My Bookings',
    navGrievance: 'Grievance Redressal',
    policiesTitle: 'Policies & Compliance',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    accessibilityStatement: 'Accessibility Statement',
    hyperlinkingPolicy: 'Hyperlinking Policy',
    sitemap: 'Sitemap',
    contactSupportTitle: 'Contact & Support',
    districtAddress: 'Shivamogga District Administration, Mini Vidhana Soudha, Shivamogga, Karnataka - 577201',
    supportEmail: 'support@shivamogga.gov.in',
    supportPhone: '08182-271234 (Toll Free)',
    officeHoursTitle: 'Office Hours',
    officeHoursSchedule: 'Mon - Sat: 09:00 AM - 05:00 PM',
    lunchBreakSchedule: 'Lunch Break: 12:00 PM - 01:00 PM',
    closedHolidays: 'Sundays & Govt Holidays Closed',
    viewOfficeMap: 'View Office Map',
    installAppLabel: 'Install App',
    legalReviewFlagText: 'Note: Needs legal review before production launch.',
    copyrightGovt: 'Government of Karnataka • Shivamogga District Administration',

    serverDownTitle: 'Service Server Currently Down',
    serviceMaintenanceTitle: 'Service Under Scheduled Maintenance',
    serverDownNoticeMsg: 'The state data center server for this service is temporarily offline or undergoing maintenance. Online token booking is paused to prevent token loss.',
    notifyMeWhenBackOnline: 'Notify Me When Server Is Back Online',
    chooseAlternativeService: 'Choose Another Active Service',
    serviceStatusActive: 'Active',
    serviceStatusDown: 'Server Down',
    serviceStatusMaintenance: 'Maintenance',
    alertRegisteredMsg: 'Alert Registered! We will notify your mobile when the server returns online.',
  },

  kn: {
    appName: 'ನಿಮ್ಮ ಸೇವಾ',
    appSubtitle: 'ಶಿವಮೊಗ್ಗ GramOne & ಸೇವಾ ಸಿಂಧು',
    navHome: 'ಮುಖಪುಟ & ನಕ್ಷೆ',
    navBook: 'ಟೋಕನ್ ಬುಕ್ ಮಾಡಿ',
    navQueue: 'ನೇರ ಸರದಿ',
    navSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆ',
    navLogin: 'ನಾಗರಿಕ ಲಾಗಿನ್',
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
    footerEmergency: 'ತುರ್ತು',
    copyright: '© 2026 ನಿಮ್ಮ ಸೇವಾ — ಶಿವಮೊಗ್ಗ ಸ್ಮಾರ್ಟ್ ಆಡಳಿತ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',

    aboutBrandingTitle: 'ಪೋರ್ಟಲ್ ಬಗ್ಗೆ',
    portalDescription: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆಯ ಗ್ರಾಮ್‌ಒನ್ ಮತ್ತು ಸೇವಾ ಸಿಂಧು ಕೇಂದ್ರಗಳ ಅಧಿಕೃತ ಪ್ರೋಗ್ರೆಸಿವ್ ವೆಬ್ ಅಪ್ಲಿಕೇಶನ್.',
    quickLinksTitle: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    navBookToken: 'ಟೋಕನ್ ಬುಕ್ ಮಾಡಿ',
    navTrackQueue: 'ಸರದಿ ವೀಕ್ಷಿಸಿ',
    navSchemeSearch: 'ಯೋಜನೆ ಹುಡುಕಾಟ',
    navMyBookings: 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು',
    navGrievance: 'ಕುಂದುಕೊರತೆ ಪರಿಹಾರ',
    policiesTitle: 'ನೀತಿಗಳು & ನಿಯಮಗಳು',
    termsOfService: 'ಸೇವೆಯ ನಿಯಮಗಳು',
    privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    accessibilityStatement: 'ಪ್ರವೇಶಿಸುವಿಕೆ ಹೇಳಿಕೆ',
    hyperlinkingPolicy: 'ಹೈಪರ್‌ಲಿಂಕಿಂಗ್ ನೀತಿ',
    sitemap: 'ಸೈಟ್‌ಮ್ಯಾಪ್',
    contactSupportTitle: 'ಸಂಪರ್ಕ & ಬೆಂಬಲ',
    districtAddress: 'ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲಾಡಳಿತ, ಮಿನಿ ವಿಧಾನ ಸೌಧ, ಶಿವಮೊಗ್ಗ, ಕರ್ನಾಟಕ - 577201',
    supportEmail: 'support@shivamogga.gov.in',
    supportPhone: '08182-271234 (ಉಚಿತ ಸಹಾಯವಾಣಿ)',
    officeHoursTitle: 'ಕಚೇರಿ ಸಮಯ',
    officeHoursSchedule: 'ಸೋಮ - ಶನಿ: ಬೆಳಿಗ್ಗೆ 09:00 - ಸಂಜೆ 05:00',
    lunchBreakSchedule: 'ಊಟದ ವಿರಾಮ: ಮಧ್ಯಾಹ್ನ 12:00 - 01:00',
    closedHolidays: 'ಭಾನುವಾರ & ಸರ್ಕಾರಿ ರಜಾದಿನಗಳಲ್ಲಿ ಮುಚ್ಚಿರುತ್ತದೆ',
    viewOfficeMap: 'ಕಚೇರಿ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ',
    installAppLabel: 'ಅಪ್ಲಿಕೇಶನ್ ಸ್ಥಾಪಿಸಿ',
    legalReviewFlagText: 'ಸೂಚನೆ: ಉತ್ಪಾದನೆಗೆ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಕಾನೂನು ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ.',
    copyrightGovt: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲಾಡಳಿತ',

    serverDownTitle: 'ಸೇವೆ ಸರ್ವರ್ ತಾತ್ಕಾಲಿಕವಾಗಿ ಸ್ಥಗಿತಗೊಂಡಿದೆ',
    serviceMaintenanceTitle: 'ಸೇವೆ ನಿಗದಿತ ನಿರ್ವಹಣೆಯಲ್ಲಿದೆ',
    serverDownNoticeMsg: 'ಈ ಸೇವೆಗಾಗಿ ರಾಜ್ಯ ಡೇಟಾ ಸೆಂಟರ್ ಸರ್ವರ್ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಟೋಕನ್ ನಷ್ಟವನ್ನು ತಡೆಯಲು ಆನ್‌ಲೈನ್ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸುವಿಕೆಯನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿಲ್ಲಿಸಲಾಗಿದೆ.',
    notifyMeWhenBackOnline: 'ಸರ್ವರ್ ಆನ್‌ಲೈನ್‌ಗೆ ಬಂದಾಗ ನನಗೆ ತಿಳಿಸಿ',
    chooseAlternativeService: 'ಮತ್ತೊಂದು ಸಕ್ರಿಯ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    serviceStatusActive: 'ಸಕ್ರಿಯ',
    serviceStatusDown: 'ಸರ್ವರ್ ಡೌನ್',
    serviceStatusMaintenance: 'ನಿರ್ವಹಣೆಯಲ್ಲಿದೆ',
    alertRegisteredMsg: 'ಎಚ್ಚರಿಕೆಯನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ! ಸರ್ವರ್ ಆನ್‌ಲೈನ್‌ಗೆ ಬಂದಾಗ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ತಿಳಿಸುತ್ತೇವೆ.',
  },

  hi: {
    appName: 'निम्म सेवा',
    appSubtitle: 'शिवमोग्गा GramOne & सेवा सिंधु',
    navHome: 'होम & मानचित्र',
    navBook: 'टोकन बुक करें',
    navQueue: 'लाइव कतार',
    navSchemes: 'सरकारी योजनाएं',
    navLogin: 'नागरिक लॉगिन',
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
    footerEmergency: 'आपातकाल',
    copyright: '© 2026 निम्म सेवा — शिवमोग्गा स्मार्ट शासन। सर्वाधिकार सुरक्षित।',

    aboutBrandingTitle: 'पोर्टल के बारे में',
    portalDescription: 'कर्नाटक सरकार के शिवमोग्गा जिले के ग्रामवन और सेवा सिंधु केंद्रों के लिए आधिकारिक प्रोग्रेसिव वेब एप्लीकेशन।',
    quickLinksTitle: 'त्वरित लिंक',
    navBookToken: 'टोकन बुक करें',
    navTrackQueue: 'कतार ट्रैक करें',
    navSchemeSearch: 'योजना खोजें',
    navMyBookings: 'मेरी बुकिंग्स',
    navGrievance: 'शिकायत निवारण',
    policiesTitle: 'नीतियां और अनुपालन',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    accessibilityStatement: 'सुलभता विवरण',
    hyperlinkingPolicy: 'हाइपरलिंकिंग नीति',
    sitemap: 'साइटमैप',
    contactSupportTitle: 'संपर्क और सहायता',
    districtAddress: 'शिवमोग्गा जिला प्रशासन, मिनी विधान सौध, शिवमोग्गा, कर्नाटक - 577201',
    supportEmail: 'support@shivamogga.gov.in',
    supportPhone: '08182-271234 (टोल फ्री)',
    officeHoursTitle: 'कार्यालय का समय',
    officeHoursSchedule: 'सोम - शनि: सुबह 09:00 - शाम 05:00',
    lunchBreakSchedule: 'भोजन अवकाश: दोपहर 12:00 - 01:00',
    closedHolidays: 'रविवार और सरकारी छुट्टियों में बंद',
    viewOfficeMap: 'कार्यालय मानचित्र देखें',
    installAppLabel: 'ऐप इंस्टॉल करें',
    legalReviewFlagText: 'नोट: लॉन्च से पहले कानूनी समीक्षा आवश्यक है।',
    copyrightGovt: 'कर्नाटक सरकार • शिवमोग्गा जिला प्रशासन',

    serverDownTitle: 'सेवा सर्वर वर्तमान में डाउन है',
    serviceMaintenanceTitle: 'सेवा निर्धारित रखरखाव के तहत है',
    serverDownNoticeMsg: 'इस सेवा के लिए राज्य डेटा सेंटर सर्वर अस्थायी रूप से ऑफ़लाइन है। टोकन क्षति को रोकने के लिए ऑनलाइन टोकन बुकिंग रोक दी गई है।',
    notifyMeWhenBackOnline: 'सर्वर ऑनलाइन आने पर मुझे सूचित करें',
    chooseAlternativeService: 'अन्य सक्रिय सेवा चुनें',
    serviceStatusActive: 'सक्रिय',
    serviceStatusDown: 'सर्वर डाउन',
    serviceStatusMaintenance: 'रखरखाव में',
    alertRegisteredMsg: 'अलर्ट पंजीकृत! सर्वर ऑनलाइन आने पर हम आपको सूचित करेंगे।',
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
