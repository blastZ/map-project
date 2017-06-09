var map;
var markers = [];
var nightModeStyleType, defaultMarker, hoverMarker, largeInfoWindow, drawingManager;
var polygon = null;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lng: -73.9980244, lat: 40.7413549}, //latitude 纬度 longitude 经度
        mapTypeControl: false
    });
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
            navPanel.hideListings();
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

function searchWithinPolygon() {
    for(var i=0; i<markers.length; i++) {
        if(google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
        }else {
            markers[i].setMap(null);
        }
    }
}

function addMarker(a_position, a_title) {
    var marker = new google.maps.Marker({
        position: a_position,
        title: a_title,
        animation: google.maps.Animation.DROP,
        icon: defaultMarker,
        draggable: false
    });
    markers.push(marker);
    marker.addListener('mouseup', function() {
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

var navButton = new Vue({
    el: '#nav-button',
    methods: {
        showNavPanel: function() {
            $('#nav-button').hide();
            $('#nav-panel').fadeIn(600);
        }
    }
})

var navPanel = new Vue({
    el: '#nav-panel',
    methods: {
        closeNavPanel: function() {
            $('#nav-panel').fadeOut(600, function() {
                $('#nav-button').fadeIn();
            });
        },
        showListings: function() {
            var bounds = new google.maps.LatLngBounds();
            for(var i=0; i<markers.length; i++) {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
            }
            map.fitBounds(bounds);
        },
        hideListings: function() {
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
})
