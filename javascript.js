var airQualityApp;
var lat = 44.976877256928;
var lng = -93.17484381979153;
var radius = 8300;
var markers = [];
var heatMap = false;
var coordinates = "";
var pRadius = "";
var parameter = "";
var tableController;
var tableDatasLatest;
var tableDatasHistory;
var tableModes;
var searchUpdate;
var values;
var dataTable;
var dates;
var classes;

var today = new Date();
var ninty_days_ago = today.setDate(today.getDate()-90);

var map;
var heatmap;
var resultsArray;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 44.976877256928, lng: -93.17484381979153},
		zoom: 13,
		mapTypeId: 'roadmap',
		gestureHandling: 'greedy'
	});
    var legend = document.getElementById('legend');
	map.controls[google.maps.ControlPosition.BOTTOM].push(legend);
	
	var input = document.getElementById('pac-input');
	var hm = document.getElementById('floating-panel');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(hm);
	
	map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
	
	searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
		return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
		marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
		if (!place.geometry) {
			console.log("Returned place contains no geometry");
			return;
		}
		var icon = {
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(25, 25)
		};

		// Create a marker for each place.
		markers.push(new google.maps.Marker({
			map: map,
			icon: icon,
			title: place.name,
			position: place.geometry.location
		}));

		if (place.geometry.viewport) {
		// Only geocodes have viewport.
			bounds.union(place.geometry.viewport);
		} else {
			bounds.extend(place.geometry.location);
		}
		});
		map.fitBounds(bounds);
		updateMap();
	});
	
	map.addListener('dragend', function(){
		if(tableModes.mode == 'latest') {
			setTimeout(function(){updateMap();},300);
		}else{
			setTimeout(function(){updateHistoryMap();},300);
		}
		setTimeout(function(){axios.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
			if(response.data.results[0] !== undefined){
				document.getElementById('pac-input').value = response.data.results[0].formatted_address;
			}else{
				document.getElementById('pac-input').value = lnglat;
				
			}
		}).catch(function(error) {
			console.log(error);
		});
		},300);
	});
	map.addListener('zoom_changed', function(){
		if(tableModes.mode == 'latest') {
			setTimeout(function(){updateMap();},300);
		}else{
			setTimeout(function(){updateHistoryMap();},300);
		}
		
		setTimeout(function(){axios.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
			if(response.data.results[0] !== undefined){
				document.getElementById('pac-input').value = response.data.results[0].formatted_address;
			}else{
				document.getElementById('pac-input').value = lnglat;
				
			}
		});
		},300);
	});
}


function updateMap(){
	document.getElementById("alert").style.display = "none";
	document.getElementById("alert2").style.display = "none";
	document.getElementById("warning").style.display = "none";
	document.getElementById("danger").style.display = "none";
	
	lnglat = map.getCenter();
	radius = getBoundsRadius(map.getBounds());
	if(lnglat!=null){
		lat=lnglat.lat();
		lng=lnglat.lng();
	}
	
	
	//*Addresss Update
	axios.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
		if(response.data.results[0] !== undefined){
			document.getElementById("addr").textContent = response.data.results[0].formatted_address;
		}else{
			document.getElementById("addr").textContent = lnglat;
		}
		document.getElementById("ll").textContent = lnglat;
	}).catch(function(error) {
		console.log(error);
	});
	//*/
	
	markers.forEach(function(marker) {
		marker.setMap(null);
	});
	
	markers = [];
	axios.get("https://api.openaq.org/v1/latest?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
	function(response)
	{
		//console.log(response.data.results);
		var heatMapData=[];
		var results = response.data.results;
		tableDatasLatest.tableData = response.data.results;
		tableDatasLatest.setColor();
		var i = 0;

		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
		for(i=0;i<results.length;i++){
			curLat = results[i].coordinates.latitude;
			curLng = results[i].coordinates.longitude;
			var measurements = "";
			for(var j=0;j<results[i].measurements.length;j++){
				measurements = measurements + "\nDate: "+results[i].measurements[j].lastUpdated +", Particle: "+results[i].measurements[j].parameter+" "+results[i].measurements[j].value+results[i].measurements[j].unit
			}
			markers.push(new google.maps.Marker({
				map: map,
				title: "Location: " + results[i].location +
				measurements,
				position: {lat: curLat, lng: curLng}
			}));
		}
	}).catch(function(error){
		console.log(error);
	});
}

