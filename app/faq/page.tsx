'use client';

import React from 'react';
import FAQ from '../../src/components/FAQ';

export default function FAQPage() {
  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return <FAQ onBackToHome={handleBackToHome} />;
}
