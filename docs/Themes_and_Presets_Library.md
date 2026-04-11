# SmartWidgets Themes & Presets Library

This document explains the structure and purpose of the `smartwidgets.types.js` file. This file acts as a built-in preset library, providing ready-to-use themes and configurations for various widgets in the SmartUI ecosystem.

## 1. The Concept of Positional Compression

To minimize memory footprint and network traffic, the library avoids storing large, verbose JSON objects for every preset. Instead, it uses a highly optimized positional encoding system. 

All configuration properties are compressed into a single string. The position of each value in the string corresponds directly to the index of the property array defined by the widget's internal `getCustomProperties()` method.

## 2. String Format Breakdown

Each preset in the `SMART_WIDGETS` array is stored as a stringified JSON object containing a single key: `stwidget`. The value of this key is the compressed configuration string.

### 2.1. The Separator (Hyphen)
Values within the string are separated by a hyphen (`-`). During decompression, the string is split by this character to assign values to their respective properties.

### 2.2. The Default Value Marker (Dot)
A dot (`.`) is used as a placeholder. It tells the parser: "Do not overwrite this property; keep the default value defined by the widget." This makes the strings much shorter when only a few parameters need to be changed.

### 2.3. The Widget Alias (First Token)
The very first token in the string identifies which widget this preset belongs to. The parser reads this prefix to route the preset to the correct class:
* `stbar`: Preset for SmartBar
* `stpgn`: Preset for SmartPolygon
* `stpal`: Preset for SmartPalette

## 3. How the "Black Box" Unpacks It

The base class `SmartWidgets` and its inherited classes use the static method `JsonToOptions(jsonString)` to decode these strings. 

When a compressed string (e.g., `stbar-.-.-discrete-ver...`) is passed to this method:
1. The method extracts the alias (`stbar`).
2. It calls `SmartBar.getCustomProperties()` to get the ordered list of property names.
3. It iterates through the hyphen-separated values.
4. If it sees a dot (`.`), it skips to the next property.
5. If it sees a value, it converts it to the correct format (string or number) and maps it to the property name using camelCase conversion (e.g., `start-angle` becomes `startAngle`).
6. It returns a fully hydrated `options` object that the widget uses to render itself.

This mechanism allows the entire library to offer dozens of complex visual themes while taking up only a few kilobytes of space.