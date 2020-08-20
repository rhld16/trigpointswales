var strava;
self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data[0]) {
        case 'activs':
            strava = data[1];
            break;
        case 'test':
            var pArr = data[1].split(',');
            var lat = parseFloat(pArr[1])
            var lng = parseFloat(pArr[0])
            var lat3 = lat.toFixed(3);
            var lng3 = lng.toFixed(3)
            for (var i = 0; strava.length > i; i++) {
                if (lat3 === strava[i].latitude.toFixed(3) && lng3 === strava[i].longitude.toFixed(3)) {
                    self.postMessage([true, data[2], lat, lng]);
                    return;
                } else {
                    continue;
                }
            };
            self.postMessage([false, data[2], lat, lng]);
            break;
        default:
            self.postMessage('Unknown command: ' + data.msg);
    };
});
