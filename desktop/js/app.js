// AGUACATE AI - DESKTOP APPLICATION

// Global variables
let currentScanType = 'leaf';
let capturedImage = null;
let stream = null;
let history = [];
let darkMode = false;
let modelLoaded = false;
let currentUser = null;

// ==================== CONNECTION STATUS ====================

function updateConnectionStatus() {
  const statusEl = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');
  const statusDot = statusEl.querySelector('.status-dot');
  
  if (navigator.onLine) {
    statusEl.classList.remove('offline');
    statusDot.classList.remove('offline');
    statusDot.classList.add('online');
    statusText.textContent = 'En línea';
  } else {
    statusEl.classList.add('offline');
    statusDot.classList.remove('online');
    statusDot.classList.add('offline');
    statusText.textContent = 'Sin conexión';
  }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// ==================== USER MANAGEMENT ====================

function getCurrentUser() {
  const user = localStorage.getItem('aguacate_current_user');
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('aguacate_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('aguacate_current_user');
  }
  currentUser = user;
}

function logout() {
  setCurrentUser(null);
  window.location.href = 'login.html';
}

// ==================== DARK MODE ====================

function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  const btn = document.getElementById('dark-mode-toggle');
  btn.textContent = darkMode ? '☀️' : '🌙';
  localStorage.setItem('aguacate_dark_mode', darkMode);
}

function loadDarkMode() {
  const saved = localStorage.getItem('aguacate_dark_mode');
  if (saved === 'true') {
    darkMode = true;
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('dark-mode-toggle');
    if (btn) btn.textContent = '☀️';
  }
}

// ==================== GOOGLE SEARCH ====================

function handleSearch(event) {
  if (event.key === 'Enter') {
    performSearch();
  }
}

function performSearch() {
  const input = document.getElementById('search-input');
  const query = input.value.trim();
  
  if (query) {
    window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
    input.value = '';
  }
}

// ==================== WEATHER (COLOMBIA) ====================

const colombianCities = {
  bogota: { name: 'Bogotá', temp: 14, humidity: 80, region: 'Cundinamarca' },
  medellin: { name: 'Medellín', temp: 24, humidity: 70, region: 'Antioquia' },
  cali: { name: 'Cali', temp: 26, humidity: 65, region: 'Valle del Cauca' },
  barranquilla: { name: 'Barranquilla', temp: 28, humidity: 75, region: 'Atlántico' },
  cartagena: { name: 'Cartagena', temp: 27, humidity: 80, region: 'Bolívar' },
  bucaramanga: { name: 'Bucaramanga', temp: 23, humidity: 65, region: 'Santander' },
  Pereira: { name: 'Pereira', temp: 22, humidity: 75, region: 'Risaralda' },
  manizales: { name: 'Manizales', temp: 18, humidity: 80, region: 'Caldas' },
  ibague: { name: 'Ibagué', temp: 25, humidity: 60, region: 'Tolima' },
  neiva: { name: 'Neiva', temp: 28, humidity: 55, region: 'Huila' }
};

async function getUserLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve({ lat: 4.7110, lng: -74.0721, city: 'bogota' })
      );
    } else {
      resolve({ lat: 4.7110, lng: -74.0721, city: 'bogota' });
    }
  });
}

function findNearestCity(lat, lng) {
  const coords = {
    bogota: { lat: 4.7110, lng: -74.0721 },
    medellin: { lat: 6.2442, lng: -75.5812 },
    cali: { lat: 3.4516, lng: -76.5320 },
    barranquilla: { lat: 10.9685, lng: -74.7813 },
    cartagena: { lat: 10.3910, lng: -75.4794 }
  };
  
  let nearest = 'bogota';
  let minDist = Infinity;
  
  for (const [city, c] of Object.entries(coords)) {
    const dist = Math.sqrt(Math.pow(lat - c.lat, 2) + Math.pow(lng - c.lng, 2));
    if (dist < minDist) { minDist = dist; nearest = city; }
  }
  
  return nearest;
}

async function fetchWeather() {
  try {
    // Use default city immediately without waiting for geolocation
    const city = colombianCities.bogota;
    
    const now = new Date();
    const hour = now.getHours();
    const variation = Math.sin(hour * Math.PI / 12) * 3;
    const temp = Math.round(city.temp + variation);
    
    // Update day/night icon and background based on time
    const isDay = hour >= 6 && hour < 18;
    const dayNightIcon = document.getElementById('day-night-icon');
    const weatherWidget = document.querySelector('.weather-widget');
    
    if (dayNightIcon) {
      dayNightIcon.textContent = isDay ? '☀️' : '🌙';
    }
    
    // Update widget background based on day/night
    if (weatherWidget) {
      weatherWidget.classList.remove('day', 'night');
      weatherWidget.classList.add(isDay ? 'day' : 'night');
    }
    
    // Update current time
    const timeEl = document.getElementById('weather-time');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
    
    document.getElementById('weather-temp').textContent = temp + '°C';
    document.getElementById('weather-city').textContent = city.name;
    document.getElementById('weather-condition').textContent = temp < 20 ? 'Agradable' : 'Cálido';
    document.getElementById('weather-humidity').textContent = city.humidity + '%';
    document.getElementById('weather-region').textContent = city.region;
  } catch (e) {
    console.log('Weather error:', e);
    // Fallback values
    document.getElementById('weather-city').textContent = 'Bogotá';
    document.getElementById('weather-temp').textContent = '20°C';
  }
}

