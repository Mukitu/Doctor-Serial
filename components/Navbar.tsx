import React from 'react';
import brandLogo from '@/app/about/MyDocBD-logo2.png';
import Header from '@/src/components/Header';

export default function Navbar(props: any) {
  return <Header {...props} />;
}
export { Header, brandLogo };
