$(document).ready(backgroundColorCheck);
getNewContent();

var scrollbar = Scrollbar.init(document.querySelector('.scroller'), {
    damping: 0.15,
    renderByPixels: false
});

var cors_api_url = 'https://cors-anywhere.herokuapp.com/';

function doCORSRequest(options, printResult) {
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
        printResult(
            options.method + ' ' + options.url + '\n' +
            x.status + ' ' + x.statusText + '\n\n' +
            (x.responseText || '')
        );
    };
    if (/^POST/i.test(options.method)) {
        x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    x.send(options.data);
}
var loaded = false;
var canRender = false;
// Bind event
function getNewContent() {
    var urlField = '';
    $('#get').on('click', function() {
        console.log("clicked");
        urlField = $(this).attr('next-url');
        doCORSRequest({
            method: 'GET',
            url: urlField,
        }, function printResult(result) {
            loaded = true;
            var htmlStr = $($.parseHTML(result));
            var mainContainer = htmlStr.find('.main-container').first().contents();
            var pageContent = mainContainer;
            var nextContainer = htmlStr.find('.main-container').get(1);

            $('.main-container').last().append(pageContent);
            $('.scroll-content').append(nextContainer);
            forceReloadJS('https://uploads-ssl.webflow.com/');

        });
    });
}
scrollbar.addListener(function() {
    let elm = $('#get').get(0);
    if (elm) {
        //      console.log("found");
        let elmRect = elm.getBoundingClientRect();
        if (elmRect.y <= 2 && loaded == false) {
            $('.main-container').get(0).remove();
            $('#get').trigger('click');
            loaded = true;
        }
    }
    backgroundColorCheck();
});

function backgroundColorCheck() {
    var darkBg = $('.dark-bg');
    var headerRect = $('header').get(0).getBoundingClientRect();
    var headerRectBottom = headerRect.top + headerRect.height / 2;
    darkBg.each(function(i, el) {
        var darkBgRect = el.getBoundingClientRect();
        var darkBgRectBottom = darkBgRect.top + darkBgRect.height;
        if (darkBgRect.top < headerRectBottom) {
            $('header').addClass('ondark');
            $('.logo-container img').attr('src', 'https://uploads-ssl.webflow.com/5e308160a637f2d883b60a59/5e308160a637f20b3fb60b31_funf-white.svg');
            if (darkBgRectBottom < headerRectBottom) {
                $('header').removeClass('ondark');
                $('.logo-container img').attr('src', 'https://uploads-ssl.webflow.com/5e308160a637f2d883b60a59/5e308160a637f23a6ab60aae_logo-funf.svg');
            }
        }
    });
}

function forceReloadJS(srcUrlContains) {
    $.each($('script:empty[src*="' + srcUrlContains + '"]'), function(index, el) {
        var oldSrc = $(el).attr('src');
        var t = +new Date();
        var newSrc = oldSrc + '?' + t;
        $(el).remove();
        $('<script/>').attr('src', newSrc).appendTo('body');
    });
}

var target = $('.main-container').get(1);
var observer = new MutationObserver(function(mutation) {
    if (mutation[0].addedNodes.length) {
        $('#get').get(0).remove();
        canRender = true;
        loaded = false;
        getNewContent();
    }
});
var config = {
    attributes: true,
    childList: true,
    characterData: true
}
observer.observe(target, config);
