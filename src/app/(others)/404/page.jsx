import React from 'react';
import Image from 'next/image';
import LogoDark from '@/assets/images/logo-dark.png';
import LogoLight from '@/assets/images/logo-light.png';
import Error404 from '@/assets/images/error-404.png';
import AuthBg from '@/assets/images/auth-bg.jpg';
import AuthBgDark from '@/assets/images/auth-bg-dark.jpg';
import Link from 'next/link';
import { LuHouse } from 'react-icons/lu';
export const metadata = {
  title: 'Page Not Found'
};
const PageNotFound = () => {
  return <div className="relative h-screen w-full flex justify-center items-center">
      <div className="absolute inset-0">
        <div className="block dark:hidden h-full w-full">
          <Image src={AuthBg} alt="background" fill className="object-cover" />
        </div>
        <div className="hidden dark:block h-full w-full">
          <Image src={AuthBgDark} alt="background dark" fill className="object-cover" />
        </div>
      </div>

      <div className="relative z-10 bg-default-50 rounded-lg w-lg">
        <div className="text-center px-10 py-12">
          <Link href="/index" className="flex justify-center">
            <div className="block dark:hidden h-6 relative w-auto">
              <Image src={LogoDark} alt="logo dark" className="object-contain" width={111} />
            </div>
            <div className="hidden dark:block h-6 relative w-auto">
              <Image src={LogoLight} alt="logo light" className="object-contain" width={111} />
            </div>
          </Link>

          <div className="mt-10">
            <div className="h-64 relative w-auto mx-auto">
              <Image src={Error404} alt="404 error" fill className="object-contain" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <h4 className="mb-2 text-purple-500 dark:text-white text-xl font-semibold">
              OPPS, PAGE NOT FOUND
            </h4>
            <p className="mb-6 text-base text-default-500">
              It will be as straightforward as Occidental; in fact, it will be just like Occidental
              to an English speaker.
            </p>
            <Link href="/index">
              <button type="button" className="bg-primary text-white hover:bg-blue-600 rounded text-[13px] py-2 px-4 inline-flex items-center">
                <LuHouse className="size-3 me-1" />
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default PageNotFound;