var map;
var markers = [], waypointsMarkers = [], placeMarkers = [];
var nightModeStyleType, defaultMarker, hoverMarker, largeInfoWindow, drawingManager;
var polygon = null;

function clearMarkers() {
    markers = [];
}

function clearWaypoints() {
    waypointsMarkers = [];
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lng: -73.9980244, lat: 40.7413549}, //latitude 纬度 longitude 经度
        mapTypeControl: false
    });

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
        })
    }else {
        window.alert('Sorry, Your web browser do not support location service');
    }

    var timeAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById("search-within-time-text")
    );

    var zoomAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById("search-area-text")
    );

    zoomAutocomplete.bindTo('bounds', map); //偏向当前地图边界限制的区域位置

    var waypointsAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById("waypoints-text")
    );

    var placesSearchBox = new google.maps.places.SearchBox(
        document.getElementById("search-places")
    );

    google.maps.event.addListener(map, 'bounds_changed', function() {
        placesSearchBox.setBounds(map.getBounds());
    });
    //限制在当前地图边界内


    placesSearchBox.addListener('places_changed', function() {
        searchBoxPlaces(this);
    });

    document.getElementById('go-places').addEventListener('click', textSearchPlaces);

    var locations = [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
        {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
        {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
    ];
    defaultMarker = {
        url: 'imgs/marker-default.png',
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
    };
    hoverMarker = {
        url: 'imgs/marker-hover.png',
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
    };

    largeInfoWindow = new google.maps.InfoWindow();
    for(var i=0; i<locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        addMarker(position, title);
    }

    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ]
        }
    })

    drawingManager.addListener('overlaycomplete', function(event) {
        if(polygon) {
            polygon.setMap(null);
            navPanel.hideMarkers(markers);
        }
        drawingManager.setDrawingMode(null);
        polygon = event.overlay;
        polygon.setEditable(true);
        searchWithinPolygon();
        polygon.getPath().addListener('set_at', searchWithinPolygon);
        polygon.getPath().addListener('insert_at', searchWithinPolygon);
    })

    nightModeStyleType = new google.maps.StyledMapType([
                {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
                {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
                {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
                {
                  featureType: 'administrative.locality',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#d59563'}]
                },
                {
                  featureType: 'poi',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#d59563'}]
                },
                {
                  featureType: 'poi.park',
                  elementType: 'geometry',
                  stylers: [{color: '#263c3f'}]
                },
                {
                  featureType: 'poi.park',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#6b9a76'}]
                },
                {
                  featureType: 'road',
                  elementType: 'geometry',
                  stylers: [{color: '#38414e'}]
                },
                {
                  featureType: 'road',
                  elementType: 'geometry.stroke',
                  stylers: [{color: '#212a37'}]
                },
                {
                  featureType: 'road',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#9ca5b3'}]
                },
                {
                  featureType: 'road.highway',
                  elementType: 'geometry',
                  stylers: [{color: '#746855'}]
                },
                {
                  featureType: 'road.highway',
                  elementType: 'geometry.stroke',
                  stylers: [{color: '#1f2835'}]
                },
                {
                  featureType: 'road.highway',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#f3d19c'}]
                },
                {
                  featureType: 'transit',
                  elementType: 'geometry',
                  stylers: [{color: '#2f3948'}]
                },
                {
                  featureType: 'transit.station',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#d59563'}]
                },
                {
                  featureType: 'water',
                  elementType: 'geometry',
                  stylers: [{color: '#17263c'}]
                },
                {
                  featureType: 'water',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#515c6d'}]
                },
                {
                  featureType: 'water',
                  elementType: 'labels.text.stroke',
                  stylers: [{color: '#17263c'}]
                }
    ]);
}

function searchBoxPlaces(searchBox) {
    navPanel.hideMarkers(placeMarkers);
    var places = searchBox.getPlaces();
    createMarkersForPlaces(places);
    if(places.length === 0) {
        window.alert("We did not find any places matching that search!");
    }
}

function textSearchPlaces() {
    var bounds = map.getBounds();
    navPanel.hideMarkers(placeMarkers);
    var placesService = new google.maps.places.PlacesService(map);
    placesService.textSearch({
        query: document.getElementById('search-places').value,
        bounds: bounds
    }, function(results, status) {
        if(status === google.maps.places.PlacesServiceStatus.OK) {
            createMarkersForPlaces(results);
        }
    })
}

function createMarkersForPlaces(places) {
    var bounds = new google.maps.LatLngBounds();
    for(var i=0; i<places.length; i++) {
        var place = places[i];
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        var marker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id
        });
        var placeInfoWindow = new google.maps.InfoWindow();
        marker.addListener('click', function() {
            if(placeInfoWindow.marker === this) {
                window.alert("This infowindow already is on this marker!");
            } else {
                getPlacesDetails(this, placeInfoWindow);
            }
        })
        placeMarkers.push(marker);
        if(place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

function getPlacesDetails(marker, infowindow) {
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: marker.id
    }, function(place, status) {
        console.log(status);
        if(status === google.maps.places.PlacesServiceStatus.OK) {
            infowindow.marker = marker;
            var innerHTML = '<div>';
            if(place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
            }
            if(place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
            }
            if(place.formatted_phone_number) {
                innerHTML += '<br>' + place.formatted_phone_number;
            }
            if(place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
            }
            if(place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                    {maxHeight: 100, maxWidth: 200}) + '">';
            }
            innerHTML += '</div>';
            infowindow.setContent(innerHTML);
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            })
        }
    });
}

