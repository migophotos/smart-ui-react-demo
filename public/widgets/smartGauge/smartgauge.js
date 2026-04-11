/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-underscore-dangle */

/**
 * @copyright Copyright © 2018-2026 ... All rights reserved.
 * @author Michael Goyberg
 * @license MIT
 * @version 2.0
 */
"use strict";

String.prototype.f = function () {
  const args = arguments;
  return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
    if (m == "{{") {
      return "{";
    }
    if (m == "}}") {
      return "}";
    }
    return args[n];
  });
};

String.prototype.isBlank = function () {
  return this.trim().length === 0;
};

String.prototype.remove = function (f) {
  return this.replace(f, "");
};

class SmartGauges extends SmartWidgets {
  static getAlias() {
    return "stgauge";
  }

  static init(context = {}) {
    if (!window.SmartGauges) {
      window.SmartGauges = new SmartGauges();
    }
    window.SmartGauges.init(context);
  }

  static addElement(type, params, parent = null, doc = null) {
    return super.addElement(type, params, parent, doc);
  }

  static getTemplate(name = null) {
    const templates =[];
    if (typeof SMART_WIDGETS !== 'undefined') {
        for (let n = 0; n < SMART_WIDGETS.length; n++) {
            if (SMART_WIDGETS[n].match("stgauge")) {
                let template = {
                    id: `theme-${n}`,
                    data: SMART_WIDGETS[n],
                };
                try {
                    const opt = JSON.parse(template.data);
                    if (opt && opt.data) {
                        template.name = opt.data.name;
                        template.data = `${JSON.stringify(opt.data)}`;
                        templates.push(template);
                    }
                } catch(e) {
                    // Ignore parsing errors for compressed strings in template array
                }
            }
        }
    }
    return templates;
  }

  constructor() {
    super();
    this._alias = SmartGauges.getAlias();
    this.uniqueId = this._makeId(this._alias, 0);
    const allTemplates = SmartGauges.getTemplate();
    this._templates = new Map();
    for (let n = 0; n < allTemplates.length; n++) {
      this._templates.set(allTemplates[n].name, allTemplates[n].data);
    }
  }

  initCtrl(id, options) {
    let ctrl = this.get(id);
    if (!ctrl) {
      ctrl = new SmartGauge(id, options);
    }
    if (ctrl) {
      ctrl.init(options);
    }
  }
  
  unInitCtrl(id) {
    window.SmartHeap.delete(id);
  }
}

class SmartGauge {
  static JsonToOptions(jsonOpt) {
    const options = {};
    if (typeof jsonOpt === "string" && jsonOpt.length) {
      const tmpOpt = JSON.parse(jsonOpt);
      const widgetsAlias = SmartWidgets.getAlias();

      if (typeof tmpOpt[widgetsAlias] != "undefined") {
        const optArr = tmpOpt[widgetsAlias].split("-");
        const customProp = SmartGauge.getCustomProperties();
        let index = 1;
        for (let prop of customProp) {
          if (optArr[index] != ".") {
            options[SmartWidgets.customProp2Param(prop)] = optArr[index];
          }
          index++;
        }
        this.convertNumericProps(options);
        options.alias = optArr[0];
        return options;
      }
      const aliasKey = `--${SmartGauges.getAlias()}-`;
      for (let key in tmpOpt) {
        const paramName = key.replace(aliasKey, "");
        options[SmartWidgets.customProp2Param(paramName)] = tmpOpt[key];
      }
      this.convertNumericProps(options);
      return options;
    }
    return null;
  }

  static buidOptionsAndCssVars(opt, what = "options") {
    const customProp = SmartGauge.getCustomProperties();
    return SmartWidgets.buidOptionsAndCssVars(opt, customProp, what == "options" ? "" : SmartGauges.getAlias());
  }

  static getCustomProperties() {
    return[
      "role", 
      "alias",
      "width",
      "height", 
      "position", 
      "ttip-template",
      "ttip-type", 
      "title-format",
      "descr-format",
      "is-emulate",
      "is-run", 
      "interval", 
      "var-font-family", 
      "server",
      "target",
      "user",
      "b-t", 
      "b-r", 
      "b-r-offset",
      "b-r-width",
      "b-r-color",
      "b-r-border",
      "b-r-opacity",
      "b-b-width", 
      "b-b-color",
      "b-f-color",
      "b-f-gradient",
      "b-opacity",
      "b-shadow",
      "scales",
    ];
  }
  
  static defOptions() {
    return {
      role: "", 
      alias: SmartGauges.getAlias(),
      width: 150,
      height: 150, 
      position: "rt", 
      ttipTemplate: "simple", 
      ttipType: "own", 
      titleFormat: "$TITLE$, value = $VALUE$",
      descrFormat: "$DESCR$, color = $COLOR$",
      isEmulate: 0, 
      isRun: 0, 
      interval: 3000, 
      varFontFamily: "Arial, DIN Condensed, Noteworthy, sans-serif",
      server: "",
      target: "",
      user: "",
      bT: 3,
      bR: 150, 
      bROffset: 0,
      bRWidth: 2, 
      bRColor: "#1313139a",
      bRBorder: "#202020", 
      bROpacity: 1.0,
      bBWidth: 2,
      bBColor: "#ffffff",
      bFColor: "#1313139a",
      bFGradient: "",
      bOpacity: 1.0,
      bShadow: 1,
      scales:[
        {
          type: 1, uuid: "s2", way: 0, offset: 0, radius: 105, angs: 310, ange: 230, inv: false, min: 0, max: 100, pct: 0, anim: 1, ttip: 0, lnk: 0,
          sign: { type: 1, radius: 77, color: "#000000", fFamily: "Tahoma", fSize: "10" },
          dial: { type: 2, radius: 84, bWidth: 0.6, bColor: "#999999", fColor: "#4540409a", fPatern: "", opacity: 1 },
          major: { type: 1, weight: 20, radius: 95, length: 10, bWidth: 2, bColor: "#ffffff", fColor: "#000000", opacity: 1.0 },
          minor: { type: 0, weight: 5, radius: 60, length: 5, bWidth: 1, bColor: "#5599ff", fColor: "#000000", opacity: 1.0 },
          center: { type: 0, radius: 16, bWidth: 1, bColor: "#fffafb", fColor: "#ff0000", opacity: 1.0, shadow: false },
          pointer: { type: 12, radius: 95, bWidth: 2, bColor: "#ffffff", fColor: "#909090", opacity: 1.0, width: 10, shadow: 1 },
          legend: { type: 1, way: 90, offset: 40, color: "#ffffff", fFamily: "Tahoma", fSize: 36, template: "- {0} -" },
          thrs: { type: 0, radius: 95, length: 10, bWidth: 0, bColor: "#ffffff", fColor: "status", opacity: 1.0, values: "5#0080c0,25#008000,50#eeee00,95#ff2f2f,100#9f0000" },
        },
        {
          type: 1, uuid: "s1", way: 340, offset: 46, radius: 36, angs: 310, ange: 230, inv: false, min: 10, max: 95, pct: 0, anim: 1, ttip: 0, lnk: 0,
          sign: { type: 1, radius: 78, color: "#000000", fFamily: "Tahoma", fSize: "16" },
          dial: { type: 1, radius: 100, bWidth: 5, bColor: "#bababa", fColor: "#ababab", fPatern: "", opacity: 1 },
          major: { type: 0, weight: 10, radius: 70, length: 10, bWidth: 2, bColor: "#0000ff", fColor: "#000000", opacity: 1.0 },
          minor: { type: 0, weight: 5, radius: 60, length: 5, bWidth: 1, bColor: "#5599ff", fColor: "#000000", opacity: 1.0 },
          center: { type: 2, radius: 16, bWidth: 1, bColor: "#fffafb", fColor: "#565656", opacity: 1.0, shadow: false },
          pointer: { type: 3, radius: 58, bWidth: 0.5, bColor: "#565656", fColor: "454040", opacity: 1.0, width: 6, shadow: 0 },
          legend: { type: 2, way: 270, offset: 70, color: "#000000", fFamily: "Tahoma", fSize: 24, template: "{0}" },
          thrs: { type: 1, radius: 96, length: 6, bWidth: 0, bColor: "#ffffff", fColor: "status", opacity: 1.0, values: "5#0080c0,25#008000,50#ffff15,95#ff2f2f,100#9f0000" },
        }
      ],
    };
  }

