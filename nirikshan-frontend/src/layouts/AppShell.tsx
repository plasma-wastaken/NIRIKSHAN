import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex flex-col h-screen bg-surface-50 overflow-hidden">
      {/* Top Bar - Government Branding */}
      <div className="bg-primary-800 text-white py-1.5 px-4 sm:px-6 flex flex-wrap justify-between text-xs z-50 flex-shrink-0">
        <div className="flex items-center space-x-4 mb-1 sm:mb-0">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-3 bg-white flex items-center justify-center text-[8px] font-bold overflow-hidden">
              <span className="text-orange-500 mr-[1px]">I</span>
              <span className="text-green-500 mr-[1px]">N</span>
              <span className="text-blue-700">D</span>
            </span>
            <span>{t('login.governmentOfIndia')}</span>
          </div>
          <span className="text-primary-300 hidden sm:inline">|</span>
          <span className="hidden sm:inline">{t('login.ministryDepartment')}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a href="#" className="hover:text-primary-300">{t('login.accessibility')}</a>
          <span className="text-primary-300">|</span>
          <a href="#" className="hover:text-primary-300">{t('login.screenReaderAccess')}</a>
          <span className="text-primary-300">|</span>
          <button 
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 hover:text-primary-300 transition-colors"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-surface-50">
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
