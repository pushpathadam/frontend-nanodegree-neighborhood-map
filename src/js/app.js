//Globals
var map;                                    //google map
//var geocoder;                             //only if we query user location
//var userLocation;                         //need to query that one
var allBrewpubs = ko.observableArray([]);   //container of all brewpub objects
var query           = ko.observable("");    //search query string
var selection       = ko.observable("");    //selection triggers lots of things
var selectionIndex  = ko.computed(function (){
    for (var i =0; i < allBrewpubs().length ;i++){
        if (selection()=== allBrewpubs()[i].name){
            return i;
        };
    };
});
var infoWindowText = ko.observable("");     //TBD
                                            //current search result
var searchResults = {
        detailsResults : ko.observable(),
        pubName : ko.observable(),
        img : ko.observable(),
        ph  : ko.observable(),
        url : ko.observable(),
        stars : ko.observable(),
        rating : ko.observable(),
        snippet : ko.observable()
};

function YelpSearch(){
    console.log("in YelpQuery");
    var self=this;

    //self.detailsResults = ko.observable();
    //self.pubName = ko.observable();
    //self.img = ko.observable();
    //self.ph  = ko.observable();
    //self.url = ko.observable();
    //self.stars = ko.observable();
    //self.rating = ko.observable();
    //self.snippet = ko.observable();

    self.getDetails = ko.computed(function(){

        var yelp_url = 'http://api.yelp.com/v2/search';
        //var yelpRequestTimeout = setTimeout(function(){
        //    $yelp-elem.text("failed to get yelp resources");
        //}, 8000);
        var nonce_generate = Math.floor(Math.random() * 1e12).toString();

        var parameters = {
            oauth_consumer_key: auth.YELP_KEY,
            oauth_token: auth.YELP_TOKEN,
            oauth_nonce: nonce_generate,
            oauth_timestamp: Math.floor(Date.now()/1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version : '1.0',
            callback: 'cb',                 // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
            term: selection(),              // This observable pushes an evaluation!
            location: "San Diego, CA",
            limit: '1'
        };
        console.log("yelpSearch-1 getDetails: ", parameters);

        var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, auth.YELP_KEY_SECRET, auth.YELP_TOKEN_SECRET);

        parameters.oauth_signature = encodedSignature;

        var settings = {
            url: yelp_url,
            data: parameters,
            cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
            dataType: 'jsonp',
            success: function(results) {
                //dostuff

                    searchResults.detailsResults(results.businesses[0]);
                    //sometimes it's sending 2 calls ..first one returns undefined


                    console.log("yelpSearch-4: output:", searchResults.detailsResults());

                    //need to test for null results

                    searchResults.pubName(results.businesses[0].name);
                    searchResults.img(results.businesses[0].image_url);
                    searchResults.ph(results.businesses[0].display_phone);
                    searchResults.url(results.businesses[0].url);
                    searchResults.stars(results.businesses[0].rating_img_url_small);
                    searchResults.rating(results.businesses[0].rating);
                    searchResults.snippet(results.businesses[0].snippet_text);
                    console.log("yelpSearch-5: pubname",searchResults.pubName());

                    //only update after query returns defined results
                    if (searchResults.pubName()!= null) {
                        //updateInfoWindowText("yelpSearch");
                        temp = infoWindowText();
                        console.log("yelpSearch-6: windowText",temp);
                        allBrewpubs()[selectionIndex()].selected();
                    };

            },
            error:function(jqXHR, textStatus, errorThrown) {
                //dostuff
                // need message sorry couldnt find any info on this business on yelp
                console.log("yelpSearch-error");
            }
        };

        //console.log(yelp_url, settings.data);
        // tests if anything is selected before ajax call
        if ((selection() != null) && (selection() != "")) {
            console.log("yelpSearch-2:", selection());
            console.log("yelpSearch-3 term: ",  parameters.term);
            $.ajax(settings);
        };
    });

};


function updateInfoWindowText(codelocation){

    infoWindowText('<div id="container-'+
    searchResults.pubName() +
    '">'+
    '<h2 class= "info-location-name">'+
    searchResults.pubName()+
    '</h2>'+
    '<p>'+
    searchResults.ph()+
    '</p>'+
    '</div>');

    console.log("updateingInfoWindowText from", codelocation," :", infoWindowText());
    //return contentString;
};

