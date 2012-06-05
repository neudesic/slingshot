function loadjscssfile(filename, filetype) {
    if (filetype == "js") {
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype == "css") {
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

switch (BrowserDetect.browser.toLowerCase()) {
    case "chrome":        
        loadjscssfile("Styles/android/android-theme.css", "css");
        var DEBUG_ANDROID_THEME = true;
        loadjscssfile("Styles/android/jquery.mobile.android-theme.js", "js");        
        break;		
    case "mozilla": //Android
        loadjscssfile("Styles/android/android-theme.css", "css");
        var DEBUG_ANDROID_THEME = true;
        loadjscssfile("Styles/android/jquery.mobile.android-theme.js", "js");                
        loadjscssfile("Scripts/Android/cordova-1.7.0.js", "js");        
        break;
    case "safari": //iOS
        loadjscssfile("Styles/default/jquery.mobile-1.1.0.min.css", "css");
        loadjscssfile("Scripts/iOS/cordova-1.7.0.js", "js");
        break;
    default:
        //TODO:
        break;
}