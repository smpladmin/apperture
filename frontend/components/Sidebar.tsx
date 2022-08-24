import styles from "../components/Sidebar.module.css";
import "remixicon/fonts/remixicon.css";
import logo from "../assets/images/apperture_white-icon.svg";

const Sidebar = () => {
  return (
    <div className={styles.sideBar}>
      <img src={logo.src} className={styles.sideBar_logo} alt="appertureLogo" />
      <div className={styles.sideBar__app}>
        <p className={styles.sideBar__headings}>APP</p>
        <div className={styles.sideBar__accountImage}>
          <p>ZA</p>
        </div>
      </div>
      <div className={styles.sideBar__explore}>
        <p className={styles.sideBar__headings}>EXPLORE</p>
        <div className={styles.sideBar_buttonWrapper}>
          <div className={styles.sideBar__buttons}>
            <div className={styles.rotate45}>
              <i className="ri-route-fill"></i>
            </div>
          </div>
          <div className={styles.sideBar__buttons}>
            <i className="ri-lightbulb-line"></i>
          </div>
          <div className={styles.sideBar__buttons}>
            <i className="ri-bookmark-line"></i>
          </div>
          <div className={styles.sideBar__tag}>Coming soon</div>
        </div>
      </div>
      <div className={styles.sideBar__logOut}>
        <div className={styles.sideBar__buttons}>
          <i className="ri-logout-box-r-line"></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
