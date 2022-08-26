import React from 'react';
import 'remixicon/fonts/remixicon.css';
import { Input } from '@chakra-ui/react';
const Create = () => {
  return (
    <div className="lg:max-w-screen-xl lg:px-48 lg:pt-20">
      <div className="mb-11 grid h-9 w-9 place-content-center rounded-full border">
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
          rounded={'00.25rem'}
          fontSize={'md'}
          placeholder="Ex- Food Web App"
          className="py-4 px-3.5 text-base text-black"
          _placeholder={{
            fontSize: '1rem',
            lineHeight: '1.375rem',
            fontWeight: 400,
            color: 'grey.100',
          }}
        />
      </div>
      <button className="mt-10 grid w-72 place-content-center rounded-lg bg-black-100 p-4 text-base font-semibold text-white-100">
        Next
      </button>
    </div>
  );
};

export default Create;
