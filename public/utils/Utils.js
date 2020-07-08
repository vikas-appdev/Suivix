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

const displayUserProfile = function(lang) {
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
            document.getElementById("username-connected").innerHTML = response.username;
            document.getElementById("discriminator").innerHTML = response.discriminator;
            document.getElementById("requestID").innerHTML = response.requestID;
            displayChangelog(lang, document.getElementById("version"), document.getElementById("changelogText"));

            if (response.requestID) {
                initSelect2ChannelList($("#select-options"), "100%", response.requestID, false, lang);
                initSelect2RoleList($("#select-options-2"), "95%", response.requestID, lang);
                includeHTML();
                document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } else {
                redirect("ATTENDANCE_NOREQUEST");
            }

        }
        request.send();
    }
    request.send();

}

function checkForQuickAttendance(channel, role, requestID) {
    if (channel && role) {
        quickAttendance(channel, role, requestID)
    }
}

const quickAttendance = function(channel, role, requestID) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/roles`, window), true)
    request.setRequestHeader("RequestID", requestID);
    let roleID;
    request.onload = function() {
        const response = JSON.parse(this.response);
        if (this.status === 404) {
            redirect("ATTENDANCE_NOREQUEST");
            return;
        }
        let roles = [];
        for (var i = 0; i < response.length; i++) {
            roles[i] = response[i];
        }
        roleID = roles.find(r => r.name === role).id;
        let channelID;
        request.open('GET', getUrl(`api/get/channels`, window), true)
        request.setRequestHeader("RequestID", requestID);
        request.onload = function() {
            const response = JSON.parse(this.response);
            let channels = [];
            for (var i = 0; i < response.length; i++) {
                channels[i] = response[i];
            }
            channelID = channels.find(c => c.name === channel).id;
            redirect("ATTENDANCE_PAGE_DONE", `requestID=${requestID}&channels=${channelID}&roles=${roleID}`);
        }
        request.send();
    }
    request.send();

}

function goToRoles(channelsList, requestID) {
    if (!channelsList) return;
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/channels`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        let channels = [];
        for (var i = 0; i < response.length; i++) {
            channels[i] = response[i];
        }
        if (channelsList.length === 1) {
            const channel = channelsList[0];
            let channelName = channel.substring(channel.indexOf(')') + 2)
            let channelID = channels.find(c => c.name === channelName).id;
            redirect("ATTENDANCE_PAGE_OPTION_2", `requestID=${requestID}&channels=${channelID}`);
        } else {
            let choosenChannels = [];
            for (let i = 0; i < channelsList.length; i++) {
                let channelName = channelsList[i].substring(channelsList[i].indexOf(')') + 2)
                choosenChannels.push(channels.find(c => c.name === channelName).id);
            }
            redirect("ATTENDANCE_PAGE_OPTION_2", `requestID=${requestID}&channels=${choosenChannels.join('-')}`);
        }

    }
    request.send();
}

function goToDone(channelID, rolesList, requestID) {
    if (!rolesList) return;
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
            let roleID = roles.find(r => r.name === rolesList[0]).id;
            redirect("ATTENDANCE_PAGE_DONE", `requestID=${requestID}&channels=${channelID}&roles=${roleID}`);
        } else {
            let choosenRoles = [];
            for (let i = 0; i < rolesList.length; i++) {
                choosenRoles.push(roles.find(r => r.name === rolesList[i]).id);
            }
            redirect("ATTENDANCE_PAGE_DONE", `requestID=${requestID}&channels=${channelID}&roles=${choosenRoles.join('-')}`);
        }

    }
    request.send();
}

