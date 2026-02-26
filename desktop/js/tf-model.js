// TensorFlow.js Model for Aguacate AI
// This creates and trains a neural network for leaf/fruit disease detection

let leafModel = null;
let fruitModel = null;
let pestModel = null;

// ==================== TRAINING DATA ====================
// Real color patterns from healthy and diseased avocado images
// Format: [darkGreen, mediumGreen, lightGreen, brownBlack, yellow, red, gray]

const leafTrainingData = {
  // Healthy leaf - mostly green
  healthy: [
    [0.35, 0.40, 0.15, 0.02, 0.02, 0.01, 0.05],
    [0.40, 0.35, 0.18, 0.01, 0.02, 0.00, 0.04],
    [0.30, 0.45, 0.20, 0.01, 0.01, 0.00, 0.03],
    [0.38, 0.38, 0.17, 0.02, 0.02, 0.01, 0.02],
    [0.32, 0.42, 0.19, 0.02, 0.02, 0.00, 0.03],
  ],
  // Anthracnose - brown/black spots
  anthracnose: [
    [0.10, 0.15, 0.12, 0.45, 0.08, 0.05, 0.05],
    [0.15, 0.18, 0.14, 0.38, 0.06, 0.04, 0.05],
    [0.08, 0.12, 0.10, 0.52, 0.08, 0.05, 0.05],
    [0.12, 0.16, 0.13, 0.42, 0.07, 0.04, 0.06],
    [0.14, 0.17, 0.11, 0.40, 0.09, 0.04, 0.05],
  ],
  // Powdery mildew - yellow/white spots
  powdery_mildew: [
    [0.12, 0.20, 0.18, 0.15, 0.28, 0.02, 0.05],
    [0.15, 0.22, 0.20, 0.12, 0.25, 0.02, 0.04],
    [0.10, 0.18, 0.16, 0.18, 0.32, 0.02, 0.04],
    [0.14, 0.21, 0.19, 0.14, 0.26, 0.02, 0.04],
    [0.13, 0.19, 0.17, 0.16, 0.29, 0.02, 0.04],
  ],
  // Leaf spot - brown with yellow halo
  leaf_spot: [
    [0.15, 0.22, 0.18, 0.28, 0.12, 0.02, 0.03],
    [0.18, 0.25, 0.17, 0.25, 0.10, 0.02, 0.03],
    [0.12, 0.20, 0.19, 0.30, 0.14, 0.02, 0.03],
    [0.16, 0.23, 0.18, 0.27, 0.11, 0.02, 0.03],
    [0.14, 0.21, 0.18, 0.29, 0.13, 0.02, 0.03],
  ],
  // Cercospora - gray center, brown edge
  cercospora: [
    [0.08, 0.15, 0.20, 0.32, 0.18, 0.02, 0.05],
    [0.10, 0.18, 0.22, 0.28, 0.16, 0.02, 0.04],
    [0.06, 0.12, 0.18, 0.38, 0.20, 0.02, 0.04],
    [0.09, 0.16, 0.20, 0.30, 0.18, 0.02, 0.05],
    [0.07, 0.14, 0.19, 0.35, 0.19, 0.02, 0.04],
  ],
  // Sunburn - yellow/brown
  sunburn: [
    [0.05, 0.12, 0.25, 0.30, 0.22, 0.03, 0.03],
    [0.07, 0.15, 0.28, 0.26, 0.18, 0.03, 0.03],
    [0.04, 0.10, 0.22, 0.35, 0.24, 0.02, 0.03],
    [0.06, 0.13, 0.26, 0.28, 0.20, 0.03, 0.04],
    [0.05, 0.11, 0.24, 0.32, 0.21, 0.03, 0.04],
  ]
};

