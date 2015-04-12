Template.proPanel.helpers({
    hasPurchasedThisGame: function() {
        var profile = Profiles.findOne();
        if (profile && profile.pro) {
            return true;
        }
    },

    hasPurchasedAllGames: function() {
        var pref = Prefs.findOne();
        if (pref && pref.pro) {
            return true;
        }
    },

    connectedToLanding: function() {
        return landingConnection.status().connected;
    }
});


Template.proPanel.events({
    'click .proButton': function(event, template) {
        var type = event.currentTarget.getAttribute('data-type');
        var button = event.currentTarget;
        var button_html = $(button).html();
        var errorAlert = template.find('#proError');
        var successAlert = template.find('#proSuccess');

        var amountInCents = s.pro[type].amountInCents;
        var words = s.pro[type].words;
        var priceString = s.pro[type].priceString;

        check(amountInCents, Number);

        $(errorAlert).hide();
        $(successAlert).hide();

        $(button).attr('disabled', true);
        $(button).html('<i class="fa fa-refresh fa-spin"></i> Please Wait');

        var handler = StripeCheckout.configure({
            key: Meteor.settings.public.stripe_publishable_key,
            image: '/stripe_logo.jpg',
            token: function(token, args) {
                Meteor.call('stripeProCheckout', type, token, function(error, charge_id) {
                    $(button).attr('disabled', false);
                    $(button).html(button_html);

                    if (error) {
                        $(errorAlert).show();
                        $(errorAlert).html('Error charging card.  Card declined.');
                    } else {
                        //log_gold_purchase(charge_id, amount_in_cents)
                        $(successAlert).show();
                        $(successAlert).html('Success! Account upgraded.');
                    }
                });
            }
        });

        handler.open({
            name: s.game_name,
            description: 'Upgrade to pro in '+words+' for $'+priceString,
            amount: amountInCents,
            email: get_user_property("emails")[0].address,
            closed: function() {
                $(button).attr('disabled', false);
                $(button).html(button_html);
            }
        });
    },
});


Template.proPanel.rendered = function() {
    this.firstNode.parentNode._uihooks = leftPanelAnimation;
};
