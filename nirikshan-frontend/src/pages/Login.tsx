import React, { useState } from 'react';
import { ShieldCheck, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../data/mockUser';
import { Select } from '../components/ui/Select';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      login(selectedRole);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Prototype Indicator */}
      <div className="absolute top-4 right-4 bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full border border-primary-200 shadow-sm">
        Prototype / Hackathon Build
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-primary-600 p-3 rounded-xl mb-4 shadow-md">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-surface-900 tracking-tight">
            NIRIKSHAN
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-surface-600">
            AI-Powered Government Inspection & Compliance Platform
          </p>
        </div>

        <Card className="mt-8 border-surface-200 shadow-lg">
          <form onSubmit={handleLogin}>
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl">Sign in to your account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Select Demo Role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                options={[
                  { label: 'Citizen', value: 'CITIZEN' },
                  { label: 'Inspector', value: 'INSPECTOR' },
                  { label: 'Supervisor', value: 'SUPERVISOR' },
                  { label: 'Admin', value: 'ADMIN' },
                ]}
                disabled={isLoading}
              />
              
              <div className="bg-surface-50 p-3 rounded-lg border border-surface-200 text-xs text-surface-600">
                <p><strong>Note:</strong> Since this is a prototype, password verification is disabled. Select a role above to mock log in as that user type.</p>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {!isLoading && <LogIn className="mr-2 h-5 w-5" />}
                Sign in
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-xs text-surface-400 mt-4">
          Authorized personnel only. Access is logged and monitored.
        </p>
      </div>
    </div>
  );
};
