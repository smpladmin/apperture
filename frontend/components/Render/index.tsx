import { AppertureContext } from '@lib/contexts/appertureContext';
import { ReactNode, useEffect, useState } from 'react';
import { useContext } from 'react';

const Render = ({
  children,
  on,
}: {
  children: ReactNode;
  on: 'mobile' | 'desktop';
}) => {
  const ctx = useContext(AppertureContext);
  const [render, setRender] = useState(false);
  useEffect(() => {
    // for mobile screens
    if (on === 'mobile' && ctx.device.isMobile) {
      setRender(true);
    }

    // for desktop screens
    if (on === 'desktop' && !ctx.device.isMobile) {
      setRender(true);
    }
  }, [on, ctx.device.isMobile]);

  return <>{render ? children : null}</>;
};

export default Render;
