import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  useMapStoreSelector,
  useMapStoreDispatch,
  fetchLayerThunk,
} from "../store/mapStore";
import { generateTimeSeries } from "../api/mockData";
import { LAYER_CONFIG } from "../config/layerConfig";

export const AnalyticsPanel: React.FC = () => {
  const { activeLayers, currentTime } = useMapStoreSelector((state) => ({
    activeLayers: state.activeLayers,
    currentTime: state.currentTime,
  }));

  const dispatch = useMapStoreDispatch();

  // Combine data for active layers
  const chartData = useMemo(() => {
    if (activeLayers.length === 0) return [];

    // Base time series on first active layer
    const baseSeries = generateTimeSeries(activeLayers[0]);

    return baseSeries.map((item) => {
      const merged: Record<string, any> = { time: item.time };
      activeLayers.forEach((layerId) => {
        const layerSeries = generateTimeSeries(layerId);
        const layerItem = layerSeries.find((i) => i.time === item.time);
        merged[layerId] = layerItem ? layerItem.value : 0;
      });
      return merged;
    });
  }, [activeLayers]);

  const handleChartClick = (e: any) => {
    if (e && e.activeLabel !== undefined) {
      const newTime = e.activeLabel as number;
      dispatch(() => ({ currentTime: newTime }));

      activeLayers.forEach((layerId: string) => {
        fetchLayerThunk(dispatch, layerId, newTime);
      });
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#1e1e1e",
        color: "white",
        borderRadius: "12px",
        marginTop: "20px",
        height: "300px",
      }}
    >
      {activeLayers.length === 0 ? (
        <p>Select a layer to view analytics</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={handleChartClick}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip
              contentStyle={{
                background: "#333",
                border: "none",
                borderRadius: "8px",
              }}
            />

            {/* Reference line for bidirectional sync */}
            <ReferenceLine x={currentTime} stroke="#1890ff" strokeWidth={2} />

            {activeLayers.map((layerId) => {
              const color = LAYER_CONFIG[layerId]?.color || "#8884d8";
              return (
                <Line
                  key={layerId}
                  type="monotone"
                  dataKey={layerId}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
