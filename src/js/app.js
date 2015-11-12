//Globals
var map;                                    //google map

var geocoder;                                   //store new location
var searchArea = ko.observable("San Diego City, CA");             //only if we query user location
//var userLocation = ko.observable("");       //need to query that one

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
var selectedPub = ko.computed(function(){
    return allBrewpubs()[selectionIndex()];
});
var infoWindowText = ko.observable("");     //TBD
                                            //current search result
var searchResults = {
        detailsResults : ko.observable(),
        pubName : ko.observable(),
        dph  : ko.observable(),
        ph  : ko.observable(),
        address : ko.observable(),
        city : ko.observable(),
        state : ko.observable(),
        zip : ko.observable(),
        url : ko.observable(),
        stars : ko.observable(),
        snippet : ko.observable()
};

// YelpSearch treated as its own ViewModel
function YelpSearch(){
    //console.log("in YelpQuery");
    var self=this;
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
        //console.log("yelpSearch-1 getDetails: ", parameters);

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
                    //console.log("yelpSearch-4: output:", searchResults.detailsResults());

                    searchResults.pubName(results.businesses[0].name);
                    searchResults.dph(results.businesses[0].display_phone);
                    searchResults.ph(results.businesses[0].phone);
                    searchResults.address(results.businesses[0].location.display_address);
                    searchResults.url(results.businesses[0].url);
                    searchResults.stars(results.businesses[0].rating_img_url_small);
                    searchResults.snippet(results.businesses[0].snippet_text);
                    //console.log("yelpSearch-5: pubname",searchResults.pubName());

                    //only update after query returns defined results
                    if (searchResults.pubName()!= null) {
                        //temp = infoWindowText();
                        //console.log("yelpSearch-6: windowText",temp);
                        selectedPub().selected();
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
            //console.log("yelpSearch-2:", selection());
            //console.log("yelpSearch-3 term: ",  parameters.term);
            $.ajax(settings);
        };
    });

}; //End of YelpSearch

// create and format infoWindow Contents
function updateInfoWindowText(name,codelocation){
    if (name!=searchResults.pubName()){
        infoWindowText('<div id="container-pub">'+
        '<h2 class= "info-location-name">'+
        name+
        '</h2>'+
        '<p>'+ "loading info ..." +
        '</p>' +
        '</div>');
    } else {
        infoWindowText('<div id="container-pub">'+
        '<h2 class= "info-location-name">'+
        searchResults.pubName()+ '&nbsp &nbsp <a href="tel:'+searchResults.ph()+'">' +
        searchResults.dph()+
        '</a></h2>'+
        '<p>'+
        searchResults.address()+
        '<br>' +
        '</p>'+
        '<img src="' + searchResults.stars() + '" height="17" width ="84">' +
        '<p>'+
        searchResults.snippet()+
        '<a href="' + searchResults.url() + '"> Read more</a>' +
        '</p>' +
        '</div>');

    }

};

//single brewpub location
function brewpub(currentBrewpub){;

    var self = this;
    self.name = currentBrewpub.name;
    self.lat = currentBrewpub.location.coordinate.latitude;
    self.lng = currentBrewpub.location.coordinate.longitude;
    self.image = {url:"img/beerpub-icon.png"};
    self.imageSelected = {url:"img/beerpub-icon-selected.png"};

    self.contentString = infoWindowText(); //default

    // creates infoWindow
    self.infoWindow = new google.maps.InfoWindow({content: self.name});

    // creates marker
    self.marker = ko.computed(function(){
        return new google.maps.Marker({
            icon: self.image,
            position: new google.maps.LatLng(self.lat, self.lng),
            title: self.name
        })
    });

    //changes marker color and adds animation in mapViewModel
    self.toggleBounce = function() {
        console.log("in bounce!");
        if (self.marker().getAnimation() !== null) {
            self.marker().setIcon(self.image);
            self.marker().setAnimation(null);
        } else {
            self.marker().setIcon(self.imageSelected);
            self.marker().setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function (){
                self.marker().setAnimation(null);
                self.marker().setIcon(self.image)
            },2000);

        };
    };

    //changes look of selected item in listViewModel
    self.toggleSelected= function(pubName) {
        $('ul').find('.pure-menu-item').removeClass("pure-menu-selected");
        $('ul').find('.pure-menu-item').filter(':contains('+pubName+')').addClass("pure-menu-selected");
    };

    //displays an infoWindow in mapViewModel
    self.selected = function(){
        self.toggleBounce();
        self.toggleSelected(self.name);
        updateInfoWindowText(self.name,"selected");
        self.infoWindow.setContent(infoWindowText());
        self.infoWindow.open(map, self.marker());
    };

    // close infoWindow in mapViewModel
    self.notselected = function(){
        //self.infoWindow.setContent("");
        $('.pure-menu-item').removeClass("pure-menu-selected");

        self.infoWindow.close();
    };

}; //End of brewpub