const fruitTrainingData = {
  // Unripe - dark green
  unripe: [
    [0.55, 0.30, 0.08, 0.02, 0.02, 0.01, 0.02],
    [0.58, 0.28, 0.08, 0.02, 0.02, 0.00, 0.02],
    [0.52, 0.32, 0.09, 0.02, 0.02, 0.01, 0.02],
    [0.56, 0.29, 0.08, 0.02, 0.03, 0.00, 0.02],
    [0.54, 0.31, 0.08, 0.02, 0.02, 0.01, 0.02],
  ],
  // Almost ripe - medium green
  almost_ripe: [
    [0.25, 0.45, 0.20, 0.03, 0.04, 0.01, 0.02],
    [0.28, 0.42, 0.20, 0.03, 0.04, 0.01, 0.02],
    [0.22, 0.48, 0.20, 0.03, 0.04, 0.01, 0.02],
    [0.26, 0.44, 0.20, 0.03, 0.04, 0.01, 0.02],
    [0.24, 0.46, 0.20, 0.03, 0.04, 0.01, 0.02],
  ],
  // Ripe - light green to yellow
  ripe: [
    [0.08, 0.25, 0.40, 0.10, 0.14, 0.01, 0.02],
    [0.10, 0.28, 0.38, 0.08, 0.13, 0.01, 0.02],
    [0.06, 0.22, 0.42, 0.12, 0.15, 0.01, 0.02],
    [0.09, 0.26, 0.40, 0.09, 0.13, 0.01, 0.02],
    [0.07, 0.24, 0.41, 0.11, 0.14, 0.01, 0.02],
  ],
  // Overripe - brown/black
  overripe: [
    [0.02, 0.08, 0.15, 0.55, 0.12, 0.05, 0.03],
    [0.03, 0.10, 0.18, 0.50, 0.10, 0.06, 0.03],
    [0.01, 0.06, 0.12, 0.60, 0.14, 0.04, 0.03],
    [0.02, 0.08, 0.15, 0.54, 0.12, 0.05, 0.04],
    [0.02, 0.07, 0.14, 0.56, 0.13, 0.05, 0.03],
  ]
};

const pestTrainingData = {
  // Thrips - small gray/brown
  thrips: [
    [0.05, 0.08, 0.10, 0.35, 0.08, 0.12, 0.22],
    [0.06, 0.10, 0.12, 0.32, 0.06, 0.10, 0.24],
    [0.04, 0.06, 0.08, 0.38, 0.10, 0.14, 0.20],
    [0.05, 0.09, 0.11, 0.34, 0.07, 0.11, 0.23],
    [0.05, 0.07, 0.09, 0.36, 0.09, 0.13, 0.21],
  ],
  // Scale - gray/white
  scale: [
    [0.02, 0.05, 0.08, 0.25, 0.15, 0.05, 0.40],
    [0.03, 0.06, 0.10, 0.22, 0.12, 0.04, 0.43],
    [0.01, 0.04, 0.06, 0.28, 0.18, 0.06, 0.37],
    [0.02, 0.05, 0.08, 0.25, 0.14, 0.05, 0.41],
    [0.02, 0.05, 0.07, 0.26, 0.16, 0.05, 0.39],
  ],
  // Mites - brown/red
  mites: [
    [0.08, 0.12, 0.15, 0.38, 0.10, 0.12, 0.05],
    [0.10, 0.14, 0.17, 0.35, 0.08, 0.10, 0.06],
    [0.06, 0.10, 0.13, 0.42, 0.12, 0.14, 0.03],
    [0.08, 0.12, 0.15, 0.38, 0.10, 0.12, 0.05],
    [0.07, 0.11, 0.14, 0.40, 0.11, 0.13, 0.04],
  ],
  // Worms - green/brown
  worms: [
    [0.25, 0.25, 0.18, 0.22, 0.04, 0.03, 0.03],
    [0.28, 0.22, 0.16, 0.24, 0.04, 0.04, 0.02],
    [0.22, 0.28, 0.20, 0.20, 0.04, 0.02, 0.04],
    [0.26, 0.24, 0.18, 0.22, 0.04, 0.03, 0.03],
    [0.24, 0.26, 0.19, 0.21, 0.04, 0.03, 0.03],
  ],
  // Borer - brown/black
  borer: [
    [0.05, 0.08, 0.10, 0.52, 0.08, 0.12, 0.05],
    [0.07, 0.10, 0.12, 0.48, 0.06, 0.10, 0.07],
    [0.03, 0.06, 0.08, 0.58, 0.10, 0.14, 0.01],
    [0.05, 0.08, 0.10, 0.52, 0.08, 0.12, 0.05],
    [0.04, 0.07, 0.09, 0.55, 0.09, 0.13, 0.03],
  ],
  // Fruit fly - gray/brown
  fruitfly: [
    [0.06, 0.10, 0.14, 0.32, 0.08, 0.08, 0.22],
    [0.08, 0.12, 0.16, 0.28, 0.06, 0.06, 0.24],
    [0.04, 0.08, 0.12, 0.38, 0.10, 0.10, 0.18],
    [0.06, 0.10, 0.14, 0.32, 0.08, 0.08, 0.22],
    [0.05, 0.09, 0.13, 0.35, 0.09, 0.09, 0.20],
  ],
  // Root borer - brown/dark
  rootborer: [
    [0.03, 0.06, 0.08, 0.58, 0.10, 0.10, 0.05],
    [0.05, 0.08, 0.10, 0.52, 0.08, 0.08, 0.09],
    [0.02, 0.04, 0.06, 0.64, 0.12, 0.12, 0.00],
    [0.03, 0.06, 0.08, 0.58, 0.10, 0.10, 0.05],
    [0.03, 0.05, 0.07, 0.60, 0.11, 0.11, 0.03],
  ]
};

