import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../../lib/formSchema';

interface Step6Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function Step6Social({ register, errors }: Step6Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📱</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Let's Connect on Social!
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        Share your social media profiles so potential matches can get to know the real you better! (Optional but highly recommended)
      </p>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
        <p className="text-sm text-gray-700">💡 <strong>Why?</strong> Real Instagram & LinkedIn profiles help us verify authenticity and let matches see your personality!</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          📸 Instagram Handle (Optional)
        </label>
        <input
          type="text"
          {...register('instagramHandle')}
          placeholder="@your_username"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          💼 LinkedIn Profile URL (Optional)
        </label>
        <input
          type="url"
          {...register('linkedInUrl')}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        {errors.linkedInUrl && <p className="text-red-500 text-sm mt-1">❌ {errors.linkedInUrl.message}</p>}
      </div>
    </div>
  );
}

