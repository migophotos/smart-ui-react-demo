import React, { useState, useEffect, useRef } from 'react';
import SmartWidget from './components/SmartWidget';
import './App.css';

export default function AppCustom() {
  const panelRef = useRef(null);

  const [config, setConfig] = useState({
    orient: 'hor',
    type: 'discrete',
    thickness: 24,
    length: 300,
    varFillColor: '#80ff80',
    varStrokeColor: '#008000',
    isShadow: 1,
    isAnimate: 1
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          
          const paramName = target.getAttribute('param'); 
          if (!paramName) return;

          let attrValue = target.getAttribute(mutation.attributeName);
          
          if (attrValue === 'on' || attrValue === 'off') {
             attrValue = (attrValue === 'on') ? 1 : 0;
          } else if (!isNaN(Number(attrValue)) && attrValue !== '') {
             attrValue = Number(attrValue);
          }

          setConfig(prev => {
            if (prev[paramName] === attrValue) return prev;
            return { ...prev,[paramName]: attrValue };
          });
        }
      });
    });

    if (panelRef.current) {
      observer.observe(panelRef.current, {
        attributeFilter:['value', 'state'], 
        attributeOldValue: false,
        subtree: true
      });
    }

    return () => observer.disconnect();
  },
  []);

  const[metricValue, setMetricValue] = useState(65);

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: '#2b2b2b', color: '#fff', height: '100vh', fontFamily: 'Helvetica, sans-serif' }}>
      
      {/* CUSTOM SIDE PANEL */}
      {/* Вешаем panelRef сюда, чтобы MutationObserver следил за всеми детьми этого div */}
      <div ref={panelRef} style={{ width: '350px', backgroundColor: '#333', padding: '20px', borderRadius: '8px', overflowY: 'auto' }}>
        <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', textTransform: 'uppercase' }}>Параметры (Custom UI)</h3>
        
        <div style={{ marginTop: '15px' }}>
          <smart-ui-selector param="orient" title="Ориентация индикатора" value={config.orient} valuelist="hor,ver" labellist="Горизонтально,Вертикально" image="images/align_text_off.svg"></smart-ui-selector>
        </div>

        <div style={{ marginTop: '15px' }}>
          <smart-ui-selector param="type" title="Тип индикатора" value={config.type} valuelist="solid,discrete" labellist="Сплошной,Дискретный" image="images/align_text_off.svg"></smart-ui-selector>
        </div>

        <div style={{ marginTop: '15px' }}>
          <smart-ui-editslider param="thickness" title="Толщина индикатора" value={config.thickness} units="px" min="5" max="100" step="1" image="images/frame-opacity.svg"></smart-ui-editslider>
        </div>

        <div style={{ marginTop: '15px' }}>
          <smart-ui-editslider param="length" title="Длина индикатора" value={config.length} units="px" min="50" max="600" step="10" image="images/frame-opacity.svg"></smart-ui-editslider>
        </div>

        <div style={{ marginTop: '15px' }}>
          <smart-ui-colorbox param="varFillColor" title="Цвет фона" value={config.varFillColor} image="images/select_color3_off.svg"></smart-ui-colorbox>
        </div>

        <div style={{ marginTop: '15px' }}>
          <smart-ui-colorbox param="varStrokeColor" title="Цвет обводки" value={config.varStrokeColor} image="images/select_color3_off.svg"></smart-ui-colorbox>
        </div>

        <div style={{ marginTop: '15px' }}>
          <smart-ui-checkbox param="isShadow" title="Отбрасывать тень" state={config.isShadow === 1 ? 'on' : 'off'} image="images/is_shadow_off.svg" iw="65" ih="22.5" imageOn="images/switch_on.svg" imageOff="images/switch_off.svg"></smart-ui-checkbox>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <smart-ui-checkbox param="isAnimate" title="Разрешить анимацию" state={config.isAnimate === 1 ? 'on' : 'off'} image="images/is_shadow_off.svg" iw="65" ih="22.5" imageOn="images/switch_on.svg" imageOff="images/switch_off.svg"></smart-ui-checkbox>
        </div>

        {/* Нативный ползунок для проверки реактивности данных */}
        <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#444', borderRadius: '4px', border: '1px solid #555' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>Тестовое значение (Value): {metricValue}</label>
          <input type="range" min="0" max="100" value={metricValue} onChange={(e) => setMetricValue(Number(e.target.value))} style={{ width: '100%' }}/>
        </div>
      </div>

      {/* WIDGET PREVIEW */}
      <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <SmartWidget 
          elementTag="smart-ui-bar" 
          id="bar-custom" 
          target={{ value: String(metricValue) }} 
          opt={{ ...config, role: 'demoMode', isRun: 0, isEmulate: 0, position: 'cd' }} 
        />
      </div>

    </div>
  );
}