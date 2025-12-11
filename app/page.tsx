import Link from 'next/link';
import { th } from '@/lib/localization/th';
import { MapPin, Sparkles, Save } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="text-center space-y-6 sm:space-y-8 animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-4">
          แผนการเดินทางด้วย AI
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
          สร้างแผนการเดินทางที่เหมาะกับคุณด้วยปัญญาประดิษฐ์
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4">
          <Link
            href="/generate"
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95"
          >
            {th.navigation.generateItinerary}
          </Link>
          <Link
            href="/history"
            className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95"
          >
            {th.navigation.history}
          </Link>
        </div>

        <div className="pt-12 sm:pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
              แผนการเดินทางที่ครบถ้วน
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              รับแผนการเดินทางรายวันพร้อมกิจกรรมและสถานที่ท่องเที่ยว
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
              ขับเคลื่อนด้วย AI
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              ใช้ปัญญาประดิษฐ์สร้างแผนที่เหมาะกับความต้องการของคุณ
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Save className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
              บันทึกและเข้าถึงได้ทุกที่
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              เก็บแผนการเดินทางไว้และเข้าถึงได้ทุกเมื่อที่ต้องการ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