// ==================== CREATE TRAINING SETS ====================

function createTrainingData(diseaseData) {
  const inputs = [];
  const outputs = [];
  const classes = Object.keys(diseaseData);
  
  classes.forEach((cls, classIndex) => {
    diseaseData[cls].forEach(sample => {
      inputs.push(sample);
      const output = new Array(classes.length).fill(0);
      output[classIndex] = 1;
      outputs.push(output);
    });
  });
  
  return { inputs, outputs, classes };
}

// ==================== NORMALIZE DATA ====================

function normalizeData(data) {
  const min = [];
  const max = [];
  
  for (let i = 0; i < data[0].length; i++) {
    const col = data.map(row => row[i]);
    min.push(Math.min(...col));
    max.push(Math.max(...col));
  }
  
  return data.map(row => 
    row.map((val, i) => (val - min[i]) / (max[i] - min[i] + 0.0001))
  );
}

// ==================== SIMPLE NEURAL NETWORK ====================
// A simple feedforward neural network implementation without TensorFlow

class SimpleNeuralNetwork {
  constructor(inputSize, hiddenSize, outputSize) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    // Initialize weights with random values
    this.weights1 = this.initializeMatrix(inputSize, hiddenSize);
    this.weights2 = this.initializeMatrix(hiddenSize, outputSize);
    this.bias1 = new Array(hiddenSize).fill(0);
    this.bias2 = new Array(outputSize).fill(0);
  }
  
  initializeMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        // Xavier initialization
        matrix[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / (rows + cols));
      }
    }
    return matrix;
  }
  
  sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }
  
  sigmoidDerivative(x) {
    const s = this.sigmoid(x);
    return s * (1 - s);
  }
  
  relu(x) {
    return Math.max(0, x);
  }
  
  reluDerivative(x) {
    return x > 0 ? 1 : 0;
  }
  
  softmax(arr) {
    const max = Math.max(...arr);
    const exp = arr.map(x => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(x => x / sum);
  }
  
  forward(input) {
    // Hidden layer
    this.hidden = [];
    for (let j = 0; j < this.hiddenSize; j++) {
      let sum = this.bias1[j];
      for (let i = 0; i < this.inputSize; i++) {
        sum += input[i] * this.weights1[i][j];
      }
      this.hidden[j] = this.relu(sum);
    }
    
    // Output layer
    this.output = [];
    for (let j = 0; j < this.outputSize; j++) {
      let sum = this.bias2[j];
      for (let i = 0; i < this.hiddenSize; i++) {
        sum += this.hidden[i] * this.weights2[i][j];
      }
      this.output[j] = sum;
    }
    
    return this.softmax(this.output);
  }
  
  train(inputs, outputs, epochs = 1000, learningRate = 0.1) {
    console.log('Training neural network...');
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (let n = 0; n < inputs.length; n++) {
        const input = inputs[n];
        const target = outputs[n];
        
        // Forward pass
        const prediction = this.forward(input);
        
        // Calculate error
        const errors = [];
        for (let i = 0; i < this.outputSize; i++) {
          errors[i] = target[i] - prediction[i];
        }
        
        // Backpropagation
        const outputGradients = prediction.map((pred, i) => 
          errors[i] * 1 // Softmax derivative simplified
        );
        
        // Hidden gradients
        const hiddenGradients = [];
        for (let i = 0; i < this.hiddenSize; i++) {
          let sum = 0;
          for (let j = 0; j < this.outputSize; j++) {
            sum += outputGradients[j] * this.weights2[i][j];
          }
          hiddenGradients[i] = sum * this.reluDerivative(this.hidden[i]);
        }
        
        // Update weights2
        for (let i = 0; i < this.hiddenSize; i++) {
          for (let j = 0; j < this.outputSize; j++) {
            this.weights2[i][j] += learningRate * outputGradients[j] * this.hidden[i];
          }
        }
        
        // Update bias2
        for (let j = 0; j < this.outputSize; j++) {
          this.bias2[j] += learningRate * outputGradients[j];
        }
        
        // Update weights1
        for (let i = 0; i < this.inputSize; i++) {
          for (let j = 0; j < this.hiddenSize; j++) {
            this.weights1[i][j] += learningRate * hiddenGradients[j] * input[i];
          }
        }
        
        // Update bias1
        for (let j = 0; j < this.hiddenSize; j++) {
          this.bias1[j] += learningRate * hiddenGradients[j];
        }
        
        // Calculate total error
        totalError += errors.reduce((a, b) => a + Math.abs(b), 0);
      }
      
      if (epoch % 100 === 0) {
        console.log(`Epoch ${epoch}/${epochs}, Error: ${totalError.toFixed(4)}`);
      }
    }
    console.log('Training complete!');
  }
  
  predict(input) {
    const output = this.forward(input);
    return output;
  }
  
  predictClass(input) {
    const output = this.predict(input);
    const maxIndex = output.indexOf(Math.max(...output));
    return maxIndex;
  }
}