function searchWithinPolygon() {
    for(var i=0; i<markers.length; i++) {
        if(google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
        }else {
            markers[i].setMap(null);
        }
    }
}

var currentId = 0;

function uniqueId() {
    return currentId++;
}

function addMarker(a_position, a_title) {
    var id = uniqueId();
    var marker = new google.maps.Marker({
        position: a_position,
        title: a_title,
        animation: google.maps.Animation.DROP,
        icon: defaultMarker,
        draggable: false,
        id: id
    });
    markers.push(marker);
    marker.addListener('click', function() {
        populateInfoWindow(this, largeInfoWindow);
    });
    marker.addListener('mouseover', function() {
        this.setIcon(hoverMarker);
    });
    marker.addListener('mouseout', function() {
        this.setIcon(defaultMarker);
    });
    return marker;
}

function populateInfoWindow(marker, infoWindow) {
    infoWindow.setContent('');
    infoWindow.marker = marker;
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    function getStreetView(data, status) {
        if(status === google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
            infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                    // heading 左右方向，pitch 上下角度
                    heading: heading,
                    pitch: 30
                }
            };
            var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
        }else {
            infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
        }
    }
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    infoWindow.open(map, marker);
}

function changeMapStyle(styleMode) {
    if(styleMode === 'nightMode') {
        if(map.mapTypeId === 'nightMode') {
            map.setMapTypeId('roadmap');
        }else {
            map.mapTypes.set('nightMode', nightModeStyleType);
            map.setMapTypeId('nightMode');
        }
    }
}

function zoomToArea() {
    var geocoder = new google.maps.Geocoder();
    var address = $('#search-area-text').val();
    if(address === '') {
        window.alert('You must enter an area, or address.');
    }else {
        geocoder.geocode(
            {
                address: address,
                // componentRestrictions: {locality: 'New York'}
            },function(results, status) {
                if(status === google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    var myMarker = addMarker(results[0].geometry.location , results[0].geometry.location.toString());//Bug: show a same area with more than one marker
                    myMarker.setMap(map);
                    map.setZoom(15);
                }else {
                    window.alert('We could not find that location - try entring a more specific place.');
                }
            });
    }
}

function searchWithinTime() {
    var distanceMatrixService = new google.maps.DistanceMatrixService;
    var address = $('#search-within-time-text').val();
    if(address === '') {
        window.alert('You must enter an address');
    }else {
        navPanel.hideMarkers(markers);
        var origins = [];
        for(var i=0; i<markers.length; i++) {
            origins[i] = markers[i].position;
        }
        var destination = address;
        var mode = $('#mode').val();
        distanceMatrixService.getDistanceMatrix({
            origins: origins,
            destinations: [destination],
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.METRIC,
        }, function(response, status) {
            if(status !== google.maps.DistanceMatrixStatus.OK) {
                window.alert('Error was: ' + status);
            }else {
                displayMarkerWithinTime(response);
            }
        });
    }
}

