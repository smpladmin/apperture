import styles from '../components/Sidebar.module.css';
import 'remixicon/fonts/remixicon.css';
import logo from '../assets/images/apperture_white-icon.svg';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="flex h-screen	w-full max-w-16 flex-col items-center bg-black-100 pt-3 pb-12 text-center text-xs text-white">
      <img src={logo.src} className="pb-10" alt="appertureLogo" />
      <div>
        <p className="text-xs-10 opacity-30">APP</p>
        <div className="mt-4 mb-10 flex h-8 w-8 items-center justify-center	rounded-full bg-yellow text-xs-14 font-bold">
          <p>ZA</p>
        </div>
      </div>
      <div>
        <p className="text-xs-10 opacity-30">EXPLORE</p>
        <div className="flex flex-col items-center gap-y-5 pt-5 ">
          <div className="duration-250 grid h-10 w-10 cursor-pointer place-items-center	rounded-lg bg-white bg-opacity-0 transition ease-in	 hover:bg-opacity-10 ">
            <div className="rotate-45 transform">
              <i className="ri-route-fill"></i>
            </div>
          </div>
          <div className="duration-250 grid h-10 w-10 cursor-pointer place-items-center	rounded-lg bg-white bg-opacity-0 transition ease-in	 hover:bg-opacity-10 ">
            <i className="ri-lightbulb-line"></i>
          </div>
          <div className="duration-250 grid h-10 w-10 cursor-not-allowed place-items-center	rounded-lg bg-white bg-opacity-0 transition ease-in	 hover:bg-opacity-10 ">
            <i className="ri-bookmark-line"></i>
          </div>
          <div className="-mt-4 rounded-sm bg-green p-1 text-xs-8 font-medium">
            Coming soon
          </div>
        </div>
      </div>
      <div className="duration-250 mt-auto grid h-10 w-10 cursor-pointer place-items-center	rounded-lg bg-white bg-opacity-0 transition ease-in	 hover:bg-opacity-10 ">
        <div>
          <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/logout`}>
            <i className="ri-logout-box-r-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
