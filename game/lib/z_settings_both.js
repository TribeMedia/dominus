// settings per game

if (Meteor.settings.public.GAME_ID == 'dev') {
    s.serverMaxPlayers = 200;

    // length of time added to game end clock when there is a new dominus
    s.time_til_game_end_when_new_dominus = 1000 * 60 * 60 * 24 * 2; 	// 2 days
}
