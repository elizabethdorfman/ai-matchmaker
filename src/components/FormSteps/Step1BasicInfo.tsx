import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData, LOCATIONS } from '../../lib/formSchema';

interface Step1Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  watchLocation?: string;
}

export default function Step1BasicInfo({ register, errors, watchLocation }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">👋</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Let's Start with the Basics
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-4">Tell us a little about yourself so we can get to know you better.</p>
      <p className="text-xs text-gray-500 mb-4">* Required fields</p>
      
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          What's Your Name? *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Your full name"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">❌ {errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          What's Your Date of Birth? *
        </label>
        <input
          type="date"
          {...register('dateOfBirth')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900"
        />
        {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">❌ {errors.dateOfBirth.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Where Are You Located? *
        </label>
        <select
          {...register('location')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white cursor-pointer text-gray-900"
        >
          <option value="">Select your location</option>
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        {errors.location && <p className="text-red-500 text-sm mt-1">❌ {errors.location.message}</p>}
      </div>

      {watchLocation === 'Other' && (
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Please specify your location <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            {...register('locationOther')}
            placeholder="Enter your city or neighborhood"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
          />
          {errors.locationOther && <p className="text-red-500 text-sm mt-1">❌ {errors.locationOther.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="your.email@example.com"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">❌ {errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          {...register('phone')}
          placeholder="+1 (555) 000-0000"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">❌ {errors.phone.message}</p>}
      </div>
    </div>
  );
}
