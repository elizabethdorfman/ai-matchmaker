import { ChangeEvent } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../../lib/formSchema';

interface FileChangeHandler {
  (file: File | null, type: 'headshot' | 'fullbody' | 'video', setFile: (file: File | null) => void, setPreview: (preview: string | null) => void): void;
}

interface Step7Props {
  headshotPreview: string | null;
  fullBodyPreview: string | null;
  videoPreview: string | null;
  headshotFile: File | null;
  fullBodyFile: File | null;
  videoFile: File | null;
  onFileChange: FileChangeHandler;
  setHeadshotFile: (file: File | null) => void;
  setFullBodyFile: (file: File | null) => void;
  setVideoFile: (file: File | null) => void;
  setHeadshotPreview: (preview: string | null) => void;
  setFullBodyPreview: (preview: string | null) => void;
  setVideoPreview: (preview: string | null) => void;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function Step7Photos({
  headshotPreview,
  fullBodyPreview,
  videoPreview,
  headshotFile,
  fullBodyFile,
  videoFile,
  onFileChange,
  setHeadshotFile,
  setFullBodyFile,
  setVideoFile,
  setHeadshotPreview,
  setFullBodyPreview,
  setVideoPreview,
  register,
  errors,
}: Step7Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📸</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Show Us Your Best Self!
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        This is traditional matchmaking, not a dating app. Your photos help our matchmakers assess physical compatibility and make thoughtful, well-informed introductions.
      </p>
      <p className="text-xs text-gray-500 mb-6">* Required fields</p>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          How Tall Are You? * (Feet & Inches)
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              {...register('heightFeet', { valueAsNumber: true })}
              min={4}
              max={8}
              placeholder="Feet"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Feet</p>
          </div>
          <div className="flex-1">
            <input
              type="number"
              {...register('heightInches', { valueAsNumber: true })}
              min={0}
              max={11}
              placeholder="Inches"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Inches</p>
          </div>
        </div>
        {errors.heightFeet && <p className="text-red-500 text-sm mt-1">❌ {errors.heightFeet.message}</p>}
        {errors.heightInches && <p className="text-red-500 text-sm mt-1">❌ {errors.heightInches.message}</p>}
      </div>

      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
        <p className="text-sm text-gray-700">💡 <strong>Pro Tips:</strong> Use clear, recent photos with good lighting. Smile! No filters needed—authenticity is important.</p>
      </div>
      
      {/* Headshot Upload */}
      <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-6 hover:border-purple-500 transition-colors">
        <label className="block">
          <span className="text-sm font-bold text-gray-800 mb-3 block">
            📷 Photo 1: Headshot * (Max 5MB)
          </span>
          <span className="text-xs text-gray-600 mb-3 block">Clear face photo, good lighting, no filters</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange(
              e.target.files?.[0] || null,
              'headshot',
              setHeadshotFile,
              setHeadshotPreview
            )}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <span className="text-3xl mb-2 block">⬆️</span>
            <span className="text-gray-600 text-sm">Click to upload headshot or drag & drop</span>
          </div>
        </label>
        {headshotPreview && (
          <div className="mt-4">
            <p className="text-xs text-green-600 mb-2">✅ Photo uploaded</p>
            <img src={headshotPreview} alt="Headshot preview" className="max-w-xs rounded-lg shadow-md" />
          </div>
        )}
        {!headshotFile && <p className="text-red-500 text-sm mt-3 text-center">❌ Headshot photo is required</p>}
      </div>

      {/* Full Body Upload */}
      <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-6 hover:border-purple-500 transition-colors">
        <label className="block">
          <span className="text-sm font-bold text-gray-800 mb-3 block">
            👗 Photo 2: Full Body Photo * (Max 5MB)
          </span>
          <span className="text-xs text-gray-600 mb-3 block">Show off your style! Casual outfit is perfect</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange(
              e.target.files?.[0] || null,
              'fullbody',
              setFullBodyFile,
              setFullBodyPreview
            )}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <span className="text-3xl mb-2 block">⬆️</span>
            <span className="text-gray-600 text-sm">Click to upload full body photo or drag & drop</span>
          </div>
        </label>
        {fullBodyPreview && (
          <div className="mt-4">
            <p className="text-xs text-green-600 mb-2">✅ Photo uploaded</p>
            <img src={fullBodyPreview} alt="Full body preview" className="max-w-xs rounded-lg shadow-md" />
          </div>
        )}
        {!fullBodyFile && <p className="text-red-500 text-sm mt-3 text-center">❌ Full body photo is required</p>}
      </div>

      {/* Video Upload */}
      <div className="bg-white rounded-lg border-2 border-dashed border-pink-300 p-6 hover:border-pink-500 transition-colors">
        <label className="block">
          <span className="text-sm font-bold text-gray-800 mb-3 block">
            🎥 Video: Quick Intro <span className="text-gray-500 font-normal">(Optional)</span> (Max 10MB, Max 15 seconds)
          </span>
          <span className="text-xs text-gray-600 mb-3 block">Record yourself saying "Hi, I'm [Name]" and give a fun intro! Be yourself!</span>
          <input
            type="file"
            accept="video/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange(
              e.target.files?.[0] || null,
              'video',
              setVideoFile,
              setVideoPreview
            )}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
            <span className="text-3xl mb-2 block">⬆️</span>
            <span className="text-gray-600 text-sm">Click to upload video or drag & drop</span>
          </div>
        </label>
        {videoPreview && (
          <div className="mt-4">
            <p className="text-xs text-green-600 mb-2">✅ Video uploaded</p>
            <video src={videoPreview} controls className="max-w-md rounded-lg shadow-md" />
          </div>
        )}
      </div>
    </div>
  );
}

