/*
* Main file for running JS code
*/

$(document).ready(function() {

    displayDayAndTime();
    loadWeatherData("amsterdam");
    loadWeatherData("new york");
    loadWeatherData("london");


    $('#card-container').on('click', '.shape', function(e) {
        $(this).shape('flip over');
    })

    $('#card-container').on('click', '.btn-remove', function(e) {
        $(this).closest('.shape').remove()
    })


    $('#add-city').click(function(e) {
        let input = $('#user-input').val();
        loadWeatherData(input);
    })
});



function displayDayAndTime() {
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var d = new Date();

    var day = weekdays[d.getDay()];
    var time = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    $('#local-day-and-time').text(day + ', ' + time);

    setTimeout(displayDayAndTime, 1000);
}


function loadWeatherData(city) {
    let api = "https://crossorigin.me/http://api.openweathermap.org/data/2.5/weather?q=";
    city = encodeURIComponent(city.trim());
    let units = "&units=imperial"
    let key = "&appid=c2e34159fe50dfa33d4dfc1b89a3d3fc"
    $.ajax({
        url: api + city + units + key,
        type: "GET",
        dataType: "jsonp",
        beforeSend: showLoader,
        success: function(data) {
            removeLoader();
            generateCard(data);
        },
        error: function() {
            removeLoader();
            console.log("Something went wrong!");
        }
    });
}

function showLoader() {
    const template = `
        <div class="card loading">
            <div class="loading-img-box">
                <img src="imgs/spinner2.gif" />
            </div>
        </div>
    `;

    $('#card-container').append(template);
}

function removeLoader() {
    $('.loading').last().remove();
}

function generateCard(obj) {
    let city =          obj.name;
    let currentTemp =   Math.round(obj.main.temp);
    let hiTemp =        Math.round(obj.main.temp_max);
    let loTemp =        Math.round(obj.main.temp_min);
    let humidity =      Math.round(obj.main.humidity);
    let desc =          obj.weather[0].description;
    let icon =          determineIcon(obj.weather[0].id);
    let windSpeed =     Math.round(obj.wind.speed);
    let windDir =       getCardinalDir(obj.wind.deg);
    let sunrise =       getLocalTime(obj.sys.sunrise);
    let sunset =        getLocalTime(obj.sys.sunset);
    let gradient =      getGradient(obj.weather[0].id);

    const template = `
    <div class="ui shape">
        <div class="sides">
            <div class="active side">
                <div class="card" style="background:${gradient}">
                    <div class="card-body">
                        <h3 class="city">${city}</h3>
                        <div class="data-row t1 mar-neg">
                            <div class="data-left">
                                <span class="current-temp">${currentTemp}°</span>
                                <p class="temp-bounds">H: ${hiTemp}° / L: ${loTemp}°</p>
                            </div>
                            <div class="data-right">
                                <img class="icon" src="imgs/icons/${icon}.png" />
                                <p class="desc">${desc}</p>
                            </div>
                        </div>
                        <div class="data-row d1 mar-mor">
                            <div class="data-left">
                                <p class="label">sunrise</p>
                                <p class="label-data">${sunrise}</p>
                            </div>
                            <div class="data-right">
                                <p class="label">sunset</p>
                                <p class="label-data">${sunrise}</p>
                            </div>
                        </div>
                        <div class="data-row d2">
                            <div class="data-left">
                                <p class="label">wind</p>
                                <p class="label-data">${windDir? windDir : ''} ${windSpeed} mph</p>
                            </div>
                            <div class="data-right">
                                <p class="label">humidity</p>
                                <p class="label-data"> ${humidity}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="side">
                <div class="card card-back">
                    <div class="card-body">
                        <h5 class="card-message">Do you want to remove this card?</h5>
                        <button type="button" class="btn btn-option btn-remove">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    $('#card-container').append(template);
}

function getLocalTime(sec) {
    let d = new Date(0)
    d.setUTCSeconds(sec);
    return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function getCardinalDir(n) {
    let val = Math.floor((n / 22.5) + 0.5);
    const cardinals = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return cardinals[(val % 16)];
}


function determineIcon(id) {
    const map = {
        2: "thunder",
        3: "drizzle",
        5: "rain",
        6: "snow",
        7: "atmos",
        8: "clear",
        9: "unknown"
    }
    let val = map[Math.floor(id / 100)];

    if (val === 'snow') {
        if (id === 600) {
            val = "flurry";
        } else if (id > 610) {
            val = "sleet";
        }
    }

    if (val === 'clear') {
        if (id === 801) {
            val = "few-clouds";
        } else if (id === 802 || id === 803) {
            val = "more-clouds";
        } else if (id === 804) {
            val = "cloudy";
        }
    }

    return val;
}

function getGradient(id) {
    let arr = [
        "white",
        "white",
        "linear-gradient(135deg, #f5f7fa 0%, #b3bfd2 100%)",
        "linear-gradient(15deg, #accbee 0%, #e7f0fd 100%)",
        "linear-gradient(15deg, #accbee 0%, #e7f0fd 100%)",
        "linear-gradient(15deg, #accbee 0%, #e7f0fd 100%)",
        "linear-gradient(325deg, #e9defa 0%, #fbfcdb 100%)",
        "linear-gradient(60deg, #fff1eb 0%, #ace0f9 100%)",
        "linear-gradient(325deg, #d299c2 0%, #fef9d7 100%)",
        "white"
    ]
    let index = Math.floor(id / 100);
    return arr[index];
}
