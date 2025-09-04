import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

export default function Settings() {
  const [emailSettings, setEmailSettings] = useState({
    autoResponse: true,
    sentimentAnalysis: true,
    priorityClassification: true,
    responseGeneration: true
  });

  const [accountSettings, setAccountSettings] = useState({
    emailAddress: "support@company.com",
    displayName: "Customer Support",
    signature: "Best regards,\\nCustomer Support Team"
  });

  const handleEmailSettingChange = (key: string, value: boolean) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAccountSettingChange = (key: string, value: string) => {
    setAccountSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your email management preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* AI Features */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-robot text-blue-500"></i>
              AI Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-response">Automatic Response Generation</Label>
                <p className="text-sm text-muted-foreground">Generate AI responses for urgent emails automatically</p>
              </div>
              <Switch
                id="auto-response"
                checked={emailSettings.autoResponse}
                onCheckedChange={(checked) => handleEmailSettingChange('autoResponse', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sentiment-analysis">Sentiment Analysis</Label>
                <p className="text-sm text-muted-foreground">Analyze emotional tone of incoming emails</p>
              </div>
              <Switch
                id="sentiment-analysis"
                checked={emailSettings.sentimentAnalysis}
                onCheckedChange={(checked) => handleEmailSettingChange('sentimentAnalysis', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="priority-classification">Priority Classification</Label>
                <p className="text-sm text-muted-foreground">Automatically classify email priority levels</p>
              </div>
              <Switch
                id="priority-classification"
                checked={emailSettings.priorityClassification}
                onCheckedChange={(checked) => handleEmailSettingChange('priorityClassification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="response-generation">Smart Response Generation</Label>
                <p className="text-sm text-muted-foreground">Enable AI-powered response suggestions</p>
              </div>
              <Switch
                id="response-generation"
                checked={emailSettings.responseGeneration}
                onCheckedChange={(checked) => handleEmailSettingChange('responseGeneration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-user-cog text-green-500"></i>
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input
                id="email-address"
                value={accountSettings.emailAddress}
                onChange={(e) => handleAccountSettingChange('emailAddress', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={accountSettings.displayName}
                onChange={(e) => handleAccountSettingChange('displayName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signature">Email Signature</Label>
              <textarea
                id="signature"
                className="w-full min-h-[100px] px-3 py-2 border rounded-lg"
                value={accountSettings.signature.replace('\\n', '\n')}
                onChange={(e) => handleAccountSettingChange('signature', e.target.value.replace('\n', '\\n'))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Provider */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fab fa-google text-red-500"></i>
              Email Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Gmail Connected</p>
                  <p className="text-sm text-muted-foreground">support@company.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Last sync: 2 minutes ago</p>
              <p>Sync frequency: Every 5 minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="btn-gradient px-8">
            <i className="fas fa-save mr-2"></i>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}