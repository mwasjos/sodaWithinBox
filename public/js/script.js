$( document ).ready(function() {
	
	var map = L.map('map',{ zoomControl:false }).setView([40.758761,-73.852844], 11);

	L.tileLayer('https://{s}.tiles.mapbox.com/v3/cwhong.map-hziyh867/{z}/{x}/{y}.png', {
		maxZoom: 18
	}).addTo(map);

	var geoSearch = new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google(),
    showMarker: true,

  }).addTo(map);

  $('#addressSearch').keypress(function(e){
    geoSearch._onKeyUp(e);
    if(e.charCode==13) {
      $('#mask').fadeOut();
   	  $('#splash').fadeOut();
    }
  });

  var baseIcon = L.Icon.extend({
    //iconUrl: '../img/taxi.png',
    options:{
	    shadowUrl: '../img/shadow.png',

	    iconSize:     [32, 37], // size of the icon
	    shadowSize:   [51, 37], // size of the shadow
	    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
	    shadowAnchor: [25, 37],  // the same for the shadow
	    popupAnchor:  [1, -37] // point from which the popup should open relative to the iconAnchor
		}
	});

	var tlcIcon = new baseIcon({iconUrl: '../img/taxi.png'});
	var dotIcon = new baseIcon({iconUrl: '../img/dot.png'});
	var parksIcon = new baseIcon({iconUrl: '../img/parks.png'});
	var buildingsIcon = new baseIcon({iconUrl: '../img/buildings.png'});
	var nypdIcon = new baseIcon({iconUrl: '../img/nypd.png'});
	var dsnyIcon = new baseIcon({iconUrl: '../img/dsny.png'});
	var fdnyIcon = new baseIcon({iconUrl: '../img/fdny.png'});
	var doeIcon = new baseIcon({iconUrl: '../img/doe.png'});
	var depIcon = new baseIcon({iconUrl: '../img/dep.png'});
	var dofIcon = new baseIcon({iconUrl: '../img/dof.png'});
	var dcaIcon = new baseIcon({iconUrl: '../img/dca.png'});
	var dohmhIcon = new baseIcon({iconUrl: '../img/dohmh.png'});
	var hpdIcon = new baseIcon({iconUrl: '../img/hpd.png'});

  map.on('geosearch_showlocation', function(e) {
  	getData();
	});

  function getData() {
  	var bbox = map.getBounds();
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

					var marker = data[i];
					var icon = getIcon(marker);
					 
					

					L.marker( [marker.location.latitude, marker.location.longitude],{icon:icon} )
						//.bindPopup(JSON.stringify(data[i]))
						.bindPopup(
							marker.complaint_type 
							+ '<br/>'
							+ (new Date(marker.created_date)).toDateString()
							+ '<br/>'
							+ marker.incident_address

						)
						.addTo(map);
				}


			})
	  }

	  function getIcon(thisMarker) {
	  
	  	switch(thisMarker.agency) {
	  		case 'TLC':
	  			return tlcIcon;
	  		case 'DOT':
	  			return dotIcon;
  			case 'DPR':
  				return parksIcon;
				case 'DOB':
  				return buildingsIcon;
  			case 'NYPD':
  				return nypdIcon;
  			case 'DSNY':
  				return dsnyIcon;
  			case 'FDNY':
  				return fdnyIcon;
  			case 'DOE':
  				return doeIcon;
  			case 'DEP':
  				return depIcon;
  			case 'DOF':
  				return dofIcon;
  			case 'DCA':
  				return dcaIcon;
  			case 'DOHMH':
  				return dohmhIcon;
  			case 'HPD':
  				return hpdIcon;
	  		default:
	  			return new L.Icon.Default();
	  	}		
	  }


});