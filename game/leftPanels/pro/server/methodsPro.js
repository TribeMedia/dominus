Meteor.methods({
    stripeProCheckout: function(type, token) {
        check(type, String);
        check(token, Object);

        var fields = {emails:1, username:1};
        var user = Meteor.users.findOne(Meteor.userId(), {fields:fields});
        if (!user) {
            throw new Meteor.Error('User not found.');
        }

        var amountInCents = s.pro[type].amountInCents;
        var fut = new Future();
        var stripe = StripeAPI(Meteor.settings.stripe_secret_key);

        var allGames;
        switch (type) {
            case 'thisGame':
                allGames = false;
                break;
            case 'allGames':
                allGames = true;
                break;
        }

        var charge = stripe.charges.create({
            amount: amountInCents,
            currency: "usd",
            card: token.id,
            description: user.emails[0].address
        }, Meteor.bindEnvironment(function(err, charge) {

            if (err) {
                fut['return'](false);
            } else {
                landingConnection.call('profile_purchasePro',
                process.env.DOMINUS_KEY,
                user.emails[0].address,
                process.env.GAME_ID,
                allGames);

                var id = Charges.insert({
                    created_at: new Date(),
                    user_id: user._id,
                    amount: amountInCents,
                    type: 'pro_'+type+'_purchase',
                    user_email: user.emails[0].address,
                    user_username: user.username,
                    livemode: charge.livemode,
                    stripe_charge_id: charge.id
                });

                fut['return'](id);
            }
        }));
        return fut.wait();
    }
});
