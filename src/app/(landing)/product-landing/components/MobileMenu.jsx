import logoDark from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light.png';
import Image from 'next/image';
import Link from 'next/link';
import { LuMenu, LuX } from 'react-icons/lu';
const MobileMenu = () => {
  return <>
      <button className="flex justify-center items-center size-9 bg-primary/90 hover:bg-primary text-white rounded md:hidden" aria-haspopup="dialog" aria-expanded="false" aria-controls="navbarMenu" data-hs-overlay="#navbarMenu">
        <LuMenu />
      </button>
      <div className="hs-overlay hs-overlay-open:translate-y-0 -translate-y-full fixed top-0 inset-x-0 transition-all duration-300 transform max-h-64 p-5 size-full  card border-b border-default-100 hidden" role="dialog" tabIndex={-1} aria-labelledby="navbarMenu-label" id="navbarMenu">
        <div className="flex items-center justify-between">
          <Link href="#">
            <Image src={logoDark} alt="logo dark" className="h-6 block dark:hidden" width={111} />
            <Image src={logoLight} alt="logo light" className="h-6 hidden dark:block" width={111} />
          </Link>

          <button aria-label="Close" data-hs-overlay="#navbarMenu" className="inline-flex justify-end items-center gap-x-2 rounded-full">
            <LuX className="size-4" />
          </button>
        </div>

        <div className="pt-8">
          <ul className="flex flex-col gap-y-4 lg:gap-8 md:gap-6 font-semibold  text-sm">
            <li>
              <Link href="#home" className="text-default-800 hover:text-primary transition duration-300">
                Home
              </Link>
            </li>

            <li>
              <Link href="#product" className="text-default-800 hover:text-primary transition duration-300">
                Our Products
              </Link>
            </li>

            <li>
              <Link href="#Features" className="text-default-800 hover:text-primary transition duration-300">
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
      </div>
    </>;
};
export default MobileMenu;