import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardBuilder from './DashboardBuilder.jsx' // <--- 1. Импортируем наш новый Билдер
// import './index.css' // (можете удалить эту строку, если не используете дефолтные стили)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DashboardBuilder /> {/* <--- 2. Рендерим его здесь */}
  </React.StrictMode>,
)