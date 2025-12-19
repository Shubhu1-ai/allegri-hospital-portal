import React, { useState } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import CameraView from './components/CameraView';
import HistoryView from './components/HistoryView';
import { UserProfile, AnalysisResult } from './types';
import { Camera, ClipboardList, UserCircle, HelpCircle, MessageCircle, LogOut, ChevronRight, BookOpen, AlertTriangle } from 'lucide-react';

// Enum for basic navigation state since request forbids React Router Browser features
enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE'
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // This state persists the "Calculation" history
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  // State for expanding help section in Profile
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = (success: boolean) => {
    if (success) {
      setUser({
        username: 'ALLEGRI',
        role: 'Senior Lab Technician',
        department: 'Microbiology',
        avatarUrl: '',
      });
      setView(ViewState.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView(ViewState.LOGIN);
  };

  // Updated to accept an array of results for batch processing
  const handleAnalysisComplete = (results: AnalysisResult[]) => {
    // Save to history
    setAnalysisHistory(prev => [...prev, ...results]);
    // Go to history view to see the result
    setView(ViewState.HISTORY);
  };

  const handleClearHistory = () => {
    setAnalysisHistory([]);
  };

  const handleDeleteHistory = (ids: string[]) => {
    setAnalysisHistory(prev => prev.filter(item => !ids.includes(item.id)));
  };

  // Render Logic
  const renderContent = () => {
    switch (view) {
      case ViewState.LOGIN:
        return <LoginForm onLogin={handleLogin} />;
      
      case ViewState.CAMERA:
        return (
          <CameraView 
            onBack={() => setView(ViewState.DASHBOARD)} 
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      
      case ViewState.HISTORY:
        return (
          <HistoryView 
            results={analysisHistory} 
            onBack={() => setView(ViewState.DASHBOARD)}
            onClearHistory={handleClearHistory}
            onDeleteHistory={handleDeleteHistory}
          />
        );

      case ViewState.PROFILE:
          return (
             <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm mt-10 animate-in fade-in duration-300">
                <div className="flex flex-col items-center">
                   <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                      <UserCircle size={64} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800">{user?.username}</h2>
                   <p className="text-emerald-600 font-medium">{user?.role}</p>
                   <p className="text-slate-500 text-sm mt-1">{user?.department}</p>
                   
                   <div className="w-full mt-8 space-y-3">
                      
                      {/* Help Section */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => setShowHelp(!showHelp)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <HelpCircle size={18} />
                            </div>
                            <span className="font-medium text-slate-700">Help & Troubleshooting</span>
                          </div>
                          <ChevronRight size={18} className={`text-slate-400 transition-transform ${showHelp ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showHelp && (
                          <div className="p-4 bg-white text-sm text-slate-600 space-y-3 border-t border-slate-100">
                             <div className="flex gap-2 items-start">
                               <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                               <p><strong>Camera Issues:</strong> Ensure your browser has permission to access the camera. If on mobile, use Safari (iOS) or Chrome (Android).</p>
                             </div>
                             <div className="flex gap-2 items-start">
                               <BookOpen size={16} className="text-blue-500 shrink-0 mt-0.5" />
                               <p><strong>Analysis:</strong> The analysis connects to the Raspberry Pi module. Ensure the Pi is powered on and connected to the same network.</p>
                             </div>
                             <div className="flex gap-2 items-start">
                               <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                               <p>For system logs, please contact the IT department.</p>
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Contact Us */}
                      <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <MessageCircle size={18} />
                          </div>
                          <div className="text-left">
                            <span className="block font-medium text-slate-700">Contact Support</span>
                            <span className="text-xs text-slate-500">support@allegri.health</span>
                          </div>
                        </div>
                      </button>

                      {/* Sign Out */}
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group mt-6"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center">
                            <LogOut size={18} />
                          </div>
                          <span className="font-medium text-red-700">Sign Out</span>
                        </div>
                      </button>

                   </div>

                   <button 
                     onClick={() => setView(ViewState.DASHBOARD)}
                     className="mt-6 text-sm text-slate-500 hover:text-slate-800 underline"
                   >
                     Back to Dashboard
                   </button>
                </div>
             </div>
          );
      
      case ViewState.DASHBOARD:
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-500">Welcome back, {user?.username}. Select an action below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Capture Photo */}
              <button
                onClick={() => setView(ViewState.CAMERA)}
                className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all text-left"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Camera size={100} className="text-emerald-500" />
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                  <Camera size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Capture Photo</h3>
                <p className="text-slate-500 mt-2 text-sm">
                  Open device camera to capture new bacteria samples for immediate analysis.
                </p>
              </button>

              {/* Card 2: Calculation / History */}
              <button
                onClick={() => setView(ViewState.HISTORY)}
                className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all text-left"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ClipboardList size={100} className="text-blue-500" />
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Calculation & Results</h3>
                <p className="text-slate-500 mt-2 text-sm">
                  View previous analysis results, confidence scores, and identified bacteria types.
                </p>
              </button>
            </div>
            
             <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setView(ViewState.PROFILE)}
                  className="text-sm text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  Manage Account & Settings
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onProfileClick={() => setView(ViewState.PROFILE)} 
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;