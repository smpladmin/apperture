import { useEffect, useRef } from 'react';

const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    //assign the value of ref to the argument
    ref.current = value;
  }, [value]);
  return ref.current;
};
export default usePrevious;
