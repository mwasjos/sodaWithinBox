$( document ).ready(function() {
	
	var map = L.map('map').setView([40.691647,-73.985356], 16);

	L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-i875mjb7/{z}/{x}/{y}.png', {
		maxZoom: 18
	}).addTo(map);

	var bbox = map.getBounds();
	console.log(bbox);
	var sodaQueryBox = [bbox._northEast.lat,bbox._southWest.lng,bbox._southWest.lat,bbox._northEast.lng];

	console.log(sodaQueryBox);
	
	var sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7);

	console.log(sevenDaysAgo);

	console.log(sevenDaysAgo.getMonth());


	function cleanDate(input) {
		if (input < 10) {
			return '0' + input;
		}
	}

	sevenDaysAgo = sevenDaysAgo.getFullYear() 
		+ '-' 
		+ (sevenDaysAgo.getMonth() + 1)
		+ '-'
		+ cleanDate((sevenDaysAgo.getDate() + 1)) ;


	console.log(sevenDaysAgo);



	$.getJSON("https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=location,closed_date,complaint_type,street_name,created_date,status,unique_key,agency_name,due_date,descriptor,location_type,agency,incident_address&$where=created_date>'"
		//+2014-11-01
		+ sevenDaysAgo
		+"' AND within_box(location,"
		+ sodaQueryBox
		+")&$order=created_date desc", function(data){
			console.log(data);

			for(var i=0; i<data.length; i++) {
				L.marker( [data[i].location.latitude, data[i].location.longitude] )
					.bindPopup(JSON.stringify(data[i]))
					.addTo(map);
			}


		})

	//working query:  location,closed_date,complaint_type,street_name,created_date,status,unique key,agency_name,due_date,descriptor,location_type,agency,incident_address
	//data.cityofnewyork.us/resource/erm2-nwe9.json?$select=location,closed_date,complaint_type,street_name,created_date,status,unique_key,agency_name,due_date,descriptor,location_type,agency,incident_address&$where=created_date%3C%272014-11-01%27%20AND%20within_box(location,40.69283316734745,%20-73.99187922477722,%2040.6904659060429,%20-73.97883296012878)&$order=created_date%20desc&

	//var marker = L.marker([40.68025, -74.00155]).addTo(map);
	//marker.bindPopup("Larry's house").openPopup();
});