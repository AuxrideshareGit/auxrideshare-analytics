import logoDark from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light.png';
import Image from 'next/image';
import Link from 'next/link';
import MobileMenu from './MobileMenu';
import { LuLogIn, LuShoppingBag } from 'react-icons/lu';
const Navbar = () => {
  return <header>
      <nav className="fixed inset-x-0 top-0 z-50 bg-card py-6 border-b border-default-150 flex justify-between items-center">
        <div className="container">
          <div className="grid lg:grid-cols-12 md:grid-cols-10 grid-cols-3 items-center">
            <div className="lg:col-span-2 md:col-span-2 col-span-1">
              <Link href="/index">
                <Image src={logoDark} alt="logo dark" className="h-6 block dark:hidden" width={111} />
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
                  <Link href="#product" className="text-default-800  hover:text-primary transition duration-300">
                    Our Products
                  </Link>
                </li>

                <li>
                  <Link href="#Features" className="text-default-800  hover:text-primary transition duration-300">
                    Features
                  </Link>
                </li>

                <li>
                  <Link href="#About" className="text-default-800  hover:text-primary transition duration-300">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link href="#Feedback" className="text-default-800  hover:text-primary transition duration-300">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 md:col-span-2 col-span-2 flex items-center justify-end gap-4">
              <MobileMenu />
              <button type="button">
                <LuShoppingBag className="size-4 text-default-500 hover:text-primary transition-all" />
              </button>

              <Link href="#" className="flex justify-end">
                <button className="btn border-0 bg-gradient-to-r from-primary to-purple-500 hover:from-purple-500 hover:to-primary text-white">
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