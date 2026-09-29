import React from "react";
import {
  useMapStoreSelector,
  useMapStoreDispatch,
  fetchLayerThunk,
} from "../store/mapStore";

export const TimelinePanel: React.FC = () => {
  const { currentTime, activeLayers } = useMapStoreSelector((state) => ({
    currentTime: state.currentTime,
    activeLayers: state.activeLayers,
  }));

  const dispatch = useMapStoreDispatch();

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value, 10);
    dispatch(() => ({ currentTime: newTime }));

    // Trigger data fetch for active layers
    activeLayers.forEach((layerId: string) => {
      fetchLayerThunk(dispatch, layerId, newTime);
    });
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#1e1e1e",
        color: "white",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      <h3>Timeline</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span>0:00</span>
        <input
          type="range"
          min="0"
          max="23"
          value={currentTime}
          onChange={handleTimeChange}
          style={{ flexGrow: 1 }}
        />
        <span>23:00</span>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "1.2em",
          fontWeight: "bold",
        }}
      >
        Current Time: {currentTime}:00
      </div>
    </div>
  );
};
