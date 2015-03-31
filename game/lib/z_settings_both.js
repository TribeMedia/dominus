// settings per game

if (Meteor.settings.public.GAME_ID == 'dev') {
    s.serverMaxPlayers = 200;

    // length of time added to game end clock when there is a new dominus
    s.time_til_game_end_when_new_dominus = 1000 * 60 * 60 * 24 * 2; 	// 2 days

    s.resource.gained_at_hex = 6;

    s.army.stats = {
        footmen: {
            offense: 15,
            defense: 10,
            speed: 15
        },
        archers: {
            offense: 5,
            defense: 15,
            speed: 21
        },
        pikemen: {
            offense: 2,
            defense: 20,
            speed: 11
        },
        cavalry: {
            offense: 18,
            defense: 5,
            speed: 33
        },
        catapults: {
            offense: 1,
            defense: 1,
            speed: 7,
            bonus_against_buildings: 80
        }
    };
}
