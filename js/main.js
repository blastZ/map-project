function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lng: 120.350, lat: 30.310} //latitude 纬度 longitude 经度
    });
    var locations = [
        {position: {lng: 122.330, lat: 32.322}, title: 'location-1'},
        {position: {lng: 123.330, lat: 33.322}, title: 'location-2'},
        {position: {lng: 121.330, lat: 34.322}, title: 'location-3'},
        {position: {lng: 120.330, lat: 31.322}, title: 'location-4'},
        {position: {lng: 124.330, lat: 30.322}, title: 'location-5'},
        {position: {lng: 125.330, lat: 29.322}, title: 'location-6'},
        {position: {lng: 126.330, lat: 35.322}, title: 'location-7'}
    ];
    var markers = [];
    var largeInfoWindow = google.maps.InfoWindow();
    var bounds = google.maps.LatLngBounds();
    for(var i=0; i<locations.length; i++) {
        var position = locations[i].position;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', populateInfoWindow(marker, largeInfoWindow));
        bounds.extend(marker[i].position);
    }
    map.fitBounds(bounds);
}

function populateInfoWindow(marker, infoWindow) {
    if(infoWindow.marker !== marker) {
        infoWindow.marker = marker;
        infoWindow.setContent('<div>' + marker.title + '</div>');
        infoWindow.open(map, marker);
        google.maps.event.addListener(infoWindow, 'closeclick', function(){
            infoWindow.setMarker = null;
        });
    }
}