function brewpub(ibrewery){;

    var self = this;
    self.name = ibrewery.name;
    self.lat = ibrewery.location.coordinate.latitude;
    self.lng = ibrewery.location.coordinate.longitude;
    self.contentString = infoWindowText();
    //'<div class="content">'+ ibrewery.name + '</div>' ;
    //just need one info window function
    self.infoWindow = new google.maps.InfoWindow({
        //no connection to external or yelp data
        content: self.contentString
        //content: updateInfoWindowText()

        });
    self.marker = ko.computed(function(){
        /*var image = {
            url: "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png",
            size: null,
            origin: null,
            anchor: null,
            scaledSize: null,
        };
        */
        return new google.maps.Marker({
            //icon: image;
            //map: map,
            position: new google.maps.LatLng(self.lat, self.lng),
            title: self.name
        })
    });
    //marker animation function needed
    //this should push out infoWindow
    self.selected = function(){
        //infoWindowText("");
        self.infoWindow.setContent("");
        updateInfoWindowText("selected");
        self.infoWindow.setContent(infoWindowText());
        self.infoWindow.open(map, self.marker());
    };
    // close infoWindow
    self.notselected = function(){
        self.infoWindow.setContent("");
        self.infoWindow.close();
    };
};

// ListViewModel
function ListViewModel(){
    console.log("in ListViewModel");

    var self = this;

    self.search =  ko.computed(function(){
        //self.tempBodies = self.availableBodies.slice(0);

        self.tempBrewpub = allBrewpubs.slice(0);

        if (query().length < 1) {
            for (var i =0; i < allBrewpubs().length ;i++){
                allBrewpubs()[i].notselected();
                allBrewpubs()[i].marker().setMap(map);
            };
            return self.tempBrewpub;
        } else {
            self.tempBrewpub = [];
            for (var i =0; i < allBrewpubs().length ;i++){
                // clear out infowindows and markers
                allBrewpubs()[i].notselected();
                allBrewpubs()[i].marker().setMap(null);
                var temp = allBrewpubs()[i].name.toLowerCase();
                // turns on all markers that match the query
                if ((query().length > 0) && (temp.search(query().toLowerCase()) > -1)){
                    allBrewpubs()[i].marker().setMap(map);
                    self.tempBrewpub.push(allBrewpubs()[i]);
                };
            };
            console.log("search matches", self.tempBrewpub);
            return self.tempBrewpub;
        }
    });

    // triggerd by clicking on listing
    self.clickedListing= function(listing) {
        selection("");
        selection(listing.name); //just a string containing name
        console.log("Clicked Listing-1 global selection:", selection());
        //clear old markers
        for (var i =0; i < allBrewpubs().length ;i++){
            //clear all markers
            allBrewpubs()[i].notselected();
            allBrewpubs()[i].marker().setMap(null);

            if (selection() === allBrewpubs()[i].name){
                allBrewpubs()[i].marker().setMap(map);
                //show infoWindow
                //allBrewpubs()[i].selected();
            };
        }
    };

};

// DetailsViewModel
function DetailsViewModel(){
    console.log("in DetailsViewModel");
    var self=this;
    self.detailsResults = ko.observable();
    self.pubName = ko.observable();
    self.img = ko.observable();
    self.ph  = ko.observable();
    self.url = ko.observable();
    self.stars = ko.observable();
    self.rating = ko.observable();
    self.snippet = ko.observable();

    // default with details hidden
    $(".search-container").hide();

    self.getDetails = ko.computed(function(){

        var yelp_url = 'http://api.yelp.com/v2/search';
        //var yelpRequestTimeout = setTimeout(function(){
        //    $yelp-elem.text("failed to get yelp resources");
        //}, 8000);
        var nonce_generate = Math.floor(Math.random() * 1e12).toString();

        var parameters = {
            oauth_consumer_key: auth.YELP_KEY,
            oauth_token: auth.YELP_TOKEN,
            oauth_nonce: nonce_generate,
            oauth_timestamp: Math.floor(Date.now()/1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version : '1.0',
            callback: 'cb',              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
            term: selection(),       // This might push an evaluation?
            location: "San Diego, CA",
            limit: '1'
        };
        console.log("DVM-getDetails about: ", parameters);

        var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, auth.YELP_KEY_SECRET, auth.YELP_TOKEN_SECRET);

        parameters.oauth_signature = encodedSignature;
        //Debug
        //console.log("obtaining encodedSignature:"+encodedSignature);

        var settings = {
            url: yelp_url,
            data: parameters,
            cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
            dataType: 'jsonp',
            success: function(results) {
                //dostuff

                    console.log("DVM-works!", selection());
                    self.detailsResults(results.businesses[0]);
                    //sometimes it's sending 2 calls ..first one returns undefined


                    console.log("DVM-output:", self.detailsResults());

                    //need to test for null results

                    self.pubName(results.businesses[0].name);
                    self.img(results.businesses[0].image_url);
                    self.ph(results.businesses[0].display_phone);
                    self.url(results.businesses[0].url);
                    self.stars(results.businesses[0].rating_img_url_small);
                    self.rating(results.businesses[0].rating);
                    self.snippet(results.businesses[0].snippet_text);
                    console.log("DVM-pubname",self.pubName());


            },
            error:function(jqXHR, textStatus, errorThrown) {
                //dostuff
                // need message sorry couldnt find any info on this business on yelp
                console.log("DVM-error");
            }
        };

        //console.log(yelp_url, settings.data);
        // tests if anything is selected before ajax call
        if ((selection() != null) && (selection() != "")) {
            console.log("DVM-no null", selection());
            console.log("DVM-term: ",  parameters.term);

            $.ajax(settings);
            // show details
            $(".search-container").show();

        };
    });

};




