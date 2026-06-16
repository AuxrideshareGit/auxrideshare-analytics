import darkLogo from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light.png';
import Image from 'next/image';
import Link from 'next/link';
import MobileMenu from './MobileMenu';
import { LuLogIn } from 'react-icons/lu';
const Navbar = () => {
  return <header>
      <nav className="fixed inset-x-0 top-0 z-50 bg-card py-6  shadow flex justify-between items-center">
        <div className="container">
          <div className="grid lg:grid-cols-12 md:grid-cols-10 grid-cols-2 items-center">
            <div className="lg:col-span-2 md:col-span-2">
              <Link href="/index">
                <Image src={darkLogo} alt="logo dark" className="h-6 block dark:hidden" width={111} />
                <Image src={logoLight} alt="logo light" className="h-6 hidden dark:block" width={111} />
              </Link>
            </div>

            <div className="lg:col-span-8 md:col-span-6 md:block hidden">
              <ul className="flex items-center justify-center lg:gap-8 md:gap-6 font-medium text-sm">
                <li>
                  <Link href="#home" className="text-default-800  hover:text-primary transition duration-300">
                    Home
                  </Link>
                </li>

                <li>
                  <Link href="#features" className="text-default-800  hover:text-primary transition duration-300">
                    Our Features
                  </Link>
                </li>

                <li>
                  <Link href="#about" className="text-default-800  hover:text-primary transition duration-300">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link href="#pricing" className="text-default-800  hover:text-primary transition duration-300">
                    Pricing
                  </Link>
                </li>

                <li>
                  <Link href="#contact" className="text-default-800  hover:text-primary transition duration-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 md:col-span-2 flex items-center justify-end gap-2">
              <MobileMenu />

              <Link href="#" className="flex justify-end">
                <button type="button" className="btn bg-primary text-white">
                  Sign In
                  <LuLogIn className="size-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>;
};
export default Navbar;