function addWaypoints() {
    var geocoder = new google.maps.Geocoder();
    var address = $('#waypoints-text').val();
    if(address === '') {
        window.alert('You must enter an area, or address.');
    }else {
        geocoder.geocode(
            {
                address: address,
                // componentRestrictions: {locality: 'New York'}
            },function(results, status) {
                if(status === google.maps.GeocoderStatus.OK) {
                    waypointsMarkers.push({
                        location: results[0].geometry.location,
                        stopover: false
                    })
                }else {
                    window.alert('We could not find that location - try entring a more specific place.');
                }
            });
    }
}

function displayMarkerWithinTime(response) {
    var maxDuration = $('#max-duration').val();
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    var alLeastOne = false;
    //response 返回一个对象 其中包含两个属性 originAddresses 和 destinationAddresses 它们是数组
    //origins 出发点个数，results 一个出发点与每个目的地对应的结果。
    for(var i=0; i<origins.length; i++) {
        var results = response.rows[i].elements;
        for(var j=0; j<results.length; j++) {
            var element = results[j];
            if(element.status === 'OK') {
                var distanceText = element.distance.text;
                var duration = element.duration.value / 60;
                var durationText = element.duration.text;
                if(duration <= maxDuration) {
                    markers[i].setMap(map);
                    atLeastOne = true;
                    var infoWindow = new google.maps.InfoWindow({
                        content: durationText + ' away, ' + distanceText +
                        '<div id=\"view-route\"><input type=\"button\" value=\"View Route\" onclick = ' +
                        '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
                    });
                    infoWindow.open(map, markers[i]);
                    markers[i].infoWindow = infoWindow;
                    google.maps.event.addListener(markers[i], 'click', function() {
                        this.infoWindow.close();
                    })
                }
            }
        }
    }
    if(!atLeastOne) {
        window.alert('We could not find any locations within that distance!');
    }
}

var directionsDisplay = null;
function displayDirections(origin) {
    navPanel.hideMarkers(markers);
    var directionsService = new google.maps.DirectionsService;
    var destinationAddress = $('#search-within-time-text').val();
    var mode = $('#mode').val();
    if(directionsDisplay !== null) {
        directionsDisplay.setMap(null);
        directionsDisplay = null;
    }
    directionsService.route({
        origin: origin,
        destination: destinationAddress,
        travelMode: google.maps.TravelMode[mode],
        waypoints: waypointsMarkers,
        optimizeWaypoints: true
    },function(response, status) {
        if(status === google.maps.DirectionsStatus.OK) {
            directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                draggable: true,
                polylineOptions: {
                    strokeColor: 'green'
                }
            });

        }else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

var navButton = new Vue({
    el: '#nav-button',
    methods: {
        showNavPanel: function() {
            $('#nav-button').hide();
            $('#nav-panel').fadeIn(600);
        }
    }
});

var navPanel = new Vue({
    el: '#nav-panel',
    methods: {
        closeNavPanel: function() {
            $('#nav-panel').fadeOut(600, function() {
                $('#nav-button').fadeIn();
            });
        },
        showListings: function() {
            if(markers.length === 0) {
                window.alert('There are no markers to show!');
                return;
            }
            var bounds = new google.maps.LatLngBounds();
            for(var i=0; i<markers.length; i++) {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
            }
            map.fitBounds(bounds);
        },
        hideMarkers: function(markers) {
            for(var i=0; i<markers.length; i++) {
                markers[i].setMap(null);
            }
        },
        toggleDrawing: function() {
            if(drawingManager.map) {
                drawingManager.setMap(null);
                if(polygon !== null) {
                    polygon.setMap(null);
                }
            }else {
                drawingManager.setMap(map);
            }
        },
        toggleNightMode: function() {
            changeMapStyle('nightMode');
        },
        searchLocation: function() {
            zoomToArea();
        }
    }
});
