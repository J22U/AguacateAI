import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  secondary: '#8BC34A',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  white: '#FFFFFF',
  border: '#E0E0E0',
};

const RIPENESS_LEVELS = [
  { level: 'unripe', levelEs: 'Verde', percentage: 15 },
  { level: 'almost_ripe', levelEs: 'Casi Maduro', percentage: 45 },
  { level: 'ripe', levelEs: 'Maduro', percentage: 75 },
  { level: 'overripe', levelEs: 'Sobremaduro', percentage: 95 },
];

const LEAF_DISEASES = {
  anthracnose: { id: 'anthracnose', nameEs: 'Antracnosis', description: 'Enfermedad fúngica que causa lesiones oscuras en las hojas' },
  powdery_mildew: { id: 'powdery_mildew', nameEs: 'Mildiú Polvoriento', description: 'Revestimiento blanco en polvo en las hojas' },
  leaf_spot: { id: 'leaf_spot', nameEs: 'Mancha Foliar', description: 'Manchas marrones o negras en las hojas' },
  cercospora: { id: 'cercospora', nameEs: 'Mancha de Cercospora', description: 'Manchas circulares marrones con bordes oscuros' },
  sunburn: { id: 'sunburn', nameEs: 'Quemadura Solar', description: 'Manchas amarillas o marrones por exposición al sol' },
  nutrient_deficiency: { id: 'nutrient_deficiency', nameEs: 'Deficiencia de Nutrientes', description: 'Amarillamiento por falta de nutrientes' },
  healthy: { id: 'healthy', nameEs: 'Hoja Sana', description: 'La hoja no muestra signos de enfermedad' },
};

