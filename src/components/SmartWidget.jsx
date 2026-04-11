/**
 * Universal Wrapper Component for all SmartUI Web Components.
 * 
 * This component acts as a bridge between React's declarative DOM 
 * and the imperative nature of custom Web Components.
 * By using the 'elementTag' prop, it can dynamically render any widget 
 * from the SmartUI library (e.g., 'smart-ui-bar', 'smart-ui-pie').
 */
import React, { useRef } from 'react';
import { useSmartWidget } from '../hooks/useSmartWidget';

const SmartWidget = ({ 
  elementTag = "smart-ui-bar", // The native HTML tag of the custom element
  id,                          // Unique identifier
  className = '',              // CSS class string for styling
  target = {},                 // Operational data (Object or Array)
  opt = {}                     // Dynamic settings and layout configuration
}) => {
  const widgetRef = useRef(null);

  // Bind the universal logic hook to handle data and options updates
  useSmartWidget(widgetRef, id, target, opt);

  // In React, assigning a string to a capitalized variable name 
  // allows JSX to dynamically render it as a corresponding HTML tag.
  const CustomTag = elementTag;

  return (
    <CustomTag
      ref={widgetRef}
      id={id}
      class={className} // Custom Web Components usually prefer 'class' over 'className'
    >
      This browser does not support custom elements.
    </CustomTag>
  );
};

export default SmartWidget;