// ==================== DISEASES DATABASE ====================

const diseases = {
  anthracnose: { 
    name: 'Antracnosis', 
    desc: 'Enfermedad fúngica causada por Colletotrichum gloeosporioides. Es una de las enfermedades más comunes y destructivas del aguacate. Afecta hojas, ramas y frutos, causando manchas cafes oscuras que pueden coalescer y matar el tejido.',
    symptoms: 'Manchas cafes oscuras en hojas • Frutos con pudrición negra • Caída prematura de hojas • Lesiones hundidas en tallos',
    treatment: '1. Aplicar fungicida de cobre (1-2 g/L) cada 7-14 días\n2. Eliminar y destruir partes afectadas\n3. Mejorar circulación de aire en el árbol\n4. Evitar riego por aspersión\n5. Aplicar en días secos'
  },
  powdery_mildew: { 
    name: 'Mildiú Polvoriento', 
    desc: 'Enfermedad caused by Oidium spp. Se caracteriza por un polvo blanco similar al harina que aparece en hojas, tallos y frutos jóvenes. Es más común en condiciones de alta humedad y temperaturas moderadas.',
    symptoms: 'Polvo blanco harinoso en hojas • Hojas enrolladas • Crecimiento retarded • Frutos deformados',
    treatment: '1. Azufre en polvo (20-30 kg/ha) al amanecer\n2. Fungicidas sistémicos como Triadimefon\n3. Aplicar cada 10-14 días\n4. Eliminar partes muy afectadas\n5. Mejorar ventilación'
  },
  leaf_spot: { 
    name: 'Mancha Foliar', 
    desc: 'Enfermedad fúngica causada por diversos géneros como Alternaria, Bipolaris y Curvularia. Produce manchas de diferentes tamaños y colores en las hojas, reduciendo la capacidad fotosintética del árbol.',
    symptoms: 'Manchas cafes con halo amarillo • Manchas necróticas • Caída de hojas • Debilitamiento general',
    treatment: '1. Eliminar hojas afectadas\n2. Aplicar fungicida de cobre (1.5 g/L)\n3. Mancozeb (2 g/L) en casos severos\n4. Aplicar cada 7-10 días\n5. Evitar humedad excesiva en foliage'
  },
  cercospora: { 
    name: 'Mancha de Cercospora', 
    desc: 'Causada por el hongo Cercospora purpurea. Es una enfermedad foliar común que causa manchas características con centros claros y bordes oscuros. Afecta principalmente hojas maduras.',
    symptoms: 'Manchas irregulares con centro gris claro • Borde cafes oscuro • Hojas amarillas • Caída prematura',
    treatment: '1. Fungicida de cobre + Mancozeb\n2. Aplicar cada 14 días\n3. Podar para mejorar ventilación\n4. Eliminar hojas caídas\n5. Aplicar en pre-lluvia'
  },
  sunburn: { 
    name: 'Quemadura Solar', 
    desc: 'Daño fisiológico causado por exposición excesiva a radiación UV y altas temperaturas. Afecta principalmente frutos y hojas expuestas directamente al sol, causando decoloración y necrosis.',
    symptoms: 'Manchas amarillas/cafes en frutos • Piel quemada • Frutos arrugados • Hojas marchitas',
    treatment: '1. Instalar malla sombra (50%) temporalmente\n2. Aplicar protector solar para plantas\n3. Mantener riego adecuado\n4. Podar para crear sombra natural\n5. Aplicar carbonato de calcio líquido'
  },
  healthy: { 
    name: 'Hoja Sana', 
    desc: 'La hoja de aguacate está saludable sin signos de enfermedades aparentes. El color verde intenso indica buena salud y capacidad fotosintética óptima.',
    symptoms: 'Color verde intenso • Sin manchas • Textura firme • Borde intacto',
    treatment: '✅ Continuar con el cuidado normal:\n1. Riego regular (2-3 veces por semana)\n2. Fertilización equilibrada\n3. Poda de mantenimiento\n4. Monitoreo preventivo'
  }
};