  static convertNumericProps(options = {}, propName) {
    const numericProps =[
      "anim", "lnk", "isEmulate", "isRun", "ttip", "interval", "min", "max", "width", "height", "varFontSize", "isGlobalColors",
      "bT", "bR", "bROffset", "bRWidth", "bROpacity", "bBWidth", "bOpacity", "bShadow",
      "type", "way", "offset", "radius", "angs", "ange", "inv", "pct"
    ];
    return SmartWidgets.convertToNumbers(options, numericProps, propName);
  }

  constructor(id, options = null) {
    if (!options) {
      console.error("must be initialized!");
      return;
    }
    this._onShowTooltip = this._onShowTooltip.bind(this);
    this._onMoveTooltip = this._onMoveTooltip.bind(this);
    this._onHideTooltip = this._onHideTooltip.bind(this);
    this._onClick = this._onClick.bind(this);
    
    const txtStyle = `
      svg { overflow: visible; --no-color: none; }
      .run { fill: var(--run-color); }
      .stop { fill: var(--stop-color); }
      .${SmartGauges.getAlias()}.shadowed { filter: url(#drop-shadow); }
      .${SmartGauges.getAlias()}.linked { cursor: pointer; }
      .${SmartGauges.getAlias()}.animated { transition:all 1.5s; }
      .animated:hover { r: 0; }
    `;
    
    let gId = id;
    const widgetsAlias = SmartWidgets.getAlias();
    const elem = document.getElementById(id);
    
    if (elem && elem.tagName === "DIV") {
      const elemId = window.SmartGauges.getId();
      const svgId = `${id}--${SmartGauges.getAlias()}`;
      elem.innerHTML = `${SmartWidgets.getSVGContext(svgId, elemId)}`;
      options = {
        mode: "html",
        context: document.getElementById(svgId),
        opt: options,
      };
      window.SmartGauges.set(id, this);
      gId = elemId;
    }

    if (typeof options.opt === "string" && options.opt.length && options.opt.startsWith(widgetsAlias)) {
      options.opt = SmartGauge.JsonToOptions(options.opt);
    }

    this._o = Object.assign({}, SmartGauge.defOptions(), options.opt || {});
    SmartGauge.convertNumericProps(this._o);

    this._mode = options.mode || null;
    this.id = gId; 
    this._root = options.context; 
    this._svgroot = this._root.getElementById(this.id); 
    this._svgdoc = this._svgroot.ownerDocument;
    this._data = null; 
    this._bp = null; 
    this._intervalCounter = 0;
    this._inited = false;

    const style = SmartGauges.addElement("style", {}, this._root, this._svgdoc);
    style.textContent = txtStyle;
    this._defs = SmartGauges.addElement("defs", {}, this._root, this._svgdoc);
    if(window.SmartGauges.defs) this._defs.innerHTML = window.SmartGauges.defs;

    if (!this._mode) {
      window.SmartGauges.set(this.id, this);
      this.init();
    }
    if (elem && elem.tagName === "DIV") {
      this.init(this._o);
    }
  }

  _rotatePointer(target, scaleDef, scaleObj) {
    const val = target.value; // Real scale mapping should clamp inside _convertVal2Angle
    const valAng = this._convertVal2Angle(val, scaleDef);

    if (scaleDef.pointer.type == 11 || scaleDef.pointer.type == 12) {
      let extR = scaleObj.radiusPCT * scaleDef.pointer.radius;
      const intR = extR - scaleObj.radiusPCT * scaleDef.pointer.width;
      const radius = (intR + extR) / 2;
      const val1 = this._convertVal2Angle(scaleDef.min, scaleDef); // Fixed drawing from minimum
      const d = this._describeArc(0, 0, radius, val1, valAng, scaleDef.angs, scaleDef.ange);
      scaleObj.pointerSrc.setAttribute("d", d);
      const totLength = scaleObj.pointerSrc.getTotalLength();
      scaleObj.pointer.style.strokeDashoffset = scaleObj.pointer.getTotalLength() - totLength;
      return;
    } else {
      if (typeof scaleObj.pointerAngle == "undefined") {
        scaleObj.pointerAngle = valAng;
      }
      scaleObj.pointer.setAttribute("transform", "rotate(" + valAng + ",0,0)");
    }
  }

  _getColorByVal(val, scaleDef) {
    let color = "#000000";
    if (scaleDef._thresholds && scaleDef._thresholds.size() > 0) {
      for (let [key, cr] of scaleDef._thresholds.entries()) {
        if (val <= Number(key)) {
          color = cr;
          break;
        }
      }
    }
    return color;
  }

