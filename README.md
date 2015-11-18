# Frontend Nanodegree Neighborhood Map Project

After looking at several existing applications that provide neighborhood information I found that an
accessible metric for assessing a neighborhood is the proximity and quality of local brewpubs, establishments that sell beer brewed on the premises and might also a restaurant.

The project current mashes up Google Places results with Yelp reviews. A stumbling block to fully realize this is that the same establishment is often named and categorized differently by each service.  A human can figure it out, its not trivial to program matches.


## Steps to Run the Application
Download the repository from github
In the js folder create a keys.js file. Replace the NEED_TOKEN strings with the appropriate API tokens from Google and Yelp  

var auth= {
    GOOGLE_MAP_KEY : 'NEED_TOKEN',
    YELP_KEY : 'NEED_TOKEN',
    YELP_KEY_SECRET : 'NEED_TOKEN',
    YELP_TOKEN : 'NEED_TOKEN',
    YELP_TOKEN_SECRET : 'NEED_TOKEN'
};

Load index.html from a web-browser.


## References & Resources

Style Guide
https://udacity.github.io/frontend-nanodegree-styleguide/index.html
https://github.com/udacity/fend-office-hours/tree/master/Javascript%20Design%20Patterns/P5%20Project%20Overview

BEM for CSS
http://getbem.com/faq/

Knockout and Googel Maps
https://github.com/manuel-guilbault/knockout.google.maps

http://stackoverflow.com/questions/12722925/google-maps-and-knockoutjs
http://www.codeproject.com/Articles/387626/BikeInCity-2-KnockoutJS-JQuery-Google-Maps

http://jsfiddle.net/Wt3B8/23/
http://jsfiddle.net/t9wcC/

http://stackoverflow.com/questions/14031421/how-to-make-code-wait-while-calling-asynchronous-calls-like-ajax
http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-asynchronous-call

http://makina-corpus.com/blog/metier/2013/dealing-with-cross-domain-issues

### Useful Conversations
https://discussions.udacity.com/t/how-i-completed-my-p5/13652
https://discussions.udacity.com/t/best-way-to-write-sub-functions/36347
https://discussions.udacity.com/t/stuck-on-filtering-yelp-data/26430
https://discussions.udacity.com/t/google-map-api-async-issues/33749/16
https://discussions.udacity.com/t/major-issue-with-knockout-and-filtering/33622
https://discussions.udacity.com/t/solved-cors-problem-alternative-to-jsonp/35658/6
https://discussions.udacity.com/t/filtering-google-maps-markers-with-list-view/34660
https://discussions.udacity.com/t/trouble-in-data-bind-when-the-map-is-added/30557/2
https://discussions.udacity.com/t/how-do-you-keep-your-google-api-key-secret/9691/4
https://discussions.udacity.com/t/api-keys-stored-in-repositories/3677
https://discussions.udacity.com/t/yelp-api-ajax-request/15747/9
https://help.github.com/articles/remove-sensitive-data/
https://discussions.udacity.com/t/markers-cant-bounce-and-show-information-box-after-1-click/34482

### Cross Domain Issues & YQL Hack
http://makina-corpus.com/blog/metier/2013/dealing-with-cross-domain-issues

### Well Organized but not async
https://github.com/peterchon/nanodegree-neighborhood-map-project/blob/gh-pages/js/app-engine.js
https://github.com/geng0610/FEND-P5-NeighborhoodMap

### Beer
http://beermapping.com/maps/citymaps.php?m=sandiego#lat=undefined&lng=undefined&z=7

### Useful Real Estate Sites
http://www.propertyshark.com/mason/  (owned by yardi)
neighborhoodscout.com
movoto.com
city-data.com
areavibes.com
streetadvisor.com

### Hazard Mitigation
http://myplan.calema.ca.gov

### Residential Real Estate
http://www.programmableweb.com/news/40-real-estate-apis-zillow-trulia-walk-score/2012/02/15
http://developer.trulia.com
https://www.walkscore.com/professional/api.php

### Business Real Estate
zoomprospector.com
loopnet
showcase
pinpoint .acquire by foursqare

### Demographics
http://www.census.gov/developers/
esri.com

Nielsen: (acquired claritas, prizm)
https://segmentationsolutions.nielsen.com/mybestsegments/

### Crime
crimereports.com
