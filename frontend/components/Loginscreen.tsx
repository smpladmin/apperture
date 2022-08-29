import Image from 'next/image';
import logo from '../assets/images/Logo_login.svg';
import glogo from '../assets/images/Google_login.svg';
import Link from 'next/link';

const Loginscreen = () => {
  return (
    <div className="h-screen bg-black p-8 text-white">
      <div className="flex h-full flex-col justify-between md:mx-36 lg:ml-45">
        <div className="md:mt-32">
          <div className={'relative mb-3 h-25 w-25 md:h-30 md:w-30'}>
            <Image src={logo} layout="fill" alt="Apperture logo" />
          </div>
          <h1 className="mt-12 text-[34px] font-normal leading-[42px] md:text-[56px] md:leading-[65px]">
            Product Analytics <br /> for everyone
          </h1>
          <p className="mt-4 text-xs font-normal leading-[22px] text-grey underline md:text-lg">
            Terms of use
          </p>
        </div>
        <div className="mt-8 lg:mt-24 mb-2 flex flex-col items-center gap-6 md:max-w-[565px]">
          <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/login`}>
            <div className="flex w-full cursor-pointer items-center justify-center gap-6 rounded-lg bg-white p-6 text-[20px] font-semibold leading-[22px] text-black-100">
              <Image src={glogo} alt="Google logo" />
              Sign up with Google
            </div>
          </Link>
          <p className="text-[20px] font-normal leading-[22px] text-grey">
            Already a user?{' '}
            <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/login`}>
              <span className="cursor-pointer font-medium text-white underline">
                Log in
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loginscreen;
