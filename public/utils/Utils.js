console.log('   _____         _         _       \n  / ____|       (_)       (_)      \n | (___   _   _  _ __   __ _ __  __\n  \\___ \\ | | | || |\\ \\ / /| |\\ \\/ /\n  ____) || |_| || | \\ V / | | >  < \n |_____/  \\__,_||_|  \\_/  |_|/_/\\_\\\n────────────────────────────────────\nConsole de déboguage. (Si vous n\'êtes pas développeur, il est déconseillé d\'aller plus loin.)')

const getUrl = function(url, window) {
    var location = window.location;
    return location.protocol + "//" + location.host + "/" + location.pathname.split('/')[0] + url;
}

function httpGetRequest(url, token) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.setRequestHeader("Authorization", token)
    return request;
}

const initAttendance = function(lang) {
    var request = new XMLHttpRequest()
    request.open('HEAD', document.location, true);
    request.onload = function() {
        let access_token = this.getResponseHeader("Access_token");
        request.open('GET', getUrl(`api/get/user`, window), true)
        request.setRequestHeader("Access_token", access_token)
        request.onload = function() {
            const response = JSON.parse(this.response);
            if (!response.username) {
                redirect("DISCORD_OAUTH_CALLBACK_URL", window, undefined);
                return;
            }
            document.getElementById("username").innerHTML = response.username;
            document.getElementById("requestID").innerHTML = response.requestID;
            document.getElementById("discriminator").innerHTML = "#" + response.discriminator;
            document.getElementById("avatar").src = response.avatar ? "https://cdn.discordapp.com/avatars/" + response.id + "/" + response.avatar : "https://cdn.discordapp.com/embed/avatars/2.png";
            $("#user-loader").hide();
            $("#user-loader-image").hide();
            $("#user-infos").show();

            displayChangelog(lang, document.getElementById("version"), document.getElementById("changelogText"));

            if (response.requestID) {
                initSelect2ChannelList(response.requestID, true, lang);
                initSelect2RoleList(response.requestID, lang);
                document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } else {
                redirect("ATTENDANCE_NOREQUEST");
            }

        }
        request.send();
    }
    request.send();

}

function doAttendance(requestID) {
    getSelectedChannels(requestID)
}

function getSelectedChannels(requestID) {
    const channelsList = $("#select-1").val();
    if (channelsList.length === 0) {
        shake();
        return;
    };
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/channels`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        if (this.status === 404) {
            redirect("ATTENDANCE_NOREQUEST", undefined);
            return;
        }
        let channels = [];
        for (var i = 0; i < response.length; i++) {
            channels[i] = response[i];
        }
        if (channelsList.length === 1) {
            const channel = channelsList[0];
            let channelName = channel.substring(channel.indexOf(')') + 2);
            let channelID = channels.find(c => c.name === channelName).id;
            getSelectedRoles(requestID, channelID);
        } else {
            let choosenChannels = [];
            for (let i = 0; i < channelsList.length; i++) {
                let channelName = channelsList[i].substring(channelsList[i].indexOf(')') + 2)
                choosenChannels.push(channels.find(c => c.name === channelName).id);
            }
            getSelectedRoles(requestID, choosenChannels.join('-'));
        }

    }
    request.send();
}

function getSelectedRoles(requestID, selectedChannels) {
    const rolesList = $("#select-2").val();
    if (rolesList.length === 0) {
        shake();
        return;
    }
    $(".btn").hide();
    $("#loading").show();
    setInterval(() => {
        $("#loading").hide();
    }, 1000);
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/roles`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        let roles = [];
        for (var i = 0; i < response.length; i++) {
            roles[i] = response[i];
        }
        if (rolesList.length === 1) {
            redirect("ATTENDANCE_PAGE_DONE", `requestID=${requestID}&channels=${selectedChannels}&roles=${roles.find(r => r.name === rolesList[0]).id}`);
        } else {
            let choosenRoles = [];
            for (let i = 0; i < rolesList.length; i++) {
                choosenRoles.push(roles.find(r => r.name === rolesList[i]).id);
            }
            redirect("ATTENDANCE_PAGE_DONE", `requestID=${requestID}&channels=${selectedChannels}&roles=${choosenRoles.join('-')}`);
        }

    }
    request.send();
}

