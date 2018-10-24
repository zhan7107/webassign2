
// initialize the map
var map = L.map('mapid').setView([44.9778, -93.2650], 13);

// load a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,',
	maxZoom: 18,
	id: 'mapbox.streets',
	accessToken: 'your.mapbox.access.token'
}).addTo(map);

function zoomTo() {
	var lat = document.getElementById("lat").value;
	var lng = document.getElementById("lng").value;
	map.panTo(new L.LatLng(lat, lng));
}