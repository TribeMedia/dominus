Template.adSquare.onRendered(function() {
    // var adsbygoogle;
    // (adsbygoogle = window.adsbygoogle || []).push({});

    $.getScript("//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", function() {
        var ads, adsbygoogle;ads = '<ins class="adsbygoogle" style="display:inline-block;width:250px;height:250px" data-ad-client="ca-pub-3932000594707687" data-ad-slot="6768509647"></ins>';
        $('#adSquareContainer').html(ads);
        return (adsbygoogle = window.adsbygoogle || []).push({});
    });
});
