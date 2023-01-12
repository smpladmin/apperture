import '@testing-library/jest-dom';

const mockChart = jest.fn();
mockChart.mockImplementation(() => {
  return {
    data: jest.fn(),
    on: jest.fn(),
    scale: jest.fn(),
    tooltip: jest.fn(),
    axis: jest.fn(),
    annotation: jest.fn(() => ({ text: jest.fn(() => ({ text: jest.fn() })) })),
    interval: jest.fn().mockImplementation(() => {
      return {
        position: jest.fn(() => ({ color: jest.fn() })),
      };
    }),
    coordinate: jest.fn(() => ({ transpose: jest.fn() })),
    render: jest.fn(),
  };
});
jest.mock('@antv/g2', () => ({
  Chart: mockChart,
}));

jest.mock('@antv/g2plot', () => ({
  Line: jest.fn().mockImplementation(() => {
    return {
      render: jest.fn(),
    };
  }),
}));

window.HTMLElement.prototype.scrollIntoView = jest.fn();