function initSelect2RoleList(requestID, lang) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/roles`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        if (this.status === 404) {
            return;
        }
        let roles = [];
        for (var i = 0; i < response.length; i++) {
            roles[i] = response[i].name;
        }
        const placeholder = (lang === "fr" ? "Rôles" : "Roles") + " 📚";
        document.getElementById("select-roles").innerHTML = "<select id='select-2'multiple><option > <select></option></select > ";
        initSelect2($("#select-2"), placeholder, roles.sort(), 6)
    }
    request.send();
}

function initSelect2ChannelList(requestID, parents, lang) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/channels`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        if (this.status === 404) {
            return;
        }
        const channelsJSON = response;
        let channels = [];
        request.open('GET', getUrl(`api/get/categories`, window), true)
        request.setRequestHeader("RequestID", requestID);
        request.onload = function() {
            const response = JSON.parse(this.response);
            for (var i = 0; i < channelsJSON.length; i++) {
                channels[i] = parents ? ` (${parseCategory(response[channelsJSON[i].id])}) ` + channelsJSON[i].name : channelsJSON[i].name;
            }
            const placeholder = (lang === "fr" ? "Salons" : "Channels") + " 🎧";
            document.getElementById("select-channels").innerHTML = "<select id='select-1'multiple><option > <select> </option></select > ";
            initSelect2($("#select-1"), placeholder, channels.sort(), 4)
        }
        request.send()
    }
    request.send();
}

function clearSelection() {
    $('#select-1').val('').trigger('change');
    $('#select-2').val('').trigger('change');
}

function deleteRequest() {
    redirect("ATTENDANCE_SERVERS", undefined)
}

const parseCategory = function(name) {
    return name.length > 30 ? name.substring(0, 30) + "..." : name;
}


function redirect(route, params) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/url`, window), true)
    request.setRequestHeader("Route", route)
    request.onload = function() {
        const response = JSON.parse(this.response);
        window.location.href = window.location.protocol + "//" + window.location.host + response.route + (params !== undefined ? "?" + params : "");
    }
    request.send();
}

function initSelect2(select, placeholder, data, max) {
    select.select2({
        minimumResultsForSearch: -1,
        placeholder: placeholder,
        width: "100%",
        data: data,
        maximumSelectionLength: max,
        language: "fr"
    });
    select.on('select2:opening select2:closing', function(event) {
        var $searchfield = $('#' + event.target.id).parent().find('.select2-search__field');
        $searchfield.prop('disabled', true);
    });
}

function $_GET(param, window) {
    var vars = {};
    window.location.href.replace(location.hash, '').replace(
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function(m, key, value) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if (param) {
        return vars[param] ? vars[param] : null;
    }
    return vars;
}

function saveTimezoneCookie() {
    document.cookie = `
        timezone = ${ Intl.DateTimeFormat().resolvedOptions().timeZone }
        ` + `;
        domain = ${ window.location.host };
        path = /`;
}

const getRandomBackground = function() {
    return `<img src="/ressources/backgrounds/background-${Math.floor(Math.random() * (6 - 1 + 1) + 1)}.jpg" alt=""></div>`
}

function askCookies(lang) {
    if (!localStorage.getItem('cookieconsent')) {
        if (lang === "en") {
            document.getElementById("cookies").innerHTML += '<div class="cookieconsent" style="position:fixed;padding:20px;left:0;bottom:0;background-color:#18191c;color:#FFF;text-align:center;width:100%;z-index:99999;">' +
                'Suivix uses cookies to work. By continuing to use this website, you agree to their use.' + " ‎ ‎" +
                '<a href="#" style="color:#CCCCCC;">‎‎‎' + 'I Understand' + '</a></div>';
        } else {
            document.getElementById("cookies").innerHTML += '<div class="cookieconsent" style="position:fixed;padding:20px;left:0;bottom:0;background-color:#18191c;color:#FFF;text-align:center;width:100%;z-index:99999;">' +
                'Suivix a besoin de cookies pour fonctionner correctement et faciliter votre utilisation. En continuant d\'utiliser ce site, vous acceptez leur utilisation.' + " ‎ ‎" +
                '<a href="#" style="color:#CCCCCC;">‎‎‎' + 'J\'ai Compris' + '</a></div>';
        }
        document.querySelector('.cookieconsent a').onclick = function(e) {
            e.preventDefault();
            document.querySelector('.cookieconsent').style.display = 'none';
            localStorage.setItem('cookieconsent', true);
        };
    }
}

function displayChangelog(lang, versiondiv, textdiv) {
    const lastDisplayedVersion = localStorage.getItem('lastDisplayedVersion');
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/changelog`, window), true);
    request.onload = function() {
        const json = JSON.parse(this.responseText)
        if (!json.version) return;
        const text = lang === "fr" ? json.fr : json.en;
        const version = json.version;
        if (lastDisplayedVersion === null || parseFloat(lastDisplayedVersion) < parseFloat(version) || !lastDisplayedVersion.includes(".")) {
            versiondiv.innerHTML = version;
            textdiv.innerHTML = text;
            $('#overlay').fadeIn(300);
            $('#close').click(function() {
                localStorage.setItem('lastDisplayedVersion', version);
                closeChangelog();
            });
        }
    }
    request.send();
}

