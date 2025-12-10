import Link from 'next/link';
import { th } from '@/lib/localization/th';
import { MapPin, Sparkles, Save, Plane, Globe, Compass } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-hero-pattern min-h-screen -mt-8 pt-8 transition-colors duration-300">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center space-y-8 animate-fadeIn">
          {/* Decorative elements */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '2s' }}>
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '2s' }}>
              <Compass className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight px-4">
            <span className="text-gradient">แผนการเดินทาง</span>
            <br />
            <span className="text-gray-800 dark:text-gray-100">ด้วย AI</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            สร้างแผนการเดินทางที่เหมาะกับคุณด้วยปัญญาประดิษฐ์
            <br className="hidden sm:block" />
            <span className="text-gray-500 dark:text-gray-400">ง่าย รวดเร็ว และเป็นส่วนตัว</span>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-8 px-4">
            <Link
              href="/generate"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-10 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {th.navigation.generateItinerary}
            </Link>
            <Link
              href="/history"
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 sm:px-10 py-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95"
            >
              {th.navigation.history}
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="pt-20 sm:pt-28 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg card-hover border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              แผนการเดินทางที่ครบถ้วน
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              รับแผนการเดินทางรายวันพร้อมกิจกรรมและสถานที่ท่องเที่ยวที่น่าสนใจ
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg card-hover border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              ขับเคลื่อนด้วย AI
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ใช้ปัญญาประดิษฐ์สร้างแผนที่เหมาะกับความต้องการและสไตล์ของคุณ
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg card-hover border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Save className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              บันทึกและเข้าถึงได้ทุกที่
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              เก็บแผนการเดินทางไว้และเข้าถึงได้ทุกเมื่อที่ต้องการจากทุกอุปกรณ์
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 sm:mt-28 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 rounded-full border border-blue-100 dark:border-blue-800">
            <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">เริ่มวางแผนการเดินทางของคุณวันนี้</span>
          </div>
        </div>
      </div>
    </div>
  );
}
