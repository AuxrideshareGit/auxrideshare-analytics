import React from 'react';
import SideHidden from './components/SideHidden';
export const metadata = {
  title: 'Hidden Sidenav'
};
const Page = () => {
  return <main>
      <SideHidden />
    </main>;
};
export default Page;