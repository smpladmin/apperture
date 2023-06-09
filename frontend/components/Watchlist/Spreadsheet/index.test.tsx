import { Provider } from '@lib/domain/provider';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import SavedSheets from '.';

describe('list saved sheets', () => {
  it('should be able to navigate to create page on clicking new sheet button', () => {
    const router = createMockRouter({
      pathname: '/analytics/workbook/list',
      query: { dsId: '63d0a7bfc636cee15d81f579' },
    });
    render(
      <RouterContext.Provider value={router}>
        <SavedSheets provider={Provider.MIXPANEL} />
      </RouterContext.Provider>
    );

    const newSheetButton = screen.getByTestId('new-sheet');
    fireEvent.click(newSheetButton);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/analytics/workbook/create/[dsId]',
      query: { dsId: '63d0a7bfc636cee15d81f579' },
    });
  });
});
