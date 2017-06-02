var map;
var markers = [];
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lng: -73.9980244, lat: 40.7413549} //latitude 纬度 longitude 经度
    });
    var locations = [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
        {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
        {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
    ];
    var largeInfoWindow = new google.maps.InfoWindow();
    for(var i=0; i<locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfoWindow);
        });
    }
}

function populateInfoWindow(marker, infoWindow) {
    if(infoWindow.marker !== marker) {
        infoWindow.marker = marker;
        infoWindow.setContent('<div>' + marker.title + '</div>');
        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function() {
            infoWindow.setMarker = null;
        })
    }
}

function showListings() {
    var bounds = new google.maps.LatLngBounds();
    for(var i=0; i<markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

function hideListings() {
    for(var i=0; i<markers.length; i++) {
        markers[i].setMap(null);
    }
}

$('#nav-button').click(function() {
    $('#nav-panel').show(500);
});

$('#nav-panel li').first().click(function() {
    $('#nav-panel').hide(500);
});

$('#nav-panel li:nth-child(2)').click(function() {
    showListings();
});

$('#nav-panel li:nth-child(3)').click(function() {
    hideListings();
})
