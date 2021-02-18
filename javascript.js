/* global google, polyong */
// global variables
var map, marker;
var button3Check = false;
var button4Check = false;
var button5Check = false;
var number = 0;
var colour = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "white"]; // array of colours
var lastLat, lastLon; // button 2
var lat, lon; // button 3
var latCoord, lonCoord; // button 4
var routey, displays, alternateRoute; // button 6
var saveMarker = [];
var info = new google.maps.InfoWindow({
    content: '<div id="content" style="width:200px;height:200px;"></div>'
}); // button 4 and 6 infoWindow use

function initialize() {
    var mapOptions = {
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.HYBRID
    };
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, mapOptions);
    /*Implement code that displays a map, and centres it at a geographical location chosen by the user. */
    var lat = prompt("Enter Latitude to launch map");
    var lon = prompt("Enter Longitude to launch map");
    addMarker(lat, lon);
}

google.maps.event.addDomListener(window, 'load', initialize);

function button1() {
    /* ask the user for the new coordinates */
    var lat = document.getElementById("latitude").value; //takes user value from latitude field
    var lon = document.getElementById("longitude").value; //takes user value from longitude field
    /* interactively changes the location on the map */
    var intialMarker = new google.maps.LatLng(lat, lon);
    var rand = Math.floor((Math.random() * 6) + 0); /* generate random number for random colour picking */
    number = number + 1; /* increment label number /*
     /*drops a marker of different colour and number*/
    marker = new google.maps.Marker({
        title: 'Marker' + number, /* number on mousehover */
        map: map,
        label: number.toString(), /* number on mousehover */
        icon: "http://maps.google.com/mapfiles/ms/icons/" + colour[rand] + "-dot.png" /* random colour inserted into link */
    });
    map.panTo(intialMarker); /*redirect view to LatLng*/
    marker.setPosition(intialMarker); /* drop marker on LatLng*/
}

function button2() {
    /* drop marker to random position on map */
    var lat = (Math.random()) * (85 - (-85)) + (-85); /*generate random number within range for latitude*/
    var lon = (Math.random()) * (180 - (-180)) + (-180); /*generate random number within range for longitude*/

    if (marker == null) { /*first marker */
        lastLat = (Math.random()) * (85 - (-85)) + (-85);
        lastLon = (Math.random()) * (180 - (-180)) + (-180);
    } else { /* after first marker */
        lastLat = marker.getPosition().lat();
        lastLon = marker.getPosition().lng();
    }
    /* call method to make sure current marker max 300km away from previous one */
    var range = distanceBetweenTwoPoints(lat, lon, lastLat, lastLon, 'K'); //range between both sets of lat & lon

    if (range <= 300) { /* drop marker if within 300km range */
        addMarker(lat, lon);
    } else { /* otherwise repeat on click of button2()*/
        button2();
    }
}

function button3() {
    if (button3Check) { /*on second click*/
        /*Antipode Calculation Reference: https://math.stackexchange.com/questions/1191689/how-to-calculate-the-antipodes-of-a-gps-coordinate */
        var latitudeAntipode = lat * -1;
        var longitudeAntipode = lon > 0 ? -1 * (180 - Math.abs(lon)) : (180 - Math.abs(lon));
        /* save to be used for clicking back and forth */
        lat = latitudeAntipode;
        lon = longitudeAntipode;
        /* add marker to antipode */
        addMarker(latitudeAntipode, longitudeAntipode);
    } else { /*on first click*/
        /* user entered latitude and longitude */
        lat = document.getElementById("latitude").value;
        lon = document.getElementById("longitude").value;
        /*add a marker chosen by the user*/
        addMarker(lat, lon);
        /* revert button state */
        button3Check = true;
    }
}

