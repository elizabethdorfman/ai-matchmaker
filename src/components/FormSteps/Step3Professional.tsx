import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData, EDUCATION_LEVELS, INDUSTRIES } from '../../lib/formSchema';

interface Step3Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function Step3Professional({ register, errors }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💼</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Career & Education
        </h2>
      </div>
      <p className="text-gray-600 text-sm">Tell us about your professional background and goals.</p>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Education Level *
        </label>
        <select
          {...register('education')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white cursor-pointer text-gray-900"
        >
          <option value="">Select your education level</option>
          {EDUCATION_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.education && <p className="text-red-500 text-sm mt-1">❌ {errors.education.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          University/School (Optional)
        </label>
        <input
          type="text"
          {...register('university')}
          placeholder="e.g., University of Toronto"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Role/Job Title *
        </label>
        <input
          type="text"
          {...register('role')}
          placeholder="e.g., Software Engineer"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        {errors.role && <p className="text-red-500 text-sm mt-1">❌ {errors.role.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Company *
        </label>
        <input
          type="text"
          {...register('company')}
          placeholder="Your company name"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        {errors.company && <p className="text-red-500 text-sm mt-1">❌ {errors.company.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Industry *
        </label>
        <select
          {...register('industry')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-gray-50 hover:bg-white cursor-pointer text-gray-900"
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        {errors.industry && <p className="text-red-500 text-sm mt-1">❌ {errors.industry.message}</p>}
      </div>
    </div>
  );
}

