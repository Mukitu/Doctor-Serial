'use client';

import React from 'react';
import TermsOfService from '../../src/components/TermsOfService';

export default function TermsPage() {
  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return <TermsOfService onBackToHome={handleBackToHome} />;
}
