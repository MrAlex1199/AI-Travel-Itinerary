import Link from 'next/link';
import { th } from '@/lib/localization/th';
import { MapPin, Sparkles, Save } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="text-center space-y-6 sm:space-y-8 animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight px-4">
          แผนการเดินทางด้วย AI
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
          สร้างแผนการเดินทางที่เหมาะกับคุณด้วยปัญญาประดิษฐ์
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4">
          <Link
            href="/generate"
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95 hover-lift"
          >
            {th.navigation.generateItinerary}
          </Link>
          <Link
            href="/history"
            className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95 hover-lift"
          >
            {th.navigation.history}
          </Link>
        </div>

        <div className="pt-12 sm:pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover-lift animate-slideIn">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              แผนการเดินทางที่ครบถ้วน
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              รับแผนการเดินทางรายวันพร้อมกิจกรรมและสถานที่ท่องเที่ยว
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover-lift animate-slideIn" style={{ animationDelay: '200ms' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              ขับเคลื่อนด้วย AI
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              ใช้ปัญญาประดิษฐ์สร้างแผนที่เหมาะกับความต้องการของคุณ
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover-lift animate-slideIn" style={{ animationDelay: '400ms' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle" style={{ animationDelay: '1s' }}>
              <Save className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              บันทึกและเข้าถึงได้ทุกที่
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              เก็บแผนการเดินทางไว้และเข้าถึงได้ทุกเมื่อที่ต้องการ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