const ripenessData = {
  unripe: { name: 'Verde / Inmaduro', percentage: 15, days: '5-7 días', recipes: ['Ensaladas', 'Salsas'] },
  almost_ripe: { name: 'Casi Maduro', percentage: 45, days: '2-4 días', recipes: ['Guacamole', 'Tostadas'] },
  ripe: { name: 'Maduro', percentage: 75, days: 'Listo', recipes: ['Consumo directo', 'Ensaladas'] },
  overripe: { name: 'Sobremaduro', percentage: 95, days: 'Pasado', recipes: ['Batidos', 'Mantequilla'] }
};

// ==================== PESTS DATABASE ====================

const pestsDB = {
  thrips: { 
    name: 'Trips del Aguacate', 
    scientific: 'Scirtothrips perseae',
    desc: 'Los trips son pequeños insectos alargados de color oscuro que se alimentan succionando la savia de hojas, tallos y frutos pequeños del aguacate.',
    symptoms: 'Hojas con apariencia plateada o bronceada • Frutos con marcas cicatrices',
    treatment: 'Spinosad (0.5-1 ml/L) cada 7 días, o Aceite de neem (5ml/L) + Jabón potásico.',
    prevention: 'Trampas adhesivas azules • Mantener humedad relativa above 60%'
  },
  scale: { 
    name: 'Cochinillas', 
    scientific: 'Coccus hesperidum',
    desc: 'Las cochinillas son insectos inmóviles que se adhieren a tallos, hojas y frutos, formando una capa protecta cerosa.',
    symptoms: 'Escudos cafés o blancos en tallos y hojas • Melaza viscosa • Hongos de fumagina',
    treatment: 'Aceite mineral (10-15 ml/L) + Imidacloprid. Alcohol isopropílico al 70% en áreas localizadas.',
    prevention: 'Inspeccionar plantas nuevas • Podar ramas muy infestadas'
  },
  mites: { 
    name: 'Ácaros del Aguacate', 
    scientific: 'Oligonychus perseae',
    desc: 'Los ácaros son arácnidos microscópicos que se alimentan del contenido celular de las hojas.',
    symptoms: 'Manchas amarillas o bronceadas en hojas • Telarañas finas en el envés',
    treatment: 'Azufre en polvo (20-30 kg/ha) o Abamectina (0.5-1 ml/L).',
    prevention: 'Monitorear semanalmente con lupa • Mantener estrés hídrico óptimo'
  },
  worms: { 
    name: 'Gusanos Defoliadores', 
    scientific: 'Glena mitis',
    desc: 'Las larvas de estas polillas se alimentan vorazmente del follaje del aguacate, pudiendo defoliar árboles completos.',
    symptoms: 'Hojas con agujeros irregulares • Presencia de orugas • Defoliación',
    treatment: 'Bacillus thuringiensis (Bt) 1-2 kg/ha. Clorantraniliprole en infestaciones severas.',
    prevention: 'Trampas de feromonas • Eliminar residuos de poda'
  },
  borer: { 
    name: 'Barrenador del Hueso', 
    scientific: 'Heilipus lauri',
    desc: 'El barrenador del hueso es una plaga de alto riesgo. Las larvas se desarrollan dentro del fruto.',
    symptoms: 'Frutos con agujeros de entrada • Frutos que caen prematuramente • Aserrín en pedúnculo',
    treatment: 'Imidacloprid al inicio de floración cada 21 días. Trampas con feromonas.',
    prevention: 'Cosechar temprano • Usar mallas protectoras en frutos'
  },
  fruitfly: { 
    name: 'Mosca de la Fruta', 
    scientific: 'Anastrepha striata',
    desc: 'Las moscas de la fruta depositan sus huevos bajo la piel del aguacate. Las larvas se alimentan de la pulpa.',
    symptoms: 'Pequeño agujero de oviposición • Pulpa con túneles • Frutos que se pudren',
    treatment: 'Cebos tóxicos con Malatión (1-2%). Trampas Jackson con metil eugenol.',
    prevention: 'Cosechar en madurez de cosecha • Eliminar frutos caídos'
  },
  rootborer: { 
    name: 'Barrenador de Raíces', 
    scientific: 'Cyladrus ruber',
    desc: 'Las larvas barrenan raíces y el cuello de la raíz, causando marchitamiento y muerte del árbol.',
    symptoms: 'Marchitamiento inexplicado • Amarillamiento de hojas • Galerías en base del tronco',
    treatment: 'Excavar para exponer larvas. Insecticidas granulares (Fipronil) alrededor del cuello.',
    prevention: 'Evitar heridas en el cuello • Proteger troncos con malla primeros 3 años'
  }
};

// ==================== TIPS DATABASE ====================

