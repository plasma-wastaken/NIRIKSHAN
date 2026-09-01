import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, ArrowRight, FileText, CheckCircle, Users, Building, FileCheck2, User, Activity, AlertTriangle, Clock, MapPin, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useInspections } from '../context/InspectionContext';
import { useComplaints } from '../context/ComplaintContext';
import { useTickets } from '../context/TicketContext';
import { useLanguage } from '../context/LanguageContext';
import type { UserRole } from '../data/mockUser';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import delhiGovImage from '../assets/Delhi_India_Government.jpg';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { inspections } = useInspections();
  const { complaints } = useComplaints();
  const { tickets } = useTickets();
  const { language, setLanguage, t } = useLanguage();
  
  // Modal states
  const [isCitizenLoginOpen, setIsCitizenLoginOpen] = useState(false);
  const [isOfficerLoginOpen, setIsOfficerLoginOpen] = useState(false);
  const [isPublicRecordsOpen, setIsPublicRecordsOpen] = useState(false);
  
  // Login states
  const [isLoading, setIsLoading] = useState(false);
  const [officerRole, setOfficerRole] = useState<UserRole>('INSPECTOR');
  
  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login('CITIZEN');
    }, 600);
  };
  
  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(officerRole);
    }, 600);
  };

  // Calculate public statistics from shared context
  const publicStats = {
    totalInspections: inspections.length,
    completedInspections: inspections.filter(i => i.status === 'COMPLETED' || i.status === 'APPROVED').length,
    inProgressInspections: inspections.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length,
    highRiskInspections: inspections.filter(i => i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL').length,
    totalComplaints: complaints.length,
    resolvedComplaints: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
    openComplaints: complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length,
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
    resolvedTickets: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge variant="info">Assigned</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">In Progress</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default">Submitted</Badge>;
      case 'COMPLETED':
      case 'APPROVED':
        return <Badge variant="success">Completed</Badge>;
      case 'RESOLVED':
      case 'CLOSED':
        return <Badge variant="success">Resolved</Badge>;
      case 'OPEN':
        return <Badge variant="info">Open</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Badge variant="success">Low Risk</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      case 'HIGH':
      case 'CRITICAL':
        return <Badge variant="danger">{risk === 'CRITICAL' ? 'Critical' : 'High Risk'}</Badge>;
      case 'UNASSESSED':
        return <Badge variant="default" className="text-surface-500 bg-surface-100">Pending Eval</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-[#0f213a] text-white py-1.5 px-6 flex flex-wrap justify-between text-xs border-b border-surface-700">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-3 bg-white flex items-center justify-center text-[8px] font-bold overflow-hidden">
              <span className="text-orange-500 mr-[1px]">I</span>
              <span className="text-green-500 mr-[1px]">N</span>
              <span className="text-blue-700">D</span>
            </span>
            <span>{t('login.governmentOfIndia')}</span>
          </div>
          <span className="text-surface-400 hidden sm:inline">|</span>
          <span className="hidden sm:inline">{t('login.ministryDepartment')}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a href="#" className="hover:text-primary-300">{t('login.accessibility')}</a>
          <span className="text-surface-400">|</span>
          <a href="#" className="hover:text-primary-300">{t('login.screenReaderAccess')}</a>
          <span className="text-surface-400">|</span>
          <button 
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 hover:text-primary-300 transition-colors"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <header className="px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between border-b border-surface-200 sticky top-0 bg-white z-40">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="flex items-center justify-center">
             <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-primary-900" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary-900 leading-tight">NIRIKSHAN</h1>
            <p className="text-xs sm:text-sm text-surface-600 leading-tight">Government Inspection &<br/>Compliance Platform</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 font-medium text-surface-700 text-sm">
          <a href="#" className="text-primary-900 border-b-2 border-yellow-500 pb-1">Home</a>
          <a href="#" className="hover:text-primary-900 transition-colors">{t('login.aboutNirikshan')}</a>
          <a href="#" className="hover:text-primary-900 transition-colors">{t('login.inspections')}</a>
          <a href="#" className="hover:text-primary-900 transition-colors">{t('login.compliance')}</a>
          <a href="#" className="hover:text-primary-900 transition-colors">{t('login.reports')}</a>
          <a href="#" className="hover:text-primary-900 transition-colors">{t('login.resources')}</a>
        </nav>
        
        <div className="flex items-center">
          <Button variant="primary" className="bg-[#0f213a] text-white hover:bg-primary-900 rounded-md" onClick={() => setIsOfficerLoginOpen(true)}>
            <User className="mr-2 h-4 w-4" /> {t('login.officerLogin')}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row relative bg-[#fdfaf5]">
        {/* Left Text Content */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 lg:py-24 z-10 bg-white/95 lg:bg-transparent">
          <div className="max-w-xl">
            <div className="w-12 h-1 bg-yellow-500 mb-6"></div>
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-primary-900 uppercase mb-1">Government of India</h2>
            <h3 className="text-xs sm:text-sm font-bold tracking-widest text-primary-900 uppercase mb-8">Digital Inspection Platform</h3>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#0a2342] mb-4 tracking-tight">
              NIRIKSHAN
            </h1>
            
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0a2342] mb-6 leading-tight">
              Government Inspection &<br/>Compliance Platform
            </h2>
            
            <p className="text-base sm:text-lg text-surface-600 mb-10 leading-relaxed max-w-md">
              {t('login.platformDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-[#0a2342] text-white hover:bg-primary-900 px-8 flex items-center justify-between shadow-lg"
                onClick={() => setIsCitizenLoginOpen(true)}
              >
                {t('login.accessPortal')} <ArrowRight className="ml-4 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary-900 text-primary-900 hover:bg-primary-50 px-8 flex items-center justify-between bg-white"
                onClick={() => setIsPublicRecordsOpen(true)}
              >
                {t('login.viewPublicReports')} <FileText className="ml-4 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-[45%] h-80 lg:h-auto lg:absolute right-0 top-0 bottom-0 z-0">
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 z-10" />
          <img 
            src={delhiGovImage} 
            alt="Government Building" 
            className="w-full h-full object-cover object-center"
          />
        </div>
      </main>

      {/* Features Banner */}
      <div className="bg-white py-12 border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 text-primary-900">
              <Building className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wider text-surface-900 uppercase mb-1">{t('login.digitalGovernance')}</h4>
              <p className="text-sm text-surface-600">{t('login.digitalGovernanceDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 text-green-600">
              <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wider text-surface-900 uppercase mb-1">{t('login.transparency')}</h4>
              <p className="text-sm text-surface-600">{t('login.transparencyDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 text-yellow-600">
              <User className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wider text-surface-900 uppercase mb-1">{t('login.accountability')}</h4>
              <p className="text-sm text-surface-600">{t('login.accountabilityDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 text-primary-900">
              <Users className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wider text-surface-900 uppercase mb-1">{t('login.publicAccess')}</h4>
              <p className="text-sm text-surface-600">{t('login.publicAccessDesc')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-surface-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900 uppercase tracking-widest mb-4">{t('login.nirikshanAtAGlance')}</h2>
            <div className="w-12 h-1 bg-yellow-500"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-surface-200">
            <div className="flex flex-col items-center px-2 sm:px-4">
              <FileCheck2 className="h-10 w-10 text-primary-800 mb-4" strokeWidth={1.5} />
              <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">14,285</div>
              <div className="text-xs sm:text-sm font-semibold text-surface-800">{t('login.inspectionsConducted')}</div>
              <div className="text-[10px] sm:text-xs text-surface-500 mt-1">{t('login.prototypeData')}</div>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-4">
              <CheckCircle className="h-10 w-10 text-green-600 mb-4" strokeWidth={1.5} />
              <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">92.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-surface-800">{t('login.averageComplianceRate')}</div>
              <div className="text-[10px] sm:text-xs text-surface-500 mt-1">{t('login.prototypeData')}</div>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-4">
              <Users className="h-10 w-10 text-yellow-600 mb-4" strokeWidth={1.5} />
              <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">850+</div>
              <div className="text-xs sm:text-sm font-semibold text-surface-800">{t('login.activeInspectors')}</div>
              <div className="text-[10px] sm:text-xs text-surface-500 mt-1">{t('login.prototypeData')}</div>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-4">
              <Building className="h-10 w-10 text-primary-800 mb-4" strokeWidth={1.5} />
              <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">45</div>
              <div className="text-xs sm:text-sm font-semibold text-surface-800">{t('login.regionalDistricts')}</div>
              <div className="text-[10px] sm:text-xs text-surface-500 mt-1">{t('login.prototypeData')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#0f213a] text-white py-12 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
                <div>
                  <div className="font-bold text-lg leading-tight">NIRIKSHAN</div>
                  <div className="text-[10px] text-surface-300">Government Inspection & Compliance Platform</div>
                </div>
              </div>
              <p className="text-xs text-surface-300 leading-relaxed max-w-xs mt-4">
                Building a safer, accountable and transparent infrastructure through technology and human expertise.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-4 text-surface-100">{t('login.quickLinks')}</h4>
              <ul className="space-y-2 text-sm text-surface-300">
                <li><a href="#" className="hover:text-white transition-colors">{t('login.aboutNirikshan')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.inspections')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.compliance')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.reports')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.resources')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-4 text-surface-100">{t('login.importantLinks')}</h4>
              <ul className="space-y-2 text-sm text-surface-300">
                <li><a href="#" className="hover:text-white transition-colors">{t('login.accessibility')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.termsOfUse')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.contactUs')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-4 text-surface-100">{t('login.helpSupport')}</h4>
              <ul className="space-y-2 text-sm text-surface-300">
                <li><a href="#" className="hover:text-white transition-colors">{t('login.support')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.faqs')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('login.feedback')}</a></li>
              </ul>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-surface-700 flex flex-col md:flex-row justify-between items-center text-xs text-surface-400 gap-4">
           <p>© Government of India. {t('login.allRightsReserved')}</p>
           <p>{t('login.prototypeDisclaimer')}</p>
         </div>
      </footer>

      {/* Citizen Login Modal */}
      <Modal 
        isOpen={isCitizenLoginOpen} 
        onClose={() => setIsCitizenLoginOpen(false)} 
        title={t('login.citizenPortalAccess')}
      >
        <form onSubmit={handleCitizenLogin} className="space-y-6 py-4">
          <div className="text-center mb-6">
            <User className="h-12 w-12 text-primary-600 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-surface-900">{t('login.citizenPortalDesc')}</h3>
            <p className="text-sm text-surface-500">{t('login.citizenPortalNote')}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
            <p><strong>Note:</strong> {t('login.citizenNote')}</p>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {!isLoading && <LogIn className="mr-2 h-5 w-5" />}
            {t('login.signInToPortal')}
          </Button>
        </form>
      </Modal>

      {/* Officer Login Modal */}
      <Modal 
        isOpen={isOfficerLoginOpen} 
        onClose={() => setIsOfficerLoginOpen(false)} 
        title={t('login.officerAuthentication')}
      >
        <form onSubmit={handleOfficerLogin} className="space-y-6 py-4">
          <div className="text-center mb-6">
            <ShieldCheck className="h-12 w-12 text-primary-800 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-surface-900">{t('login.officerDesc')}</h3>
            <p className="text-sm text-surface-500">{t('login.officerAuthDesc')}</p>
          </div>
          
          <div className="space-y-4">
            <Select
              label={t('login.selectOfficerRole')}
              value={officerRole}
              onChange={(e) => setOfficerRole(e.target.value as UserRole)}
              options={[
                { label: t('login.inspector'), value: 'INSPECTOR' },
                { label: t('login.supervisor'), value: 'SUPERVISOR' },
                { label: t('login.admin'), value: 'ADMIN' },
              ]}
              disabled={isLoading}
            />
            
            <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 text-sm text-surface-600">
              <p><strong>Note:</strong> {t('login.officerNote')}</p>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#0f213a] text-white" size="lg" isLoading={isLoading}>
            {!isLoading && <LogIn className="mr-2 h-5 w-5" />}
            {t('login.authenticate')}
          </Button>
        </form>
      </Modal>

      {/* Public Records Modal */}
      <Modal 
        isOpen={isPublicRecordsOpen} 
        onClose={() => setIsPublicRecordsOpen(false)} 
        title={t('login.publicRecords')}
        size="large"
      >
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
            <p><strong>{t('login.publicAccessNote')}</strong></p>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-surface-200">
              <CardContent className="p-4 text-center">
                <FileCheck2 className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.totalInspections}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.totalInspections')}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.completedInspections}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.completed')}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.inProgressInspections}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.inProgress')}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.highRiskInspections}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.highRisk')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-surface-200">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.totalComplaints}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.totalComplaints')}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.resolvedComplaints}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.resolved')}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.openComplaints}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.open')}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900">{publicStats.totalTickets}</p>
                <p className="text-xs text-surface-500 mt-1">{t('login.totalTickets')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Inspections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('login.recentInspections')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-100">
                {inspections.slice(0, 5).map((inspection) => (
                  <div key={inspection.inspection_id} className="p-4 hover:bg-surface-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-primary-700">
                            {inspection.inspection_id}
                          </span>
                          {getStatusBadge(inspection.status)}
                          {getRiskBadge(inspection.risk_level)}
                        </div>
                        <p className="text-sm font-medium text-surface-900">{inspection.site_name}</p>
                        <p className="text-xs text-surface-600">{inspection.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {inspections.length === 0 && (
                  <div className="p-8 text-center text-surface-500">
                    {t('login.noRecordsAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('login.recentComplaints')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-100">
                {complaints.slice(0, 5).map((complaint) => (
                  <div key={complaint.complaint_id} className="p-4 hover:bg-surface-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-primary-700">
                            {complaint.complaint_id}
                          </span>
                          {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-sm font-medium text-surface-900">{complaint.category}</p>
                        <p className="text-xs text-surface-600">{complaint.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && (
                  <div className="p-8 text-center text-surface-500">
                    {t('login.noRecordsAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('login.recentTickets')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-100">
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.ticket_id} className="p-4 hover:bg-surface-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-primary-700">
                            {ticket.ticket_id}
                          </span>
                          {getStatusBadge(ticket.status)}
                          <Badge variant="outline">{ticket.priority}</Badge>
                        </div>
                        <p className="text-xs text-surface-600">
                          Created: {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-surface-600">
                          Deadline: {new Date(ticket.sla_deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="p-8 text-center text-surface-500">
                    {t('login.noRecordsAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button 
              variant="primary" 
              className="bg-[#0f213a] text-white hover:bg-primary-900"
              onClick={() => {
                setIsPublicRecordsOpen(false);
                setIsCitizenLoginOpen(true);
              }}
            >
              <User className="mr-2 h-4 w-4" />
              {t('login.signInForFullAccess')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
