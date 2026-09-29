import React, { useEffect } from "react";
import {
  MapStoreContextProvider,
  useMapStoreSelector,
  useMapStoreDispatch,
  fetchLayerThunk,
} from "./store/mapStore";
import { MapWidget } from "./components/MapWidget";
import { TimelinePanel } from "./components/TimelinePanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import "./index.css";

const LayerControls: React.FC = () => {
  const { activeLayers, currentTime, loadingStatus } = useMapStoreSelector(
    (state) => ({
      activeLayers: state.activeLayers,
      currentTime: state.currentTime,
      loadingStatus: state.loadingStatus,
    }),
  );

  const dispatch = useMapStoreDispatch();

  const toggleLayer = (layerId: string) => {
    const isActive = activeLayers.includes(layerId);
    let newLayers = [];

    if (isActive) {
      newLayers = activeLayers.filter((id) => id !== layerId);
      dispatch(() => ({ activeLayers: newLayers }));
    } else {
      newLayers = [...activeLayers, layerId];
      dispatch(() => ({ activeLayers: newLayers }));
      fetchLayerThunk(dispatch, layerId, currentTime);
    }
  };

  const layers = [
    { id: "temperature", label: "Temperature" },
    { id: "wind", label: "Wind" },
    { id: "insolation", label: "Insolation" },
  ];

  return (
    <div className="layer-controls">
      <h3>Layers</h3>
      {layers.map((layer) => (
        <div key={layer.id} className="layer-toggle">
          <label>
            <input
              type="checkbox"
              checked={activeLayers.includes(layer.id)}
              onChange={() => toggleLayer(layer.id)}
            />
            {layer.label}
          </label>
          {loadingStatus[layer.id] && <span className="loader" />}
        </div>
      ))}
    </div>
  );
};

const MainDashboard: React.FC = () => {
  const dispatch = useMapStoreDispatch();
  const currentTime = useMapStoreSelector((state) => state.currentTime);

  // Initial fetch
  useEffect(() => {
    fetchLayerThunk(dispatch, "temperature", currentTime);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>GeoAnalytics Dashboard</h1>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <LayerControls />
        </aside>

        <main className="main-panel">
          <MapWidget />
          <TimelinePanel />
          <AnalyticsPanel />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <MapStoreContextProvider state={{}}>
      <MainDashboard />
    </MapStoreContextProvider>
  );
}

export default App;
