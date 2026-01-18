import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../../lib/formSchema';

interface Step4Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function Step4Lifestyle({ register, errors }: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌟</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          What Makes You You?
        </h2>
      </div>
      <p className="text-gray-600 text-sm">Tell us about your personality, passions, and what matters most to you.</p>
      
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Your Interests & Hobbies * (minimum 10 characters)
        </label>
        <textarea
          {...register('interests')}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all bg-gray-50 hover:bg-white resize-none text-gray-900 placeholder-gray-500"
          placeholder="What do you love to do? Travel, hiking, cooking, reading...?"
        />
        {errors.interests && <p className="text-red-500 text-sm mt-1">❌ {errors.interests.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Your Values & Beliefs * (minimum 10 characters)
        </label>
        <textarea
          {...register('values')}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all bg-gray-50 hover:bg-white resize-none text-gray-900 placeholder-gray-500"
          placeholder="What values are important to you? Family, community, spirituality...?"
        />
        {errors.values && <p className="text-red-500 text-sm mt-1">❌ {errors.values.message}</p>}
      </div>
    </div>
  );
}