  _buildActive(data = null) {
    if (!this._inited) {
      return false;
    }
    if(!data) return false;
    
    // Convert data Set to Array
    const targetsArray = Array.from(data);
    
    for (let target of targetsArray) {
      if (target.type === "description") continue;
      
      const scN = this.findScaleIndex(target.uuid);
      const scaleDef = scN !== -1 ? this._o.scales[scN] : null;
      const scaleObj = scN !== -1 ? this._bp.scales[scN] : null;
      
      if (!scaleDef) continue;
      
      if (target.thresholds) {
        if (target.thresholds !== scaleDef.thrs.values) {
          scaleDef._thresholds.init(target.thresholds);
          this._drawThresholds(scaleDef, scaleObj);
        }
      }
      
      target.legend = typeof target.legend === "string" ? target.legend.remove("html:") : target.legend;
      target.value = Number(typeof target.value === "string" ? target.value.split("%")[0] : target.value);
      
      this._rotatePointer(target, scaleDef, scaleObj);
      
      if(scaleObj.legend) {
        const txt = scaleDef.legend.template.f(target.legend || target.value);
        scaleObj.legend.replaceChild(this._svgdoc.createTextNode(txt), scaleObj.legend.firstChild);
      }

      const targColor = target.color ? target.color : this._getColorByVal(target.value, scaleDef);
      
      if (scaleObj.legendActive) scaleObj.legendActive.setAttribute("fill", targColor);
      if (scaleObj.pointerActive) scaleObj.pointerActive.setAttribute(scaleDef.pointer.type == 12 ? "stroke" : "fill", targColor);
      if (scaleObj.centerActive) scaleObj.centerActive.setAttribute("fill", targColor);
      if (scaleObj.dialActive) scaleObj.dialActive.setAttribute("fill", targColor);
    }
  }

  _convertVal2Angle(val, scale) {
    // Clamp values
    let safeVal = val;
    if(safeVal < scale.min) safeVal = scale.min;
    if(safeVal > scale.max) safeVal = scale.max;
    
    const range = scale.max - scale.min;
    const normalized = range === 0 ? 0 : (safeVal - scale.min) / range * 100;
    
    const cVal = scale.inv ? 100 - normalized : normalized;
    const eA = scale.angs < scale.ange ? scale.ange : scale.ange + 360;
    const vA = scale.angs + ((eA - scale.angs) * cVal) / 100;
    return vA;
  }

  _convertVal2Cartesian(val, radius, scale) {
    const vA = scale ? this._convertVal2Angle(val, scale) : val;
    const angleInRadians = (180 + vA) * (Math.PI / 180);
    let r;
    if (typeof radius === "object" && typeof radius.radius !== "undefined") {
      r = radius.radius;
      radius.x = r * Math.cos(angleInRadians);
      radius.y = r * Math.sin(angleInRadians);
    } else {
      r = radius;
    }
    return {
      x: r * Math.cos(angleInRadians),
      y: r * Math.sin(angleInRadians),
    };
  }

