import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { UserSettings } from '@/components/user/UserSettings';

const Settings: React.FC = () => {
  return (
    <AppLayout>
      <UserSettings />
    </AppLayout>
  );
};

export default Settings;