document.addEventListener('DOMContentLoaded', function() {
    function updateState() {
        chrome.storage.local.get(null, function(items) {
            var urls = '';

            for (const [key, value] of Object.entries(items)) {
                urls = urls + '<p>'+ key +'</p>'
            }
            document.getElementById('scrapedUrls').innerHTML = urls;
            console.log(Object.values(items))
        });
    }
    updateState();

    // listen for download button clicks
    var downloadbtn = document.getElementById('download');
    downloadbtn.addEventListener('click', function() {
        chrome.storage.local.get(null, function (items) {
            var text = 'URL, TITLE, PRICES, IMAGES, COLORS, SIZES, DESCRIPTION \n';

            for (const [key, value] of Object.entries(items)) {
                text = text + '\"' + key + '\",' + value +'\n';
            }

            var element = document.createElement('a');

            element.setAttribute('href', 'data:text/csv;charset=UTF-8-BOM,' + encodeURIComponent(text));
            element.setAttribute('download', 'strawberry-data.csv');

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);

            chrome.storage.local.clear();

            updateState();
        });
    });

    // Listen for scraping
    var checkPageButton = document.getElementById('scrapeNow');
    checkPageButton.addEventListener('click', function() {
        async function scrapeDom() {
            if (window.location.href.indexOf('https://strawberrynet.com/') === -1) {
                window.alert("This is not https://strawberrynet.com/");
            }
            var i;
            var sizes = [];
            var colors = [];
            var images = [];
            var prices = [];
            var scrapedData = [];
            // title
            scrapedData.push(document.getElementsByTagName('h1')[0].innerText);

            // prices
            var pricesDom = document.getElementsByClassName('price');
            if (pricesDom) {
                for (i = 0; i < pricesDom.length; i++) {
                    prices.push(pricesDom[i].innerText);
                }
            }
            scrapedData.push(prices.join(','));

            // images
            var imagesDom = document.getElementsByClassName('cloudzoom img-responsive imgzoom');
            if (imagesDom) {
                for (i = 0; i < imagesDom.length; i++) {
                    images.push(imagesDom[i].src);
                }
            }
            scrapedData.push(images.join(','));

            // colors
            var colorsDom = document.getElementsByClassName('colortxt');
            if (colorsDom) {
                for (i = 0; i < colorsDom.length; i++) {
                    colors.push(document.getElementsByClassName('colortxt')[0].innerText);
                }

            }
            scrapedData.push(colors.join(','));

            // sizes
            var sizesDom = document.getElementsByClassName('sizetext');
            if (sizesDom) {
                for (i = 0; i < sizesDom.length; i++) {
                    sizes.push(sizesDom[i].innerText);
                }
            }
            scrapedData.push(sizes.join(','));

            // description
            scrapedData.push(document.getElementById('desc').innerText);

            var value = JSON.stringify(scrapedData).replace('[', '').replace(']', '').replaceAll(/\u00a0/g, '');
            chrome.storage.local.set({[window.location] : value});
            window.alert("Scraping success!");
        }

        //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
        chrome.tabs.executeScript({
            code: '(' + scrapeDom + ')();' //argument here is a string but function.toString() returns function's code
        });
    }, false);
}, false);
