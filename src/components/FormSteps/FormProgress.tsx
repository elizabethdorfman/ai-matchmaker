interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  return (
    <div className="mb-10 bg-white rounded-xl p-6 shadow-lg border border-yellow-200">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Step <span className="text-blue-600">{currentStep}</span> of <span className="text-purple-600">{totalSteps}</span>
        </span>
        <span className="text-sm font-bold text-pink-600">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <span>Getting to know you...</span>
        <span>{currentStep === totalSteps ? '🎉 Almost done!' : '✨ Keep going!'}</span>
      </div>
    </div>
  );
}

