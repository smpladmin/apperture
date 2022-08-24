import styles from "../components/Loginscreen.module.css";
import Image from "next/image";
import logo from "../assets/images/Logo_login.svg";
import glogo from "../assets/images/Google_login.svg";

const Loginscreen = () => {
  return (
    <div className={styles.login__wrapper}>
      <div className={styles.login__container}>
        <div>
          <div className={styles.login__logoWrapper}>
            <Image src={logo} className={styles.login__logo} layout="fill" />
          </div>
          <h1 className={styles.login__heading}>
            Product Analytics <br /> for everyone
          </h1>
          <p className={styles.login__terms}> Terms of use</p>
        </div>
        <div className={styles.login__buttonwrapper}>
          <button className={styles.login__google}>
            <Image src={glogo}></Image>Sign up with Google
          </button>
          <p className={styles.login__already}>
            Already a user?<span className={styles.login__login}>Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loginscreen;
