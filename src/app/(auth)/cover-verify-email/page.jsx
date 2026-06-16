import React from 'react';
import Image from 'next/image';
import logoDark from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light.png';
import authBg from '@/assets/images/auth-bg.jpg';
import authBgDark from '@/assets/images/auth-bg-dark.jpg';
import authEmail from '@/assets/images/auth-email.png';
import Link from 'next/link';
export const metadata = {
  title: 'Verify Email'
};
const Page = () => {
  return <div className="relative h-screen w-full flex justify-center items-center">
      <div className="absolute inset-0">
        <div className="block dark:hidden h-full w-full relative">
          <Image src={authBg} alt="background light" fill className="object-cover" />
        </div>
        <div className="hidden dark:block h-full w-full relative">
          <Image src={authBgDark} alt="background dark" fill className="object-cover" />
        </div>
      </div>

      <div className="relative z-10 bg-card/70 rounded-lg w-lg">
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
            <h4 className="mb-3 text-xl font-semibold text-primary">Verify Email</h4>
            <p className="text-base text-default-500 mb-4">
              Did you not receive an email? Please{' '}
              <Link href="#" className="text-primary underline">
                try again
              </Link>
            </p>

            <button type="button" className="btn btn-sm bg-primary text-white">
              Skip Now
            </button>

            <div className="pt-10 text-center w-2/3 mx-auto relative">
              <Image src={authEmail} alt="verify email" className="mx-auto" style={{
              width: '100%',
              height: 'auto'
            }} />
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Page;