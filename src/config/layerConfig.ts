export interface LayerConfig {
  id: string;
  name: string;
  color: string;
  valueKey: string;
  min: number;
  max: number;
}

export const LAYER_CONFIG: Record<string, LayerConfig> = {
  temperature: {
    id: 'temperature',
    name: 'Temperature',
    color: '#ff0000',
    valueKey: 'value',
    min: 5,
    max: 25,
  },
  wind: {
    id: 'wind',
    name: 'Wind Speed',
    color: '#00ff00',
    valueKey: 'speed',
    min: 0,
    max: 10,
  },
  insolation: {
    id: 'insolation',
    name: 'Insolation',
    color: '#ffff00',
    valueKey: 'level',
    min: 0,
    max: 100,
  },
};
