
$(document).ready(function () {
    var sevenDaysAgo;
    //initialize the leaflet map, set options and view
    var map = L.map('map', {
        zoomControl: false,
        scrollWheelZoom: false
    })
	.setView([40.705008, -73.995581], 15);

    var markers = new L.FeatureGroup();

    //add an OSM tileset as the base layer
    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

    //call our getData() function.
    getData();

    //define a base icon
    var baseIcon = L.Icon.extend({
        options: {
            shadowUrl: 'img/shadow.png',

            iconSize: [32, 37], // size of the icon
            shadowSize: [51, 37], // size of the shadow
            iconAnchor: [16, 37], // point of the icon which will correspond to marker's location
            shadowAnchor: [25, 37],  // the same for the shadow
            popupAnchor: [1, -37] // point from which the popup should open relative to the iconAnchor
        }
    });

    //define agency icons based on the base icon
    var tlcIcon = new baseIcon({ iconUrl: 'img/taxi.png' });
    var dotIcon = new baseIcon({ iconUrl: 'img/dot.png' });
    var parksIcon = new baseIcon({ iconUrl: 'img/parks.png' });
    var buildingsIcon = new baseIcon({ iconUrl: 'img/buildings.png' });
    var nypdIcon = new baseIcon({ iconUrl: 'img/nypd.png' });
    var dsnyIcon = new baseIcon({ iconUrl: 'img/dsny.png' });
    var fdnyIcon = new baseIcon({ iconUrl: 'img/fdny.png' });
    var doeIcon = new baseIcon({ iconUrl: 'img/doe.png' });
    var depIcon = new baseIcon({ iconUrl: 'img/dep.png' });
    var dofIcon = new baseIcon({ iconUrl: 'img/dof.png' });
    var dcaIcon = new baseIcon({ iconUrl: 'img/dca.png' });
    var dohmhIcon = new baseIcon({ iconUrl: 'img/dohmh.png' });
    var hpdIcon = new baseIcon({ iconUrl: 'img/hpd.png' });


    function getData() {
        //get map bounds from Leaflet
        var bbox = map.getBounds();
        //map.removeLayer(markers);
        markers.clearLayers();
        //create a SODA-ready bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon
        var sodaQueryBox = [bbox._northEast.lat, bbox._southWest.lng, bbox._southWest.lat, bbox._northEast.lng];

        //figure out what the date was 7 days ago
        var sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        $('#startDate').html(sevenDaysAgo.toDateString());

        function cleanDate(input) {
            return (input < 10) ? '0' + input : input;
        }

        //create a SODA-ready date string that looks like: 2014-11-01
        sevenDaysAgo = sevenDaysAgo.getFullYear()
			+ '-'
			+ cleanDate((sevenDaysAgo.getMonth() + 1))
			+ '-'
			+ cleanDate((sevenDaysAgo.getDate() + 1));

        //use jQuery's getJSON() to call the SODA API for NYC 311
        //concatenate sodaQueryBox and sevenDaysAgo to add a $where clause to the SODA endpoint
        $.getJSON(constructQuery(sevenDaysAgo, sodaQueryBox), function (data) {

                console.log(data)
			    //iterate over each 311 complaint, add a marker to the map
			    for (var i = 0; i < data.length; i++) {

			        var marker = data[i];
			        var icon = getIcon(marker);

			        var markerItem = L.marker([marker.location.latitude, marker.location.longitude], { icon: icon });
			        markerItem.bindPopup(
							'<h4>' + marker.complaint_type + '</h4>'
							+ (new Date(marker.created_date)).toDateString()
							+ ((marker.incident_address != null) ? '<br/>' + marker.incident_address : '')
						);
			        markers.addLayer(markerItem);
			    }
            //.addTo(map);
			    map.addLayer(markers);

			})
    }

    function constructQuery(sevenDaysAgo, sodaQueryBox) {
        var originalstr = "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=location,closed_date,complaint_type,street_name,created_date,status,unique_key,agency_name,due_date,descriptor,location_type,agency,incident_address&$where=created_date>'"
			+ sevenDaysAgo
			+ "' AND within_box(location,"
			+ sodaQueryBox
			+ ")&$order=created_date desc"

        var agency = $( "#nycAgency" ).val();
        var conditiion = $("#conditions_list").val();
        if (agency.length != 0 && agency != "All") {
            originalstr = originalstr + "&agency=" + agency;
        }
        if (conditiion.length != 0 && conditiion != "All") {
            originalstr = originalstr + "&complaint_type=" + conditiion;
        }

        console.log(originalstr);

        return originalstr;
    }
    function getIcon(thisMarker) {

        switch (thisMarker.agency) {
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

    map.on('dragend', function (e) {
        getData();
    });

    $('#nycAgency').on("change", function () {
        getData();
    });

    $("#conditions_list").on('change keyup paste', function () {
        getData();
    });
});