// ListViewModel
function ListViewModel(){
    console.log("in ListViewModel");

    var self = this;

    self.testb = function(){console.log("testbutton")};

    self.layout = $('#layout').get(0);
    self.menu = $('#menu').get(0);
    self.menuLink = $('#menuLink1').get(0);

    //modified function from pure ui.js to work with knockout
    self.sidebarToggle = function toggleClass(element, className) {
        console.log("test-sidebarToggle");
        var classes = element.className.split(/\s+/),
            length = classes.length,
            i = 0;

        for(; i < length; i++) {
          if (classes[i] === className) {
            classes.splice(i, 1);
            break;
          }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }
    //modified function from pure ui.js to work with knockout
    self.toggle = function toggleCall(e) {
        var active = 'active';
        //console.log("test-toggleCall");
        //e.preventDefault();
        self.sidebarToggle(self.layout, active);
        self.sidebarToggle(self.menu, active);
        self.sidebarToggle(self.menuLink, active);
    };

    //handles input from search filter
    self.search =  ko.computed(function(){

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

    // triggered by clicking on listing
    self.clickedListing= function(listing) {
        selection("");
        selection(listing.name); //just a string containing name
        console.log("Clicked Listing-1 global selection:", selection());
        //clear old markers
        for (var i =0; i < allBrewpubs().length ;i++){
            //clear all markers
            allBrewpubs()[i].notselected();
            //allBrewpubs()[i].toggleSelected(selection());
            //allBrewpubs()[i].marker().setMap(null);
            if (selection() === allBrewpubs()[i].name){
                //allBrewpubs()[i].toggleSelected(selection());
                allBrewpubs()[i].toggleBounce();
                allBrewpubs()[i].marker().setMap(map);
            };
        };
    };
}; // End of ListViewModel


// GoogleMapViewModel
function GoogleMapViewModel(){

    // self is the viewModels
    // pointer for keeping outer this separate from inner this
    var self = this;
    var city = initialLocation;



    //search for city
    /*
    function geocodeAddress(address,callback){
        //var address = document.getElementById("address").value;
        //var address = searchArea();
        geocoder = new google.maps.Geocoder();
        var latlng = new Array(2);
        //var address = "16811 Escalon Dr, Encino, CA 91436";
        console.log("in CodeAddress:", address);

        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            //map.setCenter(results[0].geometry.location);

            //var marker = new google.maps.Marker({
            //    map: map,
            //    position: results[0].geometry.location
            //});
            latlng[0]= results[0].geometry.location.lat();
            lanlng[1]= results[0].geometry.location.lng();

            console.log("ok",latlng[0],latlng[1]);

            callback(latlng);

          } else {
            alert("Geocode was not successful for the following reason: " + status);
          }
        });
    };
    */

    self.latlng = new google.maps.LatLng(city.location.lat, city.location.lng);

    self.mapOptions = {
        center: {lat: city.location.lat, lng: city.location.lng},
        zoom: 12,
    };


    //creating global map
    //map = new google.maps.Map(document.getElementById('map-canvas'),this.mapOptions);

    //map = new google.maps.Map(document.getElementById('map-canvas'));
    //geocoder = new google.maps.Geocoder();

    //geocodeAddress(searchArea(),function(search_latlng));
    //console.log("city", city);

    map = new google.maps.Map(document.getElementById('map-canvas'));
    map.setCenter(self.mapOptions.center);
    map.setZoom(self.mapOptions.zoom);
    //map.fitBounds(bounds)

    // adjust color of the global map to make more monochrome look
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

    // create initial markers
    for (var i = 0; i < initialBrewpubs.length; i++){
                allBrewpubs.push(new brewpub(initialBrewpubs[i]));
                allBrewpubs()[i].marker().setMap(null);
    };

    // updates map
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
                                allBrewpubs()[i].selected();
                            }
                    };
                    //selectedPub().selected();
                };

                function cleanup(){
                    for (var i = 0; i < initialBrewpubs.length; i++){
                            //clear out infowindows
                            allBrewpubs()[i].notselected();
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
                google.maps.event.addListener(allBrewpubs()[i].infoWindow,'closeclick',function(){
                    //asking to close already closed window
                    cleanup();
                    console.log("closing",selection());
                });
        };



    };

    // cleans up map
    /*
    function cleanMap(){
        if(infoWindow){infoWindow.close()};
        infoWindowText("");
    };
    //cleanMap();
    */

    infoWindowText("");

    drawMap();

};


// master ViewModel to manage binding from multiple sub view models
function masterVM() {
    //console.log(searchArea());
    this.mapViewModel = new GoogleMapViewModel()
    this.listViewModel = new ListViewModel();
    this.yelpSearch = new YelpSearch();
};

// call back for successful async loading of google maps
function googleSuccess() {

    // geocoder = new google.maps.Geocoder();
    // Seems weird to apply apply view model bindings last but this puts it safely after google loads async
    if (typeof google==='object' && typeof google.maps ==='object'){

        ko.applyBindings(new masterVM());

    } else {
                // google maps didn't load
                console.log("google maps didn't load");
    };

    // Sets the boundaries of the map based on pin locations
    //window.mapBounds = new google.maps.LatLngBounds();

      // locations is an array of location strings returned from locationFinder()

};

// callback for failed google maps loading
function googleError() {
    console.log("google maps didn't load");
}
