import { ReactNode } from "react";
import Searchbar from "./Searchbar";
import Sidebar from "./Sidebar";
import styles from "./Layout.module.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.mainContainer}>
        <Searchbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
