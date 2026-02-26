# 🥑 Aguacate AI

Aplicación de inteligencia artificial para analizar hojas y frutos de aguacate. Detecta enfermedades en hojas y determina el nivel de maduración de los frutos.

## Características

- 📷 **Escaneo de hojas**: Detecta enfermedades comunes en hojas de aguacate
- 🍏 **Análisis de maduración**: Determina el estado de madurez del aguacate
- 🤖 **IA integrada**: Análisis mediante modelos de inteligencia artificial
- 💾 **Historial**: Guarda el historial de análisis realizados
- 📱 **Multiplataforma**: Disponible para móvil (iOS/Android) y escritorio (Windows/Mac/Linux)
- 🌐 **Sin conexión**: Funciona sin internet (modo offline)

## Tecnologías

### Móvil (React Native + Expo)
- React Native con Expo
- expo-camera para cámara
- expo-image-picker para galería
- TensorFlow.js para IA

### Escritorio (Electron + React)
- Electron
- React.js
- WebRTC para cámara web
- TensorFlow.js para IA

## Estructura del Proyecto

```
AguacateAI/
├── mobile/          # Aplicación móvil (React Native/Expo)
├── desktop/         # Aplicación de escritorio (Electron)
├── models/          # Modelos de IA
├── SPEC.md          # Especificación del proyecto
└── TODO.md          # Lista de tareas
```

## Instalación

### Aplicación Móvil

```
bash
cd mobile
npm install
npm start
```

Para ejecutar en Android:
```
bash
npm run android
```

Para ejecutar en iOS (Mac):
```
bash
npm run ios
```

### Aplicación de Escritorio

```
bash
cd desktop
npm install
npm run dev
```

Para construir el ejecutable:
```
bash
npm run build
```

## Idiomas

La interfaz está disponible en español.

### Enfermedades Detectadas

- Antracnosis
- Mildiú Polvoriento
- Mancha Foliar
- Mancha de Cercospora
- Quemadura Solar
- Deficiencia de Nutrientes
- Hoja Sana

### Estados de Maduración

- Verde (0-30%)
- Casi Maduro (30-60%)
- Maduro (60-85%)
- Sobremaduro (85-100%)

## Licencia

MIT License
