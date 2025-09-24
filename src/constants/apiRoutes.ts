// API Routes Constants
export const API_ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE_LOGIN: '/auth/google',
    GOOGLE_SELECT_ROLE: '/auth/google/select-role',
    LOGOUT: '/auth/logout',
  },

  // User routes
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    INTERVIEWERS: '/user/interviewers',
    INTERVIEWER_BY_ID: (id: string) => `/user/interviewers/${id}`,
    FEEDBACK: '/user/feedback',
    FEEDBACK_BY_ID: (id: string) => `/user/feedback/${id}`,
    SUBMIT_RATING: '/user/rating',
    RATING_BY_BOOKING: (bookingId: string) => `/user/rating/${bookingId}`,
    PAYMENT_HISTORY: '/user/payments/history',
    DASHBOARD: '/user/dashboard',
    CHANGE_PASSWORD: '/user/change-password',
    DELETE_ACCOUNT: '/user/delete',
    BOOKINGS: '/user/bookings',
    CREATE_BOOKING: '/user/bookings',
    CANCEL_BOOKING: '/user/bookings/cancel',
    COMPLETE_BOOKING: '/user/bookings/complete',
    RAZORPAY_CREATE_ORDER: '/user/razorpay/create-order',
    WALLET_SUMMARY: '/user/wallet/summary',
    WALLET_TRANSACTIONS: '/user/wallet/transactions',
    BOOK_SESSION: (interviewerId: string) => `/user/book-session/${interviewerId}`,
  },

  // Interviewer routes
  INTERVIEWER: {
    SUBMIT_VERIFICATION: '/interviewer/submit-verification',
    VERIFICATION_STATUS: '/interviewer/verification-status',
    PROFILE: '/interviewer/profile',
    UPDATE_PROFILE: '/interviewer/profile',
    FEEDBACK: '/interviewer/feedback',
    SUBMIT_FEEDBACK: '/interviewer/feedback',
    FEEDBACK_BY_ID: (id: string) => `/interviewer/feedback/${id}`,
    RATING_BY_BOOKING: (bookingId: string) => `/interviewer/rating/${bookingId}`,
    DASHBOARD: '/interviewer/dashboard',
    CHANGE_PASSWORD: '/interviewer/change-password',
    DELETE_ACCOUNT: '/interviewer/delete',
    BOOKINGS: '/interviewer/bookings',
    SLOT_RULES: '/interviewer/slot-rules',
    SAVE_SLOT_RULE: '/interviewer/slot-rules',
    WALLET_SUMMARY: '/interviewer/wallet/summary',
    WALLET_TRANSACTIONS: '/interviewer/wallet/transactions',
  },

  // Admin routes
  ADMIN: {
    USERS: '/admin/users',
    BLOCK_USER: (userId: string) => `/admin/block/${userId}`,
    UNBLOCK_USER: (userId: string) => `/admin/unblock/${userId}`,
    PENDING_INTERVIEWERS: '/admin/interviewer/pending',
    APPROVE_INTERVIEWER: (interviewerId: string) => `/admin/interviewer/approve/${interviewerId}`,
    REJECT_INTERVIEWER: (interviewerId: string) => `/admin/interviewer/reject/${interviewerId}`,
    DASHBOARD: '/admin/dashboard',
    SESSIONS: '/admin/sessions',
    WALLET_SUMMARY: '/admin/wallet/summary',
    WALLET_TRANSACTIONS: '/admin/wallet/transactions',
  },

  // Chat routes
  CHAT: {
    CREATE_CONVERSATION: '/chat/conversation',
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: (conversationId: string) => `/chat/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) => `/chat/${conversationId}/messages`,
    MARK_READ: (conversationId: string) => `/chat/${conversationId}/read`,
  },

  // Compiler routes
  COMPILER: {
    RUN: '/compiler/run',
    LANGUAGES: '/compiler/languages',
  },
} as const;