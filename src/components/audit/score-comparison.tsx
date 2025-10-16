'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreComparisonProps {
  currentScore: number | null;
  scoreType: 'seo' | 'accessibility' | 'design';
  industryAverage: number;
}

export function ScoreComparison({ currentScore, scoreType, industryAverage }: ScoreComparisonProps) {
  if (!currentScore) {
    return (
      <Card className="card-hover-effect">
        <CardHeader>
          <CardTitle className="capitalize">{scoreType} Score Comparison</CardTitle>
          <CardDescription>Score not yet available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Score pending...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const difference = currentScore - industryAverage;
  const percentile = Math.min(95, Math.max(5, Math.round((currentScore / 100) * 100)));
  const isAhead = difference > 0;
  const isEqual = Math.abs(difference) < 2;

  return (
    <Card className="card-hover-effect">
      <CardHeader>
        <CardTitle className="capitalize">{scoreType} Score Comparison</CardTitle>
        <CardDescription>How you compare to industry average</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Current Score */}
          <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-gray-600 mb-2 font-medium">Your Score</p>
            <p className="text-5xl font-bold text-primary mb-2">{currentScore}</p>
            <p className="text-xs text-gray-500">
              {scoreType === 'design' ? 'Out of 10' : 'Out of 100'}
            </p>
          </div>

          {/* Industry Average */}
          <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">Industry Avg</p>
            <p className="text-5xl font-bold text-gray-700 mb-2">{industryAverage}</p>
            <p className="text-xs text-gray-500">
              {scoreType === 'design' ? 'Out of 10' : 'Out of 100'}
            </p>
          </div>
        </div>

        {/* Comparison indicator */}
        <div className="mt-6 p-4 rounded-lg border-2 bg-white">
          <div className="flex items-center justify-center gap-2 mb-3">
            {isEqual ? (
              <>
                <Minus className="w-6 h-6 text-gray-500" />
                <span className="text-lg font-semibold text-gray-700">
                  About Average
                </span>
              </>
            ) : isAhead ? (
              <>
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-700">
                  {Math.abs(difference).toFixed(0)} Points Above Average
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-6 h-6 text-orange-600" />
                <span className="text-lg font-semibold text-orange-700">
                  {Math.abs(difference).toFixed(0)} Points Below Average
                </span>
              </>
            )}
          </div>

          {/* Percentile */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Estimated Percentile</p>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 border-2 border-secondary/30">
              <span className="text-2xl font-bold text-gray-900">{percentile}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Better than {percentile}% of websites
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isAhead
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : isEqual
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}
                style={{ width: `${(currentScore / (scoreType === 'design' ? 10 : 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Insight text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            {isEqual && (
              <>Your {scoreType} score is on par with industry standards. Keep up the good work!</>
            )}
            {isAhead && (
              <>
                Great job! Your {scoreType} score is <strong>{Math.abs(difference).toFixed(0)} points above</strong> the industry average. This gives you a competitive advantage.
              </>
            )}
            {!isEqual && !isAhead && (
              <>
                Your {scoreType} score is <strong>{Math.abs(difference).toFixed(0)} points below</strong> the industry average. Review the recommendations below to improve.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
