import React, { useState } from 'react';
import SmartWidget from './components/SmartWidget';

export default function AppNative() {
  const [config, setConfig] = useState({
    orient: 'hor',
    type: 'solid',
    thickness: 20,
    varFillColor: '#ffcd88',
    isShadow: 1
  });

  const handleChange = (param, value) => {
    setConfig(prev => ({ ...prev, [param]: value }));
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: '#2b2b2b', color: '#fff', height: '100vh' }}>
      
      {/* NATIVE SIDE PANEL */}
      <div style={{ width: '300px', backgroundColor: '#444', padding: '20px', borderRadius: '8px' }}>
        <h3>Нативный React UI</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px' }}>Ориентация</label>
          <select style={{ width: '100%' }} value={config.orient} onChange={(e) => handleChange('orient', e.target.value)}>
            <option value="hor">Горизонтально</option>
            <option value="ver">Вертикально</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px' }}>Толщина ({config.thickness}px)</label>
          <input type="range" min="5" max="100" style={{ width: '100%' }} value={config.thickness} onChange={(e) => handleChange('thickness', Number(e.target.value))} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px' }}>Цвет фона</label>
          <input type="color" style={{ width: '100%' }} value={config.varFillColor} onChange={(e) => handleChange('varFillColor', e.target.value)} />
        </div>
      </div>

      {/* WIDGET PREVIEW */}
      <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SmartWidget elementTag="smart-ui-bar" id="bar-native" target={{ value: 75 }} opt={config} />
      </div>

    </div>
  );
}