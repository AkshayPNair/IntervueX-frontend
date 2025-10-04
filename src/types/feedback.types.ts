export interface SubmitFeedbackData {
    bookingId: string;
    overallRating: number;
    technicalRating: number;
    communicationRating: number;
    problemSolvingRating: number;
    overallFeedback?: string;
    strengths?: string;
    improvements?: string;
}

export interface FeedbackResponseData {
  id: string;
  bookingId: string;
  interviewerId: string;
  userId: string;
  overallRating: number;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  overallFeedback?: string;
  strengths?: string;
  improvements?: string;
  createdAt: Date;
}

export interface SubmitInterviewerRatingData {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface InterviewerRatingData {
  rating: number
  comment?: string
  id: string
  bookingId: string
  interviewerId: string
  userId: string
  createdAt: string | Date
  userName?: string
}