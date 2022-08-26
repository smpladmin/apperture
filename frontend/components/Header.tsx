import 'remixicon/fonts/remixicon.css';
import Image from 'next/image';
import filterIcon from '../assets/icons/filter-icon.svg';
import mixPanel from '../assets/images/mixPanel-icon.png';
import { Input } from '@chakra-ui/react';

const Header = () => {
  return (
    <div className="flex h-18 w-full items-center justify-between bg-white py-3 px-7 shadow-xs ">
      <Input
        size={'lg'}
        w={'25rem'}
        bg={'#f6f6f6'}
        rounded={'6.25rem'}
        fontSize={'md'}
        placeholder="Search for events"
        className="py-4 px-3.5 text-text-base text-black"
        _placeholder={{
          fontSize: '1rem',
          lineHeight: '1.375rem',
          fontWeight: 400,
          color: '#b2b2b5',
        }}
      />
      <div className="flex items-center justify-between gap-6">
        <div>
          <i className="ri-calendar-fill"></i>
        </div>
        <div>
          <Image src={filterIcon} alt="filter-icon" />
        </div>
        <div className="h-8 w-8">
          <Image src={mixPanel} alt="data-source-mix-panel" />
        </div>
      </div>
    </div>
  );
};

export default Header;
