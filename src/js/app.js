//Globals
var initialLocation = {
        place: 'San Diego,CA',
        location : {lat: 32.7150, lng: -117.1625}
    };
var map;
var geocoder;
var searchArea      = ko.observable("San Diego City, CA");
var updateSearchArea;
var searchCenter;

var allBrewpubs     = ko.observableArray([]);   //container of all brewpub objects
var query           = ko.observable("");    //search query string
var selection       = ko.observable("");    //selection triggers lots of things

var selectionName   = ko.computed(function(){
    var tempName = selection().split(':');
    return tempName[0];
});

var selectionIndex  = ko.computed(function (){
    for (var i =0; i < allBrewpubs().length ;i++){
        if (selection()=== allBrewpubs()[i].name){
            return i;
        }
    }
});

var selectedPub = ko.computed(function(){
    return allBrewpubs()[selectionIndex()];
});

var infoWindowText = ko.observable("");

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
        var nonce_generate = Math.floor(Math.random() * 1e12).toString();

        var parameters = {
            oauth_consumer_key: auth.YELP_KEY,
            oauth_token: auth.YELP_TOKEN,
            oauth_nonce: nonce_generate,
            oauth_timestamp: Math.floor(Date.now()/1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version : '1.0',
            callback: 'cb',                 // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
            term: selectionName(),              // This observable pushes an evaluation of just the place name
            location: searchArea(),
            category_filter: 'breweries,pubs',
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

                    if ((searchResults.pubName()!== null) && (selectedPub())) {
                        //console.log("yelpSearch-6: windowText",temp);
                        //console.log("yelpSearch-6:",selectedPub());
                        selectedPub().selected();
                    }

                    //clear selection
                    selection("");

            },
            error:function(jqXHR, textStatus, errorThrown) {
                //dostuff
                alert("Geocode was not successful for the following reason: " + textStatus);
            }
        };

        //console.log(yelp_url, settings.data);
        // tests if anything is selected before ajax call
        if ((selection() !== null) && (selection() !== "")) {
            //console.log("yelpSearch-2:", selection());
            //console.log("yelpSearch-3 term: ",  parameters.term);
            $.ajax(settings);
        }
    });

} //End of YelpSearch

// create and format infoWindow Contents
function updateInfoWindowText(name,codelocation){

    //need to match name and searchResults

    var pubName = name.split(":")[0];

    if (searchResults.pubName()){
        var pubSearchName = searchResults.pubName();
        //console.log("debug InfoWindowText:",name, searchResults.pubName());

        var cleanPubName = pubName.toLowerCase().replace(/\./g,"");
        var cleanPubSearchName = pubSearchName.toLowerCase().replace(/\./g,"");

        infoWindowText('<div id="container-pub">'+
        '<h2 class= "info-location-name">'+
        pubName+
        '</h2>'+
        '<p>'+ "loading info ..." +
        '</p>' +
        '</div>');

        if (cleanPubSearchName===""){
            infoWindowText('<div id="container-pub">'+
            '<h2 class= "info-location-name">'+
            pubName+
            '</h2>'+
            '<p>'+ "looks like there's no yelp information ..." +
            '</p>' +
            '</div>');
        } else if ( cleanPubSearchName && ((cleanPubSearchName.includes(cleanPubName)) || (cleanPubName.includes(cleanPubSearchName)))){
            //console.log("true",cleanPubSearchName,cleanPubName);

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
        } else {
            infoWindowText('<div id="container-pub">'+
            '<h2 class= "info-location-name">'+
            pubName+
            '</h2>'+
            '<p>'+ "looks like no info on yelp or the business is named differently ..." +
            '</p>' +
            '</div>');
        }
    }

} //End of updateInfoWindowText

//single brewpub location
function brewpub(name,address,lat,lon){

    var self = this;
    self.name = name;
    self.address = address;
    self.lat = lat;
    self.lng = lon;

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
        });
    });

    //changes marker color and adds animation in mapViewModel
    self.toggleBounce = function() {
        //console.log("in bounce!");
        if (self.marker().getAnimation() !== null) {
            self.marker().setIcon(self.image);
            self.marker().setAnimation(null);
        } else {
            self.marker().setIcon(self.imageSelected);
            self.marker().setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function (){
                self.marker().setAnimation(null);
                self.marker().setIcon(self.image);
            },2000);

        }
    };

    //changes look of selected item in listViewModel
    self.toggleSelected= function(pubName) {
        $('ul').find('.pure-menu-item').removeClass("pure-menu-selected");
        $('ul').find('.pure-menu-item').filter(':contains('+pubName+')').addClass("pure-menu-selected");
    };

    //displays an infoWindow in mapViewModel()
    self.selected = function(){
        self.toggleBounce();
        // with async need to check for valid returns from yelp
        if (self.name){
            self.toggleSelected(self.name);
            selection("");
            selection(self.name); //just a string containing name

            //console.log("debug: selected:",self.name);
            updateInfoWindowText(self.name,"selected");
        }
        self.infoWindow.setContent(infoWindowText());
        self.infoWindow.open(map, self.marker());
    };

    // close infoWindow in mapViewModel
    self.notselected = function(){
        //self.infoWindow.setContent("");
        $('.pure-menu-item').removeClass("pure-menu-selected");
        //want remove color?
        self.infoWindow.close();
    };

} //End of brewpub

