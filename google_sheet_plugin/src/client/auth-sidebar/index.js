import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthSidebar from './index';

const container = document.getElementById('index');
const root = createRoot(container);
root.render(<AuthSidebar />);
