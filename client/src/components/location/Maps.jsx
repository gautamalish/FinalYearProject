import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ onLocationSelect }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    const mapInstance = L.map("map").setView([27.7172, 85.324], 13);
    setMap(mapInstance);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance);

    return () => mapInstance.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    const onMapClick = async (e) => {
      const { lat, lng } = e.latlng;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();

        const address = data.address;
        const location =
          address.city || address.town || address.village || "Unknown";

        setLocationName(location);

        onLocationSelect({ locationName: location });

        // Remove previous marker
        if (marker) {
          marker.remove();
        }

        // Add new marker
        const newMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        })
          .addTo(map)
          .bindPopup(location)
          .openPopup();

        setMarker(newMarker);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    map.on("click", onMapClick);
    return () => map.off("click", onMapClick);
  }, [map, marker]);

  const handleSearch = async () => {
    if (!locationName) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];

        // Center map and place marker
        map.setView([lat, lon], 13);

        if (marker) {
          marker.remove();
        }

        const newMarker = L.marker([lat, lon], {
          icon: L.icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        })
          .addTo(map)
          .bindPopup(data[0].display_name)
          .openPopup();

        setMarker(newMarker);
        onLocationSelect({ locationName: data[0].display_name });
      }
    } catch (error) {
      console.error("Error fetching location by name:", error);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row w-full h-[500px] bg-gray-100 rounded-lg shadow-md">
      {/* Left side - Form */}
      <div className="absolute md:relative w-[90%] md:w-[350px] bg-white p-6 md:p-8 rounded-lg shadow-lg left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 top-6 md:top-auto z-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Find a location near you.
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Select or search for your location.
        </p>

        {/* Location Search */}
        <div className="mb-3">
          <label className="text-sm text-gray-700">Location</label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full border rounded-md p-2 mt-1 bg-gray-100 text-gray-800"
            placeholder="Enter a location"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md font-medium"
        >
          Search
        </button>
      </div>

      {/* Right side - Map */}
      <div id="map" className="w-full h-full rounded-lg z-0" />
    </div>
  );
};

export default MapComponent;
