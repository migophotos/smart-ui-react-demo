// src/utils/exporter.js

export const exportToHTML = (canvasWidgets) => {
  let cssBlock = '';
  let htmlBlock = '';
  let jsBlock = '';

  canvasWidgets.forEach(w => {
    // 1. Генерируем CSS-переменные из объекта opt
    const alias = w.tag.replace('smart-ui-', 'st').replace('polygon', 'pgn'); 
    let cssVars = '';
    for (const [key, value] of Object.entries(w.opt)) {
      // Превращаем camelCase в kebab-case (varFillColor -> var-fill-color)
      const cssKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      cssVars += `      --${alias}-${cssKey}: ${value};\n`;
    }
    cssBlock += `    #${w.id} {\n${cssVars}    }\n`;

    // 2. Генерируем HTML-разметку с абсолютными координатами
    htmlBlock += `
    <div style="position: absolute; left: ${w.x}px; top: ${w.y}px;">
      <${w.tag} id="${w.id}" class="${w.id}"></${w.tag}>
    </div>`;

    // 3. Генерируем JS для инициализации данных (targets)
    // Убираем demoMode, чтобы графики слушались наших данных
    const targetData = JSON.stringify(w.target);
    jsBlock += `
      window.SmartHeap.get('${w.id}').update({
        ${Array.isArray(w.target) ? `targets: ${targetData}` : `target: ${targetData}`}
      });`;
  });

  // Собираем всё в единый HTML-документ
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartUI Exported Dashboard</title>
  
  <!-- Подключаем вашу библиотеку -->
  <script src="js/smartwidgets.js"></script>
  <script src="js/smartbar.js"></script>
  <script src="js/smartpie.js"></script>
  <script src="js/smartpolygon.js"></script>
  <script src="js/smartgauge.js"></script>
  <script src="js/smartpalette.js"></script>
  <script src="js/smarttooltip.js"></script>

  <style>
    body { 
      background-color: #2b2b2b; /* Или любой другой цвет фона */
      color: white; 
      margin: 0; 
      position: relative; 
      height: 100vh; 
      overflow: hidden; 
    }
${cssBlock}
  </style>
</head>
<body>
${htmlBlock}

  <script>
    // Инициализируем данные после загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
${jsBlock}
    });
  </script>
</body>
</html>`;

  // Создаем файл в памяти и имитируем клик по ссылке для скачивания
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'smartui_dashboard.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};