function updateHistoryMap(){
	document.getElementById("alert").style.display = "none";
	document.getElementById("alert2").style.display = "none";
	document.getElementById("warning").style.display = "none";
	document.getElementById("danger").style.display = "none";
	
	
	lnglat = map.getCenter();
	radius = getBoundsRadius(map.getBounds());
	if(lnglat!=null){
		lat=lnglat.lat();
		lng=lnglat.lng();
	}
	
	
	//*Addresss Update
	axios.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
		if(response.data.results[0] !== undefined){
			document.getElementById("addr").textContent = response.data.results[0].formatted_address;
		}else{
			document.getElementById("addr").textContent = lnglat;
		}
		document.getElementById("ll").textContent = lnglat;
	}).catch(error => {
		console.log(error.response)
	});
	//*/
	
	markers.forEach(function(marker) {
		marker.setMap(null);
	});
	
	markers = [];
	axios.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius+parameter+"&date_from="+formatDate(dates.start_from)+"&date_to="+formatDate(dates.end_to)).then(
	function(response)
	{
		//console.log(response.data.results);
		var heatMapData=[];
		var results = response.data.results;
		tableDatasHistory.tableData = response.data.results;
		tableDatasHistory.setColor();
		var i = 0;

		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
		for(i=0;i<results.length;i++){
			curLat = results[i].coordinates.latitude;
			curLng = results[i].coordinates.longitude;
			var measurements = "";
			
			measurements = measurements + "\nDate: "+results[i].date.utc +", Particle: "+results[i].parameter+" "+results[i].value+results[i].unit
			
			markers.push(new google.maps.Marker({
				map: map,
				title: "Location: " + results[i].location +
				//"\nDate: "+results[i].date.local+
				measurements,
				position: {lat: curLat, lng: curLng}
			}));
		}
	}).catch(function(error){
		console.log(error);
	});
} 


