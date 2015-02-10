// This example shows how to use the bounding box of a leaflet view to create a
// SODA within_box query, pulling data for the current map view from a Socrata dataset

  //initialize the leaflet map, set options, view, and basemap
  var map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: false
    })
    .setView([40.705008, -73.995581], 15);

  L.tileLayer(
    'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
      minZoom: 0,
      maxZoom: 19,
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

  var markers = new L.FeatureGroup();

  //figure out what the date was 7 days ago
  var sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //show the "since" date in the title box
  $('#startDate').html(sevenDaysAgo.toDateString());

  //create a SODA-ready date string for 7 days ago that looks like: YYYY-mm-dd
  sevenDaysAgo = sevenDaysAgo.getFullYear() + '-' 
    + cleanDate((sevenDaysAgo.getMonth() + 1)) + '-' 
    + cleanDate((sevenDaysAgo.getDate() + 1));

  //call getData() and show spinner when the map is dragged
  map.on('dragend', function(e) {
    $('#spinnerBox').fadeIn();
    getData();
  });

  //call getData() once
  getData();

  function getData() {
    //clear markers before getting new ones
    markers.clearLayers();

    //get map bounds from Leaflet.  getBounds() returns an object
    var bbox = map.getBounds();
    console.log(bbox);

    //within_box() expects a bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon, so we need to reorder the coordinates leaflet returned
    var sodaQueryBox = [
      bbox._northEast.lat, 
      bbox._southWest.lng, 
      bbox._southWest.lat, 
      bbox._northEast.lng
    ];

    //use jQuery's getJSON() to call the SODA API for NYC 311
    $.getJSON(buildQuery(sevenDaysAgo, sodaQueryBox), function(data) {

      //iterate over each 311 complaint, add a marker to the map
      for (var i = 0; i < data.length; i++) {

        var marker = data[i];
        var markerItem = L.circleMarker(
          [marker.location.latitude,marker.location.longitude], {
            radius: 5,
            fillColor: "steelblue",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });

        markerItem.bindPopup(
          '<h4>' + marker.complaint_type + '</h4>' 
          + (new Date(marker.created_date)).toDateString() 
          + ((marker.incident_address != null) ? '<br/>' + marker.incident_address : '')
        );

        markers.addLayer(markerItem);
      }
      //.addTo(map);
      map.addLayer(markers);

      //fade out the loading spinner
      $('#spinnerBox').fadeOut();
    })
  }

  //assemble a valid SODA API call using within_box() and created_date>{a week ago}
  function buildQuery(sevenDaysAgo, sodaQueryBox) {
    var query =
      "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=location,closed_date,complaint_type,street_name,created_date,status,unique_key,agency_name,due_date,descriptor,location_type,agency,incident_address&$where=created_date>'" +
      sevenDaysAgo + "' AND within_box(location," + sodaQueryBox +
      ")&$order=created_date desc";

    console.log(query);
    return query;
  }

  //add leading zero if month or day is less than 10
  function cleanDate(input) {
    return (input < 10) ? '0' + input : input;
  }


