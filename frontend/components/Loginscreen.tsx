import styles from "../components/Loginscreen.module.css";
import Image from "next/image";
import logo from "../assets/images/Logo_login.svg";
import glogo from "../assets/images/Google_login.svg";
import Link from "next/link";


const Loginscreen = () => {
  return (
    <div className="bg-black text-white h-screen p-8">
      <div className="h-full flex flex-col justify-between lg:ml-45 md:mx-36">
        <div className="mt-25 md:mt-32">
          <div className={"relative h-25 w-25 md:w-30 md:h-30 mb-3"}>
            <Image src={logo} layout="fill" />
          </div>
          <h1 className="mt-12 font-normal text-[34px] leading-[42px] md:text-[56px] md:leading-[65px]">
            Product Analytics <br /> for everyone
          </h1>
          <p className="mt-4 underline font-normal text-[12px] md:text-[18px] leading-[22px] text-grey">
            Terms of use
          </p>
        </div>
        <div className="flex flex-col mt-24 mb-2 gap-6 md:max-w-[565px] items-center">
          <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/login`}>
            <div className="bg-white text-black-100 font-semibold text-[20px] leading-[22px] rounded-lg flex justify-center items-center gap-6 p-6 w-full cursor-pointer">
              <Image src={glogo} />Sign up with Google
            </div>
          </Link>
          <p className="font-normal text-[20px] leading-[22px] text-grey">
            Already a user? <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/login`}>
                <span className="text-white font-medium underline cursor-pointer">Log in</span>
              </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loginscreen;
