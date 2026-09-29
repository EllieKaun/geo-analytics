export const fetchLayerData = async (
  layerId: string,
  time: number,
  signal: AbortSignal
) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const features = [];
      const baseLng = 37.6173;
      const baseLat = 55.7558;
      
      // Generate point 
      const layerOffsets: Record<string, {lng: number, lat: number}> = {
        temperature: { lng: 0, lat: 0 },
        wind: { lng: 0.007, lat: 0.007 },
        insolation: { lng: -0.007, lat: -0.007 }
      };
      
      const timeOffsetLng = Math.sin(time) * 0.02;
      const timeOffsetLat = Math.cos(time) * 0.02;

      const i = 5;
      const j = 5;
      
      const baseLngPos = baseLng + (i - 5) * 0.02;
      const baseLatPos = baseLat + (j - 5) * 0.02;
      
      const currentOffset = layerOffsets[layerId] || {lng: 0, lat: 0};
      const lng = baseLngPos + timeOffsetLng + currentOffset.lng;
      const lat = baseLatPos + timeOffsetLat + currentOffset.lat;
      
      if (layerId === 'temperature') {
        features.push({
          type: 'Feature',
          properties: { value: 15 + Math.sin(time + i) * 10 },
          geometry: { type: 'Point', coordinates: [lng, lat] }
        });
      } else if (layerId === 'wind') {
        features.push({
          type: 'Feature',
          properties: { speed: 5 + Math.cos(time + j) * 5 },
          geometry: { type: 'Point', coordinates: [lng, lat] }
        });
      } else if (layerId === 'insolation') {
        features.push({
          type: 'Feature',
          properties: { level: Math.abs(Math.sin(time + i + j) * 100) },
          geometry: { type: 'Point', coordinates: [lng, lat] }
        });
      }

      resolve({ type: 'FeatureCollection', features });
    }, 500);

    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
};

// Generate time series data for charts
export const generateTimeSeries = (layerId: string) => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: i,
      value: layerId === 'temperature' ? 15 + Math.sin(i) * 10 :
             layerId === 'wind' ? 5 + Math.cos(i) * 5 :
             Math.abs(Math.sin(i) * 100)
    });
  }
  return data;
};