const analyzeImage = async (imageUri, scanType) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (scanType === 'leaf') {
    const diseases = ['healthy', 'anthracnose', 'powdery_mildew', 'leaf_spot', 'cercospora', 'sunburn', 'nutrient_deficiency'];
    const weights = [0.4, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    const randomIndex = Math.floor(Math.random() * diseases.length);
    const selectedId = diseases[randomIndex];
    const disease = LEAF_DISEASES[selectedId];
    const confidence = selectedId === 'healthy' ? 0.75 + Math.random() * 0.25 : 0.6 + Math.random() * 0.35;
    
    return {
      type: 'leaf',
      isHealthy: selectedId === 'healthy',
      diseases: [{ ...disease, confidence: Math.min(confidence, 0.99) }],
      recommendations: selectedId === 'healthy' 
        ? ['Continúa con el cuidado actual']
        : ['Consulta con un especialista', 'Aplica tratamiento recomendado'],
      timestamp: Date.now(),
      imageUri,
    };
  } else {
    const levels = ['unripe', 'almost_ripe', 'ripe', 'overripe'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const ripenessInfo = RIPENESS_LEVELS.find(r => r.level === level);
    const percentage = ripenessInfo.percentage + Math.floor(Math.random() * 15) - 7;
    
    return {
      type: 'fruit',
      ripeness: {
        level,
        levelEs: ripenessInfo.levelEs,
        percentage: Math.max(0, Math.min(100, percentage)),
      },
      color: level === 'unripe' ? 'Verde oscuro' : level === 'ripe' ? 'Verde oscuro con tonos marrones' : 'Marrón',
      firmness: level === 'unripe' ? 'Muy firme' : level === 'ripe' ? 'Suave' : 'Muy blando',
      recommendations: level === 'ripe' ? ['¡Listo para consumir!'] : level === 'unripe' ? ['Esperar 3-5 días'] : ['Consumir pronto'],
      timestamp: Date.now(),
      imageUri,
    };
  }
};

function App() {
  const [screen, setScreen] = useState('home');
  const [scanType, setScanType] = useState('leaf');
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (screen === 'camera' && videoRef.current) {
      startCamera();
    }
    return () => stopCamera();
  }, [screen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    }
  };

  const analyzeImageHandler = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeImage(capturedImage, scanType);
      setResult(analysisResult);
      setHistory(prev => [{ id: Date.now(), result: analysisResult, timestamp: Date.now() }, ...prev]);
      setScreen('results');
    } catch (err) {
      console.error('Error analyzing:', err);
    }
    setIsAnalyzing(false);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setResult(null);
  };

  const goBack = () => {
    setScreen('home');
    setCapturedImage(null);
    setResult(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🥑 Aguacate AI</h1>
        <nav>
          <button onClick={() => setScreen('home')}>Inicio</button>
          <button onClick={() => setScreen('history')}>Historial</button>
        </nav>
      </header>

      <main className="main">
        {screen === 'home' && (
          <div className="home-screen">
            <div className="hero">
              <div className="hero-logo">🥑</div>
              <h2>Análisis Inteligente de Aguacate</h2>
              <p>Utiliza inteligencia artificial para analizar hojas y frutos de aguacate</p>
            </div>

            <div className="scan-options">
              <h3>¿Qué deseas analizar?</h3>
              <div className="options-grid">
                <button className="option-card" onClick={() => { setScanType('leaf'); setScreen('camera'); }}>
                  <div className="option-icon leaf">🍃</div>
                  <h4>Análisis de Hojas</h4>
                  <p>Detecta enfermedades en hojas de aguacate</p>
                </button>
                <button className="option-card" onClick={() => { setScanType('fruit'); setScreen('camera'); }}>
                  <div className="option-icon fruit">🥑</div>
                  <h4>Estado de Maduración</h4>
                  <p>Determina el nivel de madurez del aguacate</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === 'camera' && (
          <div className="camera-screen">
            <button className="back-btn" onClick={goBack}>← Volver</button>
            <h2>{scanType === 'leaf' ? 'Escanear Hoja' : 'Escanear Fruta'}</h2>
            
            {!capturedImage ? (
              <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="camera-frame" />
                <p className="camera-hint">Coloca el {scanType === 'leaf' ? 'la hoja' : 'el aguacate'} en el centro</p>
                <button className="capture-btn" onClick={captureImage}>📷 Capturar</button>
              </div>
            ) : (
              <div className="preview-container">
                <img src={capturedImage} alt="Captured" className="preview-image" />
                <div className="preview-actions">
                  <button className="btn secondary" onClick={resetScan}>Tomar Otra</button>
                  <button className="btn primary" onClick={analyzeImageHandler} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analizando...' : 'Analizar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'results' && result && (
          <div className="results-screen">
            <button className="back-btn" onClick={goBack}>← Nuevo Escaneo</button>
            
            <img src={result.imageUri} alt="Result" className="result-image" />
            
            {result.type === 'leaf' ? (
              <div className="result-card">
                <div className={`status-banner ${result.isHealthy ? 'healthy' : 'disease'}`}>
                  {result.isHealthy ? '✓ Hoja Sana' : '⚠️ Enfermedad Detectada'}
                </div>
                <h3>{result.diseases[0].nameEs}</h3>
                <p className="confidence">Confianza: {Math.round(result.diseases[0].confidence * 100)}%</p>
                <p>{result.diseases[0].description}</p>
                <div className="recommendations">
                  <h4>Recomendaciones:</h4>
                  <ul>
                    {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="result-card">
                <div className="status-banner fruit">{result.ripeness.levelEs}</div>
                <div className="ripeness-meter">
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${result.ripeness.percentage}%` }} />
                  </div>
                  <p className="percentage">{result.ripeness.percentage}%</p>
                </div>
                <p>Color: {result.color}</p>
                <p>Firmeza: {result.firmness}</p>
                <div className="recommendations">
                  <h4>Recomendaciones:</h4>
                  <ul>
                    {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              </div>
            )}
            
            <button className="btn primary" onClick={() => setScreen('history')}>Ver Historial</button>
          </div>
        )}

        {screen === 'history' && (
          <div className="history-screen">
            <button className="back-btn" onClick={goBack}>← Volver</button>
            <h2>Historial de Análisis</h2>
            
            {history.length === 0 ? (
              <div className="empty-history">
                <p>No hay análisis guardados</p>
                <button className="btn primary" onClick={() => setScreen('home')}>Realizar Análisis</button>
              </div>
            ) : (
              <div className="history-list">
                {history.map(item => (
                  <div key={item.id} className="history-item">
                    <span className="history-icon">{item.result.type === 'leaf' ? '🍃' : '🥑'}</span>
                    <div className="history-info">
                      <p className="history-type">{item.result.type === 'leaf' ? 'Análisis de Hoja' : 'Maduración'}</p>
                      <p className="history-date">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="history-result">
                      {item.result.type === 'leaf' 
                        ? (item.result.isHealthy ? 'Sana' : item.result.diseases[0].nameEs)
                        : item.result.ripeness.levelEs
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