// ListViewModel
function ListViewModel(){
    //console.log("in ListViewModel");

    var self = this;

    self.layout = $('#layout').get(0);
    self.menu = $('#menu').get(0);
    self.menuLink = $('#menuLink1').get(0);

    //modified function from pure ui.js to work with knockout
    self.sidebarToggle = function toggleClass(element, className) {
        //console.log("test-sidebarToggle");
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
    };

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
            }
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
                }
            }
            //console.log("debug: search matches", self.tempBrewpub);
            return self.tempBrewpub;
        }
    });

    // triggered by clicking on listing
    self.clickedListing= function(listing) {
        selection("");
        selection(listing.name); //just a string containing name
        //console.log("Clicked Listing-1 global selection:", selection());
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
            }
        }
    };
} // End of ListViewModel


// GoogleMapViewModel
function GoogleMapViewModel(){

    // self is the viewModels
    // pointer for keeping outer this separate from inner this
    var self = this;
    var city = initialLocation;

    // finds brewpubs within 10km of the search center
    // brewery is the closest keyword to brewpub
    // specifying types as bar limits the results further but with odd omissions
    var searchNearby =function(){
        var request = {
            location: searchCenter,
            radius: '10000',
            //types: ['bar','restaurant'],
            keyword: 'brewery'
        };
        var service = new google.maps.places.PlacesService(map);
        //console.log("debug: request",request);

        service.nearbySearch(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {

                //console.log("debug: PlaceServiceStatus results", results);

                //clean out allBrewpubs
                allBrewpubs.removeAll();
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    var address = place.vicinity.split(",");
                    var uniqueName = place.name + ":" +  address[0];
                    var neighborhood = address[1];

                    //console.log("debug", uniqueName, neighborhood, place.name,place.geometry.location.lat(), place.geometry.location.lng())

                    // create initial markers
                    allBrewpubs.push(new brewpub(uniqueName,place.vicinity,place.geometry.location.lat(),place.geometry.location.lng()));

                    //console.log("debug: add pub", allBrewpubs()[i].name, allBrewpubs()[i].lat,allBrewpubs()[i].lng);

                }
                infoWindowText("");

                drawMap();

            } else {
                alert("Search was not successful for the following reason: ", status);
            }
        });
    }; // End of searchNearby

    // updates center of searchArea and map
    updateSearchArea = function(){
        var address = searchArea();
        //var address = searchArea;
        geocoder = new google.maps.Geocoder();

        //console.log("debug: in CodeAddress:", address);
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {

              searchCenter= new google.maps.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
              //console.log("debug: updating-searchCenter:", searchCenter.lat(),searchCenter.lng());

            map.setCenter(searchCenter);
            map.setZoom(12);

            searchNearby();
          } else {
            alert("Geocode was not successful for the following reason: ", status);
          }

        });
    }; //End of updateSearchArea


    // updates map & binds markers
    function drawMap(){

        function brewDetail(title){
            //for (var i = 0; i < initialBrewpubs.length; i++){
            for (var i = 0; i < allBrewpubs().length; i++){
                    //clear out infowindows
                    allBrewpubs()[i].notselected();
                    //console.log("debug:brewDetail:", title, allBrewpubs()[i].name)
                    if (title === allBrewpubs()[i].name) {
                        allBrewpubs()[i].selected();
                    }
            }
        }

        function cleanup(){
            //for (var i = 0; i < initialBrewpubs.length; i++){
            for (var i = 0; i < allBrewpubs().length; i++){
                    //clear out infowindows
                    allBrewpubs()[i].notselected();
            }
        }

        for (var i = 0; i < allBrewpubs().length; i++){
                allBrewpubs()[i].marker().setMap(null);
        }

        for (var i = 0; i < allBrewpubs().length; i++){
                allBrewpubs()[i].marker().setMap(map);
                //console.log("debug:in drawMap", allBrewpubs()[i].name);

                google.maps.event.addListener(allBrewpubs()[i].marker(), 'click', function(){

                    brewDetail(this.title);
                    selection(this.title);
                    //console.log("debug: marker title",this);
                });
                google.maps.event.addListener(allBrewpubs()[i].infoWindow,'closeclick',function(){
                    //asking to close already closed window
                    cleanup();
                });
        }
    } // end drawMap

    map = new google.maps.Map(document.getElementById('map-canvas'));
    searchCenter= new google.maps.LatLng(0,0);

    updateSearchArea();
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

} // End of GoogleMapViewModel


// master ViewModel to manage binding from multiple sub view models
function masterVM() {
    this.mapViewModel = new GoogleMapViewModel();
    this.listViewModel = new ListViewModel();
    this.yelpSearch = new YelpSearch();
}

// call back for successful async loading of google maps
function googleSuccess() {

    // Seems weird to apply apply view model bindings last but this puts it safely after google loads async
    if (typeof google==='object' && typeof google.maps ==='object'){

        ko.applyBindings(new masterVM());

    } else {
                // google maps didn't load
                alert("google maps didn't load");
    }

    // Sets the boundaries of the map based on pin locations
    // window.mapBounds = new google.maps.LatLngBounds();

}

// callback for failed google maps loading
function googleError() {
    alert("google maps didn't load");
    //console.log("google maps didn't load");
}
