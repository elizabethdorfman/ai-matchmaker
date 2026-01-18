import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { SignUpFormData } from '../types/form';
import { appendToSheet } from '../lib/googleSheets';
import { uploadPhoto, uploadVideo } from '../lib/cloudinary';
import { formSchema, FormData } from '../lib/formSchema';

// Step components
import Step1BasicInfo from './FormSteps/Step1BasicInfo';
import Step2Religious from './FormSteps/Step2Religious';
import Step3Professional from './FormSteps/Step3Professional';
import Step4Lifestyle from './FormSteps/Step4Lifestyle';
import Step5MatchPrefs from './FormSteps/Step5MatchPrefs';
import Step6Social from './FormSteps/Step6Social';
import Step7Photos from './FormSteps/Step7Photos';
import Step8Agreements from './FormSteps/Step8Agreements';
import SuccessMessage from './FormSteps/SuccessMessage';

export default function SignUpFormMain() {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requestedMatchUserId, setRequestedMatchUserId] = useState<string | null>(null);

  // File states
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [fullBodyFile, setFullBodyFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [fullBodyPreview, setFullBodyPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privacyAccepted: false,
      termsAccepted: false,
      findersFeeAccepted: false,
      heightFeet: 5,
      heightInches: 8,
    },
  });

  const watchLocation = watch('location');
  const watchReligiousObservance = watch('religiousObservance');

  useEffect(() => {
    // Read requestMatch query parameter
    const requestMatch = searchParams.get('requestMatch');
    if (requestMatch) {
      setRequestedMatchUserId(requestMatch);
    }
  }, [searchParams]);

  const handleFileChange = (
    file: File | null,
    type: 'headshot' | 'fullbody' | 'video',
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (type === 'video' && file.size > 10 * 1024 * 1024) {
      alert('Video file must be less than 10MB');
      return;
    }

    if ((type === 'headshot' || type === 'fullbody') && file.size > 5 * 1024 * 1024) {
      alert('Photo file must be less than 5MB');
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    if (!headshotFile || !fullBodyFile) {
      setSubmitError('Please upload all required photos');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userId = `U${Date.now()}`;

      // Upload photos sequentially to ensure correct order and avoid any race conditions
      const headshotUrl = await uploadPhoto(headshotFile, userId, 'headshot');
      const fullBodyUrl = await uploadPhoto(fullBodyFile, userId, 'fullbody');
      const videoUrl = videoFile ? await uploadVideo(videoFile, userId) : '';

      const sheetData: SignUpFormData & { userId: string; signupDate: string; status: string; requestedMatchUserId?: string } = {
        ...data,
        userId,
        signupDate: new Date().toISOString(),
        status: 'Active',
        headshotPhotoUrl: headshotUrl,
        fullBodyPhotoUrl: fullBodyUrl,
        videoUrl: videoUrl,
        requestedMatchUserId: requestedMatchUserId || undefined,
      };

      await appendToSheet(sheetData);
      
      // Store userId for the success message
      localStorage.setItem('lastSignupUserId', userId);
      
      setSubmitSuccess(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      setSubmitError(`Failed to submit form: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return <SuccessMessage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Decorative hearts in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl opacity-10">💙</div>
        <div className="absolute top-32 right-20 text-5xl opacity-10">💛</div>
        <div className="absolute bottom-20 left-1/4 text-6xl opacity-10">💕</div>
        <div className="absolute bottom-10 right-1/3 text-4xl opacity-10">✨</div>
        <div className="absolute top-1/2 right-10 text-5xl opacity-10">💜</div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                BETA
              </span>
            </div>
            <div className="text-6xl md:text-7xl mb-4">🤖</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join the Beta
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-4">
              You're in the beta! Help us build the matchmaker we wish existed. Limited to the first 100 users.
            </p>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Currently beta testing in Toronto's Jewish community.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 border-2 border-yellow-100 space-y-12">
            {/* Request Match Banner */}
            {requestedMatchUserId && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-center text-gray-700 font-medium">
                  💕 You're requesting to match with someone! Fill out the form below to join our community and we'll connect you.
                </p>
              </div>
            )}
            
            <Step1BasicInfo register={register} errors={errors} watchLocation={watchLocation} />
            
            <div className="border-t border-gray-200 pt-8">
              <Step2Religious register={register} errors={errors} watchReligiousObservance={watchReligiousObservance} />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <Step3Professional register={register} errors={errors} />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <Step4Lifestyle register={register} errors={errors} />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <Step5MatchPrefs register={register} errors={errors} />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <Step6Social register={register} errors={errors} />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <Step7Photos
                headshotPreview={headshotPreview}
                fullBodyPreview={fullBodyPreview}
                videoPreview={videoPreview}
                headshotFile={headshotFile}
                fullBodyFile={fullBodyFile}
                videoFile={videoFile}
                onFileChange={handleFileChange}
                setHeadshotFile={setHeadshotFile}
                setFullBodyFile={setFullBodyFile}
                setVideoFile={setVideoFile}
                setHeadshotPreview={setHeadshotPreview}
                setFullBodyPreview={setFullBodyPreview}
                setVideoPreview={setVideoPreview}
                register={register}
                errors={errors}
              />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <Step8Agreements register={register} errors={errors} submitError={submitError} />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Submitting...' : '✨ Join Our Community'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
