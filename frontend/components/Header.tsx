import styles from '../components/Searchbar.module.css';
import 'remixicon/fonts/remixicon.css';
import Image from 'next/image';
import filterIcon from '../assets/icons/filter-icon.svg';
import mixPanel from '../assets/images/mixPanel-icon.png';
import { Input } from '@chakra-ui/react';

const Header = () => {
  return (
    <div className="h-18 w-full shadow-[0_1px_0_rgba(30,25,34,0.08)]">
      <div className="flex h-full items-center justify-between bg-white ">
        <div className={styles.searchBar__left}>
          <Input
            placeholder="Search for events"
            className={styles.searchBar__input}
          />
        </div>
        <div className={styles.searchBar__right}>
          <div className={styles.searchBar__dateRange}>
            <i className="ri-calendar-fill"></i>
          </div>
          <div className={styles.searchBar__filterButton}>
            <Image src={filterIcon} alt="filter-icon" />
          </div>
          <div className={styles.searchBar__dataSource}>
            <Image src={mixPanel} alt="data-source-mix-panel" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