function initSelect2RoleList(select, width, requestID, lang) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/roles`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        if (this.status === 404) {
            redirect("ATTENDANCE_NOREQUEST");
            return;
        }
        let roles = [];
        for (var i = 0; i < response.length; i++) {
            roles[i] = response[i].name;
        }
        const placeholder = lang === "fr" ? "Rôles" : "Roles";
        initSelect2(select, placeholder, width, roles.sort(), 6)
        setTimeout(() => {
            hideLoader(document);
        }, 350)
    }
    request.send();
}

function initSelect2ChannelList(select, width, requestID, parents, lang) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(`api/get/channels`, window), true)
    request.setRequestHeader("RequestID", requestID);
    request.onload = function() {
        const response = JSON.parse(this.response);
        if (this.status === 404) {
            redirect("ATTENDANCE_NOREQUEST");
            return;
        }
        const channelsJSON = response;
        let channels = [];
        request.open('GET', getUrl(`api/get/categories`, window), true)
        request.setRequestHeader("RequestID", requestID);
        request.onload = function() {
            const response = JSON.parse(this.response);
            for (var i = 0; i < channelsJSON.length; i++) {
                channels[i] = parents ? `(${parseCategory(response[channelsJSON[i].id])}) ` + channelsJSON[i].name : channelsJSON[i].name;
            }
            const placeholder = lang === "fr" ? "Salons" : "Channels";
            initSelect2(select, placeholder, width, channels.sort(), 4)
            setTimeout(() => {
                hideLoader(document);
            }, 350)
        }
        request.send()
    }
    request.send();
}

const parseCategory = function(name) {
    return name.length > 15 ? name.substring(0, 15) + "..." : name;
}

function hideLoader(document) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    const content = document.getElementById('content');
    if (content) content.style.display = 'block';

    const quickAttendance = document.getElementById('quickAttendance');
    if (quickAttendance) quickAttendance.style.display = 'block';
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

function initSelect2(select, placeholder, width, data, max) {
    select.select2({
        minimumResultsForSearch: -1,
        placeholder: placeholder,
        width: width,
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
    document.cookie = `timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}` + `;domain=${window.location.host};path=/`;
}

const getRandomBackground = function() {
    return `<img src="/ressources/backgrounds/background-${Math.floor(Math.random() * (6 - 1 + 1) + 1)}.jpg" alt=""></div>`
}

function includeHTML() {
    var includes = $('[data-include]');
    jQuery.each(includes, function() {
        var request = new XMLHttpRequest()
        request.open('GET', getUrl(`api/get/url`, window), true)
        request.setRequestHeader("Route", $(this).data('include'))
        const element = $(this);
        request.onload = function() {
            if (request.status == 404) {
                element.remove();
                return;
            }
            const url = JSON.parse(this.responseText).route.substring(1);
            element.load(getUrl(url, window));
        }
        request.send();
    });
}

function askCookies(lang) {
    if (!localStorage.getItem('cookieconsent')) {
        if (lang === "en") {
            document.getElementById("cookies").innerHTML += '\
            <div class="cookieconsent" style="position:fixed;padding:20px;left:0;bottom:0;background-color:#18191c;color:#FFF;text-align:center;width:100%;z-index:99999;">' +
                'Suivix uses cookies to work. By continuing to use this website, you agree to their use.' + " ‎ ‎" +
                '<a href="#" style="color:#CCCCCC;">‎‎‎' + 'I Understand' + '</a></div>';
        } else {
            document.getElementById("cookies").innerHTML += '\
            <div class="cookieconsent" style="position:fixed;padding:20px;left:0;bottom:0;background-color:#18191c;color:#FFF;text-align:center;width:100%;z-index:99999;">' +
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

function getServers(language) {
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
            let i = 0;
            const lang = language === "en" ? 0 : 1;
            const owner = ["Server owner", "Propriétaire du serveur"];
            const errorLoading = ["Error while loading server list.", "Erreur durant le chargement des serveurs."];
            const attendance = ["Take Attendance", "Faire un suivi"];
            const add = ["Add Suivix", "Ajouter Suivix"];
            const showMore = ["Show More", "Afficher Plus"];
            const showLess = ["Show Less", "Afficher Moins"];

            for (var k in response) {
                $(".servers").append("<div class='server-card" + (i >= 6 ? " expand" : "") + "'><div class='server-content'><div class='server-infos'><img class='server-icon'src='" +
                    (response[k].icon ? `https://cdn.discordapp.com/icons/${response[k].id}/${response[k].icon}.jpg` : "/ressources/unknown-server.png") + "'>" +
                    "<h2 class='colorStandard size16 server-name'>" + (response[k].name ? response[k].name + (response[k].owner ? " <i class='fas fa-crown yellow' title='" + owner[lang] + "'></i>" : "") : errorLoading[lang]) + "</h2><button class='" + (response[k].suivix === "A" ? "blue-btn" : "btn-dark") + " btn-small server-name server-button' onclick=\"" +
                    (response[k].suivix === "A" ? "redirect(`ATTENDANCE_NEWREQUEST`, 'guild_id=" + response[k].id + "');" : "redirect(`API_INVITE_URL`, 'guild_id=" + response[k].id + "');") + "\">" +
                    (response[k].suivix === "A" ? attendance[lang] : add[lang]) + "</button></div></div></div>");
                if (i === 5) {
                    $('.servers').append("<div class='expand-card''><div class='expand-content'><div class='expand-add'><p>" + showMore[lang] + "</p></div></div></div>");
                    $('.expand-card').click(function(e) {
                        $(this).hide();
                        $(".expand").show();
                    })
                }
                i++;
            }
            $('.servers').append("<div class='expand-card expand contract'><div class='expand-content'><div class='expand-add'><p>" + showLess[lang] + "</p></div></div></div>")
            $('.contract').click(function(e) {
                $(".expand").hide();
                $(".expand-card").show();
                $(this).hide();
            })
            $("[id=loader]").hide();
        }
        request.send();
    }
    headers.send();

}