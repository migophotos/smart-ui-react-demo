import React, { useState, useEffect, useRef } from 'react';
import SmartWidget from './components/SmartWidget';
import './App.css';

// === БАЗА ЗНАНИЙ (ПРЕСЕТЫ ИЗ ВАШЕГО ORIGINAL HTML) ===
// В React гораздо удобнее хранить настройки галереи в виде массива объектов,
// а не писать HTML-код вручную для каждой карточки.
const GALLERY_PRESETS = {
  smartbar:[
    { label: '"Horizontal Bar"', opt: { orient: 'hor', type: 'discrete', thickness: 24, length: 120, gap: 9, varStrokeColor: '#008000', varFillColor: '#80ff80' } },
    { label: '"Vertical Bar"', opt: { orient: 'ver', type: 'discrete', aligning: 'up', thickness: 20, length: 120, gap: 9, varStrokeColor: '#008000', varFillColor: '#fffcd4' } },
    { label: '"Thresholds Bar"', opt: { thickness: 16, length: 120, valueRule: 'both', isFillStroke: 0, varStrokeColor: '#fdfffc', varFillColor: '#000000', isShowThr: 1 } },
    { label: '"Wide Fat Bar"', opt: { orient: 'hor', aligning: 'up', thickness: 78, length: 120, isFillBkg: 0, varStrokeColor: '#408080', varStrokeWidth: 2 } }
  ],
  smartpie:[
    { label: '"Relative"', opt: { type: 'rel', rotation: 180, radius: 45, isLegend: 0 } },
    { label: '"Flat"', opt: { type: '1.0', rotation: 180, radius: 45, isLegend: 0 } },
    { label: '"Donut"', opt: { type: 'donut', innerRadius: 25, radius: 45, isLegend: 0 } },
    { label: '"zWatch"', opt: { type: 'zwatch', radius: 45, isLegend: 0 } }
  ],
  smartpoligon:[
    { label: '"Polygon, 4"', opt: { anglesNumber: 4, valueRule: 'fill', colorRule: 'stroke', varStrokeWidth: 3, radius: 45 } },
    { label: '"Star, 4"', opt: { anglesNumber: 4, isStar: 1, rotation: 45, innerRadius: 30, valueRule: 'none', colorRule: 'fill', radius: 45 } },
    { label: '"Polygon, 5"', opt: { anglesNumber: 5, aligning: 'left', valueRule: 'fill', colorRule: 'stroke', varStrokeWidth: 3, radius: 45 } },
    { label: '"Star, 5"', opt: { anglesNumber: 5, isStar: 1, orient: 'ver', aligning: 'up', rotation: 36.5, innerRadius: 50, valueRule: 'none', colorRule: 'fill', radius: 45 } },
    { label: '"Polygon, 8"', opt: { anglesNumber: 8, orient: 'ver', aligning: 'up', varStrokeWidth: 3, valueRule: 'fill', colorRule: 'stroke', radius: 45 } }
  ]
};

// Универсальные тестовые данные для отрисовки примеров
const DEMO_TARGETS =[
  { uuid: "t1", value: 75, color: "#0096ff", legend: "Alpha" },
  { uuid: "t2", value: 45, parent: "t1", color: "#00f900", legend: "Beta" },
  { uuid: "t3", value: 30, parent: "t1", color: "#fffc79", legend: "Gamma" }
];

