﻿///<refernce path="../../typings/jquery/jquery.d.ts"/>
///<refernce path="../../typings/leaflet/leaflet.d.ts"/>

module LSDMap.Home {
    export class Index {
        map: L.Map;
        boundaries: L.MultiPolygon;
        markers: L.LayerGroup;
        constructor(public container: JQuery) {
            this.map = L.map("map").setView(L.latLng([47, -100]), 4);

            var osm = new L.TileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            }).addTo(this.map);
            var baseLayers = { "OpenStreeMap": osm };

            this.boundaries = L.multiPolygon([], { color: "blue", fillOpacity: 0, weight: 2, clickable: false });
            this.boundaries.addTo(this.map);

            this.markers = L.layerGroup([L.marker(L.latLng([47, -100]))]);
            this.markers.addTo(this.map);

            var overlays = { "Boundaries": this.boundaries, 'Markers': this.markers };

            L.control.layers(baseLayers, overlays).addTo(this.map);

            this.map.addEventListener("zoomend", (e) => {
                if (this.map.getZoom() == 10)
                    this.GetBoundaries();
                if (this.map.getZoom() < 10)
                    this.ClearBoundaries();
            });
            this.map.addEventListener("dragend", (e) => {
                if (this.map.getZoom() == 10)
                    this.GetBoundaries();
            });

            
        }

        ClearBoundaries() {
            this.boundaries.setLatLngs([]);
            this.markers.clearLayers();
        }

        GetBoundaries() {
            var data = {
                zoomLevel: this.map.getZoom(),
                northEast: {
                    Latitude: this.map.getBounds().getNorthEast().lat, Longitude: this.map.getBounds().getNorthEast().lng
                },
                northWest: {
                    Latitude: this.map.getBounds().getNorthWest().lat, Longitude: this.map.getBounds().getNorthWest().lng
                },
                southEast: {
                    Latitude: this.map.getBounds().getSouthEast().lat, Longitude: this.map.getBounds().getSouthEast().lng
                },
                southWest: {
                    Latitude: this.map.getBounds().getSouthWest().lat, Longitude: this.map.getBounds().getSouthWest().lng
                },
            };
            $.getJSON("/api/Boundaries", data, (json) => this.PlotPoints(json)); 
        }

        PlotPoints(data) {
            var latLongs = [];
            for (var i = 0; i < data.length; i++)
            {
                var points = [];
                for(var j = 0; j<data[i].Coordinates.length; j++)
                {
                    points.push(L.latLng(data[i].Coordinates[j].Latitude,
                                         data[i].Coordinates[j].Longitude));
                }
                latLongs.push(points);
                this.markers.addLayer(L.marker(L.latLng([data[i].CenterCoordinates[0].Latitude, data[i].CenterCoordinates[0].Longitude])));
                
            }
            
            this.boundaries.setLatLngs(latLongs);
            console.dir(data);
        }
    }
}