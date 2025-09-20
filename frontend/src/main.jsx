import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Thêm BrowserRouter ở đây
import App from './App.jsx';
// Giả sử bạn có file index.css
// import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- Router cấp cao nhất bao bọc toàn bộ ứng dụng */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