/*
function obtainBreweryDbList(){
    var BREWDB_API_KEY = '74af3055e27da905ea8c2332cb03290d';
    var BREWDB_BASE_URL = 'http://api.brewerydb.com/v2/?key='
    var brewdbSearch = '/search?q='
    var brewdbQueryType = '&type=brewery';

    var brewdbLocation = 'San Diego';

};
*/

/*
function codeAddress(temp){
    //var address = document.getElementById("address").value;
    var address = temp;
    console.log("in CodeAddress:", address);
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
*/

function testb(){console.log("testbutton")};

// GoogleMapViewModel
function GoogleMapViewModel(city){

    // self is the viewModels
    // pointer for keeping outer this separate from inner this


    var self = this;

    self.latlng = new google.maps.LatLng(city.location.lat, city.location.lng);
    self.mapOptions = {
        center: {lat: city.location.lat, lng: city.location.lng},
        zoom: 12,
    };

    //creating global map
    //map = new google.maps.Map(document.getElementById('map-canvas'),this.mapOptions);
    map = new google.maps.Map(document.getElementById('map-canvas'));
    map.setCenter(self.mapOptions.center);
    map.setZoom(self.mapOptions.zoom);
    //map.fitBounds(bounds)



    // intitial markers
    for (var i = 0; i < initialBrewpubs.length; i++){
                allBrewpubs.push(new brewpub(initialBrewpubs[i]));
                allBrewpubs()[i].marker().setMap(null);
    };


    function drawMap(){
        for (var i = 0; i < initialBrewpubs.length; i++){
                allBrewpubs()[i].marker().setMap(null);
        };

        // filtered venues?
        for (var i = 0; i < initialBrewpubs.length; i++){
                allBrewpubs()[i].marker().setMap(map);
                console.log("in drawMap", allBrewpubs()[i].name);

                function brewDetail(title){
                    for (var i = 0; i < initialBrewpubs.length; i++){
                            //clear out infowindows
                            allBrewpubs()[i].notselected();
                            if (title === allBrewpubs()[i].name) {
                                //calls infoWindow

                                allBrewpubs()[i].selected();
                            }
                    };
                };
                google.maps.event.addListener(allBrewpubs()[i].marker(), 'click', function(){
                    //focusOnLocationWithDetail(this);
                    //want to showInfoWindow

                    brewDetail(this.title);
                    //trigger details view
                    selection(this.title);
                    console.log("marker title",this);
                });
        };
    };

    function cleanMap(){
        if(infoWindow){infoWindow.close()};
        infoWindowText("");
    };
    //cleanMap();
    infoWindowText("");
    drawMap();
};


var mapAppearance = function(){
    // To move Adjusted color of the global map to a more monochrome look
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
};

function masterVM() {
    this.mapViewModel = new GoogleMapViewModel(initialLocation)
    this.listViewModel = new ListViewModel();
    //this.detailsViewModel = new DetailsViewModel();
    this.yelpSearch = new YelpSearch();
};

function googleSuccess() {

    // geocoder = new google.maps.Geocoder();
    // Seems weird to apply apply view model bindings last but this puts it safely after google loads async
    if (typeof google==='object' && typeof google.maps ==='object'){

        //ko.applyBindings(new ViewModel(initialLocation));
        ko.applyBindings(new masterVM());
        mapAppearance();




    } else {
                // google maps didn't load
                console.log("google maps didn't load");
    };

    // Sets the boundaries of the map based on pin locations
    //window.mapBounds = new google.maps.LatLngBounds();

      // locations is an array of location strings returned from locationFinder()



    // Try HTML5 geolocation.
    // Note: This example requires that you consent to location sharing when
    // prompted by your browser. If you see the error "The Geolocation service
    // failed.", it means you probably did not give permission for the browser to
    // locate you.

    /*
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
    */
};
function googleError() {
    console.log("google maps didn't load");
}
