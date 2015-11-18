function YelpSearch(){var e=this;e.getDetails=ko.computed(function(){var e="http://api.yelp.com/v2/search",o=Math.floor(1e12*Math.random()).toString(),s={oauth_consumer_key:auth.YELP_KEY,oauth_token:auth.YELP_TOKEN,oauth_nonce:o,oauth_timestamp:Math.floor(Date.now()/1e3),oauth_signature_method:"HMAC-SHA1",oauth_version:"1.0",callback:"cb",term:selectionName(),location:searchArea(),category_filter:"breweries,pubs",limit:"1"},a=oauthSignature.generate("GET",e,s,auth.YELP_KEY_SECRET,auth.YELP_TOKEN_SECRET);s.oauth_signature=a;var t={url:e,data:s,cache:!0,dataType:"jsonp",success:function(e){searchResults.detailsResults(e.businesses[0]),searchResults.pubName(e.businesses[0].name),searchResults.dph(e.businesses[0].display_phone),searchResults.ph(e.businesses[0].phone),searchResults.address(e.businesses[0].location.display_address),searchResults.url(e.businesses[0].url),searchResults.stars(e.businesses[0].rating_img_url_small),searchResults.snippet(e.businesses[0].snippet_text),null!=searchResults.pubName()&&selectedPub()&&selectedPub().selected(),selection("")},error:function(e,o,s){alert("Geocode was not successful for the following reason: "+o)}};null!=selection()&&""!=selection()&&$.ajax(t)})}function updateInfoWindowText(e,o){var s=e.split(":")[0],a=searchResults.pubName(),t=s.toLowerCase().replace(/\./g,""),n=a.toLowerCase().replace(/\./g,"");infoWindowText('<div id="container-pub"><h2 class= "info-location-name">'+s+"</h2><p>loading info ...</p></div>"),""===n?infoWindowText('<div id="container-pub"><h2 class= "info-location-name">'+s+"</h2><p>looks like there's no yelp information ...</p></div>"):n&&(n.includes(t)||t.includes(n))?(console.log("true",n,t),infoWindowText('<div id="container-pub"><h2 class= "info-location-name">'+searchResults.pubName()+'&nbsp &nbsp <a href="tel:'+searchResults.ph()+'">'+searchResults.dph()+"</a></h2><p>"+searchResults.address()+'<br></p><img src="'+searchResults.stars()+'" height="17" width ="84"><p>'+searchResults.snippet()+'<a href="'+searchResults.url()+'"> Read more</a></p></div>')):infoWindowText('<div id="container-pub"><h2 class= "info-location-name">'+s+"</h2><p>looks like no info on yelp or the business is named differently ...</p></div>")}function brewpub(e,o,s,a){var t=this;t.name=e,t.address=o,t.lat=s,t.lng=a,t.image={url:"img/beerpub-icon.png"},t.imageSelected={url:"img/beerpub-icon-selected.png"},t.contentString=infoWindowText(),t.infoWindow=new google.maps.InfoWindow({content:t.name}),t.marker=ko.computed(function(){return new google.maps.Marker({icon:t.image,position:new google.maps.LatLng(t.lat,t.lng),title:t.name})}),t.toggleBounce=function(){null!==t.marker().getAnimation()?(t.marker().setIcon(t.image),t.marker().setAnimation(null)):(t.marker().setIcon(t.imageSelected),t.marker().setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){t.marker().setAnimation(null),t.marker().setIcon(t.image)},2e3))},t.toggleSelected=function(e){$("ul").find(".pure-menu-item").removeClass("pure-menu-selected"),$("ul").find(".pure-menu-item").filter(":contains("+e+")").addClass("pure-menu-selected")},t.selected=function(){t.toggleBounce(),t.toggleSelected(t.name),updateInfoWindowText(t.name,"selected"),t.infoWindow.setContent(infoWindowText()),t.infoWindow.open(map,t.marker())},t.notselected=function(){$(".pure-menu-item").removeClass("pure-menu-selected"),t.infoWindow.close()}}function ListViewModel(){var e=this;e.testb=function(){console.log("testbutton")},e.layout=$("#layout").get(0),e.menu=$("#menu").get(0),e.menuLink=$("#menuLink1").get(0),e.sidebarToggle=function(e,o){for(var s=e.className.split(/\s+/),a=s.length,t=0;a>t;t++)if(s[t]===o){s.splice(t,1);break}a===s.length&&s.push(o),e.className=s.join(" ")},e.toggle=function(o){var s="active";e.sidebarToggle(e.layout,s),e.sidebarToggle(e.menu,s),e.sidebarToggle(e.menuLink,s)},e.search=ko.computed(function(){if(e.tempBrewpub=allBrewpubs.slice(0),query().length<1){for(var o=0;o<allBrewpubs().length;o++)allBrewpubs()[o].notselected(),allBrewpubs()[o].marker().setMap(map);return e.tempBrewpub}e.tempBrewpub=[];for(var o=0;o<allBrewpubs().length;o++){allBrewpubs()[o].notselected(),allBrewpubs()[o].marker().setMap(null);var s=allBrewpubs()[o].name.toLowerCase();query().length>0&&s.search(query().toLowerCase())>-1&&(allBrewpubs()[o].marker().setMap(map),e.tempBrewpub.push(allBrewpubs()[o]))}return console.log("search matches",e.tempBrewpub),e.tempBrewpub}),e.clickedListing=function(e){selection(""),selection(e.name);for(var o=0;o<allBrewpubs().length;o++)allBrewpubs()[o].notselected(),selection()===allBrewpubs()[o].name&&(allBrewpubs()[o].toggleBounce(),allBrewpubs()[o].marker().setMap(map))}}function GoogleMapViewModel(){function e(){function e(e){for(var o=0;o<allBrewpubs().length;o++)allBrewpubs()[o].notselected(),console.log("debug:brewDetail:",e,allBrewpubs()[o].name),e===allBrewpubs()[o].name&&allBrewpubs()[o].selected()}function o(){for(var e=0;e<allBrewpubs().length;e++)allBrewpubs()[e].notselected()}for(var s=0;s<allBrewpubs().length;s++)allBrewpubs()[s].marker().setMap(null);for(var s=0;s<allBrewpubs().length;s++)allBrewpubs()[s].marker().setMap(map),google.maps.event.addListener(allBrewpubs()[s].marker(),"click",function(){e(this.title),selection(this.title)}),google.maps.event.addListener(allBrewpubs()[s].infoWindow,"closeclick",function(){o()})}var o=function(){var o={location:searchCenter,radius:"10000",keyword:"brewery"},s=new google.maps.places.PlacesService(map);console.log("request",o),s.nearbySearch(o,function(o,s){if(s==google.maps.places.PlacesServiceStatus.OK){console.log("debug: PlaceServiceStatus results",o),allBrewpubs.removeAll();for(var a=0;a<o.length;a++){var t=o[a],n=t.vicinity.split(","),l=t.name+":"+n[0],r=n[1];console.log("debug",l,r,t.name,t.geometry.location.lat(),t.geometry.location.lng()),allBrewpubs.push(new brewpub(l,t.vicinity,t.geometry.location.lat(),t.geometry.location.lng())),console.log("debug: add pub",allBrewpubs()[a].name,allBrewpubs()[a].lat,allBrewpubs()[a].lng)}infoWindowText(""),e()}else alert("Search was not successful for the following reason: ",s)})};updateSearchArea=function(){var e=searchArea();geocoder=new google.maps.Geocoder,console.log("in CodeAddress:",e),geocoder.geocode({address:e},function(e,s){s==google.maps.GeocoderStatus.OK?(console.log("searchCenter:",searchCenter.lat(),searchCenter.lng()),searchCenter=new google.maps.LatLng(e[0].geometry.location.lat(),e[0].geometry.location.lng()),console.log("updating-searchCenter:",searchCenter.lat(),searchCenter.lng()),map.setCenter(searchCenter),map.setZoom(12),o()):alert("Geocode was not successful for the following reason: ",s)})},map=new google.maps.Map(document.getElementById("map-canvas")),searchCenter=new google.maps.LatLng(0,0),updateSearchArea(),map.set("styles",[{stylers:[{saturation:-100}]},{featureType:"water",stylers:[{saturation:-100},{lightness:-46}]}])}function masterVM(){this.mapViewModel=new GoogleMapViewModel,this.listViewModel=new ListViewModel,this.yelpSearch=new YelpSearch}function googleSuccess(){"object"==typeof google&&"object"==typeof google.maps?ko.applyBindings(new masterVM):console.log("google maps didn't load")}function googleError(){console.log("google maps didn't load")}var initialLocation={place:"San Diego,CA",location:{lat:32.715,lng:-117.1625}},map,geocoder,searchArea=ko.observable("San Diego City, CA"),updateSearchArea,searchCenter,allBrewpubs=ko.observableArray([]),query=ko.observable(""),selection=ko.observable(""),selectionName=ko.computed(function(){var e=selection().split(":");return e[0]}),selectionIndex=ko.computed(function(){for(var e=0;e<allBrewpubs().length;e++)if(selection()===allBrewpubs()[e].name)return e}),selectedPub=ko.computed(function(){return allBrewpubs()[selectionIndex()]}),infoWindowText=ko.observable(""),searchResults={detailsResults:ko.observable(),pubName:ko.observable(),dph:ko.observable(),ph:ko.observable(),address:ko.observable(),city:ko.observable(),state:ko.observable(),zip:ko.observable(),url:ko.observable(),stars:ko.observable(),snippet:ko.observable()};