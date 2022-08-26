import { useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import { Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const Create = () => {
  const [appName, setAppName] = useState<string>('');
  const router = useRouter();

  const handleNextClick = (): void => {
    // api call
    router.push('/analytics/app/integrate');
  };
  const handleGoBack = (): void => router.back();

  return (
    <div className="px-48 pt-20 lg:max-w-screen-xl">
      <div
        tabIndex={0}
        className="mb-11 flex h-9 w-9 items-center justify-center rounded-full border"
        onClick={handleGoBack}
      >
        <i className="ri-close-fill"></i>
      </div>
      <div className="max-w-3xl">
        <p className="text-grey-200 pb-6 text-xs-14 font-medium">Step 1 of 3</p>
        <h2 className="pb-10 text-[3.5rem] font-semibold leading-[4.125rem]">
          What would you like to name this application?
        </h2>
        <Input
          size={'lg'}
          w={100}
          bg={'white.200'}
          rounded={'0.25rem'}
          fontSize={'md'}
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
      {/* to decide whther to wrap in form or wrap inside div to make key board accessible*/}
      <button
        className="mt-10 flex w-72 items-center justify-center rounded-lg bg-black-100 p-4 text-base font-semibold text-white-100 disabled:pointer-events-none disabled:bg-grey"
        disabled={!appName}
        onClick={handleNextClick}
      >
        Next
      </button>
    </div>
  );
};

export default Create;
