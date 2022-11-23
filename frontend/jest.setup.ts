import '@testing-library/jest-dom';
import 'jest-canvas-mock';

const mockChart = jest.fn();
mockChart.mockImplementation(() => {
  return {
    data: jest.fn(),
    scale: jest.fn(),
    tooltip: jest.fn(),
    annotation: jest.fn(() => ({ text: jest.fn() })),
    interval: jest.fn().mockImplementation(() => {
      return {
        position: jest.fn(() => ({ color: jest.fn() })),
      };
    }),
  };
});
jest.mock('@antv/g2', () => ({
  Chart: mockChart,
}));

window.HTMLElement.prototype.scrollIntoView = jest.fn();
