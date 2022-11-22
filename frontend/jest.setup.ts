import '@testing-library/jest-dom';
import 'jest-canvas-mock';

jest.mock('@antv/g2', () => ({
  Chart: jest.fn(),
}));

Object.defineProperty(global.URL, 'createObjectURL', {
  value: () => {},
  writable: true,
});
