Template.forumPost.helpers({
    isPostFromThisGame: function() {
        var gameInfo = Session.get('gameInfo');
        if (gameInfo && this) {
            if (gameInfo.gameId == this.gameId) {
                if (gameInfo.gameNumber == this.gameNumber) {
                    return true;
                }
            }
        }
    }
});
