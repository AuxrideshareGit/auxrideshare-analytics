import Link from 'next/link';
import logoLight from '@/assets/images/logo-light.png';
import authBg from '@/assets/images/auth-bg.jpg';
import logoDark from '@/assets/images/logo-dark.png';
import authBgDark from '@/assets/images/auth-bg-dark.jpg';
import Image from 'next/image';
import React from 'react';
import { LuLogOut } from 'react-icons/lu';
export const metadata = {
  title: 'Logout'
};
const Page = () => {
  return <div className="h-screen w-full flex justify-center items-center">
      <div className="absolute inset-0">
        <div className="block dark:hidden h-full w-full relative">
          <Image src={authBg} alt="background" fill className="object-cover" />
        </div>
        <div className="hidden dark:block h-full w-full relative">
          <Image src={authBgDark} alt="background dark" fill className="object-cover" />
        </div>
      </div>
      <div className="relative">
        <div className="bg-default-50 rounded-lg w-lg relative">
          <div className="text-center px-10 py-12">
            <Link href="/index" className="flex justify-center">
              <div className="h-6 w-auto relative block dark:hidden">
                <Image src={logoDark} alt="logo dark" className="object-contain" width={111} />
              </div>
              <div className="h-6 w-auto relative hidden dark:block">
                <Image src={logoLight} alt="logo light" width={111} className="object-contain" />
              </div>
            </Link>
            <div className="mt-8 text-center">
              <div className="mb-4">
                <LuLogOut className="size-6 text-purple-500 mx-auto fill-purple-100" />
              </div>
              <h4 className="mb-2 text-primary text-xl font-semibold">You are Logged Out</h4>
              <p className="mb-8 text-base text-default-500">
                Thank you for using tailwick admin template{' '}
              </p>
            </div>

            <Link href="/index">
              <button className="btn bg-primary text-white w-full">Sign In</button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default Page;