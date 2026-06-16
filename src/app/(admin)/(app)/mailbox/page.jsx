import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import Emailsidebar from './components/Emailsidebar';
import Emails from './components/Emails';
import MailOffcanavs from './components/MailOffcanavs';
import EventModal from './components/EventModal';
export const metadat = {
  title: 'Mailbox'
};
const Page = () => {
  return <>
      <main className="overflow-x-hidden">
        <PageBreadcrumb title="Mailbox" subtitle="Apps" />
        <div className="grid grid-cols-1">
          <div className="col-span-1">
            <div className="card">
              <div className="flex">
                <Emailsidebar />
                <div className="w-full relative">
                  <Emails />
                  <MailOffcanavs />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <EventModal />
    </>;
};
export default Page;