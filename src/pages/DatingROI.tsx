import { useState } from 'react';

interface ROICalculations {
  hoursPerMonth: number;
  hourlyRate: number;
  costPerMonth: number;
  costPerYear: number;
  equivalent: string;
  matchmakerComparison: string;
}

export default function DatingROI() {
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [formData, setFormData] = useState({
    hoursPerMonth: 20,
    hourlyRate: 50,
  });
  const [calculations, setCalculations] = useState<ROICalculations | null>(null);

  const calculateROI = () => {
    const hoursPerMonth = formData.hoursPerMonth;
    const hourlyRate = formData.hourlyRate;
    const costPerMonth = hoursPerMonth * hourlyRate;
    const costPerYear = costPerMonth * 12;
    
    // Equivalent activities
    const workDays = Math.round(hoursPerMonth / 8);
    const equivalent = `That's ${workDays} full work day${workDays !== 1 ? 's' : ''} per month!`;

    // Matchmaker comparison (assume 1/10th the time)
    const matchmakerHours = hoursPerMonth / 10;
    const matchmakerCost = matchmakerHours * hourlyRate;
    const savings = costPerMonth - matchmakerCost;
    const matchmakerComparison = `With our AI matchmaker, you'd spend ${matchmakerHours.toFixed(1)} hours/month ($${Math.round(matchmakerCost)}) instead of ${hoursPerMonth} hours ($${Math.round(costPerMonth)}). That's $${Math.round(savings)}/month saved!`;

    const calc: ROICalculations = {
      hoursPerMonth,
      hourlyRate,
      costPerMonth,
      costPerYear,
      equivalent,
      matchmakerComparison,
    };

    setCalculations(calc);
    setStep('results');
  };

  if (step === 'results' && calculations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl md:text-7xl mb-4">💰</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Dating ROI
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Here's what your time spent on dating is really costing you
            </p>
          </div>

          {/* Cost Per Month - Hero Number */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-red-500 text-center">
              <div className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                ${Math.round(calculations.costPerMonth)}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Per Month on Dating
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                {calculations.equivalent}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800">{calculations.hoursPerMonth}</div>
                  <div className="text-sm text-gray-600">Hours Per Month</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800">${calculations.hourlyRate}/hr</div>
                  <div className="text-sm text-gray-600">Your Hourly Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Cost */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-yellow-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">📅 Annual Cost</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-600 mb-2">
                  ${Math.round(calculations.costPerYear)}
                </div>
                <div className="text-gray-600">That's what you spend per year on dating time</div>
                <div className="mt-4 text-sm text-gray-500">
                  ({calculations.hoursPerMonth} hours/month × ${calculations.hourlyRate}/hour × 12 months)
                </div>
              </div>
            </div>
          </div>

          {/* Matchmaker Comparison */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">⚡ Matchmaker Comparison</h3>
              <div className="bg-white rounded-lg p-6">
                <div className="text-lg text-gray-700">{calculations.matchmakerComparison}</div>
              </div>
            </div>
          </div>

          {/* Share Results */}
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <button
              onClick={() => {
                const text = `I spend ${calculations.hoursPerMonth} hours/month ($${Math.round(calculations.costPerMonth)}) on dating apps 😅 That's $${Math.round(calculations.costPerYear)}/year!`;
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard! Share on social media.');
              }}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Share your results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl md:text-7xl mb-4">💰</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dating ROI Calculator
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Calculate how much your time spent on dating (swiping + going on dates) is really costing you
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100">
            <form onSubmit={(e) => { e.preventDefault(); calculateROI(); }} className="space-y-6">
              {/* Hours Per Month */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  How many hours per month do you spend on dating? (swiping + going on dates)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="0.5"
                    value={formData.hoursPerMonth}
                    onChange={(e) => setFormData({ ...formData, hoursPerMonth: parseFloat(e.target.value) || 20 })}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    required
                  />
                  <span className="text-gray-600">hours/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Include time spent swiping, messaging, and going on dates
                </p>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  What's your hourly rate? (or what you think your time is worth)
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">$</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 50 })}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    required
                  />
                  <span className="text-gray-600">/hour</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Use your salary divided by hours worked, or what you'd charge for consulting
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Calculate My ROI
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

