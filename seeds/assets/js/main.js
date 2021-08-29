equalheight = function (container) {

    var currentTallest = 0,
        currentRowStart = 0,
        rowDivs = new Array(),
        $el,
        topPosition = 0;
    $(container).each(function () {

        $el = $(this);
        $($el).height('auto')
        topPostion = $el.position().top;

        if (currentRowStart != topPostion) {
            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
            rowDivs.length = 0; // empty the array
            currentRowStart = topPostion;
            currentTallest = $el.height();
            rowDivs.push($el);
        } else {
            rowDivs.push($el);
            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
        }
        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
            rowDivs[currentDiv].height(currentTallest);
        }
    });
}

$(window).load(function () {
    equalheight('.keepsameheight');
});

$(window).resize(function () {
    equalheight('.keepsameheight');
});
$(document).ready(function () {

    $('.filterhead').click(function (e) {
        e.preventDefault();
        $('.filterbody').slideToggle();
    });

    $('.slicklogoslider,.client-scroller').slick({
        dots: false,
        infinite: true,
        speed: 300,
        autoplay: true,
        autoplaySpeed: 1000,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 991,
                settings: "unslick"
            }
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
        ]
    });

    $('.case-studies-scroller').slick({
        dots: true,
        infinite: true,
        speed: 300,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 991,
                settings: {
                    arrows: false,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                    arrows: false
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                    arrows: false
                }
            }
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
        ]
    });


    /** Partners toggle **/
    $('.toggle-partners.back').hide();
    $('.partner-title').hide();

    $('.partnerbox .toggle-partners:not(.back)').click(function (e) {
        e.preventDefault();
        $('.partner-list-item').show();
        var toshow = $(this).data('box');
        $('.partner-list-item:not(.' + toshow + ')').hide();
        $('.partner-list-item.toggler').show();

        $('.partner-title').hide();
        $('.partner-title.' + toshow).show();

        $('.toggle-partners:not(.back)').hide();
        $('.toggle-partners.back').show();
    });

    $('.partnerbox .toggle-partners.back').click(function (e) {
        e.preventDefault();
        $('.toggle-partners:not(.back)').show();
        $('.toggle-partners.back').hide();
        $('.partner-list-item').show();
        $('.partner-title').hide();

    });

    /***** Phone Toggles ****/

    $('.phone-toggles .toggle-partners:not(.back)').click(function (e) {
        e.preventDefault();
        $('.partner-list-item').show();
        var toshow = $(this).data('box');
        $('.partner-list-item:not(.' + toshow + ')').hide();
        $('.partner-list-item.toggler').show();

        $('.partner-title').hide();
        $('.partner-title.' + toshow).show();

        $('.toggle-partners:not(.back)').hide();
        $('.toggle-partners.back').show();
        $('.phone-toggle-item').hide();
        $('.phone-toggle-item.back').show();
    });

    $('.phone-toggles .toggle-partners.back').click(function (e) {
        e.preventDefault();
        $('.toggle-partners:not(.back)').show();
        $('.toggle-partners.back').hide();
        $('.phone-toggle-item').show();
        $('.phone-toggle-item.back').hide();
        $('.partner-list-item').show();
        $('.partner-title').hide();

    });

    $('.submenu').each(function () {
        if ($(this).is(':visible')) {
            $(this).parent('.nav-item').addClass('active');
        }
    });

    $('.back-row').hide();
    $('.subrow').hide();

    $('.main-row .st-parentlink').click(function (e) {
        e.preventDefault();
        $('.main-row').hide();
        $('.' + $(this).data('subrow')).show();
        $(this).parents().find('.back-row').show();
    });

    $('.backtomainrow').click(function (e) {
        e.preventDefault();
        $(this).parent().parent().parent().find('.main-row').show();
        $(this).parent().parent().parent().find('.subrow').hide();
        $(this).parent().parent().hide();
    })

    $('.togglesubmenu').click(function () {
        $('.user-menu').toggleClass('shown');
        $('.overlay').toggleClass('shown');
    });

    $('html').click(function (event) {
        if ($(event.target).closest('.usermnnn').length === 0) {
            $('.user-menu').removeClass('shown');
            $('.overlay').removeClass('shown');
        }
    });

    //My NFT details page

    $('.edit-price-form').click(function (e) {
        e.preventDefault();
        $('.priceform').toggleClass('shown');
    });

    //My NFT details page

    //Transfer page
    $('.selectable').click(function (e) {
        e.preventDefault();
        $('.selectable').removeClass('selected');
        $(this).addClass('selected');
    });
    //Transfer page

    //Create collection
    $('.uploadbox').click(function (e) {
        $('#uploadicon').trigger('click');
    });
    //Create collection
    
    $(".uploadAudioBox").click(() =>{
        $("#nft-audio").trigger("click");
    });

});

//append collaborator
$(document).on('click', '.appendit', function (e) {
    e.preventDefault();
    if ($(this).hasClass('to-remove')) {
        $(this).parent().remove();
    } else {
        $(this).parent().append($(this).parent().find('.toclone').eq(0).clone()).html();
    }
});

//append collaborator

if ($(window).width() < 480 || $(window).height() < 480) {
    //small screen, load other JS files
    $(document).ready(function () {
        $('.haschildren .nav-link').click(function (e) {
            e.preventDefault();
            if ($(this).parent().find('.submenu').is(':visible')) {
                $(this).parent().find('.submenu').hide();
            } else {
                $(this).parent().find('.submenu').show();
            }
        })
    });
}

$(function () {
    //toggle class open on button
    $('#navbarSupportedContent').on('hide.bs.collapse', function () {
        $('.navbar-toggler').removeClass('open');
    })
    $('#navbarSupportedContent').on('show.bs.collapse', function () {
        $('.navbar-toggler').addClass('open');
    })
});