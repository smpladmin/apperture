import React from 'react';
import { createRoot } from 'react-dom/client';
import Database from './index';

const container = document.getElementById('index');
const root = createRoot(container);
root.render(<Database />);
