let map, overlay;

var tripLayerOptions = {
    id:'trips',
    data: '../data/trip.json',
    getPath: d => d.waypoints.map(p => p.coordinates),
    // Timestamp is stored as float32, do not return a long int as it will cause precision loss
    getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [253, 128, 93],
    currentTime: 500,
    trailLength: 2000,
    capRounded: true,
    jointRounded: true,
    widthMinPixels: 2
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    var map = new atlas.Map('myMap', {
        center: [-122.3320708, 47.6062095], // Longitude, Latitude (Seattle coordinates as an example)
        zoom: 13.75, // Initial zoom level
        view: 'Auto', // View type ('Auto', '2D', '3D')
        pitch:45,
        style:'grayscale_dark',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: "<YOUR_AZURE_KEY>" // Replace this with your actual subscription key
        }
    });

    // Add a map control for zoom and rotation
    map.controls.add([new atlas.control.ZoomControl(),new atlas.control.StyleControl()], {
        position: 'top-right'
    });

    // Wait until the map resources are ready
    map.events.add('ready', function() {
        var scatterplotLayer = new deck.ScatterplotLayer({
            id: 'scatterplot-layer',
            data:[
                { position: [-122.39079879999997, 47.6104413], size: 100, color: [255, 0, 0] } // Sample data point
            ],
            getPosition: d=>d.position,
            getRadius: d => d.size,
            getFillColor: d=>d.color,
            opacity: 0.8,
            pickable: true
        });
        overlay = new DeckGLOverlay({
            layers:[new deck.TripsLayer(tripLayerOptions)]
        });
        map.controls.add(overlay);
        animate();
    });
});

const animate =()=>{
    // The time of the trip is being incremented forward
    var time = (tripLayerOptions.currentTime + 3) % 1000;
    tripLayerOptions.currentTime = time;
    // Updates the properties of the deck overlay
        overlay.setProps({
            layers:[new deck.TripsLayer(tripLayerOptions)]
        })

        window.requestAnimationFrame(animate);
}

class DeckGLOverlay {
            constructor(options) {
                this.id = options.id;

                // Create an instance of deck.gl MapboxOverlay what is compatible with Azure Maps
                // https://deck.gl/docs/api-reference/mapbox/mapbox-overlay
                this._mbOverlay = new deck.MapboxOverlay(options);
            }

            onAdd(map, options) {
                this.map = map;
                return this._mbOverlay.onAdd(map["map"]);
            }

            onRemove() {
                this._mbOverlay.onRemove();
            }

            getCanvas() {
                this._mbOverlay.getCanvas();
            }

            getId() {
                return this.id;
            }

            pickObject(params) {
                return this._mbOverlay.pickObject(params);
            }

            pickMultipleObjects(params) {
                return this._mbOverlay.pickMultipleObjects(params);
            }

            pickObjects(params) {
                return this._mbOverlay.pickObjects();
            }

            setProps(props) {
                this._mbOverlay.setProps(props);
            }

            finalize() {
                this._mbOverlay.finalize();
            }
        }
        