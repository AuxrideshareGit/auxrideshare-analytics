import ProvidersWrapper from '@/components/ProvidersWrapper';
import { DM_Sans, Tourney } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { DEFAULT_PAGE_TITLE } from '../helpers/constants';
import favicon from "@/assets/images/favicon.ico";
import 'flatpickr/dist/flatpickr.css';
import 'swiper/swiper-bundle.css';
import '../assets/css/style.css';
const getdmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
});
const getTourney = Tourney({
  variable: '--font-tourney',
  subsets: ['vietnamese', 'latin-ext', 'latin'],
  style: ['normal', 'italic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
});
export const metadata = {
  title: {
    default: DEFAULT_PAGE_TITLE,
    template: '%s | Auxrideshare'
  },
  icons: {
    icon: favicon.src
  }
};
export default function RootLayout({
  children
}) {
  return <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${getdmSans.variable} ${getTourney.variable} antialiased`}>
        <NextTopLoader showSpinner={false} color="var(--color-primary)" />
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>;
}