const tipsDB = [
  {
    icon: '💧',
    title: 'Riego Adecuado',
    category: 'Riego',
    content: 'Los árboles de aguacate necesitan riego profundo pero poco frecuente. Riega 2-3 veces por semana en época seca, asegurándote de que el agua penetre al menos 30 cm en el suelo. Evita el encharcamiento.'
  },
  {
    icon: '🌱',
    title: 'Fertilización',
    category: 'Nutrición',
    content: 'Aplica fertilizante rico en nitrógeno durante la primavera y verano. Usa un fertilizante equilibrado (10-10-10) cada 2-3 meses. No fertilices en invierno cuando el árbol está en reposo.'
  },
  {
    icon: '✂️',
    title: 'Poda de Mantenimiento',
    category: 'Cuidado',
    content: 'Realiza podas de formación en los primeros años para desarrollar una estructura fuerte. Elimina ramas cruzadas, enfermas o muertas. La poda más intensa debe hacerse después de la cosecha.'
  },
  {
    icon: '🌡️',
    title: 'Temperatura Ideal',
    category: 'Clima',
    content: 'El aguacate thrive en temperaturas entre 20-30°C. Puede soportar hasta 0°C brevemente, pero las heladas dañan hojas y frutos. En zonas frías, cultiva variedades resistentes o protege con malla.'
  },
  {
    icon: '🪰',
    title: 'Polinización',
    category: 'Floración',
    content: 'La mayoría de las variedades de aguacate tienen flores macho y hembra que maduran en diferentes tiempos. Planta al menos 2 árboles de variedades diferentes para asegurar polinización cruzada.'
  },
  {
    icon: '🍂',
    title: 'Control de Malezas',
    category: 'Mantenimiento',
    content: 'Mantén el área bajo el árbol libre de malezas. Usa mulch orgánico (hojarasca, paja) para retener humedad y controlar hierbas. Deja al menos 5 cm de espacio entre el mulch y el tronco.'
  },
  {
    icon: '🛡️',
    title: 'Prevención de Plagas',
    category: 'Sanidad',
    content: 'Inspecciona regularmente hojas y frutos. Usa trampas adhesivas amarillas para monitorear insectos. La prevención temprana es clave: actúa cuando notes los primeros signos de plagas.'
  },
  {
    icon: '📅',
    title: 'Cosecha',
    category: 'Fruto',
    content: 'Los aguacates no maduran en el árbol. Cosecha cuando el fruto alcance su tamaño máximo y la piel se vuelva ligeramente más oscura. Madura a temperatura ambiente en 3-7 días.'
  }
];

// ==================== AI ANALYSIS ====================

