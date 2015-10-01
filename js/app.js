var geocoder;
var map;
var userLocation; //need to query that one

var YELP_KEY = "zlSHMTd6jFsZDtRz_xLTKg";
var YELP_KEY_SECRET = "h0q1qcYo0NZlf8QYVgLnmFiJ_qM";
var YELP_TOKEN = "DpBAHxm5PtaOkbFH1g2XaGumRDAdN9t6";
var YELP_TOKEN_SECRET = "Z1lKnImH7eodJHFIo6yQtuE_ARI";

function obtainYelpBrewpubList(){
    var YELP_BASE_URL = 'http://api.yelp.com/v2/search'
    var yelp_url = YELP_BASE_URL;
    var yelpRequestTimeout = setTimeout(function(){
        $yelpElem.text("failed to get yelp resources");
    }, 8000);
    var nonce_generate = Math.floor(Math.random() * 1e12).toString();

    var parameters = {
        oauth_consumer_key: YELP_KEY,
        oauth_token: YELP_TOKEN,
        oauth_nonce: nonce_generate,
        oauth_timestamp: Math.floor(Date.now()/1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version : '1.0',
        location: 'Encino CA',
        term: 'brewpub',
        limit: 1,
        callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;
    //Debug
    console.log("obtaining encodedSignature:"+encodedSignature);

    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
        dataType: 'jsonp',
        success: function(results) {
        //dostuff
        //Debug
        },
        error:function(jqXHR, textStatus, errorThrown) {
        //dostuff
        }
    };    
    $.ajax.settings;
};



function initMap() {

    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(34.1592, -118.5003);
    var locations;
    var infoWindow = new google.maps.InfoWindow({map: map});
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

      // Try HTML5 geolocation.

    // Note: This example requires that you consent to location sharing when
    // prompted by your browser. If you see the error "The Geolocation service
    // failed.", it means you probably did not give permission for the browser to
    // locate you.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent('Location found.');
          map.setCenter(pos);
          // see if location is pulled from browser
          console.log(pos);
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    };


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
    };
};


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
