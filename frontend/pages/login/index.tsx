import styles from "./Login.module.css";
import Sidebar from "../../components/Sidebar";
import Searchbar from "../../components/Searchbar";

const Login = () => {
  return (
    <div className={styles.login}>
      <Sidebar />
      <Searchbar />
    </div>
  );
};

export default Login;
