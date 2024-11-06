function getHebChar(i) {
    return (i !== 31 ?  String.fromCharCode('א'.charCodeAt(0) + i) : " ");
}

function reverse(str) {
    return str.split('').reverse().join('');
}

function decrypt(findStr2) {
    var s = "";
    var m = 2; // 0-Prk, 1-Psk
    let i = 1;
    while (i <= 72) {
        s = getHebChar(((findStr2[m]) >> 3)) + s;
        s = getHebChar((((findStr2[m]) & 7) << 2) | ((findStr2[m + 1]) >> 6)) + s;
        s = getHebChar(((findStr2[m + 1]) & 62) >> 1) + s;
        s = getHebChar((((findStr2[m + 1]) & 1) << 4) | ((findStr2[m + 2]) >> 4)) + s;
        s = getHebChar((((findStr2[m + 2]) & 15) << 1) | ((findStr2[m + 3]) >> 7)) + s;
        s = getHebChar(((findStr2[m + 3]) & 124) >> 2) + s;
        s = getHebChar((((findStr2[m + 3]) & 3) << 3) | ((findStr2[m + 4]) >> 5)) + s;
        s = getHebChar((findStr2[m + 4]) & 31) + s;
        m += 5;
        i += 8;
    }
    return s.trim();
}

var output = "";
var EndFile = 0; // amount of verses: 22329
var args = "";
var bookheb = ['תישארב','תומש','ארקיו','רבדמב','םירבד','עשוהי','םיטפוש','א לאומש','ב לאומש', 'א םיכלמ','ב םיכלמ','היעשי','הימרי','לאקזחי','עשוה','לאוי','סומע','הידבוע','הנוי','הכימ','םוחנ','קוקבח','הינפצ', 'יגח','הירכז','יכאלמ','םילהת','ילשמ','בויא','םירישה ריש','תור','הכיא','תלהק','רתסא','לאינד','ארזע','הימחנ', 'א םימיה ירבד','ב םימיה ירבד']; // 39 books
var currBook = reverse(bookheb[0]);
var currBookIdx = 0;
var PPrk = 1;
var PPsk = 999;
var TOTLETTERS = 1;
var verses = [];
var cntLetter = [];
var currBookArr = [];
var torTxt = [];
var torTxtLength = 0;
var PPrkArr = [];
var PPskArr = [];
var found = 0;
var foundInclDups = 0;
cntLetter[0] = 1;

function init() {
    var startTime = new Date();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/shahart/heb-bible/master/BIBLE.TXT', true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined'); // Hack to pass bytes through unprocessed
    xhr.onreadystatechange = function(e) {
      if ( this.readyState === 4 &&
            this.status === 200) {
        var binStr = this.responseText;
        var line = "";
        currBookIdx = 0;
        currBook = reverse(bookheb[0]);
        let findStr2 = [];
        EndFile = 0;
        output = "";
        PPsk = 999;
        PPrk = 1;
        var eof = 0;
        while (eof < binStr.length) {
            findStr2 = [];
            for (var i = 0; i < 47; ++i) {
              var c = binStr.charCodeAt(eof);
              var xbyte = c & 0xff;  // byte at offset i
              findStr2.push(xbyte);
              ++ eof;
            }
            if (findStr2[1] - 31 !== PPsk
                    && line.length > 0) {
                let pasuk = line.replace(/\s+/g, '');
                pasuk = suffix(pasuk);
                TOTLETTERS += pasuk.length;
                for (let g = 0; g < pasuk.length; ++g) {
                    ++ torTxtLength;
                    torTxt[torTxtLength] = pasuk[g];
                }
                ++ EndFile;
                verses[EndFile] = line;
                cntLetter[EndFile] = TOTLETTERS;
                currBookArr[EndFile] = currBook;
                PPskArr[EndFile] = PPsk;
                PPrkArr[EndFile] = PPrk;
                if (findStr2[0] - 31 === 1 && findStr2[1] - 31 === 1 && findStr2[1] - 31 !== PPsk) {
                    ++currBookIdx;
                    currBook = reverse(bookheb[currBookIdx]);
                }
                line = "";
            }
            PPrk = findStr2[0] - 31;
            PPsk = findStr2[1] - 31;
            line = line + " " + decrypt(findStr2);
        }
        let pasuk = line.replace(/\s+/g, '');
        pasuk = suffix(pasuk);
        TOTLETTERS += pasuk.length;
        ++ EndFile;
        verses[EndFile] = line;
        currBookArr[EndFile] = currBook;
        PPskArr[EndFile] = PPsk;
        PPrkArr[EndFile] = PPrk;
        document.getElementById('button1').disabled = false;
        document.getElementById('buttonD').disabled = false;
        var endTime = new Date();
        console.log("Init: " + (endTime - startTime) + " mSec");
      }
    }
    document.getElementById("result").innerHTML = "Total Psukim: " + "";
    xhr.send();
}