  _polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((180 + angleInDegrees) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  _describeArc(x, y, radius, startAngle, endAngle, scaleStart, scaleEnd, isInverted) {
    let largeArc = 1;
    let arcSweep = 0;
    const s = startAngle % 360;
    const e = endAngle % 360;
    isInverted = isInverted || false;
    if (isInverted) largeArc = 0;
    const start = this._polarToCartesian(x, y, radius, s);
    const end = this._polarToCartesian(x, y, radius, e);
    arcSweep = isInverted ? (e - s + (s > e) * 360 < 180) * 1 : (e - s + (s > e) * 360 >= 180) * 1;
    return["M", start.x, start.y, "A", radius, radius, 0, arcSweep, largeArc, end.x, end.y].join(" ");
  }

  _drawBody() {
    const dt = this._o;
    this._bp.x = this._rect.x;
    this._bp.y = this._rect.y;
    this._bp.width = this._rect.width || dt.width;
    this._bp.height = this._rect.height || dt.height;
    this._bp.centerPoint = { x: this._bp.width / 2, y: this._bp.height / 2 };
    
    const cp = this._bp.centerPoint;
    this._bp.radius = Math.min(cp.x, cp.y) - (this._o.bShadow ? 4 : 1);
    this._bp.radiusPCT = this._bp.radius / 100;

    const fill = dt.bFColor.isBlank() ? "none" : dt.bFColor.startsWith("#") ? dt.bFColor : `#${dt.bFColor}`;
    const stroke = dt.bBColor.isBlank() ? "none" : dt.bBColor.startsWith("#") ? dt.bBColor : `#${dt.bBColor}`;

    switch (dt.bT) {
      case 0: break;
      case 1:
        this._bp.body = SmartGauges.addElement("circle", {
          name: "body-1", class: `${SmartGauges.getAlias()}`, cx: cp.x, cy: cp.y, r: this._bp.radius,
          fill: fill, stroke: "none", "fill-opacity": dt.bOpacity,
        }, this._bp.mainG, this._svgdoc);
        break;
      case 2:
        this._bp.radius -= (this._bp.radiusPCT * dt.bBWidth) / 2;
        this._bp.body = SmartGauges.addElement("circle", {
          name: "body-2", class: `${SmartGauges.getAlias()}`, cx: cp.x, cy: cp.y, r: this._bp.radius,
          fill: fill, stroke: stroke, "stroke-width": this._bp.radiusPCT * dt.bBWidth, "fill-opacity": dt.bOpacity,
        }, this._bp.mainG, this._svgdoc);
        break;
      case 3:
      case 4:
        this._bp.radius -= (this._bp.radiusPCT * dt.bBWidth) / 2;
        this._bp.body = SmartGauges.addElement("circle", {
          name: "body-3", class: `${SmartGauges.getAlias()}`, cx: cp.x, cy: cp.y, r: this._bp.radius,
          fill: fill, stroke: stroke, "stroke-width": this._bp.radiusPCT * dt.bBWidth, "fill-opacity": dt.bOpacity,
        }, this._bp.mainG, this._svgdoc);
        
        this._bp.radius -= this._bp.radiusPCT * dt.bROffset + (this._bp.radiusPCT * dt.bRWidth) / 2;
        this._bp.bodyActive = SmartGauges.addElement("circle", {
          name: "rim-3", class: `${SmartGauges.getAlias()}`, cx: cp.x, cy: cp.y, r: this._bp.radius,
          fill: dt.bRColor.isBlank() ? "none" : dt.bRColor.startsWith("#") ? dt.bRColor : `#${dt.bRColor}`,
          stroke: dt.bRBorder.isBlank() ? "none" : dt.bRBorder.startsWith("#") ? dt.bRBorder : `#${dt.bRBorder}`,
          "stroke-width": this._bp.radiusPCT * dt.bRWidth, "fill-opacity": dt.bROpacity,
        }, this._bp.mainG, this._svgdoc);
        if(dt.bT == 4) this._bp.bodyActive = this._bp.body;
        break;
    }
  }

  _drawCenter(scaleDef, scaleObj) {
    const radius = scaleObj.radiusPCT * scaleDef.center.radius;
    const border = scaleObj.radiusPCT * scaleDef.center.bWidth;
    const fill = scaleDef.center.fColor.isBlank() ? "none" : scaleDef.center.fColor.startsWith("#") ? scaleDef.center.fColor : `#${scaleDef.center.fColor}`;
    const stroke = scaleDef.center.bColor.isBlank() ? "none" : scaleDef.center.bColor.startsWith("#") ? scaleDef.center.bColor : `#${scaleDef.center.bColor}`;

    if(scaleDef.center.type == 1) {
        const el = SmartGauges.addElement("circle", {
          name: "center-1", class: `${SmartGauges.getAlias()}`, cx: 0, cy: 0, r: radius,
          fill: fill, stroke: stroke, "stroke-width": scaleObj.phaze == 0 ? border : 0,
          "fill-opacity": scaleDef.center.opacity, "pointer-events": "none",
        }, scaleObj.scaleG, this._svgdoc);
        el.classList.add(scaleDef.center.shadow ? "shadowed" : "no-shadows");
    } else if(scaleDef.center.type == 2) {
        scaleObj.centerActive = SmartGauges.addElement("circle", {
          name: "center-2", class: `${SmartGauges.getAlias()} ${scaleDef.anim ? "animated" : ""}`, cx: 0, cy: 0, r: radius,
          fill: fill, stroke: stroke, "stroke-width": scaleObj.phaze == 0 ? border : 0,
          "fill-opacity": scaleDef.center.opacity, "pointer-events": "none",
        }, scaleObj.scaleG, this._svgdoc);
        scaleObj.centerActive.classList.add(scaleDef.center.shadow ? "shadowed" : "no-shadows");
    }
  }

  _drawDial(scaleDef, scaleObj) {
    const radius = scaleObj.radiusPCT * scaleDef.dial.radius;
    const border = scaleObj.radiusPCT * scaleDef.dial.bWidth;
    const fill = scaleDef.dial.fColor.isBlank() ? "none" : scaleDef.dial.fColor.startsWith("#") ? scaleDef.dial.fColor : `#${scaleDef.dial.fColor}`;
    const stroke = scaleDef.dial.bColor.isBlank() ? "none" : scaleDef.dial.bColor.startsWith("#") ? scaleDef.dial.bColor : `#${scaleDef.dial.bColor}`;

    if(scaleDef.dial.type == 1) {
        SmartGauges.addElement("circle", {
          name: "dial-1", class: `${SmartGauges.getAlias()}`, cx: 0, cy: 0, r: radius,
          fill: fill, stroke: stroke, "stroke-width": border, "fill-opacity": scaleDef.dial.opacity, "pointer-events": "none",
        }, scaleObj.scaleG, this._svgdoc);
    } else if(scaleDef.dial.type == 2) {
        scaleObj.dialActive = SmartGauges.addElement("circle", {
          name: "dial-2", class: `${SmartGauges.getAlias()} ${scaleDef.anim ? "animated" : ""}`, cx: 0, cy: 0, r: radius,
          fill: fill, stroke: stroke, "stroke-width": border, "fill-opacity": scaleDef.dial.opacity,
        }, scaleObj.scaleG, this._svgdoc);
    }
  }

  _drawThresholds(scaleDef, scaleObj) {
    if (scaleObj.thresholdG) scaleObj.scaleG.removeChild(scaleObj.thresholdG);
    scaleObj.thresholdG = SmartWidgets.addElement("g", { name: "thrG" }, scaleObj.scaleG, this._svgdoc);

    let prevVal = scaleDef.min;
    if(scaleDef.thrs.type == 1 && scaleDef._thresholds && scaleDef._thresholds.size() > 0) {
      for (let[valStr, color] of scaleDef._thresholds.entries()) {
        let val = Number(valStr);
        if (val < scaleDef.min) continue;
        if (val > scaleDef.max) val = scaleDef.max;
        
        let extR = scaleObj.radiusPCT * scaleDef.thrs.radius;
        let intR = extR - scaleObj.radiusPCT * scaleDef.thrs.length;
        let radius = (intR + extR) / 2;
        
        let val1 = this._convertVal2Angle(prevVal, scaleDef);
        let val2 = this._convertVal2Angle(val, scaleDef);
        let d = this._describeArc(0, 0, radius, val1, val2, scaleDef.angs, scaleDef.ange, scaleDef.inv);
        
        SmartWidgets.addElement("path", {
            name: "thr-" + scaleDef.thrs.type, d: d, "pointer-events": "none", fill: "none", stroke: color, "stroke-width": extR - intR,
        }, scaleObj.thresholdG, this._svgdoc);
        prevVal = val;
      }
    }
  }

  _drawScale(scaleDef, scaleObj) {
    if (scaleDef.type == 0) return;
    
    const extR = scaleObj.radiusPCT * scaleDef.radius;
    const intR = extR - 4;
    const radius = (extR + intR) / 2;
    const d = this._describeArc(0, 0, radius, scaleDef.angs, scaleDef.ange, scaleDef.angs, scaleDef.ange);
    
    scaleObj.body = SmartGauges.addElement("path", {
        name: `scaleBody-${scaleObj.index}`, d: d, fill: "#f88", stroke: "#f00", "stroke-width": extR - intR, "stroke-opacity": 0, "fill-opacity": 0,
      }, scaleObj.scaleG, this._svgdoc);
      
    const textG = SmartGauges.addElement("g", {
        class: "scaleText", name: `scaleText-${scaleObj.index}`, "pointer-events": "none", "text-anchor": "middle", "alignment-baseline": "center", "dominant-baseline": "middle",
        fill: scaleDef.sign.color.startsWith("#") ? scaleDef.sign.color : "#" + scaleDef.sign.color,
      }, scaleObj.scaleG, this._svgdoc);

    const majorTik = { external: { radius: scaleObj.radiusPCT * scaleDef.major.radius, x: 0, y: 0 }, internal: { radius: scaleObj.radiusPCT * scaleDef.major.radius - scaleObj.radiusPCT * scaleDef.major.length, x: 0, y: 0 }, path: "" };
    const minorTik = { external: { radius: scaleObj.radiusPCT * scaleDef.minor.radius, x: 0, y: 0 }, internal: { radius: scaleObj.radiusPCT * scaleDef.minor.radius - scaleObj.radiusPCT * scaleDef.minor.length, x: 0, y: 0 }, path: "" };
    const textPt = { x: 0, y: 0, radius: scaleObj.radiusPCT * scaleDef.sign.radius };
    
    const minValue = scaleDef.min || 0;
    const maxValue = scaleDef.max || 100;
    const minorStep = scaleDef.minor.weight || 0;
    const majorStep = scaleDef.major.weight || 0;

    const trunkVl = (n) => {
      if (n % 1 === 0) return +n;
      return +(n > 100 ? Math.trunc(n) : n.toFixed(1));
    };

    this.drawTick = function (tik, isMajor, customValue) {
      let bShow100 = true, bShow0 = true;
      if (tik == minValue && scaleDef.ange > scaleDef.angs && scaleDef.ange - scaleDef.angs > 350) bShow0 = false;
      if (tik == maxValue && scaleDef.angs > scaleDef.ange && Math.abs(scaleDef.angs - scaleDef.ange) <= 10) bShow100 = false;

      if (!isMajor) {
        this._convertVal2Cartesian(tik, minorTik.external, scaleDef);
        this._convertVal2Cartesian(tik, minorTik.internal, scaleDef);
        minorTik.path += " M" + minorTik.external.x + "," + minorTik.external.y + " L" + minorTik.internal.x + "," + minorTik.internal.y;
      }

      if (isMajor) {
        this._convertVal2Cartesian(tik, majorTik.external, scaleDef);
        this._convertVal2Cartesian(tik, majorTik.internal, scaleDef);
        majorTik.path += " M" + majorTik.external.x + "," + majorTik.external.y + " L" + majorTik.internal.x + "," + majorTik.internal.y;

        if (scaleDef.sign.type > 0 && bShow0 && bShow100) {
          this._convertVal2Cartesian(tik, textPt, scaleDef);
          textPt.showVal = !customValue ? tik : customValue;
          textPt.showVal = trunkVl(textPt.showVal);
          
          if(scaleDef.sign.type == 1) {
              textPt.showValForm = textPt.showVal.toString();
          } else if(scaleDef.sign.type == 2) {
              let pct = (textPt.showVal - minValue) / (maxValue - minValue);
              textPt.showValForm = (pct == 0 || Math.abs(pct) == 1) ? pct.toFixed() : pct.toFixed(2);
          }
          
          SmartGauges.addElement("text", {
              x: textPt.x, y: textPt.y, "pointer-events": "none", "font-family": scaleDef.sign.fFamily, "font-size": scaleObj.radiusPCT * scaleDef.sign.fSize,
              fill: scaleDef.sign.color.startsWith("#") ? scaleDef.sign.color : "#" + scaleDef.sign.color, "dominant-baseline": "middle", text: textPt.showValForm,
            }, textG, this._svgdoc);
        }
      }
    };

    this.drawTick(minValue, true, minValue);
    this.drawTick(maxValue, true, maxValue);

    if (minorStep > 0) {
      for (let tik = minValue + minorStep; tik < maxValue; tik += minorStep) {
        this.drawTick(tik, false);
      }
    }
    if (majorStep > 0) {
      for (let tik = minValue + majorStep; tik < maxValue; tik += majorStep) {
        this.drawTick(tik, true, tik);
      }
    }
    
    if (scaleDef.major.type) {
      SmartGauges.addElement("path", {
          name: "majorScale-" + scaleObj.index, d: majorTik.path, stroke: scaleDef.major.bColor.startsWith("#") ? scaleDef.major.bColor : "#" + scaleDef.major.bColor,
          "stroke-width": scaleObj.radiusPCT * scaleDef.major.bWidth, "stroke-opacity": scaleDef.major.opacity, "pointer-events": "none",
        }, scaleObj.scaleG, this._svgdoc);
    }
    if (scaleDef.minor.type && minorTik.path.length > 0) {
      SmartGauges.addElement("path", {
          name: "minorScale-" + scaleObj.index, d: minorTik.path, stroke: scaleDef.minor.bColor.startsWith("#") ? scaleDef.minor.bColor : "#" + scaleDef.minor.bColor,
          "stroke-width": scaleObj.radiusPCT * scaleDef.minor.bWidth, "stroke-opacity": scaleDef.minor.opacity, "pointer-events": "none",
        }, scaleObj.scaleG, this._svgdoc);
    }
  }

  _drawLegend(scaleDef, scaleObj) {
    if (scaleDef.legend.type == 0) return;
    
    let legendText = "";
    if(scaleDef.legend.type == 3) {
        legendText = scaleDef.legend.template;
    } else {
        legendText = scaleDef.legend.template.f(0);
    }
    
    if (legendText) {
      const offset = scaleObj.radiusPCT * scaleDef.legend.offset;
      const pos = this._convertVal2Cartesian(scaleDef.legend.way, offset);
      const fontDef = "font-family:" + scaleDef.legend.fFamily + "; font-size:" + scaleObj.radiusPCT * scaleDef.legend.fSize + "px;";
      const fill = scaleDef.legend.color.isBlank() ? "none" : scaleDef.legend.color.startsWith("#") ? scaleDef.legend.color : `#${scaleDef.legend.color}`;

      scaleObj.legend = SmartGauges.addElement("text", {
          name: `legend-${scaleDef.legend.type}`, class: `${SmartGauges.getAlias()} ${scaleDef.anim ? "animated" : ""}`,
          x: pos.x, y: pos.y, fill: fill, style: fontDef, "text-anchor": "middle", "dominant-baseline": "middle", text: legendText,
        }, scaleObj.scaleG, this._svgdoc);
      scaleObj.legendActive = scaleDef.legend.type == 2 ? scaleObj.legend : null;
    }
  }

  _drawPointer(scaleDef, scaleObj) {
    const ptLength = scaleObj.radiusPCT * scaleDef.pointer.radius;
    const fill = scaleDef.pointer.fColor.isBlank() ? "none" : scaleDef.pointer.fColor.startsWith("#") ? scaleDef.pointer.fColor : "#" + scaleDef.pointer.fColor;
    const stroke = scaleDef.pointer.bColor.isBlank() ? "none" : scaleDef.pointer.bColor.startsWith("#") ? scaleDef.pointer.bColor : "#" + scaleDef.pointer.bColor;

    switch (scaleDef.pointer.type) {
      case 0: break;
      case 1:
      case 2: {
        const lo = scaleObj.radiusPCT * (scaleDef.pointer.radius / 4);
        const pr = scaleDef.pointer.width ? scaleObj.radiusPCT * scaleDef.pointer.width : 0;
        const kr = pr / 2;
        scaleObj.pointer = SmartWidgets.addElement("path", {
            name: `pointer-${scaleDef.pointer.type}`, class: `${SmartGauges.getAlias()}`,
            d: "M" + lo + ",0 h-" + ptLength + " l-" + pr + "," + kr + " l-" + pr + ",-" + kr + " l" + pr + ",-" + kr + " l" + pr + "," + kr + " h" + ptLength + " z",
            fill: fill, stroke: stroke, "stroke-width": scaleDef.pointer.bWidth,
          }, scaleObj.scaleG, this._svgdoc);
        scaleObj.pointerActive = scaleDef.pointer.type == 2 ? scaleObj.pointer : null;
        break;
      }
      case 3:
      case 4:
      case 5:
      case 6: {
        const kc = scaleObj.radiusPCT * (scaleDef.pointer.type == 3 || scaleDef.pointer.type == 4 ? scaleDef.pointer.width : scaleDef.center.radius);
        scaleObj.pointer = SmartWidgets.addElement("path", {
            name: `pointer-${scaleDef.pointer.type}`, class: `${SmartGauges.getAlias()}`,
            d: "M0,0 v-" + kc + " L-" + ptLength + ",0 L0," + kc + " z",
            fill: fill, stroke: stroke, "stroke-width": scaleDef.pointer.bWidth,
          }, scaleObj.scaleG, this._svgdoc);
        scaleObj.pointerActive = scaleDef.pointer.type == 4 || scaleDef.pointer.type == 6 ? scaleObj.pointer : null;
        break;
      }
      case 7:
      case 8: {
        const lo = scaleObj.radiusPCT * (scaleDef.pointer.radius / 4);
        const pr = scaleDef.pointer.width ? (scaleObj.radiusPCT * scaleDef.pointer.width) / 2 : 0;
        scaleObj.pointer = SmartWidgets.addElement("path", {
            name: `pointer-${scaleDef.pointer.type}`, class: `${SmartGauges.getAlias()}`, "pointer-events": "none",
            d: `M${lo},0 v${pr} h-${ptLength} v-${pr * 2} h${ptLength} v${pr} z`,
            fill: fill, stroke: stroke, "stroke-width": scaleDef.pointer.bWidth,
          }, scaleObj.scaleG, this._svgdoc);
        scaleObj.pointerActive = scaleDef.pointer.type == 8 ? scaleObj.pointer : null;
        break;
      }
      case 9:
      case 10: {
        const pr = scaleObj.radiusPCT * scaleDef.pointer.width;
        if (pr) {
          scaleObj.pointer = SmartWidgets.addElement("path", {
              name: `pointer-${scaleDef.pointer.type}`, class: `${SmartGauges.getAlias()}`, "pointer-events": "none",
              d: "m-" + ptLength + " 0 a " + pr + "," + pr + " 0 1,1 0,1 z", fill: fill, stroke: stroke, "stroke-width": 1,
            }, scaleObj.scaleG, this._svgdoc);
          scaleObj.pointerActive = scaleDef.pointer.type == 10 ? scaleObj.pointer : null;
        }
        break;
      }
      case 11:
      case 12: {
        let extR = scaleObj.radiusPCT * scaleDef.pointer.radius;
        const intR = extR - scaleObj.radiusPCT * scaleDef.pointer.width;
        const radius = (intR + extR) / 2;
        const val0 = this._convertVal2Angle(scaleDef.min, scaleDef);
        const val100 = this._convertVal2Angle(scaleDef.max, scaleDef);
        const d = this._describeArc(0, 0, radius, val0, val100, scaleDef.angs, scaleDef.ange);

        scaleObj.pointerSrc = SmartWidgets.addElement("path", {
            name: `pointer-${scaleDef.pointer.type}`, d: d, fill: "none", stroke: "none", "stroke-width": extR - intR, "pointer-events": "none",
          }, scaleObj.scaleG, this._svgdoc);

        scaleObj.pointer = SmartWidgets.addElement("path", {
            name: `pointer-${scaleDef.pointer.type}`, class: `${SmartGauges.getAlias()}`, d: d,
            fill: "none", stroke: stroke, "stroke-width": extR - intR, "pointer-events": "none",
          }, scaleObj.scaleG, this._svgdoc);
          
        const totLength = scaleObj.pointerSrc.getTotalLength();
        scaleObj.pointer.style.strokeDasharray = totLength + " " + totLength;
        scaleObj.pointerActive = scaleDef.pointer.type == 12 ? scaleObj.pointer : null;
        break;
      }
    }
    if (scaleObj.pointer) {
      scaleObj.pointer.style.transition = "all 1s ease-in-out";
      scaleObj.pointer.style.WebkitTransition = "all 1s ease-in-out";
    }
  }

  _build() {
    if (!this._inited) return;

    if (this._bp) {
      if (this._bp.body) {
        this._bp.body.removeEventListener("click", this._onClick);
        this._bp.body.removeEventListener("mouseover", this._onShowTooltip);
        this._bp.body.removeEventListener("mousemove", this._onMoveTooltip);
        this._bp.body.removeEventListener("mouseout", this._onHideTooltip);
      }
      if (this._bp.scales) {
        for (let scN = 0; scN < this._bp.scales.length; scN++) {
          const scale = this._bp.scales[scN];
          if (scale && scale.scaleG) {
            scale.scaleG.removeEventListener("click", this._onClick);
            scale.scaleG.removeEventListener("mouseover", this._onShowTooltip);
            scale.scaleG.removeEventListener("mousemove", this._onMoveTooltip);
            scale.scaleG.removeEventListener("mouseout", this._onHideTooltip);
          }
        }
      }
      if(this._bp.mainG) this._svgroot.removeChild(this._bp.mainG);
    }
    
    this._bp = {
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height,
      bodyActive: null,
      body: null,
      scales:[],
      mainG: SmartGauges.addElement("g", { name: "mainG" }, this._svgroot, this._svgdoc),
      scalesG: null,
    };

    this._drawBody();
    this._bp.radiusPCT = this._bp.radius / 100;

    this._bp.scalesG = SmartGauges.addElement("g", { name: "scalesG", transform: "translate(" + this._bp.centerPoint.x + "," + this._bp.centerPoint.y + ")" }, this._bp.mainG, this._svgdoc);

    for (let scN = 0; scN < this._o.scales.length; scN++) {
      const scaleDef = this._o.scales[scN];
      if(!scaleDef._thresholds) {
          scaleDef._thresholds = new StateToColors(); 
          scaleDef._thresholds.init(scaleDef.thrs.values);
      }

      const bodyRadius = this._bp.radiusPCT * scaleDef.radius;
      const scaleObj = {
        index: scN, radius: bodyRadius, radiusPCT: bodyRadius / 100, centerActive: null, dialActive: null, legendActive: null, pointerActive: null,
        scaleG: null, body: null, center: null, dial: null, legend: null, pointer: null, majorG: null, minorG: null, thresholdG: null,
      };
      
      const offset = this._bp.radiusPCT * scaleDef.offset;
      const pos = this._convertVal2Cartesian(scaleDef.way, offset);
      scaleObj.scaleG = SmartGauges.addElement("g", { name: "scaleG-" + scN, transform: "translate(" + pos.x + "," + pos.y + ")" }, this._bp.scalesG, this._svgdoc);

      this._drawDial(scaleDef, scaleObj);
      scaleObj.phaze = 0; 
      this._drawCenter(scaleDef, scaleObj);
      this._drawThresholds(scaleDef, scaleObj);
      this._drawScale(scaleDef, scaleObj);
      this._drawLegend(scaleDef, scaleObj);
      this._drawPointer(scaleDef, scaleObj);
      scaleObj.phaze = 1; 
      this._drawCenter(scaleDef, scaleObj);
      this._bp.scales.push(scaleObj);
    }
    if (this._bp.body) {
      this._bp.body.classList.add(this._o.bShadow ? "shadowed" : "no-shadows");
      this._bp.body.addEventListener("click", this._onClick);
      this._bp.body.addEventListener("mouseover", this._onShowTooltip);
      this._bp.body.addEventListener("mousemove", this._onMoveTooltip);
      this._bp.body.addEventListener("mouseout", this._onHideTooltip);
    }
  }

  _onShowTooltip(evt) {
    if (typeof SmartTooltip !== "undefined") {
      if (!this._o.ttip || this._o.ttipType !== "own") return;
      let tta = Array.from(this._data);
      if(!tta.length) return;
      const data = {
        id: this.id,
        x: evt.clientX,
        y: evt.clientY,
        title: tta[0],
        options: {
          location: this._bp.body.getBoundingClientRect(),
          delayOut: 1000,
          showMode: "pinned",
          template: this._o.ttipTemplate,
          titleFormat: this._o.titleFormat,
          descrFormat: this._o.descrFormat,
          position: this._o.position,
        },
      };
      SmartTooltip.showTooltip(data, evt);
    }
  }

  _onMoveTooltip(evt) { }

  _onHideTooltip(evt) {
    if (typeof SmartTooltip !== "undefined") {
      if (!this._o.ttip || this._o.ttipType !== "own") return;
      SmartTooltip.hideTooltip(evt);
    }
  }

  _onClick(event) {
    event.preventDefault();
    if (this._o.lnk && this._data && this._data.size > 0) {
      let dataArr = Array.from(this._data);
      let linkto = dataArr[0].link;
      if (linkto) {
        linkto = SmartGauges.getLink(linkto);
        window.open(linkto, "");
      }
    }
  }

  findScaleIndex(uuid) {
    for (let scN = 0; scN < this._o.scales.length; scN++) {
      if (this._o.scales[scN].uuid === uuid) return scN;
    }
    return -1;
  }

  getAlias() { return this._o.alias; }
  getCtrl() { return this; }
  isInited() { return this._inited; }

  init(options = null) {
    if (options) {
      const widgetsAlias = SmartWidgets.getAlias();
      if (typeof options === "string" && options.length) {
        if (options.startsWith(widgetsAlias)) {
          options = SmartGauge.JsonToOptions(options);
        } else {
          options = JSON.parse(options);
        }
      }
      SmartGauge.convertNumericProps(options);
      this._o = Object.assign({}, this._o, options);
    }
    const rc = this._svgroot.firstElementChild;
    if(rc) {
        this._rect = rc.getBBox();
        rc.setAttribute("display", "none");
        if (!this._mode) {
            if (this._rect.width == 0 || this._rect.height == 0) {
                this._rect = {
                    x: Number(rc.getAttribute("x")),
                    y: Number(rc.getAttribute("y")),
                    width: Number(rc.getAttribute("width")),
                    height: Number(rc.getAttribute("height")),
                };
                this._rect.width = this._rect.width || this._rect.height;
                this._rect.height = this._rect.height || this._rect.width;
            }
        } else {
            this._rect = {
                x: 0, y: 0,
                width: options.width || options.height || this._o.bR * 2,
                height: options.height || options.width || this._o.bR * 2,
            };
        }
    } else {
         this._rect = {
            x: 0, y: 0,
            width: options.width || options.height || this._o.bR * 2,
            height: options.height || options.width || this._o.bR * 2,
        };       
    }
    this._inited = true;
    this._build();

    this._data = new Set();
    if (typeof SmartTooltip !== "undefined") {
      if (this._o.ttipType == "own" && this._o.ttipTemplate) {
        SmartTooltip.initTooltip(this.id, this._o.ttipTemplate);
      }
    }
  }

  isRun() { return this._o.isRun; }
  run(isRun) {
    let emMode = 0;
    if (typeof isRun === "string") {
      emMode = (isRun === "1" || isRun === "true") ? 1 : 0;
    } else {
      emMode = isRun ? 1 : 0;
    }
    this._o.isRun = emMode;
  }
  
  get intervalCounter() { return this._intervalCounter; }
  set intervalCounter(n) { this._intervalCounter = n <= 0 ? this._o.interval : n; }
  isEmulate() { return this._o.isEmulate; }
  emulate(mode) {
    let emMode = 0;
    if (typeof mode === "string") {
      if (mode === "1" || mode === "true") emMode = 1;
      else if (mode === "-1") emMode = -1;
    } else {
      emMode = mode;
    }
    this._o.isEmulate = emMode;
  }

  update(data = null) {
    if (!data) {
      if (this._o.server != "" && this._o.target != "") {
        SmartWidgets._httpGet(this._o.server + this._o.target)
          .then((response) => {
            let parsedData = JSON.parse(response);
            this._data.clear();
            
            // Universal handling: arrays or objects
            let targetPayload = parsedData.targets || parsedData.target;
            if(!Array.isArray(targetPayload)) targetPayload = [targetPayload];
            
            this._data = new Set(targetPayload);
            this._buildActive(this._data);
            if (this._o.role === "demoMode") window.SmartGauges.update("gauge-wdg", parsedData);
          }).catch((error) => console.error(error));
      } else {
        const fakeData = { target: { uuid: this._o.scales[0].uuid, name: "Name", value: "85", color: "crimson"} };
        this._data.clear();
        this._data = new Set([fakeData.target]);
        this._buildActive(this._data);
      }
    } else {
      let options = null;
      if (typeof data.cfg === "object") options = data.cfg;
      if (typeof data.opt === "object") options = data.opt;
      let needRebuild = this.setParams(options, false);
      
      if (typeof data.targets === "object") {
        this._data = new Set(data.targets);
      } else if (typeof data.target === "object") {
          this._data = new Set([data.target]);
      }
      
      if (needRebuild) this._build();
      else this._buildActive(this._data);
    }
  }

  generateExData() {
    const dataArr =[];
    for (let scN = 0; scN < this._o.scales.length; scN++) {
      const scaleDef = this._o.scales[scN];
      const max = scaleDef.max;
      const min = scaleDef.min;
      const value = Math.floor(Math.random() * (max - min + 1) + min);
      
      const dt = {
        uuid: `${scaleDef.uuid}`, 
        units: "kb/s",
        value: `${value}${scaleDef.pct ? "%" : ""}`,
        minValue: scaleDef.min,
        maxValue: scaleDef.max,
        tooltip: scaleDef.ttip ? `Scale s${scN + 1} value ${value}` : "",
        link: scaleDef.lnk ? "http://www.google.com" : "",
        legend: `${value}`,
      };
      dataArr.push(dt);
    }
    return { targets: dataArr, cfg: null, opt: null };
  }

  getParams(filter = "all") {
    const customProp = SmartGauge.getCustomProperties();
    const defOptions = SmartGauge.defOptions();
    return SmartWidgets.getCustomParams(customProp, defOptions, this._o, filter);
  }
  
  setParam(name, value) {
    if (this.dontRespond) return;
    const opt = {};
    opt[name] = value;
    SmartGauge.convertNumericProps(opt, name);
    if (this._bp && this._bp.body) this.setParams(opt);
  }

  resetParams(options = null) {
    if (options) {
      this._o = Object.assign({}, SmartGauge.defOptions(), options);
      this._build();
    }
  }

  setParams(options = {}, rebuild = true) {
    let needRebuild = false;
    if (!options) return false;
    SmartGauge.convertNumericProps(options);
    this._o = Object.assign({}, this._o, options);

    for (let key in options) {
      switch (key) {
        case "position": case "ttipTemplate": case "lnk": case "ttip":
        case "isEmulate": case "isRun": case "interval": case "server":
        case "target": case "user":
          break;
        default:
          needRebuild++;
          break;
      }
    }
    if (rebuild && needRebuild) this._build();
    return needRebuild;
  }
}

class SmartGaugeElement extends HTMLElement {
  constructor(id) {
    super();
    SmartGauges.init();

    const txtStyle = `
			:host { all: initial; contain: content; opacity: 1; will-change: opacity; transition: opacity 500ms ease-in-out; }
			:host([background]) { background: var(--stwidget-bgk, #9E9E9E); }
			:host(:hover) { --stwidget-ftm-fill: var(--stwidget-over-fill, white); }
			:host([disabled]) { pointer-events: none; opacity: 0.4; }
		`;

    if (!!!HTMLElement.prototype.attachShadow) throw new Error("Browser does not support shadow DOM v1.");
    
    this._id = this.getAttribute("id") || id;
    this._o = {};
    this._root = this.attachShadow({ mode: "open" });
    const elemId = window.SmartGauges.getId();
    const svgId = `${this.id}--${SmartGauges.getAlias()}`;
    
    this._root.innerHTML = `
			<style>${txtStyle}</style>
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${svgId}">
				<g id="${elemId}">
					<rect id="fakeR" x="10" y="10" width="150" height="150" fill="#eee" stroke="black" stroke-dasharray="4 4"></rect>
				</g>
			</svg>
		`;
    this._svgroot = this._root.querySelector("svg");
    this._stwdg = new SmartGauge(elemId, { context: this._svgroot, mode: "html", opt: null });
    window.SmartGauges.set(this._id, this);
  }
  
