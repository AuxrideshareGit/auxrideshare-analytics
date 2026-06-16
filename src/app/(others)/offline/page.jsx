import React from 'react';
import Image from 'next/image';
import LogoDark from '@/assets/images/logo-dark.png';
import LogoLight from '@/assets/images/logo-light.png';
import OfflineImg from '@/assets/images/offline.png';
import AuthBg from '@/assets/images/auth-bg.jpg';
import AuthBgDark from '@/assets/images/auth-bg-dark.jpg';
import Link from 'next/link';
import { LuRefreshCcw } from 'react-icons/lu';
export const metadata = {
  title: 'Offline'
};
const OfflinePage = () => {
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
            <div className="h-72 relative w-auto mx-auto">
              <Image src={OfflineImg} alt="offline" fill className="object-contain" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <h4 className="mb-2 text-purple-500 dark:text-white text-xl font-semibold">
              We're Temporarily Offline
            </h4>
            <p className="mb-6 text-base text-default-500">
              We can't display these images as you're currently not connected to the internet. Once
              you're back online, please refresh the page or click the button below.
            </p>

            <button type="button"
          // onClick={() => window.location.reload()}
          className="bg-primary text-white hover:bg-blue-600 rounded text-[13px] py-2 px-4 inline-flex items-center">
              <LuRefreshCcw className="size-3 me-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default OfflinePage;