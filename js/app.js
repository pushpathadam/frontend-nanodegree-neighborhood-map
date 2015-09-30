var geocoder;
var map;

function initMap() {

    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(34.1592, -118.5003);

    var locations;

    var mapOptions = {
        center: {lat: 34.1592, lng: -118.5003},
        zoom: 13,
        //center: latlng,
        //disableDefaultUI: true
    };

    // This next line makes `map` a new Google Map JavaScript Object and attaches it to
    // <div id="map">, which is appended as part of an exercise late in the course.
    map = new google.maps.Map(document.getElementById('map'),mapOptions);

    // Adjusted color of the map to a more monochrome look
    map.set('styles',[
        {
            "stylers": [
              { "saturation": -100 }
            ]
        },
        {
            "featureType": "water",
            "stylers": [
              { "saturation": -100 },
              { "lightness": -46 }
            ]
        }
    ]);

    // Sets the boundaries of the map based on pin locations
    //window.mapBounds = new google.maps.LatLngBounds();

      // locations is an array of location strings returned from locationFinder()
}


function codeAddress(){
    var address = document.getElementById("address").value;
    console.log(address);
    console.log(geocoder);
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
};
