$(document).ready(function() {
    var duration = 5000;
    $('.a').hide();

    $('.q').on('click', function() {
        var answerLi = $(this).next();
        if($(this).attr('data-icon') === "\u25B6") {
            $(this).attr('data-icon', "\u25BC");
            answerLi.slideDown(duration);
        } else {
            $(this).attr('data-icon', "\u25B6");
            answerLi.slideUp(duration);
        }
    });
});