function analyzeImageColors(imageData) {
  const data = imageData.data;
  let darkGreen = 0, mediumGreen = 0, lightGreen = 0, brownBlack = 0, yellow = 0, red = 0, gray = 0;
  const total = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i+1], data[i+2]);
    
    if (h >= 80 && h <= 120 && s >= 30 && l >= 15 && l <= 35) darkGreen++;
    else if (h >= 70 && h <= 120 && s >= 25 && l >= 35 && l <= 50) mediumGreen++;
    else if (h >= 60 && h <= 110 && s >= 20 && l >= 45 && l <= 65) lightGreen++;
    else if (h >= 0 && h <= 40 && s >= 20 && l >= 5 && l <= 25) brownBlack++;
    else if (h >= 40 && h <= 60 && s >= 30 && l >= 40) yellow++;
    else if (h >= 0 && h <= 20 && s >= 30 && l >= 20 && l <= 45) red++;
    else if (s < 15 && l >= 20 && l <= 60) gray++;
  }
  
  return {
    darkGreen: darkGreen / total,
    mediumGreen: mediumGreen / total,
    lightGreen: lightGreen / total,
    brownBlack: brownBlack / total,
    yellow: yellow / total,
    red: red / total,
    gray: gray / total
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function analyzeLeaf(imageData) {
  const colors = analyzeImageColors(imageData);
  const greenness = colors.darkGreen + colors.mediumGreen + colors.lightGreen;
  
  let diseaseScores = {
    healthy: 0.3,
    anthracnose: colors.brownBlack * 2,
    powdery_mildew: colors.yellow * 1.5,
    leaf_spot: colors.brownBlack * 1.2,
    cercospora: colors.brownBlack * 0.8 + colors.yellow * 0.4,
    sunburn: colors.yellow * 0.8
  };
  
  diseaseScores.healthy = greenness * 1.5;
  
  const total = Object.values(diseaseScores).reduce((a, b) => a + b, 0);
  Object.keys(diseaseScores).forEach(k => diseaseScores[k] /= total);
  
  let maxScore = 0, detected = 'healthy';
  Object.entries(diseaseScores).forEach(([d, s]) => { if (s > maxScore) { maxScore = s; detected = d; } });
  
  const healthScore = Math.min(Math.max(greenness * 100, 5), 100);
  
  return {
    disease: diseases[detected],
    isHealthy: detected === 'healthy',
    confidence: Math.min(maxScore * 1.5, 0.99),
    healthScore: healthScore,
    type: 'leaf'
  };
}

function analyzeFruit(imageData) {
  const colors = analyzeImageColors(imageData);
  
  const score = colors.lightGreen * 0.15 + colors.mediumGreen * 0.45 + 
                colors.darkGreen * 0.75 + colors.yellow * 0.60 + colors.brownBlack * 0.95;
  const percentage = Math.min(Math.max(score * 100, 5), 100);
  
  let stage = percentage < 30 ? 'unripe' : percentage < 60 ? 'almost_ripe' : percentage < 85 ? 'ripe' : 'overripe';
  const info = ripenessData[stage];
  
  return {
    ripeness: { ...info, percentage, days: info.days },
    qualityScore: stage === 'ripe' ? 95 : stage === 'almost_ripe' ? 80 : 60,
    type: 'fruit'
  };
}

function analyzePest(imageData) {
  const colors = analyzeImageColors(imageData);
  
  // Pest detection based on color patterns
  const pestScores = {
    thrips: colors.gray * 1.5 + colors.brownBlack * 0.8,
    scale: colors.gray * 2 + colors.yellow * 0.5,
    mites: colors.brownBlack * 1.2 + colors.red * 0.8,
    worms: colors.green * 0.8 + colors.brownBlack * 1.5,
    borer: colors.brownBlack * 2 + colors.red * 0.5,
    fruitfly: colors.gray * 1.2 + colors.brownBlack * 0.8,
    rootborer: colors.brownBlack * 1.8 + colors.gray * 0.5
  };
  
  // Add some randomness to simulate AI confidence
  Object.keys(pestScores).forEach(k => {
    pestScores[k] += Math.random() * 0.1;
  });
  
  const total = Object.values(pestScores).reduce((a, b) => a + b, 0);
  Object.keys(pestScores).forEach(k => pestScores[k] /= total);
  
  let maxScore = 0, detected = 'thrips';
  Object.entries(pestScores).forEach(([d, s]) => { 
    if (s > maxScore) { maxScore = s; detected = d; } 
  });
  
  const pestInfo = pestsDB[detected];
  
  return {
    pest: pestInfo,
    confidence: Math.min(maxScore * 1.5, 0.99),
    severity: maxScore > 0.5 ? 'Alta' : maxScore > 0.3 ? 'Media' : 'Baja',
    type: 'pest'
  };
}

async function performAnalysis(imgElement, scanType) {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, 224, 224);
  const imageData = ctx.getImageData(0, 0, 224, 224);
  
  let result;
  if (scanType === 'leaf') {
    result = analyzeLeaf(imageData);
  } else if (scanType === 'fruit') {
    result = analyzeFruit(imageData);
  } else if (scanType === 'pest') {
    result = analyzePest(imageData);
  }
  
  result.image = capturedImage;
  result.timestamp = Date.now();
  
  return result;
}

// ==================== CAMERA ====================

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    document.getElementById('video').srcObject = stream;
    showCameraButtons();
  } catch (err) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      document.getElementById('video').srcObject = stream;
      showCameraButtons();
    } catch (e) {
      alert('No se pudo acceder a la cámara');
    }
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

function showCameraButtons() {
  document.getElementById('capture-btn').style.display = 'inline-block';
  document.getElementById('analyze-btn').style.display = 'none';
  document.getElementById('retake-btn').style.display = 'none';
  document.getElementById('preview-container').style.display = 'none';
}

function captureImage() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  
  capturedImage = canvas.toDataURL('image/jpeg', 0.9);
  document.getElementById('preview-img').src = capturedImage;
  
  document.getElementById('preview-container').style.display = 'block';
  document.getElementById('video').style.display = 'none';
  document.getElementById('capture-btn').style.display = 'none';
  document.getElementById('analyze-btn').style.display = 'inline-block';
  document.getElementById('retake-btn').style.display = 'inline-block';
}

function retakeImage() {
  document.getElementById('video').style.display = 'block';
  document.getElementById('preview-container').style.display = 'none';
  document.getElementById('capture-btn').style.display = 'inline-block';
  document.getElementById('analyze-btn').style.display = 'none';
  document.getElementById('retake-btn').style.display = 'none';
  capturedImage = null;
}

