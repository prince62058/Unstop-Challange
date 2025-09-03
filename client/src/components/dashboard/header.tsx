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
    <header className="bg-card border-b border-border p-6" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="page-title">Email Management Dashboard</h2>
          <p className="text-muted-foreground" data-testid="page-subtitle">AI-powered email analysis and response generation</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-sync-emails"
          >
            <i className={`fas ${isSyncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
            {isSyncing ? 'Syncing...' : 'Sync Emails'}
          </Button>
          <Button 
            variant="secondary"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            data-testid="button-user-menu"
          >
            <i className="fas fa-user-circle text-xl"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
