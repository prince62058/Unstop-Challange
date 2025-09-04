import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeaderProps {
  onSyncEmails: () => void;
}

export default function Header({ onSyncEmails }: HeaderProps) {
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
    <header className="glass-card border-b border-border p-6 m-4 rounded-xl fade-in sticky top-4 z-40" data-testid="header">
      <div className="flex items-center justify-between mobile-stack gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text mb-2" data-testid="page-title">
            Email Management Dashboard
          </h1>
          <p className="text-muted-foreground flex items-center gap-2" data-testid="page-subtitle">
            <i className="fas fa-robot text-blue-500"></i>
            AI-powered email analysis and response generation
          </p>
        </div>
        <div className="flex items-center gap-3 mobile-full mobile-stack">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="btn-gradient px-6 py-2 rounded-xl font-semibold shadow-lg"
            data-testid="button-sync-emails"
          >
            <i className={`fas ${isSyncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2 text-sm`}></i>
            {isSyncing ? 'Syncing...' : 'Sync Emails'}
          </Button>
        </div>
      </div>
    </header>
  );
}