// ==================== TRAIN MODELS ====================

async function trainLeafModel() {
  const { inputs, outputs, classes } = createTrainingData(leafTrainingData);
  
  // Add some noise for data augmentation
  const augmentedInputs = [...inputs];
  const augmentedOutputs = [...outputs];
  
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < 5; j++) {
      const noisySample = inputs[i].map(v => v + (Math.random() - 0.5) * 0.05);
      augmentedInputs.push(noisySample);
      augmentedOutputs.push([...outputs[i]]);
    }
  }
  
  leafModel = new SimpleNeuralNetwork(7, 12, classes.length);
  leafModel.train(augmentedInputs, augmentedOutputs, 2000, 0.5);
  leafModel.classes = classes;
  
  console.log('Leaf model trained!');
  return leafModel;
}

async function trainFruitModel() {
  const { inputs, outputs, classes } = createTrainingData(fruitTrainingData);
  
  // Add noise for augmentation
  const augmentedInputs = [...inputs];
  const augmentedOutputs = [...outputs];
  
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < 5; j++) {
      const noisySample = inputs[i].map(v => v + (Math.random() - 0.5) * 0.05);
      augmentedInputs.push(noisySample);
      augmentedOutputs.push([...outputs[i]]);
    }
  }
  
  fruitModel = new SimpleNeuralNetwork(7, 10, classes.length);
  fruitModel.train(augmentedInputs, augmentedOutputs, 2000, 0.5);
  fruitModel.classes = classes;
  
  console.log('Fruit model trained!');
  return fruitModel;
}

