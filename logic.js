// Creating map object
var myMap = L.map("map", {
  center: [35.1361, -119.6756],
  zoom: 5
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
}).addTo(myMap);



// Assembling API query URL
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create helper function to return colors:
function getColor(d) {
  return d > 4  ? '#FF0000' :
         d > 3  ? '#FFF000' :
         d > 2   ? '#FFFF00' :
         d > 1   ? '#7FFF00' :
         d > 0   ? '#00FF00' :
                   '';
}

// Grabbing the earthquake data with d3..
d3.json(url, function(response) {

  // Creating a new marker cluster group
  var earthquakes = L.markerClusterGroup();

  // Loop through our data...
  for (var i = 0; i < response.features.length; i++) {
    // Gather magnitude, significance, and lat/lon data from each earthquake
    var feature = response.features[i];
    var time
    var properties = feature.properties;
    var magnitude = properties.mag;
    var significance = properties.sig;
    var lon = feature.geometry.coordinates[0];
    var lat = feature.geometry.coordinates[1];
    var place = properties.place;



    // If the data has a location property...
    if (location) {

      // Add a new marker to the cluster group and bind a pop-up
      myMap.addLayer(L.circleMarker([lat,lon])
        .setRadius(magnitude*5)
        .setStyle({
          'stroke': false,
          'color': getColor(magnitude),
        })
        .bindPopup(`
        <p>Location: ${place}</p>
        <p>Lat/Long: ${lat}, ${lon}</p>
        <p>Magnitude: ${magnitude}</p>
        <p>Significance: ${significance}</p>
        `));
    }

  }
  // Add our marker cluster layer to the map
  myMap.addLayer(earthquakes);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ['0','1','2','3','4+']
    var colors = ['#00FF00','#7FFF00','#FFFF00','#FFF000','#FF0000']
    var labels = [];

    // Add min & max
    var legendInfo = "<h1 style='color:white'>Intensity</h1>"

    div.innerHTML = legendInfo;
    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] +"\"><strong>"+limits[index]+"</strong></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  legend.addTo(myMap);
});
