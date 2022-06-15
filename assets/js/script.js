// creating Welcome modal and zipmodal variable
var $modal = $('.modal');
var $zipModal = $('.zipModal');
// Array to store the community garden markers
var markers = [];
// creating input variable and search button variable
var zipInput = document.querySelector('#zip');
var searchBtn = document.querySelector('#button1');
// will be used later to pull zip value
var getZip;
// variables for displaying zone results and creating appropriate link
var zoneResults = document.querySelector('.zoneResults');
var results = document.querySelector('.results');
var zoneLink = document.querySelector('#zoneLink');
// variable to store city name
var cityName = '';

getZip = localStorage.getItem('zip') || '98052';

// Defines the request for community gardens
var requestGardens = {
	location: coords,
	radius: '500', // Preferring results closer to the center point.
	query: 'community garden',
};

// modal
$modal.dialog({
	modal: true,
	buttons: [
		{
			text: 'Yes!',
			click: function () {
				$(this).dialog('close');
			}
		},
		{
			text: 'No, I\'ll be wearing gloves.',
			click: function () {
				$(this).dialog('close');
			}
		}
	],
	minWidth: 400,
});

var init = function () {
	$zipModal.hide();
	geocode({ address: getZip });
	getAgZone(getZip);
	getWeatherData(requestGardens);
}



var createMarker = function (place) {
	if (!place.geometry || !place.geometry.location) return;

	const marker = new google.maps.Marker({
		map,
		position: place.geometry.location,
	});
	// open a pop-up window to display address for the marker.
	google.maps.event.addListener(marker, 'click', () => {
		const content = document.createElement('div');
		const nameElement = document.createElement('h2');
		const addressElement = document.createElement('p');

		nameElement.textContent = place.name;
		addressElement.textContent = place.formatted_address;

		content.appendChild(nameElement);
		content.appendChild(addressElement);
		infowindow.setContent(content);
		infowindow.open(map, marker);
	});
	markers.push(marker);
};

// Function to search community gardens and create markers for them.
var getCommunityGardens = function (requestLocation) {
	markers = [];
	console.log(markers);
	console.log(requestLocation);
	service.textSearch(requestLocation, (results, status) => {
		if (status === google.maps.places.PlacesServiceStatus.OK && results) {
			console.log(results.length);
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i]);
			}
		}
	});
}

var geocode = function (request) {
	clear();
	geocoder.geocode(request)
		.then((result) => {
			const { results } = result;

			map.setCenter(results[0].geometry.location);

			cityName = results[0].address_components[1].long_name;
			console.log(cityName);
			console.log(results[0].geometry.location.lat());
			requestGardens.location.lat = results[0].geometry.location.lat();
			requestGardens.location.lng = results[0].geometry.location.lng();
			console.log(requestGardens.location.lat);
			getCommunityGardens(requestGardens);
			getWeatherData(requestGardens);
		})
		.catch((e) => {
			alert('Geocode was not successful for the following reason: ' + e);
		});
}
var getWeatherData = function (requestGardens) {
	console.log(requestGardens);
	fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + requestGardens.location.lat + '&lon=' + requestGardens.location.lng + '&units=imperial&appid=fd8dcdd160b0be1f8103a8b54146c418')
		.then((response) => {
			return response.json();
		}).then((data) => {
			console.log(data);
			var Numb = document.querySelector('#temperature');
			Numb.textContent = Math.ceil(data.current.temp);
			Numb = document.querySelector('#feels-like')
			Numb.textContent = Math.ceil(data.current.feels_like);
			Numb = document.querySelector('#humidity');
			Numb.textContent = Math.ceil(data.current.humidity);
			Numb = document.querySelector('#weather-location');
			Numb.textContent = cityName;
		})
}

// Sets the map on all markers in the array.
var setMapOnAll = function (map) {
	for (let i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

var clear = function () {
	setMapOnAll(null);
	markers = [];
}


// ZIPCODE INPUT
searchBtn.addEventListener('click', (event) => {
	event.preventDefault();
	getZip = zipInput.value.trim();
	if (getZip.length !== 5) {
		// zipModal displays if zipcode entry is !5 character
		$zipModal.dialog({
			modal: true,
			minWidth: 400,
		})
	} else {

		console.log(getZip);
		// this is optional, if we don't want to store zipcodes we can scratch this
		localStorage.setItem('zip', getZip);
		geocode({ address: getZip });
		getAgZone(getZip);
		// getWeatherData(requestGardens);
		if ($zipModal.css('visibility') === 'hidden') {
			$zipModal.css('visibility', 'visible');
		} else {
			$zipModal.css('visibility', 'hidden');
		}
	}
});

var show = function () {
	paraP = document.getElementById('hidden');
}

// API to pull agricultural zone
var getAgZone = function (getZip) {
	// stitch the zipcode into the API URL
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'plant-hardiness-zone.p.rapidapi.com',
      'X-RapidAPI-Key': 'f720bff0aemsh09e18b403689183p139bd3jsn8f600209aac2'
    }
  };
  const agURL = `https://plant-hardiness-zone.p.rapidapi.com/zipcodes/${getZipCode}`;
	fetch(agURL, options)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			console.log(data)
			zoneResults.textContent = 'You live in Zone ' + data.hardiness_zone + '!';
			// generate link to zone growing info
			zoneLink.href = 'https://www.gardenate.com/?zone=' + data.hardiness_zone;
			zoneLink.target = '_blank';
			zoneLink.innerText = 'Click here to see what you can grow in your zone!';
		});
};

document.addEventListener('DOMContentLoaded', (e) => {
	init();
});