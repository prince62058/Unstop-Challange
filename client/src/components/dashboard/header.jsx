import { useState } from "react";

export default function Header({ onSyncEmails }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncEmails();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="glass-card border-b border-border p-6 m-4 rounded-2xl fade-in sticky top-4 z-40 bg-gradient-to-r from-white/95 to-blue-50/95" data-testid="header">
      <div className="flex items-center justify-between mobile-stack gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <i className="fas fa-envelope-open-text text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-black gradient-text" data-testid="page-title">
                An intelligent email management system
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-muted-foreground font-semibold" data-testid="page-subtitle">
                  Intelligent email management system
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <i className="fas fa-brain text-blue-500"></i>
              <span className="font-medium text-blue-700">AI Powered</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
              <i className="fas fa-bolt text-green-500"></i>
              <span className="font-medium text-green-700">Real-time</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
              <i className="fas fa-shield-alt text-purple-500"></i>
              <span className="font-medium text-purple-700">Secure</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mobile-full mobile-stack">
          <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <i className="fas fa-clock"></i>
              <span>Last sync: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="btn-gradient px-8 py-4 rounded-2xl font-bold shadow-xl text-lg transition-all duration-300 hover:shadow-2xl disabled:opacity-70"
            data-testid="button-sync-emails"
          >
            <i className={`fas ${isSyncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-3 text-lg`}></i>
            {isSyncing ? 'Syncing...' : 'Sync Emails'}
          </button>
        </div>
      </div>
    </header>
  );
}