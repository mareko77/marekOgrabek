let map;
let border;

$(window).on('load', function () {
    $(".loader-wrapper").fadeOut("slow");
    userLocation();
});

// Map Initialization
map = L.map('map').setView([51.50, 0.13], 3);

// Map Layers
const wsm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 2,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});
wsm.addTo(map); 

const stadiaDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    minZoom: 2,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
    
getCountries();
    


// Layer Controller
const baseMaps = {
    "WSM": wsm,
    "Stadia Dark": stadiaDark
};


L.control.layers(baseMaps).addTo(map)
    .setPosition("bottomright");

L.control.scale().addTo(map);

// L.easyButtons
// button to show Modal with Country Info
const countryInfoButton = new L.easyButton('<i class="fas fa-info"></i>', function() {
    $("#countryModal").modal("show");
}, "Country Info");
countryInfoButton.addTo(map);

// Get User Location
function userLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser!");
    }

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        $.ajax({
            url: "libs/php/getUserIsoA3.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: latitude,
                lng: longitude
            },
            success: function(result) {
                $("#select-country").val(result.isoA3).change();
            },
            error: function(err) {
                alert("Error: " + err);
            }
        });
    }
    
    function error() {
        alert("Unable to find your location!");
    }
    navigator.geolocation.getCurrentPosition(success, error);
}

// Populate Select/Search Bar
function getCountries() {
    $.ajax({
        url: "libs/php/getCountries.php",
        type: 'POST',
        dataType: 'json',
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {    
            let selectSearchBar = $("#select-country");
            const countries = result.data;
            countries.forEach(country => {
            
                if (country.iso3 != "-99") {
                    selectSearchBar.append($(
                        `<option value="${country.iso3}">
                            ${country.name}
                        </option>`
                    ));
                }   
            });
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(err) {
            alert("Error: " + err);
        }
    });
}

// Get Borders
function addBorders(country) {
    $.ajax({
        url: "libs/php/getCountryBorder.php",
        type: 'POST',
        dataType: 'json',
        data: {
            isoA3: country
        },
        success: function(result) {
            const countryBorders = result.data;
            
            if (map.hasLayer(border)) {
                map.removeLayer(border);
            }
           border = L.geoJSON(countryBorders, {
               color: "#361999",
               wheight: 14,
               opacity: 1,
               fillOpacity: 0.1
           }).addTo(map);
            map.fitBounds(border.getBounds());  
            
            const bounds = border.getBounds();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();

            const blLat = bounds._southWest.lat;
            const trLat = bounds._northEast.lat;
            const blLng = bounds._southWest.lng;
            const trLng = bounds._northEast.lng;
            
            nearByCities(north, south, east, west);
            getEarthquakes(north, south, east, west);
            addRestaurants(blLat, trLat, blLng, trLng);
        },
        error: function(textStatus, errorThrown) {
            // console.log(textStatus, errorThrown);
        }
    });    
}

// Country Info
$("#select-country").change(function(country){
    $.ajax({
        url: "libs/php/getCountryInfo1.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#select-country').val()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            if (result.status.name == "ok") {

                    $('#txtContinent').html(result['data'][0]['continent']);
					$('#txtCapital').html(result['data'][0]['capital']);
					$('#txtLanguages').html(result['data'][0]['languages']);
					$('#txtPopulation').html(result['data'][0]['population']);
					$('#txtArea').html(result['data'][0]['areaInSqKm']);
            }
                
               
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(textStatus, errorThrown) {
            alert("Error: " + errorThrown);
        }
    });    
});








// When a country is selected
$("#select-country").on("change", countrySelection);

function countrySelection(event) {
    countryInformation(event.target.value);
}