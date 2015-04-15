Template.rightEdPanel.helpers({
    hide: function() {
        var profile = Profiles.findOne();
        if (profile && profile.pro) {
            return true;
        }
    }
});


Template.rightEdPanel.onRendered(function() {
    this.autorun(function() {
        var profile = Profiles.findOne();
        if (profile) {
            if (!profile.pro) {
                $.getScript("//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", function() {
                    var ads, adsbygoogle;ads = '<ins class="adsbygoogle" style="display:inline-block;width:160px;height:600px" data-ad-client="ca-pub-3932000594707687" data-ad-slot="6908110447"></ins>';
                    $('#rightEdContainer').html(ads);
                    return (adsbygoogle = window.adsbygoogle || []).push({});
                });
            }
        }
    });
});


Template.rightEdPanel.events({
    'click #rightEdPanelHideAdsButton': function(event, template) {
        Session.set('show_pro_panel', true);
    }
});
