import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../../lib/formSchema';

interface Step5Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function Step5MatchPrefs({ register, errors }: Step5Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💕</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
          What's Your Match?
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-4">Help us find your perfect match by telling us what you're looking for.</p>
      <p className="text-xs text-gray-500 mb-4">* Required fields</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Min Age Preference *
          </label>
          <input
            type="number"
            {...register('agePreferenceMin', { valueAsNumber: true })}
            min={18}
            placeholder="18"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
          />
          {errors.agePreferenceMin && <p className="text-red-500 text-sm mt-1">❌ {errors.agePreferenceMin.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Max Age Preference *
          </label>
          <input
            type="number"
            {...register('agePreferenceMax', { valueAsNumber: true })}
            min={18}
            placeholder="45"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
          />
          {errors.agePreferenceMax && <p className="text-red-500 text-sm mt-1">❌ {errors.agePreferenceMax.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Other Preferences <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <textarea
          {...register('otherPreferences')}
          rows={5}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all bg-gray-50 hover:bg-white resize-none text-gray-900 placeholder-gray-500"
          placeholder="Be specific about any other preferences you have for your match (e.g., religious observance, lifestyle, values, etc.). Our humans will review this prior to making a match."
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Our human matchmakers will carefully review your preferences before making any matches.
        </p>
        {errors.otherPreferences && <p className="text-red-500 text-sm mt-1">❌ {errors.otherPreferences.message}</p>}
      </div>
    </div>
  );
}
