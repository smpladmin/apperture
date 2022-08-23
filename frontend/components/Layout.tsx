import Searchbar from "./Searchbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <>
      <Sidebar />

      <Searchbar />
      <main>{children}</main>
    </>
  );
}
