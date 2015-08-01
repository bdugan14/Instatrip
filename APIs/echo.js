//echo.js
var request = require('request');
var keys = require('../config.js');
var prettyJson = require('prettyjson');
var query = require('querystring');

//module.exports = {
//37.774950000000004
//-122.41929
//
var obtainEchoData = function(latLng, index, pusher){
  var lat = latLng.lat;
  var lng = latLng.lng;
  request({
      url: 'http://developer.echonest.com/api/v4/song/search', //URL to hit
      useQuerystring: true,
      qs: {
            api_key: keys.EchoApiKey,
            format: "json",
            results: 1,
            min_latitude: lat-.3,
            max_latitude: lat+.3,
            min_longitude: lng-.4,
            max_longitude: lng+.4,
            sort: "song_hotttnesss-desc",
            bucket: ["artist_location"/*"id:spotify","tracks"*/]
            //TODO: make this bucket work without overwriting other bucket
            // "id:spotify"]
            //bucket: "id:spotify"
            //"artist_location",
           }, //Query string data
      method: 'GET' //Specify the method
      // headers: { //We can define headers too
      //     // 'Content-Type': 'MyContentType',
      //     // 'Custom-Header': 'Custom Value'
      // }
  }, function(error, response, body){
      if(error) {
          console.log(error);
      } else {
          var objBody = JSON.parse(body);
          if(objBody.response.songs){
            var song = objBody.response.songs[0];
            pusher(index, song);
          } else {
            pusher(index, {song: "blank"});
          }
      }
  });
};
var songsIterator = function(latLngArr, nextCB){
//We have a multitude of async calls, and need to keep songs in the proper order.
//The songs each make one call to the songsearch api, and are then inserted into the array
//at the proper index (regardless of the return order).
  var counter = 0;
  var maxLength = latLngArr.length;
  var resultContainer = [];
  var pusher = function(index, song){
    resultContainer[index] = song;
    counter ++;
    if (counter === maxLength){
        nextCB(resultContainer);
    }
  };
  for(var i=0; i<latLngArr.length; i++){
    obtainEchoData(latLngArr[i], i, pusher);
  }
};

module.exports = {
  songsIterator: songsIterator
};
