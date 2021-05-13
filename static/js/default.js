function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function consentCookies() {
    if (getCookie('cookieconsent') != "true") {
        document.body.innerHTML += '\
            <div class="cookieconsent">\
            We use cookies to make this site work and we process personal data for security purposes. \
            If You dont consent, please leave the site without logging in.\
            <button id="coconsent">I Understand</button>\
            </div>\
            ';
        document.querySelector('.cookieconsent #coconsent').onclick = function (e) {
            e.preventDefault();
            console.log("clicked Consenting");
            document.querySelector('.cookieconsent').style.display = 'none';
            setCookie("cookieconsent", "true", 7);
            whichLanguage();
        };
    } else { whichLanguage(); }
}

function whichLanguage() {
    return true; // no language support yet -----
    if (getCookie('lcl') == "") {
        document.body.innerHTML += '\
            <div class="locales">\
          This site has different Versions for different Languages. Please specify which Language you want to use.\
          <div class="cookieconsent">\
          This site uses cookies. By continuing to use this website, you agree to their use.\
          <div id="langList" style="flex-direction: row;">\
          <button id="deutsch">Deutsch</button>\
          <button id="english">English</button>\
          </div>\
            </div>\
        ';
        document.querySelector('.locales #deutsch').onclick = function (e) {
            e.preventDefault();
            document.querySelector('.locales').style.display = 'none';
            setCookie("lcl", "de", 365);
            location.reload();
        };
        document.querySelector('.locales #english').onclick = function (e) {
            e.preventDefault();
            document.querySelector('.locales').style.display = 'none';
            setCookie("lcl", "en", 365);
            location.reload();
        };
    }
}

function changeLang(newloc) {
    setCookie("lcl", newloc, 365);
    location.reload();
}