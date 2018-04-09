$(document).ready(function() {
    var duration = 500;
    $('.a').hide();
    $('.faq-more').hide();

    $('.q').on('click', function() {
        var answerLi = $(this).next();
        if($(this).attr('data-action') === "hide") {
            $(this).attr('data-action','show');
            $('.arrow', this).css({
                'transform' : 'rotate(90deg)'
            })
            answerLi.slideDown(duration);
        } else {
            $(this).attr('data-action','hide');
            $('.arrow', this).css({
                'transform' : 'rotate(0deg)'
            })
            answerLi.slideUp(duration);
        }
    });

    $('.more').on('click', function() {
        var answerMore = $(this).next();
        if($(this).attr('data-more') === "hide") {
            $(this).attr('data-more','show');
            answerMore.slideDown(duration);
        } else {
            $(this).attr('data-more','hide');
            answerMore.slideUp(duration);
        }
    })
});