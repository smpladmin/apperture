import "remixicon/fonts/remixicon.css";
import logo from "../assets/images/apperture_white-icon.svg";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="w-full h-screen	max-w-{64px} pt-3 pb-12 flex flex-col items-center text-xs bg-aptBlack text-white text-center	max-w-4">
      <img src={logo.src} className="pb-10" alt="appertureLogo" />
      <div>
        <p className="opacity-30 text-xs-10">APP</p>
        <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 rounded-full	text-xs-14 font-bold mt-4 mb-10">
          <p>ZA</p>
        </div>
      </div>
      <div>
        <p className="opacity-30 text-xs-10">EXPLORE</p>
        <div className="pt-5 flex flex-col items-center gap-y-5 ">
          <div className="w-10 h-10 grid place-items-center rounded-lg cursor-pointer	transition ease-in duration-250 bg-white bg-opacity-0	 hover:bg-opacity-10 ">
            <div className="transform rotate-45">
              <i className="ri-route-fill"></i>
            </div>
          </div>
          <div className="w-10 h-10 grid place-items-center rounded-lg cursor-pointer	transition ease-in duration-250 bg-white bg-opacity-0	 hover:bg-opacity-10 ">
            <i className="ri-lightbulb-line"></i>
          </div>
          <div className="w-10 h-10 grid place-items-center rounded-lg cursor-not-allowed	transition ease-in duration-250 bg-white bg-opacity-0	 hover:bg-opacity-10 ">
            <i className="ri-bookmark-line"></i>
          </div>
          <div className="-mt-4 bg-aptGreen p-1 font-medium rounded-sm text-xs-8">
            Coming soon
          </div>
        </div>
      </div>
      <div className="mt-auto w-10 h-10 grid place-items-center rounded-lg cursor-pointer	transition ease-in duration-250 bg-white bg-opacity-0	 hover:bg-opacity-10 ">
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
