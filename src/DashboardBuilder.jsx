/**
 * SmartUI Dashboard Builder
 */

import React, { useState, useEffect, useRef } from 'react';
import SmartWidget from './components/SmartWidget';
import SettingsPanel from './components/SettingsPanel'; // <-- ДОБАВЛЕНО
import { exportToHTML } from './utils/exporter';

// === ПОМОЩНИК ДЛЯ ФОРМАТИРОВАНИЯ ДАННЫХ ===
// SmartBar и SmartPolygon ждут {} (Object)
// SmartPie и SmartGauge ждут[] (Array)
const getDemoTarget = (tag, value = 65) => {
  if (tag === 'smart-ui-bar' || tag === 'smart-ui-polygon') {
    return { uuid: "t1", value: value, color: "#00ab06", state: "1" };
  }
  return[
    { uuid: "t1", value: value, color: "#0096ff", legend: "Val A", state: "1" },
    { uuid: "t2", value: 100 - value, parent: "t1", color: "#fffc79", legend: "Val B", state: "2" },
    { uuid: "s1", value: value, color: "#ff0000", legend: "Scale 1" },
    { uuid: "s2", value: value / 2, color: "#00ff00", legend: "Scale 2" }
  ];
};
// ==========================================
// МИКРО-КОМПОНЕНТ: Живое превью виджета
// ==========================================
const WidgetPreview = ({ preset, contextId, onDragStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const previewOpt = { ...preset.opt };
  
  previewOpt.role = ''; // Убираем 'demoMode', чтобы не срабатывали старые костыли
  previewOpt.isTooltip = 0;
  previewOpt.isShadow = 0;
  previewOpt.isLegend = 0; 
  previewOpt.isLink = 0; // Блокируем клики внутри SVG
  if (preset.tag === 'smart-ui-bar') previewOpt.scalePosition = 'none';

  previewOpt.isRun = isHovered ? 1 : 0;
  previewOpt.isEmulate = isHovered ? 1 : 0;
  previewOpt.interval = 500; // Эмуляция стартует моментально!

  const isBar = preset.tag === 'smart-ui-bar';
  const isVer = previewOpt.orient === 'ver';
  const boxW = isBar ? (isVer ? 6 : 30) : 30;
  const boxH = isBar ? (isVer ? 30 : 6) : 30;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, preset)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        backgroundColor: isHovered ? '#555' : '#333',
        borderRadius: '6px',
        transition: 'background-color 0.2s',
        border: '1px solid #444'
      }}
      title={preset.label}
    >
      <div style={{ width: `${boxW}px`, height: `${boxH}px`, pointerEvents: 'none' }}>
        <SmartWidget
          elementTag={preset.tag}
          id={`preview-${contextId}`}
          target={getDemoTarget(preset.tag, 65)} // <--- Используем хелпер!
          opt={previewOpt}
        />
      </div>
    </div>
  );
};

// ==========================================
// ГЛАВНЫЙ КОМПОНЕНТ: БИЛДЕР
// ==========================================
export default function DashboardBuilder() {
  const [builderConfig, setBuilderConfig] = useState(null); 
  
  // 1. Initialize widgets from localStorage if available
const [widgets, setWidgets] = useState(() => {
    try {
      const cached = localStorage.getItem('smartui_dashboard');
      return cached ? JSON.parse(cached) : [];
    } catch(e) {
      return[];
    }
  });

  const [selectedId, setSelectedId] = useState(null);       
  const [recentWidgets, setRecentWidgets] = useState([]);   
  const[openCategory, setOpenCategory] = useState(null);
  const [resizing, setResizing] = useState(null);
  const canvasRef = useRef(null);

  // 2. Save to localStorage every time 'widgets' array changes
  useEffect(() => {
    localStorage.setItem('smartui_dashboard', JSON.stringify(widgets));
  }, [widgets]);

  // 3. ASYNC INITIALIZATION
  useEffect(() => {
    fetch('/builder-config.json')
      .then(res => res.json())
      .then(data => {
        const parsedWidgets = data.widgets.map(w => {
          let opt = {};
          try {
            const optArr = w.preset.split('-');
            
            // УНИВЕРСАЛЬНЫЙ ПАРСЕР: Спрашиваем у браузера атрибуты Web Component'а!
            const elementClass = customElements.get(w.tag);
            if (elementClass && elementClass.observedAttributes) {
              const props = elementClass.observedAttributes; 
              let index = 1;
              for (let prop of props) {
                if (optArr[index] && optArr[index] !== '.') {
                  // Переводим kebab-case в camelCase (var-fill-color -> varFillColor)
                  const camelProp = prop.replace(/[-:]([a-z])/g, (token) => token[1].toUpperCase());
                  let val = optArr[index];
                  // Конвертируем в числа там, где это нужно
                  if (!isNaN(Number(val)) && val !== '') val = Number(val);
                  opt[camelProp] = val;
                }
                index++;
              }
            } else {
              console.warn(`Компонент ${w.tag} еще не зарегистрирован в браузере.`);
            }
          } catch (e) {
            console.error("Ошибка парсинга пресета:", w.label, e);
          }

          const isBar = w.tag === 'smart-ui-bar';
          const defaultIdeal = isBar ? { width: 120, height: 30 } : { width: 100, height: 100 };
          return { ...w, opt: opt || {}, box_size: w.box_size || { ideal: defaultIdeal } };
        });

        setBuilderConfig({ ...data, widgets: parsedWidgets });
        if (data.categories && data.categories.length > 0) setOpenCategory(data.categories[0].id);
      })
      .catch(err => console.error("Failed to load builder-config.json:", err));
  },[]);

  // Update specific property of the selected widget
  const handleUpdateProperty = (key, value) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === selectedId) {
        return { ...w, opt: { ...w.opt, [key]: value } };
      }
      return w;
    }));
  };

