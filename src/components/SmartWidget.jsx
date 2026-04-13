import React, { useRef } from 'react';
import { useSmartWidget } from '../hooks/useSmartWidget';

const SmartWidget = ({ 
  elementTag = "smart-ui-bar", 
  id, 
  className = '', 
  target = {},
  opt = {} 
}) => {
  const widgetRef = useRef(null);

  // Наш хук для обновления данных "на лету"
  useSmartWidget(widgetRef, id, target, opt);

  const CustomTag = elementTag;

  // МАГИЯ ЗДЕСЬ: 
  // Превращаем camelCase ключи из объекта opt (например, varFillColor, innerRadius) 
  // в правильные HTML-атрибуты с дефисами (var-fill-color, inner-radius),
  // чтобы Web Component увидел их в момент connectedCallback!
  const htmlAttributes = {};
  for (const [key, value] of Object.entries(opt)) {
    const attrName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    htmlAttributes[attrName] = value;
  }

  return (
    <CustomTag
      ref={widgetRef}
      id={id}
      class={className}
      {...htmlAttributes} // <-- Разворачиваем атрибуты прямо в тег!
    >
      This browser does not support custom elements.
    </CustomTag>
  );
};

export default SmartWidget;