function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function setColorValue(param, value){
	if(param == 'pm25'){
		if(value <= 12.0){
			return 'rgb(' + [0,228,0].join(',') + ')';
		}
		else if(value >= 12.0 && value <= 35.4){
			return 'rgb(' + [255,255,0].join(',') + ')';
		}
		else if(value > 35.4 && value <= 55.4){
			if(document.getElementById("alert").style.display == "none"){
				document.getElementById("alert").style.display = "block";
			}			
			return 'rgb(' + [255,126,0].join(',') + ')';
		}
		else if(value > 55.4 && value <= 150.4){
			if(document.getElementById("alert2").style.display == "none"){
				document.getElementById("alert2").style.display = "block";
			}				
			return 'rgb(' + [255,0,0].join(',') + ')';
		}
		else if(value > 150.4 && value <= 250.4){
			if(document.getElementById("warning").style.display == "none"){
				document.getElementById("warning").style.display = "block";
			}			
			return 'rgb(' + [143,63,151].join(',') + ')';
		}
		else{
			if(document.getElementById("danger").style.display == "none"){
				document.getElementById("danger").style.display = "block";
			}				
			return 'rgb(' + [126,0,35].join(',') + ')';;
		}
	}
	else if(param == 'pm10'){
		if(value <= 54.0){
			return 'rgb(' + [0,228,0].join(',') + ')';
		}
		else if(value > 54.0 && value <= 154){
			return 'rgb(' + [255,255,0].join(',') + ')';
		}
		else if(value > 154 && value <= 254){
			if(document.getElementById("alert").style.display == "none"){
				document.getElementById("alert").style.display = "block";
			}			
			return 'rgb(' + [255,126,0].join(',') + ')';
		}
		else if(value > 254 && value <= 354){
			if(document.getElementById("alert2").style.display == "none"){
				document.getElementById("alert2").style.display = "block";
			}							
			return 'rgb(' + [255,0,0].join(',') + ')';
		}
		else if(value > 354 && value <= 424){
			if(document.getElementById("warning").style.display == "none"){
				document.getElementById("warning").style.display = "block";
			}							
			return 'rgb(' + [143,63,151].join(',') + ')';
		}
		else{
			if(document.getElementById("danger").style.display == "none"){
				document.getElementById("danger").style.display = "block";
			}							
			return 'rgb(' + [126,0,35].join(',') + ')';
		}
	}
	else if(param == 'co'){
		if(value <= 4.4){
			return 'rgb(' + [0,228,0].join(',') + ')';	
		}
		else if(value > 4.4 && value <= 9.4){
			return 'rgb(' + [255,255,0].join(',') + ')';
		}
		else if(value > 9.4 && value <= 12.4){
			if(document.getElementById("alert").style.display == "none"){
				document.getElementById("alert").style.display = "block";
			}			
			return 'rgb(' + [255,126,0].join(',') + ')';
		}
		else if(value > 12.4 && value <= 15.4){
			if(document.getElementById("alert2").style.display == "none"){
				document.getElementById("alert2").style.display = "block";
			}							
			return 'rgb(' + [255,0,0].join(',') + ')';	
		}
		else if(value > 15.4 && value <= 30.4){
			if(document.getElementById("warning").style.display == "none"){
				document.getElementById("warning").style.display = "block";
			}				
			return 'rgb(' + [143,63,151].join(',') + ')';
		}
		else{
			if(document.getElementById("danger").style.display == "none"){
				document.getElementById("danger").style.display = "block";
			}							
			return 'rgb(' + [126,0,35].join(',') + ')';
		}
	}
	else if(param == 'so2'){
		if(value <= 35.0){
			return 'rgb(' + [0,228,0].join(',') + ')';	
		}
		else if(value > 35.0 && value <= 75){
			return 'rgb(' + [255,255,0].join(',') + ')';
		}
		else if(value > 75 && value <= 185){
			if(document.getElementById("alert").style.display == "none"){
				document.getElementById("alert").style.display = "block";
			}			
			return 'rgb(' + [255,126,0].join(',') + ')';
		}
		else if(value > 185 && value <= 304){
			if(document.getElementById("alert2").style.display == "none"){
				document.getElementById("alert2").style.display = "block";
			}							
			return 'rgb(' + [255,0,0].join(',') + ')';
		}
		else if(value > 304 && value <= 604){
			if(document.getElementById("warning").style.display == "none"){
				document.getElementById("warning").style.display = "block";
			}				
			return 'rgb(' + [143,63,151].join(',') + ')';
		}
		else{
			if(document.getElementById("danger").style.display == "none"){
				document.getElementById("danger").style.display = "block";
			}							
			return 'rgb(' + [126,0,35].join(',') + ')';
		}
	}
	else if(param == 'no2'){
		if(value <= 53.0){
			return 'rgb(' + [0,228,0].join(',') + ')';
		}
		else if(value > 53.0 && value <= 100){
			return 'rgb(' + [255,255,0].join(',') + ')';			
		}
		else if(value > 100 && value <= 360){
			if(document.getElementById("alert").style.display == "none"){
				document.getElementById("alert").style.display = "block";
			}			
			return 'rgb(' + [255,126,0].join(',') + ')';
		}
		else if(value > 360 && value <= 649){
			if(document.getElementById("alert2").style.display == "none"){
				document.getElementById("alert2").style.display = "block";
			}							
			return 'rgb(' + [255,0,0].join(',') + ')';
		}
		else if(value > 649 && value <= 1249){
			if(document.getElementById("warning").style.display == "none"){
				console.log("hi");
				document.getElementById("warning").style.display = "block";
			}				
			return 'rgb(' + [143,63,151].join(',') + ')';
		}
		else{
			if(document.getElementById("danger").style.display == "none"){
				document.getElementById("danger").style.display = "block";
			}							
			return 'rgb(' + [126,0,35].join(',') + ')';
		}
	}
	else if(param == 'o3'){
		if(value <= 0.054){
			return 'rgb(' + [0,228,0].join(',') + ')';
		}
		else if(value > 0.054 && value <= 0.070){
			return 'rgb(' + [255,255,0].join(',') + ')';
		}
		else if(value > 0.070 && value <= 0.085){
			if(document.getElementById("alert").style.display == "none"){
				document.getElementById("alert").style.display = "block";
			}			
			return 'rgb(' + [255,126,0].join(',') + ')';
		}
		else if(value > 0.085 && value <= 0.105){
			if(document.getElementById("alert2").style.display == "none"){
				document.getElementById("alert2").style.display = "block";
			}							
			return 'rgb(' + [255,0,0].join(',') + ')';
		}
		else if(value > 0.106 && value <= 0.200){
			if(document.getElementById("warning").style.display == "none"){
				document.getElementById("warning").style.display = "block";
			}				
			return 'rgb(' + [143,63,151].join(',') + ')';
		}
		else{
			if(document.getElementById("danger").style.display == "none"){
				document.getElementById("danger").style.display = "block";
			}							
			return 'rgb(' + [126,0,35].join(',') + ')';
		}
	}
}

