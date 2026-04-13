// src/components/SettingsPanel.jsx
import React from 'react';

// === БАЗА ЗНАНИЙ О СВОЙСТВАХ ВИДЖЕТОВ (SCHEMA) ===
// Мы берем структуру прямо из вашего оригинального index.html
// СТАЛО:
const WIDGET_SCHEMA = {
  'smart-ui-bar':[
    { key: 'orient', label: 'Ориентация', type: 'select', options:[{v:'hor', l:'Горизонтально'}, {v:'ver', l:'Вертикально'}], def: 'hor' },
    { key: 'aligning', label: 'Направление', type: 'select', options:[{v:'left', l:'Влево'}, {v:'up', l:'Вверх'}, {v:'right', l:'Вправо'}, {v:'down', l:'Вниз'}], def: 'right' },
    { key: 'type', label: 'Тип', type: 'select', options:[{v:'solid', l:'Сплошной'}, {v:'discrete', l:'Дискретный'}], def: 'solid' },
    { key: 'thickness', label: 'Толщина', type: 'slider', min: 1, max: 100, step: 1, def: 24 },
    { key: 'gap', label: 'Отступ (Gap)', type: 'slider', min: 0.5, max: 20, step: 0.5, def: 5 },
    { key: 'scalePosition', label: 'Положение шкалы', type: 'select', options:[{v:'none', l:'Нет'}, {v:'left', l:'Слева'}, {v:'top', l:'Сверху'}, {v:'right', l:'Справа'}, {v:'bottom', l:'Снизу'}], def: 'none' },
    { key: 'scaleOffset', label: 'Смещение шкалы', type: 'slider', min: 2, max: 30, step: 1, def: 15 },
    { key: 'valueRule', label: 'Значение сигнала', type: 'select', options:[{v:'fill', l:'На фоне'}, {v:'stroke', l:'На обводке'}, {v:'both', l:'Оба'}, {v:'none', l:'Нигде'}], def: 'fill' },
    { key: 'colorRule', label: 'Цвет сигнала', type: 'select', options:[{v:'fill', l:'На фоне'}, {v:'stroke', l:'На обводке'}, {v:'none', l:'Нигде'}], def: 'stroke' },
    { key: 'isFillBkg', label: 'Закрашивать фон', type: 'checkbox', def: 1 },
    { key: 'varFillColor', label: 'Цвет фона', type: 'color', def: '#ffcd88' },
    { key: 'isFillStroke', label: 'Закрашивать контур', type: 'checkbox', def: 1 },
    { key: 'varStrokeColor', label: 'Цвет обводки', type: 'color', def: '#000000' },
    { key: 'varStrokeWidth', label: 'Толщина обводки', type: 'slider', min: 0, max: 20, step: 0.5, def: 1 },
    { key: 'varOpacity', label: 'Непрозрачность', type: 'slider', min: 0, max: 1, step: 0.05, def: 1 },
    { key: 'varIsShadow', label: 'Отбрасывать тень', type: 'checkbox', def: 1 },
    { key: 'isAnimate', label: 'Анимация', type: 'checkbox', def: 1 },
    { key: 'isShowThr', label: 'Показывать пороги', type: 'checkbox', def: 0 },
    { key: 'isShowTrends', label: 'Показывать тренды', type: 'checkbox', def: 0 },
    // --- RUNTIME SETTINGS ---
    { key: 'isRun', label: 'Внутренний таймер', type: 'checkbox', def: 0 },
    { key: 'isEmulate', label: 'Эмуляция данных', type: 'checkbox', def: 0 },
    { key: 'interval', label: 'Интервал опроса (мс)', type: 'slider', min: 500, max: 10000, step: 500, def: 3000 }
  ],
  'smart-ui-polygon':[
    { key: 'orient', label: 'Ориентация', type: 'select', options:[{v:'hor', l:'Горизонтально'}, {v:'ver', l:'Вертикально'}], def: 'hor' },
    { key: 'aligning', label: 'Направление', type: 'select', options:[{v:'left', l:'Влево'}, {v:'up', l:'Вверх'}, {v:'right', l:'Вправо'}, {v:'down', l:'Вниз'}], def: 'right' },
    { key: 'anglesNumber', label: 'Количество углов', type: 'slider', min: 3, max: 128, step: 1, def: 4 },
    { key: 'isStar', label: 'Вид', type: 'select', options:[{v: 1, l: 'Звезда'}, {v: 0, l: 'Многоугольник'}], def: 0 },
    { key: 'innerRadius', label: 'Внутренний радиус (Звезда)', type: 'slider', min: 1, max: 99, step: 1, def: 50 },
    { key: 'rotation', label: 'Угол поворота', type: 'slider', min: -180, max: 180, step: 0.5, def: -90 },
    { key: 'valueRule', label: 'Значение сигнала', type: 'select', options:[{v:'fill', l:'На фоне'}, {v:'stroke', l:'На обводке'}, {v:'both', l:'Оба'}, {v:'none', l:'Нигде'}], def: 'fill' },
    { key: 'colorRule', label: 'Цвет сигнала', type: 'select', options:[{v:'fill', l:'На фоне'}, {v:'stroke', l:'На обводке'}, {v:'none', l:'Нигде'}], def: 'stroke' },
    { key: 'isFillBkg', label: 'Закрашивать фон', type: 'checkbox', def: 0 },
    { key: 'varFillColor', label: 'Цвет фона', type: 'color', def: '#ffcd88' },
    { key: 'varStrokeColor', label: 'Цвет обводки', type: 'color', def: '#000000' },
    { key: 'varStrokeWidth', label: 'Толщина обводки', type: 'slider', min: 0.5, max: 20, step: 0.5, def: 3 },
    { key: 'varOpacity', label: 'Непрозрачность', type: 'slider', min: 0, max: 1, step: 0.05, def: 1 },
    { key: 'varIsShadow', label: 'Отбрасывать тень', type: 'checkbox', def: 1 },
    { key: 'isAnimate', label: 'Анимация', type: 'checkbox', def: 1 },
    // --- RUNTIME SETTINGS ---
    { key: 'isRun', label: 'Внутренний таймер', type: 'checkbox', def: 0 },
    { key: 'isEmulate', label: 'Эмуляция данных', type: 'checkbox', def: 0 },
    { key: 'interval', label: 'Интервал опроса (мс)', type: 'slider', min: 500, max: 10000, step: 500, def: 3000 }
  ],
  'smart-ui-pie':[
    { key: 'type', label: 'Тип', type: 'select', options:[{v:'rel', l:'Относительный'}, {v:'donut', l:'Бублик'}, {v:'flat', l:'Плоский'}, {v:'zwatch', l:'zWatch'}, {v:'1.0', l:'1.0'}, {v:'1.1', l:'1.1'}], def: 'rel' },
    { key: 'innerRadius', label: 'Внутренний радиус (Бублик)', type: 'slider', min: 0, max: 99, step: 1, def: 0 },
    { key: 'rotation', label: 'Вращение', type: 'slider', min: -180, max: 180, step: 10, def: -90 },
    { key: 'startAngle', label: 'Начальный угол', type: 'slider', min: 0, max: 360, step: 1, def: 0 },
    { key: 'endAngle', label: 'Конечный угол', type: 'slider', min: 0, max: 360, step: 1, def: 0 },
    { key: 'isLegend', label: 'Показывать легенду', type: 'checkbox', def: 0 },
    { key: 'varFillColor', label: 'Цвет фона', type: 'color', def: '#ffcd88' },
    { key: 'varStrokeColor', label: 'Цвет границ', type: 'color', def: '#000000' },
    { key: 'varStrokeWidth', label: 'Толщина границ', type: 'slider', min: 0, max: 20, step: 0.5, def: 2 },
    { key: 'varOpacity', label: 'Непрозрачность', type: 'slider', min: 0, max: 1, step: 0.05, def: 1 },
    { key: 'varIsShadow', label: 'Отбрасывать тень', type: 'checkbox', def: 1 },
    { key: 'isAnimate', label: 'Анимация', type: 'checkbox', def: 1 },
    // --- RUNTIME SETTINGS ---
    { key: 'isRun', label: 'Внутренний таймер', type: 'checkbox', def: 0 },
    { key: 'isEmulate', label: 'Эмуляция данных', type: 'checkbox', def: 0 },
    { key: 'interval', label: 'Интервал опроса (мс)', type: 'slider', min: 500, max: 10000, step: 500, def: 3000 }
  ]
};
export default function SettingsPanel({ widget, onChange }) {
  if (!widget) return null;

  const { tag, opt } = widget;
  const schema = WIDGET_SCHEMA[tag] ||[];

  const renderControl = (setting) => {
    // Получаем текущее значение из opt, либо дефолтное из схемы
    const currentValue = opt[setting.key] !== undefined ? opt[setting.key] : setting.def;

    switch (setting.type) {
      case 'select':
        return (
          <select 
            value={currentValue} 
            onChange={(e) => onChange(setting.key, isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
            style={{ width: '100%', padding: '5px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
          >
            {setting.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        );
      
      case 'color':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="color" 
              value={currentValue || '#000000'} 
              onChange={(e) => onChange(setting.key, e.target.value)}
              style={{ width: '30px', height: '24px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
            />
            <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>{currentValue}</span>
          </div>
        );

      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input 
              type="checkbox" 
              checked={currentValue === 1 || currentValue === true} 
              onChange={(e) => onChange(setting.key, e.target.checked ? 1 : 0)}
            />
            <span style={{ fontSize: '11px', color: '#aaa' }}>{currentValue ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </label>
        );

      case 'slider':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="range" 
              min={setting.min} max={setting.max} step={setting.step}
              value={currentValue} 
              onChange={(e) => onChange(setting.key, Number(e.target.value))}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: '#aaa', minWidth: '35px', textAlign: 'right' }}>{currentValue}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '5px 0' }}>
      {schema.map(setting => (
        <div key={setting.key} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#ccc', marginBottom: '5px', fontWeight: 'bold' }}>
            {setting.label}
          </label>
          {renderControl(setting)}
        </div>
      ))}
      
      {schema.length === 0 && (
        <p style={{ fontSize: '11px', color: '#888' }}>Схема настроек для {tag} пока не описана.</p>
      )}
    </div>
  );
}