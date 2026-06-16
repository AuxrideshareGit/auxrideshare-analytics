import Image from 'next/image';
import logoDark from '@/assets/images/logo-aux.webp';
import logoLight from '@/assets/images/logo-aux.webp';
import authBgDark from '@/assets/images/auth-bg-dark.jpg';
import authBg from '@/assets/images/auth-bg.jpg';
import ArabianFlag from '@/assets/images/flags/arebian.svg';
import FrenchFlag from '@/assets/images/flags/french.jpg';
import GermanyFlag from '@/assets/images/flags/germany.jpg';
import ItalyFlag from '@/assets/images/flags/italy.jpg';
import JapaneseFlag from '@/assets/images/flags/japanese.svg';
import RussiaFlag from '@/assets/images/flags/russia.jpg';
import SpainFlag from '@/assets/images/flags/spain.jpg';
import UsFlag from '@/assets/images/flags/us.jpg';
import Boxed from '@/assets/images/auxivan.webp';
import Link from 'next/link';
import IconifyIcon from '@/components/client-wrapper/IconifyIcon';
export const metadata = {
  title: 'Login'
};
const Page = () => {
  return <div className="h-screen w-full flex justify-center items-center">
      <div className="absolute inset-0">
        <div className="block dark:hidden h-full w-full relative">
          <Image src={authBg} alt="background" fill className="object-cover" />
        </div>
        <div className="hidden dark:block h-full w-full relative">
          <Image src={authBgDark} alt="background dark" className="object-cover" width={111} />
        </div>
      </div>
      <div className="relative dark:bg-[url('../images/auth-bg-dark.jpg')]">
        <div className="bg-card/70 rounded-lg w-2/3 mx-auto">
          <div className="grid lg:grid-cols-12 grid-cols-1 items-center gap-0">
            <div className="lg:col-span-5">
              <div className="text-center px-10 py-12">
                <h4 className="mb-3 text-xl font-semibold text-purple-500">Welcome Back !</h4>
                <p className="text-base text-default-500">Sign in to continue to Auxrideshare.</p>

                <form action="/index" className="text-left w-full mt-10">
                  <div className="mb-4">
                    <label htmlFor="Username" className="block font-medium text-default-900 text-sm mb-2">
                      Username
                    </label>
                    <input type="text" id="Username" className="form-input" placeholder="Enter Username or email" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="Password" className="block font-medium text-default-900 text-sm mb-2">
                      Password
                    </label>
                    <input type="password" id="Password" className="form-input" placeholder="Enter Password" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input id="checkbox-1" type="checkbox" className="form-checkbox" />
                    <label htmlFor="checkbox-1" className="text-default-900 text-sm font-medium">
                      Remember Me
                    </label>
                  </div>

                  <div className="mt-10 text-center">
                    <button type="button" className="btn bg-primary text-white w-full">
                      Sign In
                    </button>
                  </div>

                  
                 
                  
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 bg-card/60 mx-2 my-2 shadow-[0_14px_15px_-3px_#f1f5f9,0_4px_6px_-4px_#f1f5f9] dark:shadow-none rounded-lg">
              <div className="pt-10 px-10 h-full">
                <div className="flex items-center justify-between gap-3">
                  <Link href="/index">
                    <Image src={logoDark} alt="logo dark" className="h-6 block dark:hidden" width={111} />
                    <Image src={logoLight} alt="logo light" className="h-6 hidden dark:block" width={111} />
                  </Link>
                </div>

                <div className="mt-auto">
                  <Image src={Boxed} alt="Boxed Illustration" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Page;