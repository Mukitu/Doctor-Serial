import React from 'react';
import AboutUs from '../../src/components/AboutUs';

export default function AboutPage() {
  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return <AboutUs onBackToHome={handleBackToHome} />;
}
