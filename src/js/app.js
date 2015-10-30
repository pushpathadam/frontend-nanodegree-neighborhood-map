//Globals
var map;
//var geocoder; //only if we query user location
var allMarkers=[];
//var userLocation; //need to query that one
var brewpubList;

var chosenOne = ko.observableArray([]); //may keep as a temp
var query = ko.observable("");
var selection = ko.observable("");


var visibleBodies = ko.observableArray([]);
var allBrewpubs = ko.observableArray([]);


function person(name) {
    var self = this;
    self.name = name;
    self.flower = "poinsetta";
    //self.visible = ko.observable(true);
    //self.selected = ko.observable(false);
};

function brewpub(ibrewery){
    var self = this;
    self.name = ibrewery.name;
    self.lat = ibrewery.location.coordinate.latitude;
    self.lng = ibrewery.location.coordinate.longitude;
    self.contentString = '<div class="content">'+ ibrewery.name + '</div>';
    self.infoWindow = new google.maps.InfoWindow({
        content: self.contentString
        });
    self.marker = function(){
        return new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(self.lat, self.lng),
            title: self.name
        })
    };

    //Draw marker
    self.marker();
    //turn marker off
    //self.marker().setVisible(false);
    self.infoWindow.open(map, self.marker());
};


// ListViewModel
function ListViewModel(){
    console.log("in ListViewModel");

    var self = this;

    for (var i = 0; i < initialBrewpubs.length; i++){
            allBrewpubs.push(new brewpub(initialBrewpubs[i]))
    };



    self.search =  ko.computed(function(){
        //self.tempBodies = self.availableBodies.slice(0);
        self.tempBrewpub = allBrewpubs.slice(0);
        if (query().length < 1) {
            //console.log("here1",self.tempBodies);
            //return self.tempBodies;
            return self.tempBrewpub;
        } else {
            self.tempBrewpub = [];
            for (var i =0; i < allBrewpubs().length ;i++){
                var temp = allBrewpubs()[i].name.toLowerCase();
                // Note this test is case sensitive
                if ((query().length > 0) && (temp.search(query().toLowerCase()) > -1)){
                    //console.log(query(),temp);

                    self.tempBrewpub.push(allBrewpubs()[i]);
                 };
            };
            //console.log("here2",self.tempBodies);
            return self.tempBrewpub;
        }
    });

    self.clickedBody= function(i) {
        //console.log("clicked",i.name);
        //chosenOne.pop();
        //chosenOne.push(i.name);

        //why is this one not working?
        selection("");
        selection(i.name);
        //console.log("result", chosenOne()[0],"or",self.selection());
        console.log("result", selection());
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
        console.log("getDetails about: ", parameters);

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

                    console.log("works!", selection());
                    self.detailsResults(results.businesses[0]);
                    //sometimes it's sending 2 calls ..first one returns undefined


                    console.log("output:", self.detailsResults());

                    //need to test for null results

                    self.pubName(results.businesses[0].name);
                    self.img(results.businesses[0].image_url);
                    self.ph(results.businesses[0].display_phone);
                    self.url(results.businesses[0].url);
                    self.stars(results.businesses[0].rating_img_url_small);
                    self.rating(results.businesses[0].rating);
                    self.snippet(results.businesses[0].snippet_text);
                    console.log("pubname",self.pubName());


            },
            error:function(jqXHR, textStatus, errorThrown) {
                //dostuff
                // need message sorry couldnt find any info on this business on yelp
                console.log("error");
            }
        };

        //console.log(yelp_url, settings.data);
        // tests if anything is selected before ajax call
        if ((selection() != null) && (selection() != "")) {
            console.log("no null", selection());
            console.log("term: ",  parameters.term);

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

function initInfoWindow(marker){

    //var infoWindowContainer {
    //    contentString = '<div class="content">'+
    //        ibrewery.name +
    //        '</div>';
    //}
    //infoWindow.setContent(infoWindowContainer);

    //infoWindow.open(marker.getMap(), marker);
};

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
    map = new google.maps.Map(document.getElementById('map-canvas'),this.mapOptions);


    // observables
    // want to update search area
    /*
    self.searchArea= ko.observable(city.place);
    self.processedLocation = ko.computed(function(){
        return self.searchArea()+" here";
    },self);
    */

    // build editable list of brewpubs
    // brewery markers
    self.brewpubList = ko.observableArray([]);
    for (var i = 0; i < initialBrewpubs.length; i++){
        self.brewpubList.push(new brewpub(initialBrewpubs[i]))
    }

    //operations on brewpub list

    //current or selected brewpub
    // need to be connected to maps
    // need to be pushed out to details window
    self.currentBrewpub = ko.observable(self.brewpubList()[0]);


    self.setBrewpub =function(clickedBrewpub){
        self.currentBrewpub(clickedBrewpub);
    };

    // list of brewpubs that match search query
    self.xBrewpub = function(clickedBrewpub){
        console.log("xBrewpup");
    };

    // hide brewpubs
    // show brewpubs
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
    this.detailsViewModel = new DetailsViewModel();
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