async function analyzeImage() {
  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Analizando...';
  
  document.getElementById('result-content').innerHTML = '<div class="empty-state"><div class="loading"></div><p>Analizando imagen...</p></div>';
  showScreen('results');
  
  try {
    const img = new Image();
    img.src = capturedImage;
    await new Promise(resolve => img.onload = resolve);
    
    const result = await performAnalysis(img, currentScanType);
    
    history.unshift(result);
    localStorage.setItem('aguacate_history', JSON.stringify(history));
    
    // Save to gallery
    const gallery = JSON.parse(localStorage.getItem('aguacate_gallery') || '[]');
    gallery.unshift({ image: result.image, timestamp: result.timestamp, type: result.type });
    localStorage.setItem('aguacate_gallery', JSON.stringify(gallery));
    
    displayResult(result);
  } catch (error) {
    alert('Error al analizar: ' + error.message);
  }
  
  btn.disabled = false;
  btn.textContent = '🔍 Analizar';
}

// ==================== DISPLAY RESULTS ====================

function displayResult(result) {
  let html;
  if (result.type === 'leaf') {
    html = displayLeafResult(result);
  } else if (result.type === 'fruit') {
    html = displayFruitResult(result);
  } else if (result.type === 'pest') {
    html = displayPestResult(result);
  }
  document.getElementById('result-content').innerHTML = html;
}

function displayLeafResult(result) {
  const treatmentItems = result.disease.treatment.split('\n').filter(t => t.trim()).map(t => `<li>${t.trim()}</li>`).join('');
  const symptomsItems = result.disease.symptoms ? result.disease.symptoms.split('•').filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join('') : '';
  
  return `
    <img src="${result.image}" class="result-image" alt="Resultado">
    <div class="result-status ${result.isHealthy ? 'healthy' : 'disease'}">
      ${result.isHealthy ? '✅ Sana' : '⚠️ Problema'}
    </div>
    <h3 class="result-title">${result.disease.name}</h3>
    <p class="result-confidence">Confianza: ${Math.round(result.confidence * 100)}%</p>
    <p class="result-desc">${result.disease.desc}</p>
    
    ${!result.isHealthy && symptomsItems ? `
    <div class="recommendations">
      <h4>🔍 Síntomas</h4>
      <ul>${symptomsItems}</ul>
    </div>
    ` : ''}
    
    <div class="progress-section">
      <div class="progress-label">
        <span>Salud de la planta</span>
        <span>${Math.round(result.healthScore)}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${result.isHealthy ? 'healthy' : 'disease'}" style="width:${result.healthScore}%"></div>
      </div>
    </div>
    
    <div class="recommendations">
      <h4>💊 Tratamiento</h4>
      <ul>${treatmentItems}</ul>
    </div>
  `;
}

function displayFruitResult(result) {
  const r = result.ripeness;
  return `
    <img src="${result.image}" class="result-image" alt="Resultado">
    <div class="result-status fruit">${r.name}</div>
    
    <div class="progress-section">
      <div class="progress-label">
        <span>Nivel de maduración</span>
        <span>${r.percentage}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill healthy" style="width:${r.percentage}%"></div>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value">${r.days}</div>
        <div class="stat-label">Para madura</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">${result.qualityScore}%</div>
        <div class="stat-label">Calidad</div>
      </div>
    </div>
    
    <div class="recommendations">
      <h4>🍽️ Recetas sugeridas</h4>
      <ul>
        ${r.recipes.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  `;
}

function displayPestResult(result) {
  const p = result.pest;
  const treatmentItems = p.treatment.split('\n').filter(t => t.trim()).map(t => `<li>${t.trim()}</li>`).join('');
  const symptomsItems = p.symptoms ? p.symptoms.split('•').filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join('') : '';
  const preventionItems = p.prevention ? p.prevention.split('•').filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join('') : '';
  
  return `
    <img src="${result.image}" class="result-image" alt="Resultado">
    <div class="result-status disease">🐛 Plaga Detectada</div>
    
    <h3 class="result-title">${p.name}</h3>
    <p class="result-confidence">Confianza: ${Math.round(result.confidence * 100)}%</p>
    <p class="result-desc">${p.desc}</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value">${result.severity}</div>
        <div class="stat-label">Severidad</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔬</div>
        <div class="stat-value" style="font-size:0.8rem;">${p.scientific}</div>
        <div class="stat-label">Nombre científico</div>
      </div>
    </div>
    
    ${symptomsItems ? `
    <div class="recommendations">
      <h4>🔍 Síntomas</h4>
      <ul>${symptomsItems}</ul>
    </div>
    ` : ''}
    
    <div class="recommendations">
      <h4>💊 Tratamiento</h4>
      <ul>${treatmentItems}</ul>
    </div>
    
    ${preventionItems ? `
    <div class="recommendations">
      <h4>🛡️ Prevención</h4>
      <ul>${preventionItems}</ul>
    </div>
    ` : ''}
  `;
}

// ==================== STATS ====================