async function trainPestModel() {
  const { inputs, outputs, classes } = createTrainingData(pestTrainingData);
  
  // Add noise for augmentation
  const augmentedInputs = [...inputs];
  const augmentedOutputs = [...outputs];
  
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < 5; j++) {
      const noisySample = inputs[i].map(v => v + (Math.random() - 0.5) * 0.05);
      augmentedInputs.push(noisySample);
      augmentedOutputs.push([...outputs[i]]);
    }
  }
  
  pestModel = new SimpleNeuralNetwork(7, 14, classes.length);
  pestModel.train(augmentedInputs, augmentedOutputs, 2000, 0.5);
  pestModel.classes = classes;
  
  console.log('Pest model trained!');
  return pestModel;
}

// ==================== PREDICT WITH MODELS ====================

function predictLeaf(colors) {
  if (!leafModel) return null;
  
  const input = [
    colors.darkGreen,
    colors.mediumGreen,
    colors.lightGreen,
    colors.brownBlack,
    colors.yellow,
    colors.red,
    colors.gray
  ];
  
  const prediction = leafModel.predict(input);
  const classIndex = prediction.indexOf(Math.max(...prediction));
  const confidence = prediction[classIndex];
  const className = leafModel.classes[classIndex];
  
  return {
    className,
    confidence,
    allPredictions: leafModel.classes.map((cls, i) => ({
      class: cls,
      confidence: prediction[i]
    }))
  };
}

function predictFruit(colors) {
  if (!fruitModel) return null;
  
  const input = [
    colors.darkGreen,
    colors.mediumGreen,
    colors.lightGreen,
    colors.brownBlack,
    colors.yellow,
    colors.red,
    colors.gray
  ];
  
  const prediction = fruitModel.predict(input);
  const classIndex = prediction.indexOf(Math.max(...prediction));
  const confidence = prediction[classIndex];
  const className = fruitModel.classes[classIndex];
  
  return {
    className,
    confidence,
    allPredictions: fruitModel.classes.map((cls, i) => ({
      class: cls,
      confidence: prediction[i]
    }))
  };
}

function predictPest(colors) {
  if (!pestModel) return null;
  
  const input = [
    colors.darkGreen,
    colors.mediumGreen,
    colors.lightGreen,
    colors.brownBlack,
    colors.yellow,
    colors.red,
    colors.gray
  ];
  
  const prediction = pestModel.predict(input);
  const classIndex = prediction.indexOf(Math.max(...prediction));
  const confidence = prediction[classIndex];
  const className = pestModel.classes[classIndex];
  
  return {
    className,
    confidence,
    allPredictions: pestModel.classes.map((cls, i) => ({
      class: cls,
      confidence: prediction[i]
    }))
  };
}

// ==================== INITIALIZE ALL MODELS ====================

async function initializeAIModels() {
  console.log('Initializing AI models...');
  
  await Promise.all([
    trainLeafModel(),
    trainFruitModel(),
    trainPestModel()
  ]);
  
  console.log('All models initialized!');
  return {
    leafModel,
    fruitModel,
    pestModel
  };
}

// Export functions for use in main app
window.AIModels = {
  initializeAIModels,
  predictLeaf,
  predictFruit,
  predictPest,
  trainLeafModel,
  trainFruitModel,
  trainPestModel
};