  getCtrl() { return this._stwdg; }

  static get observedAttributes() { return SmartGauge.getCustomProperties(); }
  
  attributeChangedCallback(name, oldValue, newValue) {
    const paramName = SmartWidgets.customProp2Param(name);
    this._o[paramName] = newValue;
    this._stwdg.setParam(paramName, newValue);
  }

  connectedCallback() {
    const compStyle = getComputedStyle(this);
    const customProp = SmartGauge.getCustomProperties();
    for (let n = 0; n < customProp.length; n++) {
      const prop = `--${SmartGauges.getAlias()}-${customProp[n]}`;
      const propKey = SmartWidgets.customProp2Param(`${customProp[n]}`);
      let propVal = compStyle.getPropertyValue(prop);
      if (propVal) {
        propVal = propVal.trimLeft();
        this._o[propKey] = propVal;
      }
    }
    this._stwdg.init(this._o);
    let size = Math.max(this._stwdg._bp.height, this._stwdg._bp.width);
    this._svgroot.setAttribute("height", size);
    this._svgroot.setAttribute("width", size);
    this._svgroot.setAttribute("viewBox", `0 0 ${size} ${size}`);
  }
  
  disconnectedCallback() {
    window.SmartGauges.unset(this._id);
    this._stwdg = null;
    this._root = null;
    this._o = null;
  }
}
window.customElements.define("smart-ui-gauge", SmartGaugeElement);