// === МАГИЯ ИЗМЕНЕНИЯ РАЗМЕРОВ (RESIZE) ===
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;

      setWidgets(prev => prev.map(w => {
        if (w.id !== resizing.id) return w;

        let newW = resizing.startW;
        let newH = resizing.startH;
        let newX = resizing.startWidgetX;
        let newY = resizing.startWidgetY;

        // Высчитываем новые координаты в зависимости от того, за какой край тянем
        if (resizing.handle.includes('e')) newW += dx;
        if (resizing.handle.includes('s')) newH += dy;
        if (resizing.handle.includes('w')) { newW -= dx; newX += dx; }
        if (resizing.handle.includes('n')) { newH -= dy; newY += dy; }

        // Ограничитель: элемент не может быть меньше 20x20 пикселей
        if (newW < 20) { newW = 20; if (resizing.handle.includes('w')) newX = resizing.startWidgetX + resizing.startW - 20; }
        if (newH < 20) { newH = 20; if (resizing.handle.includes('n')) newY = resizing.startWidgetY + resizing.startH - 20; }

        // Синхронизируем математику графиков (радиусы/длины) с новой коробкой!
        const newOpt = { ...w.opt };
        if (w.tag === 'smart-ui-bar') {
          const isVer = newOpt.orient === 'ver';
          newOpt.length = isVer ? newH : newW;
          newOpt.thickness = isVer ? newW : newH;
        } else {
          newOpt.radius = Math.min(newW, newH) / 2;
        }

        return { 
          ...w, x: newX, y: newY, opt: newOpt, 
          box_size: { ...w.box_size, ideal: { width: newW, height: newH } } 
        };
      }));
    };

    const handleMouseUp = () => setResizing(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const startResize = (e, widget, handle) => {
    e.stopPropagation();
    e.preventDefault(); 
    setResizing({
      id: widget.id, handle,
      startX: e.clientX, startY: e.clientY,
      startW: widget.box_size.ideal.width, startH: widget.box_size.ideal.height,
      startWidgetX: widget.x, startWidgetY: widget.y
    });
  };

  const getHandleStyle = (handle) => {
    const base = { position: 'absolute', width: '8px', height: '8px', backgroundColor: '#fff', border: '1px solid #00ab06', zIndex: 100 };
    if (handle.includes('n')) base.top = '-4px';
    if (handle.includes('s')) base.bottom = '-4px';
    if (handle.includes('w')) base.left = '-4px';
    if (handle.includes('e')) base.right = '-4px';
    if (handle === 'n' || handle === 's') { base.left = '50%'; base.transform = 'translateX(-50%)'; base.cursor = 'ns-resize'; }
    if (handle === 'w' || handle === 'e') { base.top = '50%'; base.transform = 'translateY(-50%)'; base.cursor = 'ew-resize'; }
    if (handle === 'nw' || handle === 'se') base.cursor = 'nwse-resize';
    if (handle === 'ne' || handle === 'sw') base.cursor = 'nesw-resize';
    return base;
  };

  const handleDragStartLibrary = (e, preset) => {
    e.dataTransfer.setData('new_widget', JSON.stringify(preset));
  };

  const handleDragStartCanvas = (e, id, currentX, currentY) => {
    e.stopPropagation();
    e.dataTransfer.setData('move_widget', JSON.stringify({ id, offsetX: e.clientX - currentX, offsetY: e.clientY - currentY }));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - canvasRect.left;
    const dropY = e.clientY - canvasRect.top;

    const newWidgetData = e.dataTransfer.getData('new_widget');
    if (newWidgetData) {
      const preset = JSON.parse(newWidgetData);
      const newId = `wdg-${Date.now()}`;
      
      const idealW = preset.box_size?.ideal?.width || 50;
      const idealH = preset.box_size?.ideal?.height || 50;

      const newWidget = {
        id: newId,
        tag: preset.tag,
        x: dropX - (idealW / 2), 
        y: dropY - (idealH / 2),
        opt: preset.opt,
        box_size: preset.box_size,
        target: getDemoTarget(preset.tag, 75) // <--- Используем хелпер!
      };

      setWidgets(prev => [...prev, newWidget]);
      setSelectedId(newId);
      setRecentWidgets(prev =>[preset, ...prev.filter(p => p.label !== preset.label)].slice(0, 8));
    }

    const moveWidgetData = e.dataTransfer.getData('move_widget');
    if (moveWidgetData) {
      const { id, offsetX, offsetY } = JSON.parse(moveWidgetData);
      setWidgets(prev => prev.map(w => w.id === id ? { ...w, x: e.clientX - offsetX, y: e.clientY - offsetY } : w));
    }
  };

  const handleSizeChange = (width, height) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== selectedId) return w;
      return { ...w, box_size: { ...w.box_size, ideal: { width, height } } };
    }));
  };

  if (!builderConfig) {
    return <div style={{ color: '#fff', padding: '50px', backgroundColor: '#2b2b2b', height: '100vh' }}>Loading Dashboard Engine...</div>;
  }

  const selectedWidget = widgets.find(w => w.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      
      {/* --- TOP BAR --- */}
      <div style={{ height: '70px', backgroundColor: '#333', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #000', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 10 }}>
        <h2 style={{ margin: 0, color: '#00ab06', marginRight: '40px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>SmartUI IDE</h2>
        
        <div style={{ display: 'flex', gap: '15px', flex: 1, overflowX: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>RECENT:</span>
          {recentWidgets.length === 0 && <span style={{ fontSize: '12px', color: '#555' }}>Drag widgets from library...</span>}
          {recentWidgets.map((r, i) => (
            <WidgetPreview key={i} preset={r} contextId={`recent-${i}`} onDragStart={handleDragStartLibrary} />
          ))}
        </div>

        <button onClick={() => exportToHTML(widgets)} style={{ padding: '8px 16px', backgroundColor: '#00ab06', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
          Export HTML
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* --- LEFT PANEL: ACCORDION LIBRARY --- */}
        <div style={{ width: '280px', backgroundColor: '#2b2b2b', borderRight: '1px solid #111', overflowY: 'auto', padding: '15px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: 0 }}>Library</h3>
          
          {builderConfig.categories.map(category => {
            const catWidgets = builderConfig.widgets.filter(w => w.category === category.id);
            if (catWidgets.length === 0) return null;

            const isOpen = openCategory === category.id;

            return (
              <div key={category.id} style={{ marginBottom: '8px' }}>
                <div 
                  onClick={() => setOpenCategory(isOpen ? null : category.id)}
                  style={{ 
                    padding: '10px', backgroundColor: isOpen ? '#444' : '#333', borderRadius: '4px', cursor: 'pointer', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s', border: '1px solid #222'
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#ddd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {category.icon && <img src={category.icon} alt="" width="16" height="16" />}
                    {category.title}
                  </span>
                  <span style={{ fontSize: '11px', color: '#aaa', backgroundColor: '#222', padding: '2px 8px', borderRadius: '12px' }}>
                    {catWidgets.length}
                  </span>
                </div>
                
                {isOpen && (
                  <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                    gap: '8px', marginTop: '8px', padding: '10px', backgroundColor: '#222', borderRadius: '4px' 
                  }}>
                    {catWidgets.map((widgetDef, idx) => (
                      <WidgetPreview key={idx} preset={widgetDef} contextId={`acc-${category.id}-${idx}`} onDragStart={handleDragStartLibrary} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- CENTER PANEL: CANVAS DROP ZONE --- */}
        <div 
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => setSelectedId(null)} 
          style={{ flex: 1, backgroundColor: '#f5f2f0', position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
{widgets.map(w => (
            <div
              key={w.id}
              draggable={!resizing} // Отключаем drag самого окна, если мы тянем за угол!
              onDragStart={(e) => handleDragStartCanvas(e, w.id, w.x, w.y)}
              onClick={(e) => { e.stopPropagation(); setSelectedId(w.id); }}
              style={{
                position: 'absolute',
                left: w.x,
                top: w.y,
                width: `${w.box_size.ideal.width}px`, 
                height: `${w.box_size.ideal.height}px`,
                cursor: selectedId === w.id ? 'default' : 'grab',
                border: selectedId === w.id ? '1px solid #00ab06' : '1px dashed transparent',
                transition: resizing ? 'none' : 'border 0.2s', // Отключаем задержку при ресайзе
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              {/* === КВАДРАТИКИ ДЛЯ ИЗМЕНЕНИЯ РАЗМЕРОВ (Только для выделенного) === */}
              {selectedId === w.id &&['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(handle => (
                <div 
                  key={handle}
                  onMouseDown={(e) => startResize(e, w, handle)}
                  style={getHandleStyle(handle)}
                />
              ))}

              <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <SmartWidget elementTag={w.tag} id={w.id} target={w.target} opt={{ ...w.opt, role: '', isRun: 0, isTooltip: 0, isLink: 0 }} />
              </div>
            </div>
          ))}          
          {widgets.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#999', fontSize: '18px', pointerEvents: 'none' }}>
              Перетащите виджеты из библиотеки на холст
            </div>
          )}
        </div>

{/* --- RIGHT PANEL: SETTINGS --- */}
        <div style={{ width: '320px', backgroundColor: '#2b2b2b', borderLeft: '1px solid #111', padding: '15px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: 0 }}>Properties</h3>
          
          {!selectedWidget ? (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '50px', fontSize: '13px' }}>
              Select a widget on the canvas
            </div>
          ) : (
            <div>
              {/* Bounding Box Controls */}
              <div style={{ padding: '10px', backgroundColor: '#3a3a3a', borderRadius: '6px', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#ccc', marginBottom: '8px', textTransform: 'uppercase' }}>Canvas Box Size (px):</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: '#888' }}>Width</span>
                    <input type="number" value={selectedWidget.box_size.ideal.width} onChange={e => handleSizeChange(Number(e.target.value), selectedWidget.box_size.ideal.height)} style={{ width: '100%', padding: '4px', background: '#222', color: '#fff', border: '1px solid #555' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: '#888' }}>Height</span>
                    <input type="number" value={selectedWidget.box_size.ideal.height} onChange={e => handleSizeChange(selectedWidget.box_size.ideal.width, Number(e.target.value))} style={{ width: '100%', padding: '4px', background: '#222', color: '#fff', border: '1px solid #555' }} />
                  </div>
                </div>
              </div>
              
              {/* Test Data Control */}
              <div style={{ padding: '15px', backgroundColor: '#3a3a3a', borderRadius: '6px', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#ccc', marginBottom: '5px', textTransform: 'uppercase' }}>Data Value:</label>
                <input 
                  type="range" min="0" max="100" style={{ width: '100%', cursor: 'pointer' }}
                  value={Array.isArray(selectedWidget.target) ? selectedWidget.target[0].value : selectedWidget.target.value} 
                  onChange={e => {
                    const newVal = Number(e.target.value);
                    setWidgets(prev => prev.map(w => {
                      if (w.id === selectedId) {
                        let newTarget = Array.isArray(w.target) ? [...w.target] : { ...w.target };
                        if (Array.isArray(newTarget)) newTarget[0] = { ...newTarget[0], value: newVal };
                        else newTarget.value = newVal;
                        return { ...w, target: newTarget };
                      }
                      return w;
                    }));
                  }} 
                />
              </div>

              {/* DYNAMIC NATIVE PROPERTIES PANEL */}
              <SettingsPanel widget={selectedWidget} onChange={handleUpdateProperty} />
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}