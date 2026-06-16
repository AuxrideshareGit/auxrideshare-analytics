import PageBreadcrumb from '@/components/PageBreadcrumb';
import Calender from './components/Calender';
export const metadata = {
  title: 'Calendar'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Calendar" subtitle="Menu" />
      <div className="grid lg:grid-cols-4 gap-5">
        <Calender />
      </div>
    </main>;
};
export default Page;