function closeChangelog() {
    $('#overlay').fadeOut(300);
}

function initServerSelection(language) {
    let headers = new XMLHttpRequest();
    headers.open('HEAD', document.location, true);
    headers.onload = function() {
        let access_token = this.getResponseHeader("Access_token");
        if (access_token === "undefined") {
            redirect("DISCORD_OAUTH_CALLBACK_URL", "redirect=false");
            return;
        }
        let request = new XMLHttpRequest();
        request.open('GET', getUrl(`api/get/user/guilds`, window), true)
        request.setRequestHeader("Access_token", access_token)
        request.onload = function() {
            const response = JSON.parse(this.response);
            const lang = language === "en" ? 0 : 1;
            const add = ["Add Suivix", "Ajouter Suivix"];
            let i = 0;
            let isOnSupport = false;
            for (var k in response) {
                if (response[k].id === "705806416795009225") {
                    $("#support").click(function() {
                        redirect(`ATTENDANCE_NEWREQUEST`, 'guild_id=705806416795009225');
                    });
                    isOnSupport = true;
                    continue;
                };
                if (!response[k].suivix && (response[k].permissions & 0x20) !== 32) continue;
                $(".servers").append('<div class="server-card" id="' + response[k].id + '" suivix="' + response[k].suivix + '">' +
                    (response[k].suivix ? "" : '<button' +
                        ' class="add" title="' + add[lang] + '"><i class="fas fa-plus"></i></button>') +
                    '<p>' + response[k].name + '<img src="' +
                    (response[k].icon ? `https://cdn.discordapp.com/icons/${response[k].id}/${response[k].icon}.jpg` : "/ressources/unknown-server.png") +
                    '"></p>' + '</div>');
                $("#" + response[k].id).click(function() {
                    if ($(this).attr('suivix') === "true")
                        redirect(`ATTENDANCE_NEWREQUEST`, 'guild_id=' + $(this).attr('id'));
                    else {
                        redirect(`API_INVITE_URL`, 'guild_id=" + response[k].id + "');
                    }
                })
                i++;
            }
            if (!isOnSupport) {
                $("#support").html('<button class="add" title="Join Suivix Support Server"><i class="fas fa-arrow-right"></i></i></button><p>Suivix © Support<img src="/ressources/support-icon.png"></p>')
                $("#support").click(function() {
                    redirect(`API_SUPPORT_URL`, undefined);
                });
            }
            $(".load").css("display", "none");
            const height = i === 1 ? i * 48 + 48 : i * 48;
            $(".servers-container").css("height", height > 145 ? 145 : height + "px")
        }
        request.send();
    }
    headers.send();

}

function initParallax() {

    if (!$('.parallax div')) return;
    var currentX = '';
    var currentY = '';
    var movementConstant = .004;
    $(document).mousemove(function(e) {
        if (currentX == '') currentX = e.pageX;
        var xdiff = e.pageX - currentX;
        currentX = e.pageX;
        if (currentY == '') currentY = e.pageY;
        var ydiff = e.pageY - currentY;
        currentY = e.pageY;
        $('.parallax div').each(function(i, el) {
            var movement = (i + 1) * (xdiff * movementConstant);
            var movementy = (i + 1) * (ydiff * movementConstant);
            var newX = $(el).position().left + movement;
            var newY = $(el).position().top + movementy;
            $(el).css('left', newX + 'px');
            $(el).css('top', newY + 'px');
        });
    });
}
//initParallax();


function shake() {
    $("#card").effect("shake");
}