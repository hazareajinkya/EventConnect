// Dynamic import wrapper for face-api.js to avoid SSR issues
// We are using local models in /public/models
const MODEL_URL = '/models';

let faceapi: any = null;

const loadFaceApi = async () => {
  if (typeof window === 'undefined') return null; // Prevent server-side execution

  if (!faceapi) {
    faceapi = await import('face-api.js');
    // Important: Tell face-api to use the browser fetch implementation
    faceapi.env.monkeyPatch({
      fetch: window.fetch,
      // Fix for "Illegal constructor" error (canvas/HTMLImageElement issue in Node env)
      Canvas: window.HTMLCanvasElement,
      Image: window.HTMLImageElement,
      ImageData: window.ImageData,
      Video: window.HTMLVideoElement,
      createCanvasElement: () => document.createElement('canvas'),
      createImageElement: () => document.createElement('img')
    });
  }
  return faceapi;
};

export const loadModels = async () => {
  try {
    const api = await loadFaceApi();
    if (!api) return;

    // Only load TinyFaceDetector - it's fastest and good enough
    console.log('Loading TinyFaceDetector (fast mode)...');
    await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    console.log('✅ TinyFaceDetector loaded');
    
    // Skip other models for speed - TinyFaceDetector is fast and works well
    console.log('✅ Models ready (using fast TinyFaceDetector only)');
  } catch (error) {
    console.error('Error loading models:', error);
    throw error;
  }
};

export const detectFaces = async (imageElement: HTMLImageElement) => {
  const api = await loadFaceApi();
  if (!api) throw new Error('Face API not loaded');

  // Ensure models are loaded
  if (!api.nets.tinyFaceDetector.params) {
    console.log('Models not loaded, loading now...');
    await loadModels();
  }

  const { naturalWidth, naturalHeight } = imageElement;
  console.log('=== FAST FACE DETECTION ===');
  console.log('Image dimensions:', naturalWidth, 'x', naturalHeight);
  
  // Use only TinyFaceDetector with optimized settings - FAST!
  console.log('🔍 Detecting faces with TinyFaceDetector (fast mode)...');
  
  try {
    // Single fast detection with optimized settings
    const options = new api.TinyFaceDetectorOptions({ 
      inputSize: 416,  // Good balance of speed and accuracy
      scoreThreshold: 0.3  // Standard threshold - fast and reliable
    });
    
    const detections = await api.detectAllFaces(imageElement, options);
    console.log(`✅ Found ${detections.length} faces`);
    
    if (detections.length === 0) {
      // Try with lower threshold if no faces found
      console.log('Trying with lower threshold...');
      const lowThresholdOptions = new api.TinyFaceDetectorOptions({ 
        inputSize: 416,
        scoreThreshold: 0.1  // Lower threshold to catch more faces
      });
      const retryDetections = await api.detectAllFaces(imageElement, lowThresholdOptions);
      console.log(`✅ Found ${retryDetections.length} faces with lower threshold`);
      
      if (retryDetections.length === 0) {
        throw new Error('No faces detected. Please check the image has clear, visible faces.');
      }
      
      // Use retry results
      const minFaceSize = Math.min(naturalWidth, naturalHeight) * 0.02;
      const validDetections = retryDetections
        .filter((d: any) => d.box.width > minFaceSize && d.box.height > minFaceSize)
        .map((d: any) => ({
          id: crypto.randomUUID(),
          x: d.box.x / naturalWidth,
          y: d.box.y / naturalHeight,
          width: d.box.width / naturalWidth,
          height: d.box.height / naturalHeight,
        }));
      
      console.log(`✅ Final valid faces: ${validDetections.length}`);
      return validDetections;
    }
    
    // Convert to normalized coordinates and filter out very small detections
    const minFaceSize = Math.min(naturalWidth, naturalHeight) * 0.02;
    
    const validDetections = detections
      .filter((d: any) => d.box.width > minFaceSize && d.box.height > minFaceSize)
      .map((d: any) => ({
        id: crypto.randomUUID(),
        x: d.box.x / naturalWidth,
        y: d.box.y / naturalHeight,
        width: d.box.width / naturalWidth,
        height: d.box.height / naturalHeight,
      }));

    console.log(`✅ Final valid faces: ${validDetections.length}`);
    return validDetections;
    
  } catch (err: any) {
    console.error('Detection error:', err);
    throw new Error(`Face detection failed: ${err.message}`);
  }
};
