"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ArrowLeft, Save, Send } from "lucide-react";
import ParticleBackground from "../../../../components/ui/ParticleBackground";
import { getInterviewerBookings } from "@/services/bookingService";
import { useInterviewerBookings } from "@/hooks/useInterviewerBookings";
import { useSubmitFeedback } from "@/hooks/useSubmitFeedback";
import { useFeedbackById } from "@/hooks/useFeedbackById";
import { useCompleteBooking } from "@/hooks/useCompleteBooking";
import { toast } from "sonner";

const Feedback = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'create'; // 'create' or 'view'
  const feedbackId = (params?.id as string) || ""; // in create mode, this is bookingId
  const bookingId = useMemo(() => (mode === 'create' ? feedbackId : ''), [mode, feedbackId]);
  const { feedback, loading: feedbackLoading } = useFeedbackById(mode === 'view' ? feedbackId : null);
  const [overallRating, setOverallRating] = useState(0);
  const [technicalRating, setTechnicalRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [problemSolvingRating, setProblemSolvingRating] = useState(0);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [candidateName, setCandidateName] = useState<string>("");
  const [candidateEmail, setCandidateEmail] = useState<string>("");
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
  const [sessionDate, setSessionDate] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { submitFeedback, loading: submitLoading } = useSubmitFeedback();

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };
  const { bookings } = useInterviewerBookings();
  const { completeSession } = useCompleteBooking();

  useEffect(() => {
    if (mode !== 'create' || !bookingId) return;
    const current = bookings.find(b => b.id === bookingId);
    if (current) {
      setCandidateName(current.userName);
      setCandidateEmail(current.userEmail);
      setSessionDate(new Date(current.createdAt).toLocaleDateString());
    }
  }, [mode, bookingId, bookings]);

  const RatingStars = ({
    rating,
    setRating,
    label,
    field,
    error,
  }: {
    rating: number;
    setRating: (rating: number) => void;
    label: string;
    field: string;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-white">{label}</Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => {
              setRating(star);
              clearError(field);
            }}
            className="transition-colors hover:scale-110 transform duration-200"
            disabled={mode === 'view'}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-400 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );

  useEffect(() => {
    if (mode !== 'view' || !feedback) return;
    setOverallRating(feedback.overallRating || 0);
    setTechnicalRating(feedback.technicalRating || 0);
    setCommunicationRating(feedback.communicationRating || 0);
    setProblemSolvingRating(feedback.problemSolvingRating || 0);
    setGeneralFeedback(feedback.overallFeedback || "");
    setStrengths(feedback.strengths || "");
    setImprovements(feedback.improvements || "");

    const b = bookings.find(bk => bk.id === feedback.bookingId);
    if (b) {
      setCandidateName(b.userName);
      setCandidateEmail(b.userEmail);
      setSessionDate(new Date(b.date).toLocaleDateString());
    }
  }, [mode, feedback, bookings]);


  const validationRules = [
    { field: 'overallFeedback', value: generalFeedback, label: 'General Comments' },
    { field: 'strengths', value: strengths, label: 'Key Strengths' },
    { field: 'improvements', value: improvements, label: 'Areas for Improvement' },
  ];

  const ratingValidations = [
    { field: 'overallRating', value: overallRating, label: 'Overall Performance' },
    { field: 'technicalRating', value: technicalRating, label: 'Technical Skills' },
    { field: 'communicationRating', value: communicationRating, label: 'Communication' },
    { field: 'problemSolvingRating', value: problemSolvingRating, label: 'Problem Solving' },
  ];

  const handleSubmit = async () => {
    if (mode !== 'create' || submitting) return;

    const newErrors: Record<string, string> = {};

    ratingValidations.forEach(({ field, value, label }) => {
      if (value <= 0) {
        newErrors[field] = `${label} rating is required`;
      } else {
        clearError(field);
      }
    });

    validationRules.forEach(({ field, value, label }) => {
      const trimmed = value.trim();
      if (!trimmed) {
        newErrors[field] = `${label} is required`;
        return;
      }
      if (trimmed.length < 20) {
        newErrors[field] = `${label} must be at least 20 characters`;
        return;
      }
      if (/^\d+$/.test(trimmed)) {
        newErrors[field] = `${label} cannot contain only numbers`;
        return;
      }
      if (/^[^a-zA-Z]+$/.test(trimmed)) {
        newErrors[field] = `${label} must include at least one letter`;
        return;
      }
      if (/[^a-zA-Z\s0-9]/.test(trimmed)) {
        newErrors[field] = `${label} cannot contain special characters`;
        return;
      }
      clearError(field);
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      toast.error(newErrors[firstErrorKey]);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await submitFeedback({
        bookingId,
        overallRating,
        technicalRating,
        communicationRating,
        problemSolvingRating,
        overallFeedback: generalFeedback.trim(),
        strengths: strengths.trim(),
        improvements: improvements.trim(),
      });
      if (bookingId) {
        await completeSession({ bookingId });
      }
      router.push('/interviewer/feedback');
    } catch (e) {
      console.error('Failed to submit feedback', e);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
      <ParticleBackground />
      
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" asChild className="glass-effect border-purple-400/30 text-white hover:bg-purple-500/20">
            <Link href="/interviewer/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">{mode === 'view' ? 'Feedback Details' : 'Interview Feedback'}</h1>
          <p className="text-purple-300">{mode === 'view' ? 'Review submitted feedback' : "Provide detailed feedback for the completed interview session"}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Candidate Summary */}
          <div className="lg:col-span-1">
            <div className="card-futuristic hover-lift animate-scale-in sticky top-6 rounded-2xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient mb-4">Session Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 glow-button">
                    <AvatarFallback>{(candidateName || 'U').slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                     <h3 className="font-semibold text-white glow-text">{candidateName || 'Unknown User'}</h3>
                      <p className="text-sm text-purple-300">{candidateEmail}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Date:</span>
                      <span className="text-white">{sessionDate || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Duration:</span>
                      <span className="text-white">1 hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Session/Booking ID:</span>
                      <span className="text-white">#{mode === 'create' ? bookingId : feedbackId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ratings */}
            <div className="card-futuristic hover-lift animate-fade-in rounded-2xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient mb-2">Performance Ratings</h3>
                <p className="text-purple-300 mb-6">Rate the candidate's performance in different areas</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <RatingStars 
                    rating={overallRating} 
                    setRating={setOverallRating} 
                    label="Overall Performance" 
                    field="overallRating"
                    error={errors.overallRating}
                  />
                  <RatingStars 
                    rating={technicalRating} 
                    setRating={setTechnicalRating} 
                    label="Technical Skills" 
                    field="technicalRating"
                    error={errors.technicalRating}
                  />
                  <RatingStars 
                    rating={communicationRating} 
                    setRating={setCommunicationRating} 
                    label="Communication" 
                    field="communicationRating"
                    error={errors.communicationRating}
                  />
                  <RatingStars 
                    rating={problemSolvingRating} 
                    setRating={setProblemSolvingRating} 
                    label="Problem Solving" 
                    field="problemSolvingRating"
                    error={errors.problemSolvingRating}
                  />
                </div>
              </div>
            </div>

            {/* Written Feedback */}
            <div className="card-futuristic hover-lift animate-fade-in rounded-2xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient mb-2">Detailed Feedback</h3>
                <p className="text-purple-300 mb-6">Provide comprehensive written feedback</p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="general" className="text-white">General Comments</Label>
                    <Textarea
                      id="general"
                      placeholder="Provide overall feedback about the candidate's performance during the interview..."
                      value={generalFeedback}
                      onChange={(e) => setGeneralFeedback(e.target.value)}
                      rows={4}
                      disabled={mode === 'view'}
                      className="resize-none glass-effect border-purple-400/30 text-white placeholder:text-purple-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strengths" className="text-white">Key Strengths</Label>
                    <Textarea
                      id="strengths"
                      placeholder="What did the candidate do well?"
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      rows={3}
                      disabled={mode === 'view'}
                      className="resize-none glass-effect border-purple-400/30 text-white placeholder:text-purple-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="improvements" className="text-white">Areas for Improvement</Label>
                    <Textarea
                      id="improvements"
                      placeholder="What areas could the candidate work on? "
                      value={improvements}
                      onChange={(e) => setImprovements(e.target.value)}
                      rows={3}
                      disabled={mode === 'view'}
                      className="resize-none glass-effect border-purple-400/30 text-white placeholder:text-purple-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {mode === 'create' && (
              <div className="flex justify-end space-x-4">
                <Button onClick={handleSubmit} disabled={submitting} className="glow-button animate-pulse-glow">
                 <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;