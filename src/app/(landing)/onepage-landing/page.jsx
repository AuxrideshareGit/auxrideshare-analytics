import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Feature from './components/Feature';
import Works from './components/Works';
import About from './components/About';
import Contact from './components/Contact';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
export const metadata = {
  title: 'One Page Landing'
};
const Page = () => {
  return <>
      <Navbar />
      <Hero />
      <Feature />
      <Works />
      <About />
      <Pricing />
      <Contact />
      <Footer />
    </>;
};
export default Page;