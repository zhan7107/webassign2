
// initialize the map
var mymap = L.map('mapid').setView([44.9778, -93.2650], 13);
mymap.addControl(new L.Control.Fullscreen());

// load a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,',
	maxZoom: 18,
	id: 'mapbox.streets',
	accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

function zoomTo() {
	var lat = document.getElementById("lat").value;
	var lng = document.getElementById("lng").value;
	mymap.panTo(new L.LatLng(lat, lng));
}

L.control.coordinates({
	position:"topright", //optional default "bootomright"
	decimals:2, //optional default 4
	decimalSeperator:".", //optional default "."
	labelTemplateLat:"Latitude: {y}", //optional default "Lat: {y}"
	labelTemplateLng:"Longitude: {x}", //optional default "Lng: {x}"
	enableUserInput:true, //optional default true
	useDMS:false, //optional default false
	useLatLngOrder: true //ordering of labels, default false-> lng-lat
}).addTo(mymap);