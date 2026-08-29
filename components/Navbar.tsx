import React from 'react';
import brandLogo from '@/app/about/MyDocBD-Logo.png';
import Header from '@/src/components/Header';

export default function Navbar(props: any) {
  return <Header {...props} />;
}
export { Header, brandLogo };
