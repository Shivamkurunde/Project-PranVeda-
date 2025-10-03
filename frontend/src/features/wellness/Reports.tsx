import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, Share, Clock, CheckCircle, Zap, Heart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Reports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate report generation
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF report...');
      
      // Create a simple PDF-like content
      const reportContent = `
        PRANVEDA ZEN FLOW - WEEKLY WELLNESS REPORT
        Generated: ${new Date().toLocaleDateString()}
        
        SUMMARY STATISTICS:
        • Total Minutes: 185m (Goal exceeded by 35m)
        • Sessions: 7 (Excellent consistency!)
        • Streak Days: 12 (Amazing dedication!)
        • Mood Trend: ↑ 13% (Improving)
        
        WEEKLY PROGRESS:
        • Meditation: 85%
        • Workout: 70%
        • Sleep Quality: 90%
        
        AI INSIGHTS:
        • Consistency Champion: Your 12-day streak shows remarkable dedication
        • Sleep Optimization: Sleep quality improved by 13% this week
        • Goal Achievement: Exceeded weekly meditation goal by 35 minutes
      `;

      // Create and download the file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pranveda-wellness-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF report');
      console.error('PDF download error:', error);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-purple-900 to-purple-800 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Generating Your Weekly Report</h2>
            <p className="text-gray-300">AI is analyzing your wellness journey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-purple-900 to-purple-800 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Weekly Wellness Report</h1>
            <p className="text-gray-300">Your personalized AI-generated insights for Sun, Sep 21 - Sun, Sep 28</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button 
            onClick={handleDownloadPDF}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
            <Share className="w-4 h-4 mr-2" />
            Share Report
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Minutes */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">185m</div>
              <div className="text-gray-300 mb-2">Total Minutes</div>
              <div className="text-sm text-green-400 flex items-center">
                <span>🎉</span>
                <span className="ml-1">Goal exceeded by 35m</span>
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">7</div>
              <div className="text-gray-300 mb-2">Sessions</div>
              <div className="text-sm text-green-400">Excellent consistency!</div>
            </CardContent>
          </Card>

          {/* Streak Days */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-gray-300 mb-2">Streak Days</div>
              <div className="text-sm text-green-400">Amazing dedication!</div>
            </CardContent>
          </Card>

          {/* Mood Trend */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2 flex items-center">
                <TrendingUp className="w-6 h-6 text-green-400 mr-1" />
                13%
              </div>
              <div className="text-gray-300 mb-2">Mood Trend</div>
              <div className="text-sm text-green-400">Improving</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Report Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Weekly Progress Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Meditation</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Workout</span>
                  <span className="text-white">70%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sleep Quality</span>
                  <span className="text-white">90%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-900/30 rounded-lg">
                  <h4 className="text-purple-300 font-semibold mb-2">Consistency Champion</h4>
                  <p className="text-gray-300 text-sm">Your 12-day streak shows remarkable dedication. Keep up the momentum!</p>
                </div>
                
                <div className="p-4 bg-teal-900/30 rounded-lg">
                  <h4 className="text-teal-300 font-semibold mb-2">Sleep Optimization</h4>
                  <p className="text-gray-300 text-sm">Your sleep quality has improved by 13% this week. Great work!</p>
                </div>
                
                <div className="p-4 bg-green-900/30 rounded-lg">
                  <h4 className="text-green-300 font-semibold mb-2">Goal Achievement</h4>
                  <p className="text-gray-300 text-sm">You've exceeded your weekly meditation goal by 35 minutes!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