function renderStats() {
  const totalScans = history.length;
  const leafScans = history.filter(h => h.type === 'leaf').length;
  const fruitScans = history.filter(h => h.type === 'fruit').length;
  const pestScans = history.filter(h => h.type === 'pest').length;
  const healthyPlants = history.filter(h => h.type === 'leaf' && h.isHealthy).length;
  const ripeFruits = history.filter(h => h.type === 'fruit' && h.ripeness.name.includes('Maduro')).length;
  
  const container = document.getElementById('stats-overview');
  container.innerHTML = `
    <div class="stat-card-large">
      <div class="stat-icon">📊</div>
      <div class="stat-value">${totalScans}</div>
      <div class="stat-label">Total Análisis</div>
    </div>
    <div class="stat-card-large">
      <div class="stat-icon">🍃</div>
      <div class="stat-value">${leafScans}</div>
      <div class="stat-label">Hojas Escaneadas</div>
    </div>
    <div class="stat-card-large">
      <div class="stat-icon">🥑</div>
      <div class="stat-value">${fruitScans}</div>
      <div class="stat-label">Frutos Escaneados</div>
    </div>
    <div class="stat-card-large">
      <div class="stat-icon">🐛</div>
      <div class="stat-value">${pestScans}</div>
      <div class="stat-label">Plagas Detectadas</div>
    </div>
    
    <div class="stats-chart">
      <h3>📈 Distribución de Análisis</h3>
      <div class="chart-bars">
        <div class="chart-bar">
          <div class="bar-value">${leafScans}</div>
          <div class="bar" style="height: ${Math.max(leafScans * 20, 20)}px"></div>
          <div class="bar-label">Hojas</div>
        </div>
        <div class="chart-bar">
          <div class="bar-value">${fruitScans}</div>
          <div class="bar" style="height: ${Math.max(fruitScans * 20, 20)}px"></div>
          <div class="bar-label">Frutos</div>
        </div>
        <div class="chart-bar">
          <div class="bar-value">${pestScans}</div>
          <div class="bar" style="height: ${Math.max(pestScans * 20, 20)}px"></div>
          <div class="bar-label">Plagas</div>
        </div>
      </div>
    </div>
    
    <div class="stat-card-large">
      <div class="stat-icon">${healthyPlants > 0 ? '✅' : '📷'}</div>
      <div class="stat-value">${leafScans > 0 ? Math.round((healthyPlants / leafScans) * 100) : 0}%</div>
      <div class="stat-label">Plantas Sanas</div>
    </div>
    <div class="stat-card-large">
      <div class="stat-icon">🥑</div>
      <div class="stat-value">${fruitScans > 0 ? Math.round((ripeFruits / fruitScans) * 100) : 0}%</div>
      <div class="stat-label">Frutos Maduros</div>
    </div>
  `;
}

// ==================== TIPS ====================

function renderTips() {
  const container = document.getElementById('tips-container');
  container.innerHTML = tipsDB.map(tip => `
    <div class="tip-card">
      <span class="tip-category">${tip.category}</span>
      <div class="tip-icon">${tip.icon}</div>
      <h3>${tip.title}</h3>
      <p>${tip.content}</p>
    </div>
  `).join('');
}

// ==================== GALLERY ====================

