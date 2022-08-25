import { ReactNode } from "react";
import Searchbar from "./Searchbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Searchbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
