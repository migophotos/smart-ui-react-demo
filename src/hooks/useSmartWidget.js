/**
 * Universal React Hook to control any SmartWidget instance.
 * It bridges React's declarative state with the widget's imperative update() method.
 * 
 * @param {Object} ref - React useRef attached to the Custom Web Component.
 * @param {String} id - Unique identifier of the widget.
 * @param {Object|Array} targetData - The operational data payload. Can be a single object (e.g., SmartBar) or an array of objects (e.g., SmartPie).
 * @param {Object} options - The 'opt' payload for dynamic styling and layout configuration.
 */
import { useEffect } from 'react';

export const useSmartWidget = (ref, id, targetData, options) => {
  
  // We stringify the objects to safely use them in the dependency array.
  // This prevents infinite re-render loops if objects are re-created in the parent component.
  const targetStr = JSON.stringify(targetData);
  const optionsStr = JSON.stringify(options);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Construct the universal payload according to the SmartWidgets Base Class specifications.
    const payload = {
      opt: { ...options }
    };

    // 1. Handle array payloads (e.g., SmartPie expects a 'targets' array for multi-level slices)
    if (Array.isArray(targetData)) {
      payload.targets = targetData;
    } 
    // 2. Handle single object payloads (e.g., SmartBar expects a 'target' object)
    else {
      payload.target = { uuid: id, ...targetData };
    }

    // --- EXECUTE UPDATE ---

    // Primary approach: Get the controller directly from the Custom Element's DOM node.
    // This bypasses the global manager and ensures direct communication with the instance.
    if (typeof el.getCtrl === 'function') {
      const ctrl = el.getCtrl();
      if (ctrl && typeof ctrl.update === 'function') {
        ctrl.update(payload);
        return; // Success, exit early
      }
    }
    
    // Fallback approach: Use the global SmartHeap manager from the base class.
    // This handles edge cases where the DOM node might temporarily lose the getCtrl reference.
    if (window.SmartHeap) {
      const ctrl = window.SmartHeap.get(id);
      if (ctrl && typeof ctrl.update === 'function') {
        ctrl.update(payload);
      }
    }

  },[id, targetStr, optionsStr]); // Effect triggers only when actual data or options change
};