function button4() {
    if (!button4Check) { /* on first click */
        /* revert button state */
        button4Check = true;
        /* user entered coordinates */
        latCoord = document.getElementById("latitude").value;
        lonCoord = document.getElementById("longitude").value;
        /* add red marker first as centre of geographical area */
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(latCoord, lonCoord),
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        });
        map.panTo(new google.maps.LatLng(latCoord, lonCoord));
    } else { /* on second click */
     
        /* four green marker coordinates created */
        var squarePoint1 = {lat: parseFloat(latCoord) - 0.5, lng: parseFloat(lonCoord) - 0.5}; 
        var squarePoint2 = {lat: parseFloat(latCoord) - 0.5, lng: parseFloat(lonCoord) + 0.5};
        var squarePoint3 = {lat: parseFloat(latCoord) + 0.5, lng: parseFloat(lonCoord) - 0.5};
        var squarePoint4 = {lat: parseFloat(latCoord) + 0.5, lng: parseFloat(lonCoord) + 0.5};

        /* droper four green markers at coordinates */
        squarePoint1Marker = new google.maps.Marker({
            position: new google.maps.LatLng(squarePoint1),
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        });
        squarePoint2Marker = new google.maps.Marker({
            position: new google.maps.LatLng(squarePoint2),
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        });
        squarePoint3Marker = new google.maps.Marker({
            position: new google.maps.LatLng(squarePoint3),
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        });
        squarePoint4Marker = new google.maps.Marker({
            position: new google.maps.LatLng(squarePoint4),
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"

        });

        /* link four green markers mark area of a square */
        var square = [squarePoint4, squarePoint2,squarePoint1, squarePoint3];
        var createSquare = new google.maps.Polygon({
            paths: square
        });
        createSquare.setMap(map);

        /* add info window to four main green markers. Click X to close + marker ot open.
         * Reference: https://developers.google.com/maps/documentation/javascript/streetview */
        var streetView = new google.maps.StreetViewService();
        squarePoint1Marker.addListener('click', function () {
            info.open(map, squarePoint1Marker);
            streetView.getPanorama({location: squarePoint1, radius: 500}, streetViewInfo);
        });
        squarePoint2Marker.addListener('click', function () {
            info.open(map, squarePoint2Marker);
            streetView.getPanorama({location: squarePoint2, radius: 500}, streetViewInfo);
        });
        squarePoint3Marker.addListener('click', function () {
            info.open(map, squarePoint3Marker);
            streetView.getPanorama({location: squarePoint3, radius: 500}, streetViewInfo);
        });
        squarePoint4Marker.addListener('click', function () {
            info.open(map, squarePoint4Marker);
            streetView.getPanorama({location: squarePoint4, radius: 500}, streetViewInfo);
        });

        /* array holds random marker positons */
        var randomMarkers = new Array();
        /* boundary where random markers can be dropped */
        var boundary = new google.maps.LatLngBounds();
        for (var i = 0; i < createSquare.getPath().getLength(); i++) {
            boundary.extend(createSquare.getPath().getAt(i));
        }
        var one = boundary.getSouthWest();
        var two = boundary.getNorthEast();
        var numberOfMarkers = 0;

        /* add 10 random markers at a time within calculated boundaries of square */
        while (numberOfMarkers < 10) {
            /* create random positions of markers within square */
            var rngLat = Math.random() * (two.lat() - one.lat()) + one.lat();
            var rngLon = Math.random() * (two.lng() - one.lng()) + one.lng();
            /* add random positions */
            var rngMarkers = new google.maps.LatLng(rngLat, rngLon);
            /* if contained within boudnaries drop markers */
            if (google.maps.geometry.poly.containsLocation(rngMarkers, createSquare)) {
                randomMarkers.push(rngMarkers);
                numberOfMarkers++;
                marker = new google.maps.Marker({
                    position: rngMarkers,
                    map: map,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                });
            }
        }
    }
}

function button5() {
    /* set polygon default values with perimeter and area colours different */
    var polygon = new google.maps.Polygon({
        path: new google.maps.MVCArray(),
        map: map,
        clickable: false,
        fillColor: "orange"
    });

    if (!button5Check) { /* on first click */
        /* revert button state */
        button5Check = true;
        /*enable user to add contour points interactively delimiting a geographical area */
        polygon.setMap(map);
        listener = google.maps.event.addListener(map, 'click', function (event) {
            var path = polygon.getPath();
            path.push(event.latLng);
            new google.maps.Marker({
                position: event.latLng,
                map: map
            });
        });

        polygon.setOptions({clickable: true});
        /* change colour of area when mouseover polygon */
        mouseover = google.maps.event.addListener(polygon, "mouseover", function (event) {
            polygon.setOptions({fillColor: 'purple'});
            polygon.setMap(map);
            /* add yellow marker on region entrance point by mouse */
            marker = new google.maps.Marker({
                position: event.latLng, 
                map: map,
                icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            });
        });
        /* change colour of area when mouseout polygon */
        mouseout = google.maps.event.addListener(polygon, "mouseout", function (event) {
            polygon.setOptions({fillColor: 'orange'});
            polygon.setMap(map);
        });

    } else { /* on second click  disable all processes*/
        google.maps.event.removeListener(mouseover);
        google.maps.event.removeListener(mouseout);
        polyong.setOptions({clickable: false});
        button5Check = false;
        google.maps.event.removeListener(listener);
    }
}

