Template.edSquare.helpers({
    hide: function() {
        var profile = Profiles.findOne();
        if (profile && profile.pro) {
            return true;
        }
    }
});


Template.edSquare.onRendered(function() {
    this.autorun(function() {
        var profile = Profiles.findOne();
        if (profile) {
            if (!profile.pro) {
                $.getScript("//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", function() {
                    var ads, adsbygoogle;ads = '<ins class="adsbygoogle" style="display:inline-block;width:250px;height:250px" data-ad-client="ca-pub-3932000594707687" data-ad-slot="6768509647"></ins>';
                    $('#edSquareContainer').html(ads);
                    return (adsbygoogle = window.adsbygoogle || []).push({});
                });
            }
        }
    });
});



Template.edSquare.events({
    'click #edSquareHideAdsButton': function(event, template) {
        Session.set('show_pro_panel', true);
    }
});
