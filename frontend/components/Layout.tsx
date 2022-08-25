import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex w-full flex-col">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