function button6() {
    /* prompt user to enter source latitude + longitude */
    var startLat = prompt("Enter source latitude");
    var startLon = prompt("Enter source longitude");
    /* prompt user to enter destination latitude + longitude */
    var destinationLat = prompt("Enter destination latitude");
    var destinationLongitude = prompt("Enter destination longitude");

    var start = {lat: parseFloat(startLat), lng: parseFloat(startLon)};
    var destination = {lat: parseFloat(destinationLat), lng: parseFloat(destinationLongitude)};
    /* render directions result. Reference: https://developers.google.com/maps/documentation/javascript/directions */
    if (displays)
        displays.setMap(null);
    displays = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    /* drop source marker of pink colour*/
    startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(start),
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
    });
    /* drop source marker of orange colour*/
    destinationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(destination),
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
    });
    map.panTo(new google.maps.LatLng(destination));

    /* add info window with street view to source marker */
    var streetView = new google.maps.StreetViewService();
    startMarker.addListener('click', function () {
        info.open(map, startMarker);
        streetView.getPanorama({location: start, radius: 1000}, streetViewInfo);
    });
    /* add info window with street view to destination marker */
    destinationMarker.addListener('click', function () {
        info.open(map, destinationMarker);
        streetView.getPanorama({location: destination, radius: 1000}, streetViewInfo);
    });

    routey = new google.maps.DirectionsService();
    displays.setMap(map);
    /* directions conveyed as if user driving using car vehicle */
    var routeRequest = {
        origin: start,
        destination: destination,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    };

    /* Calculate alternate route directions. Reference: https://developers.google.com/maps/documentation/javascript/directions */
    routey.route(routeRequest, function (reply, status) {
        if (status == 'OK') {/* indicates response contains a valid DirectionsResult */
            displays.setDirections(reply); /* setDirections() on renderer, passing it DirectionsResult (reply). MVCObject so automatically detect changes + update  map*/

            if (!alternateRoute) /* no alternate route available */
                alternateRoute = new Array(reply.routes.length);
            else /* where alternate routes available */
                for (var i = 0; i < reply.routes.length; i++)
                    alternateRoute[i].setMap(null);
        }

        for (var i = 0; i < reply.routes.length; i++) {
            alternateRoute[i] = new google.maps.DirectionsRenderer({/*handles display of route polyline + placement of markers*/
                polylineOptions: {strokeColor: colour[number++ % colour.length]} /* different polyline colour for each */
            });
            alternateRoute[i].setDirections(reply); /* setDirections() on renderer, passing it DirectionsResult (reply). MVCObject so automatically detect changes + update  map*/
            alternateRoute[i].setRouteIndex(i); /* index of the route in the DirectionsResult object to render */
            alternateRoute[i].setMap(map); /* redirect view to display rendered route */
        }
    });
}

/* 
 * 
 *ADDITIONAL HELPER METHODS CALLED ON WITHIN BUTTON METHODS
 *
 */ 
 
/* add marker for initialize + button 2 + button 3 */
function addMarker(lat, lon) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        map: map
    });
    map.panTo(new google.maps.LatLng(lat, lon));
}

/* calculate distance between markers to maintain 300km max distance requirement Reference: https://www.geodatasource.com/developers/javascript*/
function distanceBetweenTwoPoints(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344
        }
        if (unit == "N") {
            dist = dist * 0.8684
        }
        return dist;
    }
}

function streetViewInfo(data, status) {
    /* Implement a method to extract panoramic images from each location */
    if (status === 'OK') {
        var panorama;
        panorama = new google.maps.StreetViewPanorama(document.getElementById('content')); /* panorama view added to infoWindow */
        panorama.setPosition(data.location.latLng);
        panorama.setPov(({
            heading: 200,
            pitch: 0
        }));
        panorama.setVisible(true); /* enable view to user */
    } else /* if no street view available prompt message to user */
        alert('Not available');
}