function saveInput(cname, cvalue) {
    if (typeof (Storage) !== "undefined") {
        // ~5M max
        localStorage.setItem(cname, cvalue);
    } else {
        // 4K
        const d = new Date();
        let expireInDays = 7;
        d.setTime(d.getTime() + (expireInDays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        var myCookieValue = cvalue;
        document.cookie = cname + "=" + myCookieValue + ";" + expires + ";path=/";
    }
}

function loadInput(cname) {
    if (typeof (Storage) !== "undefined") {
        let res = localStorage.getItem(cname);
        return res || "";
    } else {
        let name = cname + "=";
        let decodedCookie = document.cookie;
        let ca = decodedCookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length).split('\\').join('\n');
            }
        }
        return "";
    }
}

const params = new URLSearchParams(document.location.search);
const firstName = params.get("firstName");
if (firstName && firstName !== '') {
    console.info(firstName);
}

let cookieInput = firstName && firstName !== '' ? firstName : loadInput("input");
if (cookieInput !== "") {
    document.getElementById('text').value = cookieInput;
}
let totalPsukim = firstName && firstName !== '' ? 0 : loadInput("resCount");
if (totalPsukim !== "") {
    document.getElementById("result").innerHTML = "Total Psukim: " + totalPsukim;
}

function suffix(target) {
    target = target.replace(/\u05DA/g, 'כ');
    target = target.replace(/\u05DD/g, 'מ');
    target = target.replace(/\u05DF/g, 'נ');
    target = target.replace(/\u05E3/g, 'פ');
    target = target.replace(/\u05E5/g, 'צ');
    return target;
}

function isValid(i, containsName) {
    let line = verses[i];
    if ((((line.charAt(1) === args.charAt(0) && line.charAt(line.length-1) === args.charAt(args.length-1)) || (containsName && line.indexOf(args) >= 0)))
        ) {
        ++foundInclDups;
        if (output.indexOf(noName(line)) == -1) {
            output += noName(line) + " - " + currBookArr[i] + " " + PPrkArr[i] + "-" + PPskArr[i] + "<br/><br/>";
            ++found;
        }
    }
}

function noName(orig) {
    return orig.replaceAll("יהוה", "ה'");
}

init();

function pasuk() { // same todo as in Pasuk.html
    document.getElementById("result").innerHTML = "";
    let containsName = document.getElementById("containsName").checked;
    args = document.getElementById("text").value;
    if (args.length <= 1 || args.charAt(0) > 'ת' || args.charAt(0) < 'א' || args.charAt(args.length-1) > 'ת' || args.charAt(args.length-1) < 'א') {
        document.getElementById("result").innerHTML = "Invalid name";
    }
    else {
        if (! containsName) {
            var dictionary = {};
            dictionary["אא"] = 43;
            dictionary["אב"] = 34;
            dictionary["אג"] = 2;
            dictionary["אד"] = 33;
            // todo see SvcTest.java output
            var shortName = args.charAt(0) + args.charAt(args.length-1);
            if (dictionary[shortName]) {
                document.getElementById("result").innerHTML = "Total Psukim: " + dictionary[shortName];
            }
        }
        saveInput("input", args);
        output = "";
        found = 0;
        foundInclDups = 0;
        for (let i = 1; i < verses.length; ++i) {
            isValid(i, containsName);
        }
        saveInput('resCount', found);
        document.getElementById("result").innerHTML = "Total Psukim: " + found + "<br/><br/>" + output;
        console.log("withDups: " + foundInclDups + " -- " + args);
        //
        var xhrAws = new XMLHttpRequest();
        xhrAws.open('POST', 'https://z4r74tvfwdi3wywr4aegh4f3di0zhhuo.lambda-url.eu-north-1.on.aws/');
        xhrAws.setRequestHeader("Content-Type", "application/json");
        xhrAws.send(JSON.stringify({ "name": args, "containsName": containsName }));
        xhrAws.onreadystatechange = function(e) {
          if ( xhrAws.readyState === 4 &&
                xhrAws.status === 200) {
            console.log("Java " + this.responseText + " -- " + args);
            if (this.responseText != "Total Psukim: " + foundInclDups) {
                // alert("Total Psukim diff was found, please contact shahar_t AT hotmail. Java " + this.responseText + " -- " + "JS Total Psukim: " + foundInclDups + " -- " + args);
            }

          }
        }
        xhrAws.send();
    }
}

