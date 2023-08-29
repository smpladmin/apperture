import { useEffect, useRef } from 'react';
import { VariableSizeGrid } from 'react-window';

export function useRespondToStateChange(state: any) {
  const ref = useRef<VariableSizeGrid>();

  useEffect(() => {
    if (ref.current) {
      ref.current?.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true,
      });
    }
  }, [state]);

  return ref;
}
