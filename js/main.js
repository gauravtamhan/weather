/*
* Main file for running JS code
*/

let cityArray = [];

$(document).ready(function() {

    displayDayAndTime();
    showHint();
    $('#card-container').on('click', '.shape', function(e) {
        $(this).shape('flip over');
    })

    $('#card-container').on('click', '.btn-remove', function(e) {
        let card = $(this);
        card.closest('.outside').fadeOut('fast', 'linear', function() {
            removeCity($(this).find(".city").first().text());
            $(this).remove();
            showHint();
        });

    })

    $('#city-form').on('submit', function(e) {
        e.preventDefault();
        $('#user-input').blur();
        let input = $('#user-input').val();
        validateInputAndMakeRequest(input);
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


function loadWeatherData(value) {
    let api = "https://api.openweathermap.org/data/2.5/weather?q=";
    city = encodeURIComponent(value.trim());
    let units = "&units=imperial";
    let key = "&appid=c2e34159fe50dfa33d4dfc1b89a3d3fc";
    $.ajax({
        url: api + city + units + key,
        type: "GET",
        dataType: "jsonp",
        beforeSend: showLoader,
        success: function(data) {
            removeHint();
            cityArray.push(value);
            removeLoader();
            generateCard(data);
        },
        error: function(jqXHR, exception) {
            removeLoader();

            let msg = '';
            if (jqXHR.status == 404) {
                msg = "Please enter a valid city name";
            }
            displayError(msg, 'red');
            shakeForm();
        }
    });
}

function displayError(str, color) {
    let colors = {
        'blue': 'rgb(43, 130, 221)',
        'red': 'rgb(235, 95, 107)',
        'orange': 'rgb(251, 148, 41)'
    };

    $('#error-box>p').text(str);
    $('#error-box').css("background-color", colors[color]).slideDown();
    setTimeout(function() {
        $('#error-box').slideUp();
    }, 3000);
}

function showLoader() {
    const template = `
        <div class="outside l">
        <div class="card loading">
            <div class="loading-img-box">
                <img src="imgs/spinner2.gif" />
            </div>
        </div>
        </div>
    `;

    $('#card-container').prepend(template);
}

function removeLoader() {
    $('.l').first().remove(); // here
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
    <div class="outside">
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
                                <p class="label-data">${sunset}</p>
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
                        <h5 class="card-message">Want to remove this card?</h5>
                        <button type="button" class="btn btn-option btn-remove">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    `;

    $('#card-container').prepend(template);
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
    // return "#f6fafd";
}

function showHint() {
    let isEmpty = $.trim($('#card-container').html()) === '';
    if (isEmpty) {
        let hint = `
        <div id="hint">
            <p>Hey there!</p>
            <p>You can add weather cards to your dashboard by entering the name of a city above.</p>
            <p>To remove a weather card, simply click on the card and select 'Remove'</p>
        </div>
        `;
        $('#card-container').append(hint);
    }
}

function removeHint() {
    let hint = $('#hint');
    if (hint.length) {
        hint.remove();
    }
}

function shakeForm() {
    $('#city-form').addClass('shake');
    $('#city-form').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e){
      $('#city-form').delay(200).removeClass('shake');
    });
}

function validateInputAndMakeRequest(str) {
    str = str.toLowerCase();
    if (str === "") {
        displayError("City name cannot be blank", 'orange');
        shakeForm();
    } else if ($.inArray(str, cityArray) < 0) {  // input doesn't exist
        loadWeatherData(str);
    } else {                               // input already exists
        let msg = "City has already been added";
        displayError(msg, 'blue');
        shakeForm();
    }
}

function removeCity(str) {
    let i = cityArray.indexOf(str.toLowerCase());
    cityArray.splice(i, 1);
    console.log(cityArray);
}