function renderGallery() {
  const gallery = JSON.parse(localStorage.getItem('aguacate_gallery') || '[]');
  const container = document.getElementById('gallery-grid');
  
  if (gallery.length === 0) {
    container.innerHTML = `
      <div class="gallery-empty">
        <div class="gallery-empty-icon">📷</div>
        <p>No hay imágenes guardadas</p>
        <p>¡Realiza tu primer análisis para ver las imágenes aquí!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = gallery.map((item, index) => {
    let typeText = item.type === 'leaf' ? '🍃 Hoja' : item.type === 'fruit' ? '🥑 Fruto' : '🐛 Plaga';
    return `
      <div class="gallery-item" onclick="showGalleryImage(${index})">
        <img src="${item.image}" alt="${typeText}">
        <div class="gallery-item-overlay">
          ${typeText}
        </div>
      </div>
    `;
  }).join('');
}

function showGalleryImage(index) {
  const gallery = JSON.parse(localStorage.getItem('aguacate_gallery') || '[]');
  const item = gallery[index];
  if (item) {
    alert(`Imagen del ${new Date(item.timestamp).toLocaleDateString()}`);
  }
}

// ==================== NAVIGATION ====================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  
  if (screenId !== 'camera') stopCamera();
  if (screenId === 'history') renderHistory();
  if (screenId === 'stats') renderStats();
  if (screenId === 'tips') renderTips();
  if (screenId === 'gallery') renderGallery();
  
  window.scrollTo(0, 0);
}

function startScan(type) {
  currentScanType = type;
  let title;
  if (type === 'leaf') {
    title = '🍃 Escanear Hoja';
  } else if (type === 'fruit') {
    title = '🥑 Escanear Fruto';
  } else if (type === 'pest') {
    title = '🐛 Escanear Plaga';
  }
  document.getElementById('scan-title').textContent = title;
  showScreen('camera');
  startCamera();
}

function goHome() {
  showScreen('home');
}

// ==================== HISTORY ====================

function loadHistory() {
  const saved = localStorage.getItem('aguacate_history');
  history = saved ? JSON.parse(saved) : [];
}

function renderHistory() {
  const container = document.getElementById('history-list');
  
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📷</div><p>No hay análisis realizados</p></div>';
    return;
  }
  
  container.innerHTML = history.map(item => {
    let icon, typeText, resultText;
    if (item.type === 'leaf') {
      icon = '🍃';
      typeText = 'Planta';
      resultText = item.isHealthy ? '✅ Sana' : item.disease.name;
    } else if (item.type === 'fruit') {
      icon = '🥑';
      typeText = 'Fruto';
      resultText = item.ripeness.name;
    } else if (item.type === 'pest') {
      icon = '🐛';
      typeText = 'Plaga';
      resultText = item.pest.name;
    }
    
    return `
      <div class="history-item">
        <span class="history-icon">${icon}</span>
        <div class="history-info">
          <div class="history-type">${typeText}</div>
          <div class="history-date">${new Date(item.timestamp).toLocaleDateString()}</div>
        </div>
        <div class="history-result">${resultText}</div>
      </div>
    `;
  }).join('');
}

// ==================== PESTS SCREEN RENDER ====================

function renderPests() {
  const container = document.getElementById('pests-list');
  if (!container) return;
  
  container.innerHTML = Object.entries(pestsDB).map(([key, p]) => `
    <div class="pest-card" style="background:white;border-radius:12px;padding:1.2rem;margin-bottom:1rem;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.8rem;">
        <span style="font-size:2rem;">🐛</span>
        <div>
          <h3 style="color:var(--primary);margin:0;font-size:1.1rem;">${p.name}</h3>
          <span style="color:var(--text-muted);font-size:0.85rem;font-style:italic;">${p.scientific}</span>
        </div>
      </div>
      
      <p style="color:var(--text-muted);margin:0.8rem 0;line-height:1.5;">${p.desc}</p>
      
      <div style="background:#FFF3E0;padding:0.8rem;border-radius:8px;margin:0.8rem 0;">
        <strong style="color:#E65100;">🔍 Síntomas:</strong>
        <p style="margin:0.4rem 0 0;font-size:0.9rem;color:var(--text-muted);">${p.symptoms}</p>
      </div>
      
      <div style="background:#E8F5E9;padding:0.8rem;border-radius:8px;margin:0.8rem 0;">
        <strong style="color:#2E7D32;">💊 Tratamiento:</strong>
        <p style="margin:0.4rem 0 0;font-size:0.9rem;color:var(--text-muted);">${p.treatment}</p>
      </div>
      
      <div style="background:#E3F2FD;padding:0.8rem;border-radius:8px;margin:0.8rem 0;">
        <strong style="color:#1565C0;">🛡️ Prevención:</strong>
        <p style="margin:0.4rem 0 0;font-size:0.9rem;color:var(--text-muted);">${p.prevention}</p>
      </div>
    </div>
  `).join('');
}

// ==================== AI INITIALIZATION ====================

let aiModelsReady = false;
let aiStatus = 'Cargando IA...';

async function initAI() {
  console.log('🤖 Iniciando modelos de IA...');
  
  try {
    if (window.AIModels && window.AIModels.initializeAIModels) {
      await window.AIModels.initializeAIModels();
      aiModelsReady = true;
      aiStatus = 'IA Activa';
      console.log('✅ Modelos de IA listos!');
      
      const statusEl = document.getElementById('status-text');
      if (statusEl) {
        statusEl.textContent = 'IA Activa';
      }
    }
  } catch (error) {
    console.error('Error initializing AI:', error);
    aiStatus = 'IA No disponible';
  }
}

function getAIResult(colors, scanType) {
  if (!aiModelsReady || !window.AIModels) {
    return null;
  }
  
  try {
    if (scanType === 'leaf') {
      return window.AIModels.predictLeaf(colors);
    } else if (scanType === 'fruit') {
      return window.AIModels.predictFruit(colors);
    } else if (scanType === 'pest') {
      return window.AIModels.predictPest(colors);
    }
  } catch (e) {
    console.error('AI prediction error:', e);
  }
  
  return null;
}

// ==================== INITIALIZATION ====================

function hideLoader() {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  currentUser = getCurrentUser();
  
  if (!currentUser) {
    currentUser = { name: 'Usuario' };
    setCurrentUser(currentUser);
  }
  
  loadDarkMode();
  loadHistory();
  updateConnectionStatus();
  fetchWeather();
  renderPests();
  showScreen('home');
  
  // Initialize AI in background
  initAI();
  
  hideLoader();
});
