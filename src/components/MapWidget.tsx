import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStoreSelector } from "../store/mapStore";
import L from "leaflet";
import { LAYER_CONFIG } from "../config/layerConfig";
import type { LayerConfig } from "../config/layerConfig";
import type { FeatureCollection } from "../store/mapStore";

const DynamicGeoJSON = ({
  data,
  config,
}: {
  data: FeatureCollection;
  config: LayerConfig;
}) => {
  const geoJsonRef = useRef<L.GeoJSON>(null);

  useEffect(() => {
    if (geoJsonRef.current && data) {
      geoJsonRef.current.clearLayers();
      geoJsonRef.current.addData(data as any);
    }
  }, [data]);

  const getDynamicStyle = (feature: any) => {
    const val = feature.properties[config.valueKey] || 0;
    const normalized = Math.max(
      0,
      Math.min(1, (val - config.min) / (config.max - config.min)),
    );
    const opacity = 0.2 + normalized * 0.8;
    return {
      radius: 10,
      fillColor: config.color,
      color: "#ffffff",
      weight: 2,
      opacity: opacity,
      fillOpacity: opacity,
    };
  };

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    return L.circleMarker(latlng, getDynamicStyle(feature));
  };

  return (
    <GeoJSON ref={geoJsonRef} data={data as any} pointToLayer={pointToLayer} />
  );
};

export const MapWidget: React.FC = () => {
  const { activeLayers, layerData } = useMapStoreSelector((state) => ({
    activeLayers: state.activeLayers,
    layerData: state.layerData,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <MapContainer
        center={[55.7558, 37.6173]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {activeLayers.map((layerId) => {
          const config = LAYER_CONFIG[layerId];
          const data = layerData[layerId];
          if (!config || !data) return null;

          return <DynamicGeoJSON key={layerId} data={data} config={config} />;
        })}
      </MapContainer>
    </div>
  );
};
