import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../../lib/formSchema';

interface Step8Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  submitError: string | null;
}

export default function Step8Agreements({ register, errors, submitError }: Step8Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🤝</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
          You're Almost There!
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        Just a few final agreements and you'll be part of our community! 💕
      </p>

      <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6 border border-blue-200 space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register('privacyAccepted')}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
          <label className="text-sm text-gray-700 flex-1 cursor-pointer">
            I accept the <a href="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a> *
            <p className="text-xs text-gray-500 mt-1">Your information is safe with us and will never be shared without your consent.</p>
          </label>
        </div>
        {errors.privacyAccepted && <p className="text-red-500 text-sm ml-8">❌ {errors.privacyAccepted.message}</p>}

        <div className="border-t border-blue-200 pt-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('termsAccepted')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-pink-600 cursor-pointer"
            />
            <label className="text-sm text-gray-700 flex-1 cursor-pointer">
              I accept the <a href="/terms" className="text-pink-600 font-semibold hover:underline">Terms of Service</a> *
              <p className="text-xs text-gray-500 mt-1">You agree to our community guidelines and respectful behavior standards.</p>
            </label>
          </div>
          {errors.termsAccepted && <p className="text-red-500 text-sm ml-8">❌ {errors.termsAccepted.message}</p>}
        </div>

        <div className="border-t border-blue-200 pt-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('findersFeeAccepted')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <label className="text-sm text-gray-700 flex-1 cursor-pointer">
              I understand and agree: if we help you find your match and you get married, a <strong className="text-blue-600">$500 finder's fee</strong> supports our work. *
              <p className="text-xs text-gray-500 mt-1">
                This is our trust-based model. We trust you. No fee if you don't get married.
              </p>
            </label>
          </div>
          {errors.findersFeeAccepted && <p className="text-red-500 text-sm ml-8">❌ {errors.findersFeeAccepted.message}</p>}
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-semibold mb-1">❌ Oops! Something went wrong:</p>
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">✅ <strong>Ready to find your match?</strong> We're excited to have you in our community!</p>
      </div>
    </div>
  );
}

