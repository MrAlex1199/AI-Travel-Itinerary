/**
 * Thai language translations
 */

export const th = {
  // Common UI elements
  common: {
    loading: 'กำลังโหลด...',
    submit: 'ส่ง',
    cancel: 'ยกเลิก',
    save: 'บันทึก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    close: 'ปิด',
    back: 'กลับ',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    search: 'ค้นหา',
    filter: 'กรอง',
    clear: 'ล้าง',
    confirm: 'ยืนยัน',
    error: 'เกิดข้อผิดพลาด',
    success: 'สำเร็จ',
    warning: 'คำเตือน',
    info: 'ข้อมูล',
  },

  // Navigation
  navigation: {
    home: 'หน้าแรก',
    generateItinerary: 'สร้างแผนการเดินทาง',
    history: 'ประวัติ',
    logout: 'ออกจากระบบ',
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    profile: 'โปรไฟล์',
  },

  // Authentication
  auth: {
    // Login
    loginTitle: 'เข้าสู่ระบบ',
    loginSubtitle: 'เข้าสู่ระบบเพื่อเข้าถึงแผนการเดินทางของคุณ',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    loginButton: 'เข้าสู่ระบบ',
    noAccount: 'ยังไม่มีบัญชี?',
    createAccount: 'สร้างบัญชี',
    
    // Register
    registerTitle: 'สมัครสมาชิก',
    registerSubtitle: 'สร้างบัญชีเพื่อเริ่มวางแผนการเดินทาง',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    registerButton: 'สมัครสมาชิก',
    haveAccount: 'มีบัญชีอยู่แล้ว?',
    
    // Messages
    loginSuccess: 'เข้าสู่ระบบสำเร็จ',
    logoutSuccess: 'ออกจากระบบสำเร็จ',
    registerSuccess: 'สมัครสมาชิกสำเร็จ',
    invalidCredentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    emailAlreadyExists: 'อีเมลนี้ถูกใช้งานแล้ว',
    sessionExpired: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
    weakPassword: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
    registrationFailed: 'การสมัครสมาชิกล้มเหลว กรุณาลองอีกครั้ง',
    loginFailed: 'การเข้าสู่ระบบล้มเหลว กรุณาลองอีกครั้ง',
    logoutFailed: 'การออกจากระบบล้มเหลว กรุณาลองอีกครั้ง',
    authenticationRequired: 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้',
    unauthorized: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
  },

  // Destination form
  destinationForm: {
    title: 'สร้างแผนการเดินทางของคุณ',
    subtitle: 'กรอกข้อมูลเพื่อสร้างแผนการเดินทางที่เหมาะกับคุณ',
    destination: 'จุดหมายปลายทาง',
    destinationPlaceholder: 'เช่น กรุงเทพฯ, เชียงใหม่, ภูเก็ต',
    duration: 'จำนวนวัน',
    durationPlaceholder: 'จำนวนวันที่เดินทาง',
    generateButton: 'สร้างแผนการเดินทาง',
    generating: 'กำลังสร้างแผนการเดินทาง...',
  },

  // Validation errors
  validation: {
    required: 'กรุณากรอกข้อมูลนี้',
    invalidEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
    invalidPassword: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    destinationRequired: 'กรุณากรอกจุดหมายปลายทาง',
    durationRequired: 'กรุณากรอกจำนวนวัน',
    durationMinimum: 'กรุณากรอกจำนวนวันที่ถูกต้อง (ตั้งแต่ 1 วันขึ้นไป)',
    durationInvalid: 'จำนวนวันต้องเป็นตัวเลขเท่านั้น',
    passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    passwordsDoNotMatch: 'รหัสผ่านไม่ตรงกัน',
  },

  // Itinerary display
  itinerary: {
    title: 'แผนการเดินทาง',
    day: 'วันที่',
    activities: 'กิจกรรม',
    recommendations: 'คำแนะนำ',
    placesOfInterest: 'สถานที่น่าสนใจ',
    restaurants: 'ร้านอาหาร',
    experiences: 'ประสบการณ์',
    time: 'เวลา',
    location: 'สถานที่',
    description: 'รายละเอียด',
    generatedAt: 'สร้างเมื่อ',
    duration: 'ระยะเวลา',
    days: 'วัน',
    noActivities: 'ไม่มีกิจกรรม',
    noRecommendations: 'ไม่มีคำแนะนำ',
  },

  // History
  history: {
    title: 'ประวัติแผนการเดินทาง',
    subtitle: 'ดูแผนการเดินทางที่คุณสร้างไว้',
    empty: 'คุณยังไม่มีแผนการเดินทางที่บันทึกไว้',
    emptySubtitle: 'เริ่มสร้างแผนการเดินทางแรกของคุณ',
    viewDetails: 'ดูรายละเอียด',
    destination: 'จุดหมายปลายทาง',
    duration: 'ระยะเวลา',
    createdAt: 'สร้างเมื่อ',
    loadingHistory: 'กำลังโหลดประวัติ...',
    loadingFailed: 'โหลดประวัติล้มเหลว',
  },

  // Error messages
  errors: {
    generic: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    networkError: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ',
    serverError: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองอีกครั้งในภายหลัง',
    notFound: 'ไม่พบข้อมูลที่ต้องการ',
    timeout: 'หมดเวลาในการประมวลผล กรุณาลองอีกครั้ง',
    tryAgain: 'ลองอีกครั้ง',
    
    // AI generation errors
    aiGenerationFailed: 'การสร้างแผนการเดินทางล้มเหลว กรุณาลองอีกครั้ง',
    aiTimeout: 'การสร้างแผนการเดินทางใช้เวลานานเกินไป กรุณาลองอีกครั้ง',
    aiRateLimit: 'มีการใช้งานมากเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง',
    aiInvalidResponse: 'ได้รับข้อมูลที่ไม่ถูกต้องจาก AI กรุณาลองอีกครั้ง',
    
    // Database errors
    databaseError: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
    saveFailed: 'บันทึกข้อมูลล้มเหลว',
    loadFailed: 'โหลดข้อมูลล้มเหลว',
  },

  // Success messages
  success: {
    itineraryGenerated: 'สร้างแผนการเดินทางสำเร็จ',
    itinerarySaved: 'บันทึกแผนการเดินทางสำเร็จ',
  },
} as const;

export type TranslationKey = keyof typeof th;
