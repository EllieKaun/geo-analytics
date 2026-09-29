import { createVedro } from 'vedro';
import { fetchLayerData } from '../api/mockData';

// Minimal GeoJSON type for our needs
export interface FeatureCollection {
  type: 'FeatureCollection';
  features: any[];
}

export interface MapState {
  activeLayers: string[];
  currentTime: number;
  layerData: Record<string, FeatureCollection | null>;
  loadingStatus: Record<string, boolean>;
}

const initialState: MapState = {
  activeLayers: ['temperature'],
  currentTime: 0,
  layerData: {},
  loadingStatus: {},
};

export const {
  Context: MapStoreContext,
  Provider: MapStoreContextProvider,
  useStore: useMapStore,
  useSelector: useMapStoreSelector,
  useDispatch: useMapStoreDispatch,
} = createVedro(initialState);

// AbortController storage to prevent race conditions
const abortControllers: Record<string, AbortController> = {};

export const fetchLayerThunk = async (
  dispatch: typeof useMapStoreDispatch extends () => infer D ? D : any,
  layerId: string,
  time: number
) => {
  if (abortControllers[layerId]) {
    abortControllers[layerId].abort();
  }
  abortControllers[layerId] = new AbortController();

  dispatch((state: MapState) => ({
    loadingStatus: { ...state.loadingStatus, [layerId]: true }
  }));

  try {
    const data = await fetchLayerData(layerId, time, abortControllers[layerId].signal) as FeatureCollection;
    
    dispatch((state: MapState) => ({
      layerData: { ...state.layerData, [layerId]: data },
      loadingStatus: { ...state.loadingStatus, [layerId]: false }
    }));
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error(`Error loading layer ${layerId}`, error);
      dispatch((state: MapState) => ({
        loadingStatus: { ...state.loadingStatus, [layerId]: false }
      }));
    }
  }
};
