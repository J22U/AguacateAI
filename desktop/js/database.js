// AGUACATE AI - DATABASE SERVICE
// Loads and manages data from database.json

class Database {
  constructor() {
    this.data = null;
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return this.data;
    
    try {
      const response = await fetch('../database.json');
      if (!response.ok) throw new Error('Failed to load database');
      this.data = await response.json();
      this.loaded = true;
      return this.data;
    } catch (error) {
      console.error('Error loading database:', error);
      // Fallback to hardcoded data
      return this.getFallbackData();
    }
  }

  // Get all diseases
  getDiseases() {
    return this.data?.diseases || this.getFallbackData().diseases;
  }

  // Get disease by ID
  getDisease(id) {
    return this.getDiseases()[id] || null;
  }

  // Get all pests
  getPests() {
    return this.data?.pests || this.getFallbackData().pests;
  }

  // Get pest by ID
  getPest(id) {
    return this.getPests()[id] || null;
  }

  // Get all ripeness stages
  getRipeness() {
    return this.data?.ripeness || this.getFallbackData().ripeness;
  }

  // Get ripeness by ID
  getRipenessStage(id) {
    return this.getRipeness()[id] || null;
  }

  // Get all tips
  getTips() {
    return this.data?.tips || this.getFallbackData().tips;
  }

  // Get weather cities
  getWeatherCities() {
    return this.data?.weather?.colombianCities || this.getFallbackData().weather.colombianCities;
  }

  // Get city by name
  getCity(name) {
    return this.getWeatherCities()[name.toLowerCase()] || null;
  }