export default function FullBuilder() {
  const [activeWidget, setActiveWidget] = useState('smartbar');
  const [codeTab, setCodeTab] = useState('react');
  
  // Состояние текущего редактируемого графика в Центре
  const[widgetConfig, setWidgetConfig] = useState(GALLERY_PRESETS['smartbar'][0].opt);

  const optionsRef = useRef(null);

  // Смена виджета в верхнем меню
  const handleWidgetSwitch = (wName) => {
    setActiveWidget(wName);
    // При смене категории сразу загружаем первый пресет из этой категории
    if (GALLERY_PRESETS[wName] && GALLERY_PRESETS[wName].length > 0) {
      setWidgetConfig(GALLERY_PRESETS[wName][0].opt);
    } else {
      setWidgetConfig({});
    }
  };

  // Слушатель атрибутов с кастомных панелей (ваша магия из index.html)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          const paramName = target.getAttribute('param'); 
          let attrValue = target.getAttribute(mutation.attributeName);
          
          if (!paramName) return;

          if (attrValue === 'on' || attrValue === 'off') {
             attrValue = (attrValue === 'on') ? 1 : 0;
          } else if (!isNaN(Number(attrValue)) && attrValue !== '') {
             attrValue = Number(attrValue);
          }

          setWidgetConfig(prev => {
            if (prev[paramName] === attrValue) return prev;
            return { ...prev,[paramName]: attrValue };
          });
        }
      });
    });

    if (optionsRef.current) {
      observer.observe(optionsRef.current, {
        attributeFilter: ['value', 'state'], 
        attributeOldValue: false,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [activeWidget]); 


  // Генератор кода
  const renderCode = () => {
    const tag = `smart-ui-${activeWidget.replace('smart', '') === 'pgn' ? 'polygon' : activeWidget.replace('smart', '')}`;
    if (codeTab === 'react') {
      return `<SmartWidget \n  elementTag="${tag}" \n  id="demo-widget" \n  target={{ value: 75 }} \n  opt={${JSON.stringify(widgetConfig, null, 2).replace(/\n/g, '\n  ')}} \n/>`;
    }
    if (codeTab === 'json') {
      return JSON.stringify(widgetConfig, null, 2);
    }
    return `<!-- Select React or JSON format -->`;
  };

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr auto', backgroundColor: '#2b2b2b', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* === ВЕРХНЯЯ ПАНЕЛЬ (Иконки виджетов) === */}
      <div style={{ padding: '10px 20px', backgroundColor: '#333', borderBottom: '1px solid #111', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', marginRight: '40px', color: '#00ab06' }}>Smart UI Builder</h2>
        
        {['smarttooltip', 'smartpie', 'smartpolygon', 'smartbar', 'smartpalette', 'smartgauge'].map(w => (
          <button 
            key={w} onClick={() => handleWidgetSwitch(w)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', outline: 'none',
              opacity: activeWidget === w ? 1 : 0.4, transition: '0.3s' 
            }}
            title={`Настроить ${w}`}
          >
            
            <img src={`/images/${w.replace('smart', '')}_${activeWidget === w ? 'on' : 'off'}.svg`} alt={w} width="40" height="40" />
          </button>
        ))}
      </div>

      {/* === ЦЕНТРАЛЬНАЯ ЧАСТЬ (Галерея + Превью + Опции) === */}
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ: Галерея примеров (Замена вашему .widget-wrapper) */}
        <div style={{ width: '350px', padding: '15px', overflowY: 'auto', backgroundColor: '#222', borderRight: '1px solid #111' }}>
          <h3 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
            Галерея примеров
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {GALLERY_PRESETS[activeWidget] ? GALLERY_PRESETS[activeWidget].map((preset, idx) => (
              
              /* КАРТОЧКА ПРЕСЕТА */
              <div 
                key={idx} 
                onClick={() => setWidgetConfig(preset.opt)} // Клик перебрасывает опции в ЦЕНТР!
                style={{ 
                  backgroundColor: '#ccc', borderRadius: '8px', padding: '10px', 
                  cursor: 'pointer', textAlign: 'center', transition: 'background-color 0.3s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9ae65b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
              >
                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#333', fontWeight: 'bold' }}>{preset.label}</p>
                
                {/* Рендерим мини-копию виджета прямо в галерее */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                  <SmartWidget 
                    elementTag={`smart-ui-${activeWidget.replace('smart', '') === 'pgn' ? 'polygon' : activeWidget.replace('smart', '')}`}
                    id={`gal-${activeWidget}-${idx}`}
                    target={DEMO_TARGETS}
                    opt={{ ...preset.opt, role: 'demoMode', isRun: 0, isTooltip: 0, isAnimate: 0 }}
                  />
                </div>
              </div>

            )) : (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>
                Примеры для этого виджета пока не добавлены...
              </div>
            )}
          </div>
        </div>

        {/* ЦЕНТР: Главное превью редактируемого виджета */}
        <div style={{ flex: 1, backgroundColor: '#f5f2f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <h3 style={{ position: 'absolute', top: '20px', color: '#00ab06', fontSize: '24px', margin: 0 }}>
              {activeWidget.toUpperCase()} PREVIEW
            </h3>
            
            <SmartWidget 
              elementTag={`smart-ui-${activeWidget.replace('smart', '') === 'pgn' ? 'polygon' : activeWidget.replace('smart', '')}`}
              id="main-preview-widget"
              target={DEMO_TARGETS}
              opt={{ ...widgetConfig, radius: 120, role: 'demoMode', isRun: 0, isEmulate: 0 }}
            />
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Меню опций (Слушаются через MutationObserver) */}
        <div ref={optionsRef} style={{ width: '350px', backgroundColor: '#333', padding: '20px', overflowY: 'auto', borderLeft: '1px solid #111' }}>
          <h3 style={{ textTransform: 'uppercase', fontSize: '12px', color: '#888', borderBottom: '1px solid #555', paddingBottom: '10px' }}>Настройки</h3>
          
          {/* Слайдеры для SmartBar */}
          {activeWidget === 'smartbar' && (
            <>
              <div style={{ marginTop: '15px' }}><smart-ui-selector param="orient" title="Ориентация индикатора" value={widgetConfig.orient || 'hor'} valuelist="hor,ver" labellist="Горизонтально,Вертикально" image="images/align_text_off.svg"></smart-ui-selector></div>
              <div style={{ marginTop: '15px' }}><smart-ui-selector param="type" title="Тип индикатора" value={widgetConfig.type || 'solid'} valuelist="solid,discrete" labellist="Сплошной,Дискретный" image="images/align_text_off.svg"></smart-ui-selector></div>
              <div style={{ marginTop: '15px' }}><smart-ui-editslider param="thickness" title="Толщина индикатора" value={widgetConfig.thickness || 24} units="px" min="5" max="100" step="1" image="images/frame-opacity.svg"></smart-ui-editslider></div>
              <div style={{ marginTop: '15px' }}><smart-ui-colorbox param="varFillColor" title="Цвет фона" value={widgetConfig.varFillColor || '#80ff80'} image="images/select_color3_off.svg"></smart-ui-colorbox></div>
            </>
          )}

          {/* Слайдеры для SmartPie */}
          {activeWidget === 'smartpie' && (
            <>
              <div style={{ marginTop: '15px' }}><smart-ui-selector param="type" title="Тип пирога" value={widgetConfig.type || 'rel'} valuelist="rel,flat,donut,zwatch,1.0,1.1" labellist="Относительный,Плоский,Бублик,zWatch,1.0,1.1" image="images/align_text_off.svg"></smart-ui-selector></div>
              <div style={{ marginTop: '15px' }}><smart-ui-editslider param="innerRadius" title="Размер дырки бублика" value={widgetConfig.innerRadius || 0} units="%" min="0" max="90" step="5" image="images/frame-opacity.svg"></smart-ui-editslider></div>
              <div style={{ marginTop: '15px' }}><smart-ui-editslider param="rotation" title="Угол поворота" value={widgetConfig.rotation || -90} units="deg" min="-180" max="180" step="10" image="images/frame-opacity.svg"></smart-ui-editslider></div>
            </>
          )}

          {/* Слайдеры для SmartPolygon */}
          {activeWidget === 'smartpoligon' && (
            <>
              <div style={{ marginTop: '15px' }}><smart-ui-editslider param="anglesNumber" title="Количество углов" value={widgetConfig.anglesNumber || 4} units="" min="3" max="20" step="1" image="images/frame-opacity.svg"></smart-ui-editslider></div>
              <div style={{ marginTop: '15px' }}><smart-ui-selector param="isStar" title="Вид полигона" value={widgetConfig.isStar || 0} valuelist="1,0" labellist="Звезда,Полигон" image="images/align_text_off.svg"></smart-ui-selector></div>
              <div style={{ marginTop: '15px' }}><smart-ui-editslider param="innerRadius" title="Внутренний радиус звезды" value={widgetConfig.innerRadius || 50} units="%" min="10" max="90" step="5" image="images/frame-opacity.svg"></smart-ui-editslider></div>
              <div style={{ marginTop: '15px' }}><smart-ui-editslider param="varStrokeWidth" title="Толщина обводки" value={widgetConfig.varStrokeWidth || 2} units="px" min="0" max="15" step="1" image="images/border_width_off.svg"></smart-ui-editslider></div>
            </>
          )}
        </div>
      </div>

      {/* === 3. НИЖНЯЯ ПАНЕЛЬ (Генератор кода) === */}
      <div style={{ height: '200px', backgroundColor: '#1e1e1e', borderTop: '1px solid #000', display: 'flex' }}>
        
        {/* Кнопки вкладок (Замена вашего source-selector) */}
        <div style={{ width: '220px', backgroundColor: '#222', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Source Code</h3>
          <button onClick={() => setCodeTab('react')} style={{ padding: '10px', cursor: 'pointer', backgroundColor: codeTab === 'react' ? '#444' : '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', textAlign: 'left' }}>⚛️ React Component</button>
          <button onClick={() => setCodeTab('json')} style={{ padding: '10px', cursor: 'pointer', backgroundColor: codeTab === 'json' ? '#444' : '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', textAlign: 'left' }}>{`{ }`} JSON Format</button>
        </div>

        {/* Окно вывода кода (Замена вашего source-panel) */}
        <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
          <pre style={{ color: '#00ff00', margin: 0, fontSize: '13px', fontFamily: 'Consolas, Monaco, monospace' }}>
            {renderCode()}
          </pre>
        </div>
      </div>

    </div>
  );
}