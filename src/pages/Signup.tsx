
import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

const Signup: React.FC = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
