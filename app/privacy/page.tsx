'use client';

import React from 'react';
import PrivacyPolicy from '../../src/components/PrivacyPolicy';

export default function PrivacyPage() {
  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return <PrivacyPolicy onBackToHome={handleBackToHome} />;
}
