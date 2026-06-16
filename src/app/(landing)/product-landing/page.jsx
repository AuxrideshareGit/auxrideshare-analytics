import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Product from './components/Product';
import Features from './components/Features';
import About from './components/About';
import Customer from './components/Customer';
import Cta from './components/Cta';
import Footer from './components/Footer';
export const metadata = {
  title: 'Product Landing'
};
const Page = () => {
  return <>
      <Navbar />
      <Hero />
      <Product />
      <Features />
      <About />
      <Customer />
      <Cta />
      <Footer />
    </>;
};
export default Page;