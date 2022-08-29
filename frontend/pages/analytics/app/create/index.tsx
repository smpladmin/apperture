import { useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import { Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { addApp } from '../../../../lib/services/appService';

const Create = () => {
  const [appName, setAppName] = useState<string>('');
  const router = useRouter();

  const handleNextClick = async () => {
    try {
      await addApp(appName);
      router.push('/analytics/app/integrate');
    } catch (err) {
      console.log(err);
    }
  };
  const handleGoBack = (): void => router.back();

  return (
    <div className="flex h-screen flex-col justify-between p-4 lg:h-auto lg:max-w-screen-xl lg:px-48 lg:pt-20">
      <div>
        <div
          tabIndex={0}
          className="mb-11 flex h-9 w-9 items-center justify-center rounded-full border"
          onClick={handleGoBack}
        >
          <i className="ri-close-fill"></i>
        </div>
        <div className="sm:w-full lg:max-w-3xl">
          <p className="text-grey-200 pb-6 text-xs-14 font-medium">
            Step 1 of 3
          </p>
          <h2 className="pb-8 text-[1.74rem] font-semibold leading-[2.125rem] lg:pb-10 lg:text-[3.5rem] lg:leading-[4.125rem]">
            What would you like to name this application?
          </h2>
          <Input
            size={'lg'}
            width={[
              '100%', // base
              '100%', // 480px upwards
              '31.25rem', // 768px upwards
            ]}
            bg={'white.200'}
            rounded={'0.25rem'}
            fontSize={['xs,md']}
            placeholder="Ex- Food Web App"
            className="py-4 px-3.5 text-base text-black"
            _placeholder={{
              fontSize: '1rem',
              lineHeight: '1.375rem',
              fontWeight: 400,
              color: 'grey.100',
            }}
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
        </div>
      </div>
      <button
        className="lg-72 mt-10 flex items-center justify-center rounded-lg bg-black-100 p-4 text-base font-semibold text-white-100 disabled:pointer-events-none disabled:bg-grey sm:w-full lg:w-72"
        disabled={!appName}
        onClick={handleNextClick}
      >
        Next
      </button>
    </div>
  );
};

export default Create;