function formatDate(date) {
    var d = new Date(date);
	year = "" + d.getFullYear();
	month = "" + (d.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
	day = "" + d.getDate(); if (day.length == 1) { day = "0" + day; }
	hour = "" + d.getHours(); if (hour.length == 1) { hour = "0" + hour; }
	minute = "" + d.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
	second = "" + d.getSeconds(); if (second.length == 1) { second = "0" + second; }
	return year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
}

function updateLnglat(val){
	lnglat=val;
	document.getElementById('ll').value = lnglat;
	//document.getElementById('ll').innerHTML = lnglat;
	document.getElementById('ll').textContent = lnglat;
}

function getBoundsRadius(bounds){
	//https://stackoverflow.com/questions/3525670/radius-of-viewable-region-in-google-maps-v3
	// r = radius of the earth in km
	var r = 6378.8
	// degrees to radians (divide by 57.2958)
	var ne_lat = bounds.getNorthEast().lat() / 57.2958
	var ne_lng = bounds.getNorthEast().lng() / 57.2958
	var c_lat = bounds.getCenter().lat() / 57.2958
	var c_lng = bounds.getCenter().lng() / 57.2958
	// distance = circle radius from center to Northeast corner of bounds
	var r_km = r * Math.acos(
	Math.sin(c_lat) * Math.sin(ne_lat) +
	Math.cos(c_lat) * Math.cos(ne_lat) * Math.cos(ne_lng - c_lng)
	)
	return r_km *1000 // radius in meters
}


window.onload = function () {
	
	tableController = new Vue ({
		el: '#particles',
		data: {
			particle: '',
			options: [
				{type: '', value: '' },
				{ type: 'pm25', value: 'pm25' },
				{ type: 'pm10', value: 'pm10' },
				{ type: 'so2', value: 'so2' },
				{ type: 'no2', value: 'no2' },
				{ type: 'o3', value: 'o3' },
				{ type: 'co', value: 'co' }
			]
		},
		methods: {
			onchange: function() {
				var hm = document.getElementById("floating-panel");
				if(this.particle!==''){
					parameter="&parameter="+this.particle;
					hm.style.display='block';
				}else{
					document.getElementById("legendImg").src = "legend/Capture.PNG";
					hm.style.display='none';
				}
				
				if(this.particle === 'pm25'){
					document.getElementById("legendImg").src = "legend/pm25.PNG";
				}
				else if (this.particle === 'pm10'){
					document.getElementById("legendImg").src = "legend/pm10.PNG";
				}
				else if (this.particle === 'so2'){
					document.getElementById("legendImg").src = "legend/so2.PNG";
				}
				else if (this.particle === 'no2'){
					document.getElementById("legendImg").src = "legend/no2.PNG";
				}
				else if (this.particle === 'o3'){
					document.getElementById("legendImg").src = "legend/o3.PNG";				
				}
				else if (this.particle === 'co'){
					document.getElementById("legendImg").src = "legend/co.PNG";
				}
				
				if(tableModes.mode == 'latest') {
					document.getElementById("tableLatest").style.display = "block";
					document.getElementById("tableHistory").style.display = "none";
					setTimeout(function(){updateMap();},300);
				}else{
					document.getElementById("tableLatest").style.display = "none";
					document.getElementById("tableHistory").style.display = "block";
					setTimeout(function(){updateHistoryMap();},300);
				}
			}
		}
	});
		
	tableModes = new Vue({
		el: '#mapMode',
		data: {
			mode: 'latest',
			historyorlatest: [
				{ type: 'latest', value: 'latest'},
				{ type: 'history', value: 'history' }
			]
		},
		methods: {
			onchange: function() {
				if(this.mode == 'latest'){
					document.getElementById("tableLatest").style.display = "block";
					document.getElementById("tableHistory").style.display = "none";
					document.getElementById("dates").style.display = "none";
					setTimeout(function(){updateMap();},300);
				}else{
					document.getElementById("tableLatest").style.display = "none";
					document.getElementById("tableHistory").style.display = "block";
					document.getElementById("dates").style.display = "block";

					setTimeout(function(){updateHistoryMap();},300);
				}
			}
		}	
	});
	
	tableDatasLatest = new Vue({
		el: '#tableLatest',
		data () {
			return {
				min: '-10000',
				max: '10000',
				color: '',
				tableData: null,
			}
		},
		methods: {
			setColor: function (){
				if (this.tableData != null){
					for(var i = 0; i < this.tableData.length; i++){
						this.tableData[i].color = setColorValue(this.tableData[i].measurements[0].parameter, this.tableData[i].measurements[0].value);
					}
				}
			}
		}
	});
	
	tableDatasHistory = new Vue({
		el: '#tableHistory',
		data () {
			return {
				min: '-10000',
				max: '10000',
				tableData: null
			}
		},
		methods: {
			setColor: function (){
				if (this.tableData != null){
					for(var i = 0; i < this.tableData.length; i++){
						this.tableData[i].color = setColorValue(this.tableData[i].parameter, this.tableData[i].value)
					}
				}
			}
		}
	});
	
	
	values = new Vue({
		el:'#values',
		data: {
			min: '-10000',
			max: '10000'
		},
		watch: {
			min: function(val, oldVal) {
				if(tableModes.mode == 'latest'){
					tableDatasLatest.min = val;
				}else{
					tableDatasHistory.min = val;
				}
			},
			max: function(val, oldVal) {
				if(tableModes.mode == 'latest'){
					tableDatasLatest.max = val;
				}else{
					tableDatasHistory.max = val;
				}
			}
		}
	});
	
	dates = new Vue({
		el: '#dates',
		data() {
			return {
				format: 'yyyy-MM-dd',
				start_from: ninty_days_ago,
				end_to: new Date(),
				disabledDates: {
					to: new Date(ninty_days_ago),
					from: new Date()
				}
			}
		},
		watch: {
			start_from: function(){
				setTimeout(function(){updateHistoryMap();},300);
			},
			end_to: function() {
				setTimeout(function(){updateHistoryMap();},300);
			}
		}
	});
	updateMap();
}



