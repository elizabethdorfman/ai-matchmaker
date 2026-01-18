import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData, RELIGIOUS_OBSERVANCE } from '../../lib/formSchema';

interface Step2Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  watchReligiousObservance?: string;
}

export default function Step2Religious({ register, errors, watchReligiousObservance }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">✡️</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Your Faith & Values
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-4">Understanding your religious background helps us find truly compatible matches.</p>
      <p className="text-xs text-gray-500 mb-4">* Required fields</p>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Religious Observance Level *
        </label>
        <select
          {...register('religiousObservance')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all bg-gray-50 hover:bg-white cursor-pointer text-gray-900"
        >
          <option value="">Select your observance level</option>
          {RELIGIOUS_OBSERVANCE.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.religiousObservance && <p className="text-red-500 text-sm mt-1">❌ {errors.religiousObservance.message}</p>}
      </div>

      {watchReligiousObservance === 'Other' && (
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Please specify your religious observance <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            {...register('religiousObservanceOther')}
            placeholder="Enter your religious observance"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
          />
          {errors.religiousObservanceOther && <p className="text-red-500 text-sm mt-1">❌ {errors.religiousObservanceOther.message}</p>}
        </div>
      )}
    </div>
  );
}
