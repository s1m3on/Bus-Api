//create map in leaflet and tie it to the div called 'theMap'
const map = L.map('theMap').setView([44.650627, -63.597140], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//create layer group to hold bus markers
const busLayer = L.layerGroup().addTo(map);

let busIcon = L.icon({
    iconUrl: 'bus.png',
    iconSize: [25, 30],
    iconAnchor: [10, 14],
    popupAnchor: [0, -15],
});

// const mapInterval = () => {
    //async function to fetch and filter bus data
    async function fetchData() {
        const url = 'https://prog2700.onrender.com/hrmbuses';
        const response = await fetch(url);
        const busData = await response.json();
        //filter bus data for bus routes 1 - 10
        const filteredBusData = busData.entity.filter(bus => bus.vehicle.trip.routeId <= 10);
        return filteredBusData;
    }

    //function to create bus markers
    async function addBusLayer() {
        const busData = await fetchData();
        busLayer.clearLayers();
        busData.forEach(bus => {
            const busMarker = L.marker([bus.vehicle.position.latitude, bus.vehicle.position.longitude], {
                icon: busIcon, 
                rotationAngle: bus.vehicle.position.bearing
            }).addTo(busLayer);

            busMarker.bindPopup(
                `Bus ID: ${bus.vehicle.vehicle.id}<br>
            Route ID: ${bus.vehicle.trip.routeId}<br>
            Latitude: ${bus.vehicle.position.latitude}<br>
            Longitude: ${bus.vehicle.position.longitude}`);
        });
    }

    //function to convert bus data to geojson
    function convertToGeoJSON(busData) {
        const geoJSON = {
            type: 'FeatureCollection',
            features: []
        };

        busData.forEach(bus => {
            const feature = {
                type: 'Feature',
                properties: {
                    busId: bus.vehicle.vehicle.id,
                    routeId: bus.vehicle.trip.routeId,
                    latitude: bus.position.latitude,
                    longitude: bus.position.longitude
                },
                geometry: {
                    type: 'Point',
                    coordinates: [bus.vehicle.position.longitude, bus.vehicle.position.latitude]
                }
            };
            geoJSON.features.push(feature);
        });

        return geoJSON;
    }

    //function to update map after 7seconds
    function updateMap() {
        addBusLayer();
        setTimeout(updateMap, 10000);
    }
    updateMap();
// }
// mapInterval();