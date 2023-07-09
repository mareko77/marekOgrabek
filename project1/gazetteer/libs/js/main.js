let e, t;
$(window).on("load", function () {
    $(".loader-wrapper").fadeOut("slow"),
        (function () {
            navigator.geolocation || alert("Geolocation is not supported by your browser!");
            function e(e) {
                $.ajax({
                    url: "libs/php/getUserIsoA2.php",
                    type: "POST",
                    dataType: "json",
                    data: { lat: e.coords.latitude, lng: e.coords.longitude },
                    success: function (e) {
                        $("#select-country").val(e.isoA2).change();
                    },
                    error: function (e) {
                        alert("Error: " + e);
                    },
                });
            }
            function t() {
                alert("Unable to find your location!");
            }
            navigator.geolocation.getCurrentPosition(e, t);
        })();
}),
    (e = L.map("map").setView([51.5, 0.13], 3));
const a = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        minZoom: 2,
        attribution: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }),
    o = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    });
o.addTo(e);
var r = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution:
        'Tiles © Esri — National Geographic. Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> and <a href="https://smashicons.com/" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>',
    maxZoom: 12,
});
$.ajax({
    url: "libs/php/getCountries.php",
    type: "POST",
    dataType: "json",
    beforeSend: function () {
        $("#loader").removeClass("hidden");
    },
    success: function (e) {
        let t = $("#select-country");
        e.data.forEach((e) => {
            "-99" != e.iso2 && t.append($(`<option value="${e.iso2}">${e.name}</option>`));
        });
    },
    complete: function () {
        $("#loader").addClass("hidden");
    },
    error: function (e) {
        alert("Error: " + e);
    },
});
new L.easyButton(
    '<i class="fas fa-info"></i>',
    function () {
        $("#countryModal").modal("show");
    },
    "Country Info"
).addTo(e);
new L.easyButton(
    '<i class="fas fa-cloud-sun"></i>',
    function () {
        $("#weatherModal").modal("show");
    },
    "Weather Info"
).addTo(e);
new L.easyButton(
    '<i class="far fa-newspaper"></i>',
    function () {
        $("#newsModal").modal("show");
    },
    "Country News"
).addTo(e);
new L.easyButton(
    '<i class="fas fa-camera-retro"></i>',
    function () {
        $("#imagesModalScrollable").modal("show");
    },
    "Images"
).addTo(e);
let n;
new L.easyButton(
    '<i class="fas fa-donate"></i>',
    function () {
        $("#exchangeModal").modal("show");
    },
    "Currency Exchange"
).addTo(e),
    $("#select-country").change(function () {
        $.ajax({
            url: "libs/php/getCountryBorder.php",
            type: "POST",
            dataType: "json",
            data: { isoA2: $("#select-country option:selected").val() },
            success: function (a) {
                console.log(a);
                const o = a.data;
                t && t.clearLayers(), (t = L.geoJSON(o, { color: "blue", weight: 4, opacity: 1, fillOpacity: 0.1 }).addTo(e)), e.fitBounds(t.getBounds());
                const r = t.getBounds(),
                    l = r.getNorth(),
                    d = r.getSouth(),
                    p = r.getEast(),
                    u = r.getWest();
                !(function (e, t, a, o) {
                    i.clearLayers(),
                        $.ajax({
                            url: "libs/php/getCities.php",
                            type: "POST",
                            dataType: "json",
                            data: { north: e, south: t, east: a, west: o },
                            success: function (e) {
                                console.log(e);
                                e.data.forEach((e) => {
                                    const t = L.marker([`${e.lat}`, `${e.lng}`], { icon: c }).bindPopup(
                                        `<div class="container card h-100"><table class="table table-sm"><thead><tr><th><strong>City</strong></th></tr></thead><tbody><tr><th scope="row">Name:</th><td class="text-end"><strong>${
                                            e.name
                                        }</strong></td></tr><tr><th scope="row">Population:</th><td class="text-end">${e.population.toLocaleString("en-US")}</td></tr></tbody></table></div>`
                                    );
                                    i.addLayer(t);
                                });
                            },
                            error: function (e, t, a) {
                                alert("Error: " + a), console.log(e);
                            },
                        });
                })(l, d, p, u),
                    (function (e, t, a, o) {
                        n.clearLayers(),
                            $.ajax({
                                url: "libs/php/getEarthquake.php",
                                type: "POST",
                                dataType: "json",
                                data: { north: e, south: t, east: a, west: o },
                                success: function (e) {
                                    console.log(e);
                                    e.data.forEach((e) => {
                                        const t = L.marker([`${e.lat}`, `${e.lng}`], { icon: s }).bindPopup(
                                            `<div class="container card h-100"><table class="table table-sm"><thead><tr><th><strong>Earthquake</strong></th></tr></thead><tbody><tr><th scope="row">Magnitude:</th><td class="text-end"><strong>${
                                                e.magnitude
                                            }</strong></td></tr><tr><th scope="row">Date and Time:</th><td class="text-end">${window
                                                .moment(e.datetime)
                                                .format("MMMM Do YYYY, h:mm:ss A")}<td></tr><tr><th scope="row">Depth:</th><td class="text-end">${Math.round(e.depth)}Km</td></tr></tbody></table><div>`
                                        );
                                        n.addLayer(t);
                                    });
                                },
                                error: function (e, t, a) {
                                    alert("Error: " + a), console.log(e);
                                },
                            });
                    })(l, d, p, u);
            },
            error: function (e, t, a) {
                console.error(e);
            },
        }),
            $.ajax({
                url: "libs/php/getOpencage.php",
                type: "POST",
                dataType: "json",
                data: { country: encodeURI($("#select-country option:selected").text()) },
                success: function (e) {
                    console.log(e),
                        "ok" == e.status.name &&
                            $.ajax({
                                url: "libs/php/getWeather.php",
                                type: "GET",
                                dataType: "json",
                                data: { capitalLat: e.data[0].geometry.lat, capitalLng: e.data[0].geometry.lng },
                                beforeSend: function () {
                                    $("#loader").removeClass("hidden");
                                },
                                success: function (e) {
                                    console.log(e);
                                    let t = new Date().toString("dS, MMMM H:m"),
                                        a = new Date().toString("dddd");
                                    $("#weatherTable tbody tr td").html(" ");
                                    let o = e.data.weather.current.weather[0].icon,
                                        r = e.data.weather.daily[0].weather[0].icon;
                                    $("#todaysDate").html(t),
                                        $("#todaysDay").html(a),
                                        $("#capitalWeatherIcon").html(`<img src="https://openweathermap.org/img/wn/${o}@2x.png"width="120px">`),
                                        $("#capitalWeatherIconTomorrow").html(`<img src="https://openweathermap.org/img/wn/${r}@2x.png"width="120px">`),
                                        $("#txtCapitalWeatherName").html(e.data.weather.timezone),
                                        $("#txtCapitalWeatherCurrent").html(Math.round(e.data.weather.current.temp) + "&#8451<br>"),
                                        $("#feels_like").html(Math.round(e.data.weather.current.feels_like) + "&#8451<br>"),
                                        $("#txtCapitalWeatherDescription").html(e.data.weather.current.weather[0].description),
                                        $("#txtCapitalWeatherDescriptionTomorrow").html(e.data.weather.daily[0].weather[0].description),
                                        $("#txtCapitalWeatherWindspeed").html(e.data.weather.current.wind_speed + " km/h"),
                                        $("#txtCapitalWeatherHumidity").html(Math.round(e.data.weather.current.humidity) + "&#37"),
                                        $("#txtCapitalWeatherLo").html(Math.round(e.data.weather.daily[0].temp.min) + "&#8451<br>"),
                                        $("#txtCapitalWeatherHi").html(Math.round(e.data.weather.daily[0].temp.max) + "&#8451<br>");
                                    var n = moment(1e3 * e.data.weather.current.sunrise).format("HH:mm");
                                    $("#txtCapitalSunrise").html(n);
                                    var s = moment(1e3 * e.data.weather.current.sunset).format("HH:mm");
                                    $("#txtCapitalSunset").html(s),
                                        $(".capitalSunriseIcon").html('<img src="images/icons/sunrise.png" width="24px">'),
                                        $(".capitalSunsetIcon").html('<img src="images/icons/sunset.png" width="24px">'),
                                        $("#txtCapitalTomorrowsWeatherLo").html(Math.round(e.data.weather.daily[1].temp.min) + "&#8451<br>"),
                                        $("#txtCapitalTomorrowsWeatherHi").html(Math.round(e.data.weather.daily[1].temp.max) + "&#8451<br>"),
                                        $("#weatherIcon").html('<img src="images/icons/weather.svg" width="24px">'),
                                        $("#capitalHumidityIcon").html('<img src="images/icons/humidity.svg" width="24px">'),
                                        $("#capitalWindIcon").html('<img src="images/icons/007-windy.svg" width="24px">'),
                                        $(".capitalHiTempIcon").html('<img src="images/icons/thermometer.svg" width="24px">'),
                                        $(".capitalLoTempIcon").html('<img src="images/icons/thermometer-colder.svg" width="24px">');
                                },
                                complete: function () {
                                    $("#loader").addClass("hidden");
                                },
                                error: function (e, t, a) {
                                    console.error(e);
                                },
                            });
                },
            }),
            $.ajax({
                url: "libs/php/getCountryInfo.php",
                type: "POST",
                dataType: "json",
                data: { country: $("#select-country option:selected").val() },
                beforeSend: function () {
                    $("#loader").removeClass("hidden");
                },
                success: function (e) {
                    console.log(e);
                    let t = $("#country-info");
                    t.html(""),
                        t.append(
                            $(
                                `<div class='country-body'><div class="card-body country"><h3 id='flag-country'><strong>${e[0].name.common}</strong></h3></div><div class="card h-100 country"><img src="${e[0].flags.png}"alt="${
                                    e[0].flags.alt
                                }"/><br></div><table class="table flex table-striped table-sm"id='country-info-image'><tbody><tr><th scope="row">Capital:</th><td>${e[0].capital}</td></tr><tr><th scope="row">Population:</th><td>${
                                    (e[0].population / 1e6).toFixed(1) + "M"
                                }</td></tr><tr><th scope="row">Area:</th><td>${e[0].area.toLocaleString()}Km<sup>2</sup></td></tr><tr><th scope="row">Region:</th><td>${e[0].region}</td></tr><tr><th scope="row">Subregion:</th><td>${
                                    e[0].subregion
                                }</td></tr><tr><th scope="row">Demonyms:</th><td>${e[0].demonyms[Object.keys(e[0].demonyms)[0]].m}</td></tr><tr><th scope="row">Languages:</th><td>${
                                    Object.values(e[0].languages)[0]
                                }</td></tr><tr><th scope="row">Currencies:</th><td>${e[0].currencies[Object.keys(e[0].currencies)[0]].name}</td></tr><tr><th scope="row">Driving side:</th><td>${
                                    e[0].car.side
                                }</td></tr></tbody></table><div class="coatOfArms"id='coatOfArms'><img src="${e[0].coatOfArms.png}"/></div></div>`
                            )
                        ),
                        $("#currency-header").html(),
                        $("#countryCurrencyLabel").html(e[0].name.common + " currency and rate");
                },
                complete: function () {
                    $("#loader").addClass("hidden");
                },
                error: function (e, t, a) {
                    console.log(t, a);
                },
            }),
            $.ajax({
                url: "libs/php/getRestCountries.php",
                type: "POST",
                dataType: "json",
                data: { country: $("#select-country option:selected").val() },
                beforeSend: function () {
                    $("#loader").removeClass("hidden");
                },
                success: function (e) {
                    (currencyCode = Object.keys(e[0].currencies)[0]),
                        (currencySymbol = e[0].currencies[currencyCode].symbol),
                        (currencyName = e[0].currencies[currencyCode].name),
                        $("#nav-currency").html(),
                        $("#currency").html(currencyName + "<br>"),
                        $("#currencyCode").html(currencyCode + "<br>"),
                        $("#currencySymbol").html(currencySymbol + "<br>"),
                        $("#from").html(currencyCode),
                        $.ajax({
                            url: "libs/php/getExchangeRates.php",
                            type: "GET",
                            dataType: "json",
                            beforeSend: function () {
                                $("#loader").removeClass("hidden");
                            },
                            success: function (e) {
                                console.log(e),
                                    "ok" == e.status.name && ((exchangeRate = e.exchangeRate.rates[currencyCode]), $("#nav-currency").html(), $("#exchangeRate").html(exchangeRate.toFixed(2) + " " + currencyCode + " = 1 USD. <br>"));
                            },
                            complete: function () {
                                $("#loader").addClass("hidden");
                            },
                            error: function (e, t, a) {
                                console.log(t, a);
                            },
                        });
                },
            }),
            $.ajax({
                url: "libs/php/getLocationImages.php",
                type: "POST",
                dataType: "json",
                data: { query: $("#select-country option:selected").text() },
                beforeSend: function () {
                    $("#loader").removeClass("hidden");
                },
                success: function (e) {
                    if ((console.log(e), $("#countryImages").empty(), "ok" == e.status.name))
                        for (var t = 0; t < e.data.results.length; t++)
                            $("#countryImages").append("<p style='color:black' id='description" + t + "'class='countryDescription'>"),
                                $("#countryImages").append("<img src='' alt='' id='image" + t + "'class='countryImages'><br><br>"),
                                $("#image" + t).attr("src", e.data.results[t].urls.regular),
                                $("#image" + t).attr("alt", e.data.results[t].alt_description),
                                $("#description" + t).append(e.data.results[t].alt_description);
                },
                complete: function () {
                    $("#loader").addClass("hidden");
                },
                error: function (e, t, a) {
                    alert("Error: " + a), console.log(e);
                },
            }),
            $.ajax({
                url: "libs/php/getWikiInfo.php",
                type: "POST",
                dataType: "json",
                data: { country: $("#select-country option:selected").text() },
                beforeSend: function () {
                    $("#loader").removeClass("hidden");
                },
                success: function (e) {
                    console.log(e),
                        "ok" == e.status.name &&
                            ($("#sumTitle").empty(), $("#sumTitle").append(e.data[0].title), $("#summary").html(e.data[0].summary), $("#wikipediaUrl").attr("href", e.data[0].wikipediaUrl), $("#wikipediaUrl").html(e.data[0].wikipediaUrl));
                },
                complete: function () {
                    $("#loader").addClass("hidden");
                },
                error: function (e, t, a) {
                    alert("Error: " + a), console.log(e);
                },
            }),
            $.ajax({
                url: "libs/php/getNews.php",
                type: "POST",
                dataType: "json",
                data: { country: $("#select-country option:selected").val() },
                beforeSend: function () {
                    $("#loader").removeClass("hidden");
                },
                success: function (e) {
                    console.log(e);
                    let t = $("#news-info-card");
                    t.html("");
                    for (var a = 0; a < e.articles.length; a++)
                        t.append(
                            $(
                                `<div class='newsContener'><div id="card-news"><img class="card-img"src="${e.articles[a].urlToImage}"alt="News Image"></div><div class="d-flex flex-column justify-content-end"><br><a href="${
                                    e.articles[a].url
                                }"target="_blank">${e.articles[a].title}</a><br></div><div class="row infoPanel p-0 m-0"aria-labelledby="headingThree"><strong><p>Author:<span id="articleAuthor">${
                                    e.articles[a].author
                                }</span></p></strong></div><div class="row infoPanel p-0 m-0"aria-labelledby="headingThree"><strong><p>Published at:<span id="published">${window
                                    .moment(e.articles[a].publishedAt)
                                    .format("MMMM Do YYYY, h:mm:ss A")}</span></p></strong></div></div>`
                            )
                        );
                },
                complete: function () {
                    $("#loader").addClass("hidden");
                },
                error: function (e, t, a) {
                    alert("Error: " + a), console.log(e);
                },
            });
    }),
    $("#value").on("keyup", function () {
        $.ajax({
            url: "libs/php/getExchangeRates.php",
            type: "GET",
            dataType: "json",
            base: $("#currencyCode").text(),
            beforeSend: function () {
                $("#loader").removeClass("hidden");
            },
            success: function (e) {
                if ((console.log(e), "ok" == e.status.name)) {
                    var t = Number($("#value").val() / e.exchangeRate.rates[$("#currencyCode").text()]);
                    $("#exchangeResult").html($("#value").val() + "  " + $("#currencySymbol").text() + " = " + t.toFixed(2) + " $");
                }
            },
            complete: function () {
                $("#loader").addClass("hidden");
            },
            error: function (e, t, a) {
                console.log(t, a);
            },
        });
    }),
    (n = L.markerClusterGroup()),
    e.addLayer(n);
const s = L.icon({ iconUrl: "images/earthquakeIcon.png", iconSize: [50, 50], iconAnchor: [25, 45], popupAnchor: [0, -40] });
let i;
(i = L.markerClusterGroup()), e.addLayer(i);
const c = L.icon({ iconUrl: "images/cityIcon.png", iconSize: [50, 50], iconAnchor: [25, 45], popupAnchor: [0, -40] });
const l = { SatelliteMap: o, WSM: a, NatGeoWorldMap: r },
    d = { Cities: i, Earthquakes: n };
L.control.layers(l, d).addTo(e).setPosition("topright"), L.control.scale().addTo(e);

//function to clear currency exchange result button

function clearContent(){
    document.getElementById('exchangeResult').innerHTML = '';
}
