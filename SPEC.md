# Aguacate AI - Specification Document

## 1. Project Overview

**Project Name:** Aguacate AI  
**Type:** Cross-platform Mobile & Desktop Application  
**Core Functionality:** AI-powered mobile and desktop application that scans avocado leaves to detect diseases and analyzes avocado fruits to determine their ripeness level.

## 2. Technology Stack

### Mobile Application
- **Framework:** React Native with Expo
- **Camera:** expo-camera for image capture
- **AI/ML:** TensorFlow.js or TensorFlow Lite for on-device inference
- **State Management:** React Context API
- **Navigation:** React Navigation

### Desktop Application
- **Framework:** Electron with React
- **Camera:** WebRTC / MediaDevices API
- **AI/ML:** TensorFlow.js for browser-based inference
- **State Management:** React Context API
- **UI Framework:** Material UI or custom React components

### AI Models
- **Leaf Disease Detection:** Pre-trained CNN model (MobileNet/ResNet based)
- **Ripeness Detection:** Pre-trained image classification model
- **Offline Support:** TensorFlow.js with saved model weights
- **Online Support:** Cloud API fallback option

## 3. Feature List

### Core Features
1. **Camera Integration**
   - Real-time camera preview
   - Photo capture functionality
   - Gallery image selection

2. **Leaf Disease Detection**
   - Analyze avocado leaf images
   - Identify common diseases (anthracnose, powdery mildew, leaf spot, etc.)
   - Display disease name, confidence level, and treatment recommendations

3. **Ripeness Detection**
   - Analyze avocado fruit images
   - Determine ripeness stages (unripe, ripe, overripe)
   - Display ripeness percentage and recommendations

4. **Offline/Online Mode**
   - Local AI model inference when offline
   - Cloud API integration when online
   - Automatic sync between modes

5. **History & Results**
   - Save scan history locally
   - View previous results
   - Share results functionality

### UI Screens
1. **Home Screen** - Main dashboard with scan options
2. **Scan Screen** - Camera view for capturing images
3. **Results Screen** - Display analysis results
4. **History Screen** - View past scans
5. **Settings Screen** - App configuration

## 4. Architecture

```
AguacateAI/
├── mobile/                 # React Native (Expo) app
│   ├── App.js
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── models/         # TensorFlow models
│   │   └── utils/
│   └── package.json
├── desktop/                # Electron + React app
│   ├── main.js             # Electron main process
│   ├── renderer/           # React app
│   │   ├── src/
│   │   └── package.json
│   └── package.json
├── models/                 # AI models
│   ├── leaf-disease/
│   └── ripeness/
├── SPEC.md
└── README.md
```

## 5. Supported Diseases (Leaf Analysis)
- Anthracnose
- Powdery Mildew
- Leaf Spot
- Cercospora Leaf Spot
- Sunburn
- Nutrient Deficiency
- Healthy Leaf

## 6. Ripeness Stages (Fruit Analysis)
- Unripe (0-30%)
- Almost Ripe (30-60%)
- Ripe (60-85%)
- Overripe (85-100%)

## 7. UI/UX Design

### Color Scheme
- **Primary:** Green (#2E7D32)
- **Secondary:** Light Green (#8BC34A)
- **Accent:** Yellow (#FFC107)
- **Background:** White (#FFFFFF)
- **Text:** Dark Gray (#212121)

### Design Principles
- Simple and intuitive interface
- Large touch targets for mobile
- Clear visual feedback during scanning
- Accessible for all user levels
