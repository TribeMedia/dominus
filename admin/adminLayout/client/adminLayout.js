Template.adminLayout.onRendered(function() {
    setBackground()
    window.onresize = function() {
        setBackground()
    }
})


var setBackground = function() {
    document.body.style.backgroundColor = '#222';
    document.body.style.backgroundImage = 'none';
}