  // Fallback data (same as original hardcoded data)
  getFallbackData() {
    return {
      diseases: {
        anthracnose: {
          id: "anthracnose",
          name: "Antracnosis",
          scientific: "Colletotrichum gloeosporioides",
          description: "Enfermedad fúngica causada por Colletotrichum gloeosporioides. Es una de las enfermedades más comunes y destructivas del aguacate.",
          symptoms: ["Manchas cafes oscuras en hojas", "Frutos con pudrición negra", "Caída prematura de hojas", "Lesiones hundidas en tallos"],
          treatment: "1. Aplicar fungicida de cobre (1-2 g/L) cada 7-14 días\n2. Eliminar y destruir partes afectadas\n3. Mejorar circulación de aire\n4. Evitar riego por aspersión\n5. Aplicar en días secos",
          prevention: ["Evitar heridas en la planta", "Desinfectar herramientas", "Eliminar frutos caídos", "Mantener árbol podado"]
        },
        powdery_mildew: {
          id: "powdery_mildew",
          name: "Mildiú Polvoriento",
          scientific: "Oidium spp.",
          description: "Enfermedad causada por Oidium spp. Se caracteriza por un polvo blanco harinoso en hojas y frutos.",
          symptoms: ["Polvo blanco harinoso", "Hojas enrolladas", "Crecimiento retardado", "Frutos deformados"],
          treatment: "1. Azufre en polvo (20-30 kg/ha)\n2. Fungicidas sistémicos\n3. Aplicar cada 10-14 días\n4. Mejorar ventilación",
          prevention: ["Buena circulación de aire", "Evitar exceso de nitrógeno", "Monitorear regularmente"]
        },
        leaf_spot: {
          id: "leaf_spot",
          name: "Mancha Foliar",
          scientific: "Alternaria spp.",
          description: "Enfermedad fúngica que produce manchas en las hojas.",
          symptoms: ["Manchas cafes con halo amarillo", "Manchas necróticas", "Caída de hojas"],
          treatment: "1. Eliminar hojas afectadas\n2. Fungicida de cobre\n3. Mancozeb en casos severos",
          prevention: ["Eliminar restos de poda", "Evitar riego por aspersión"]
        },
        cercospora: {
          id: "cercospora",
          name: "Mancha de Cercospora",
          scientific: "Cercospora purpurea",
          description: "Enfermedad foliar con manchas características.",
          symptoms: ["Manchas con centro gris claro", "Borde cafes oscuro", "Hojas amarillas"],
          treatment: "1. Fungicida de cobre + Mancozeb\n2. Podar para mejorar ventilación\n3. Eliminar hojas caídas",
          prevention: ["Recoger hojas caídas", "Poda de aireación"]
        },
        sunburn: {
          id: "sunburn",
          name: "Quemadura Solar",
          scientific: "Physiological disorder",
          description: "Daño por exposición excesiva al sol.",
          symptoms: ["Manchas amarillas/cafes", "Piel quemada", "Frutos arrugados"],
          treatment: "1. Instalar malla sombra\n2. Aplicar protector solar\n3. Mantener riego adecuado",
          prevention: ["Malla sombra en zonas cálidas", "Riego regular", "Podas de formación"]
        },
        healthy: {
          id: "healthy",
          name: "Hoja Sana",
          scientific: null,
          description: "La hoja está saludable sin signos de enfermedades.",
          symptoms: ["Color verde intenso", "Sin manchas", "Textura firme"],
          treatment: "✅ Continuar con cuidado normal:\n1. Riego regular\n2. Fertilización equilibrada\n3. Poda de mantenimiento",
          prevention: ["Riego adecuado", "Fertilización equilibrada", "Monitoreo regular"]
        }
      },
      pests: {
        thrips: {
          id: "thrips",
          name: "Trips del Aguacate",
          scientific: "Scirtothrips perseae",
          description: "Pequeños insectos que succionan savia.",
          symptoms: ["Hojas con apariencia plateada", "Frutos con cicatrices"],
          treatment: "Spinosad (0.5-1 ml/L) o Aceite de neem (5ml/L).",
          prevention: ["Trampas adhesivas azules", "Mantener humedad"]
        },
        scale: {
          id: "scale",
          name: "Cochinillas",
          scientific: "Coccus hesperidum",
          description: "Insectos que se adhieren a tallos y hojas.",
          symptoms: ["Escudos blancos en tallos", "Melaza", "Fumagina"],
          treatment: "Aceite mineral + Imidacloprid.",
          prevention: ["Inspeccionar plantas nuevas", "Podar ramas infestadas"]
        },
        mites: {
          id: "mites",
          name: "Ácaros",
          scientific: "Oligonychus perseae",
          description: "Árachnidos microscópicos que se alimentan de hojas.",
          symptoms: ["Manchas bronceadas", "Telarañas finas"],
          treatment: "Azufre en polvo o Abamectina.",
          prevention: ["Monitoreo con lupa", "Buena ventilación"]
        },
        worms: {
          id: "worms",
          name: "Gusanos Defoliadores",
          scientific: "Glena mitis",
          description: "Larvas que se alimentan del follaje.",
          symptoms: ["Hojas con agujeros", "Defoliación"],
          treatment: "Bacillus thuringiensis (Bt).",
          prevention: ["Trampas de feromonas", "Eliminar residuos"]
        },
        borer: {
          id: "borer",
          name: "Barrenador del Hueso",
          scientific: "Heilipus lauri",
          description: "Larvas dentro del fruto.",
          symptoms: ["Agujeros en frutos", "Frutos caídos"],
          treatment: "Imidacloprid cada 21 días.",
          prevention: ["Cosechar temprano", "Mallas protectoras"]
        },
        fruitfly: {
          id: "fruitfly",
          name: "Mosca de la Fruta",
          scientific: "Anastrepha striata",
          description: "Moscas que depositan huevos en frutos.",
          symptoms: ["Pequeños agujeros", "Pulpa con túneles"],
          treatment: "Cebos tóxicos con Malatión.",
          prevention: ["Eliminar frutos caídos", "Trampas de monitoreo"]
        }
      },
      ripeness: {
        unripe: { name: "Verde / Inmaduro", percentage: 15, days: "5-7 días", recipes: ["Ensaladas", "Salsas"] },
        almost_ripe: { name: "Casi Maduro", percentage: 45, days: "2-4 días", recipes: ["Guacamole", "Tostadas"] },
        ripe: { name: "Maduro", percentage: 75, days: "Listo", recipes: ["Consumo directo", "Ensaladas"] },
        overripe: { name: "Sobremaduro", percentage: 95, days: "Pasado", recipes: ["Batidos", "Mantequilla"] }
      },
      tips: [
        { icon: "💧", title: "Riego Adecuado", content: "Riega 2-3 veces por semana." },
        { icon: "🌱", title: "Fertilización", content: "Aplica fertilizante rico en nitrógeno en primavera." },
        { icon: "✂️", title: "Poda", content: "Poda después de la cosecha." },
        { icon: "🌡️", title: "Temperatura", content: "20-30°C es ideal." }
      ],
      weather: {
        colombianCities: {
          bogota: { name: "Bogotá", temp: 14, humidity: 80, region: "Cundinamarca" },
          medellin: { name: "Medellín", temp: 24, humidity: 70, region: "Antioquia" },
          cali: { name: "Cali", temp: 26, humidity: 65, region: "Valle del Cauca" }
        }
      }
    };
  }
}

// Create global database instance
const db = new Database();