if (firstName && firstName !== '') {
    pasuk();
}

function indVrsRange(cntLtr, indLowVrs, indHigVrs) {
    if (indLowVrs == indHigVrs) {
        return indLowVrs;
    }
    else {
        var indMidVrs = Math.ceil((indLowVrs + indHigVrs) / 2);
        if (cntLtr < cntLetter[indMidVrs]) {
            return indVrsRange(cntLtr, indLowVrs, indMidVrs-1);
        }
        else {
            return indVrsRange(cntLtr, indMidVrs, indHigVrs);
        }
    }
}

function dilug() {
    var skipMin = Math.ceil(document.getElementById("skipMin").value);
    if (skipMin < 0) { skipMin = 1; }
    var skipMax = Math.ceil(document.getElementById("skipMax").value);
    if (skipMax < 0) { skipMax = 1; }
    if (skipMax >= 10000) { skipMax = 9999 ; }
    var startTime = new Date();
    // todo document.getElementById('buttonD').disabled = true;
    document.getElementById("resultDilug").innerHTML = "";
    args = document.getElementById("dilugTxt").value;
    var found = 0;

    var target = args.replace(/\s+/g, ''); // remove spaces
    if (!(/^[\u05D0-\u05EA]+$/).test(target)) {
        alert("הטקסט לחיפוש חייב להכיל רק אותיות בעברית ורווחים");
        return;
    }
    target = suffix(target);
    var targetLen = target.length;

    for (let iSkip = skipMin; iSkip <= skipMax; ++ iSkip) {
        lastInd = TOTLETTERS - (targetLen-1) * iSkip;
        for (let j = 0; j < lastInd; j++) { // loop on Torah
            match = true;
            for (let k = 0; k < targetLen; k++) { // loop on target
                if (torTxt[j+k*iSkip] != target[k]) {
                    match = false;
                    break;
                }
            }
            if (!match) {
                match = true;
                for (let k = 0; k < targetLen; k++) { // loop on target
                    if (torTxt[j+k*iSkip] != target[targetLen-k-1]) {
                        match = false;
                        break;
                    }
                }
            }
            if (match) {
                var foundStr = "דילוג של " + iSkip + " החל ממיקום " + (j+1).toString() + "<br>";
                var idx = indVrsRange(j+1, 0, EndFile-1) + 1;
                foundStr += verses[idx] + " - " + currBookArr[idx] + " " + PPrkArr[idx] + "-" + PPskArr[idx];

                let txt = "";
                for (let h = j; h <= j+ targetLen * iSkip; ++h) {
                    txt += torTxt[h];
                }
                foundStr += "<pre>";
                for (let h = 0; h < targetLen; ++h) {
                    foundStr += "<br>" + "<b>" + txt[(h)*iSkip] + "</b>"  + txt.substring(h*iSkip+1, (h+1)*iSkip) ;
                }
                foundStr += "</pre>";
                document.getElementById("resultDilug").innerHTML = foundStr;
                found++;
                j = lastInd;
                iSkip = skipMax + 1;
            }
        }
        // todo document.getElementById('buttonD').disabled = false;
    }
    if (found == 0) {
        document.getElementById("resultDilug").innerHTML = "Not found";
    }
    var endTime = new Date();
    console.log((endTime - startTime) + " mSec");

    //
    var xhrAws = new XMLHttpRequest();
    xhrAws.open('POST', 'https://z4r74tvfwdi3wywr4aegh4f3di0zhhuo.lambda-url.eu-north-1.on.aws/');
    xhrAws.setRequestHeader("Content-Type", "application/json");
    xhrAws.send(JSON.stringify({ "name": args, "found": (found >= 1), "dilugim": true }));
    xhrAws.onreadystatechange = function(e) {
      if ( xhrAws.readyState === 4 &&
            xhrAws.status === 200) {
        console.log(this.responseText);
      }
    }
    xhrAws.send();
}

