import React from 'react'
import ReactDOM from 'react-dom/client'
// import AppCustom from './AppCustom.jsx' // <--- Прошлые версии можно закомментировать
import FullBuilder from './FullBuilder.jsx' // <--- 1. ИМПОРТИРУЕМ НАШ НОВЫЙ БИЛДЕР

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FullBuilder /> {/* <--- 2. ЗАПУСКАЕМ ЕГО ЗДЕСЬ! */}
  </React.StrictMode>,
)