﻿(function ($, ss) {
    var previousWidth = ss.getViewPort().width;

    function resizeSliders() {
        // set height to the wrapper of the home page sliders and banners so that they are aligned all the same in height
        if (ss.getViewPort().width >= 768) {
            var mainSliderHeight = $('.main-banner-1 div').height();
            if (mainSliderHeight != null && mainSliderHeight > 0) {
                $('.banner-wrapper').css("height", mainSliderHeight + "px");
                $('.main-banner-2 .slider-wrapper').css("height", mainSliderHeight + "px");
            }
        }
        else {
            $('.banner-wrapper').css('height', 'auto');
        }
    }

    function resizeAndInitializeFlyoutCart() {
        var previousHeight = ss.getViewPort().height;
        var cartCountHeight = $('.mini-shopping-cart .count').height();
        var cartItemHeight = $('.mini-shopping-cart .items').height();
        var cartTotalHeight = $('.mini-shopping-cart .totals').height();
        var cartButtonsHeight = $('.mini-shopping-cart .buttons').height();
        var general = cartCountHeight + cartItemHeight + cartTotalHeight + cartButtonsHeight;

        if (general >= previousHeight) {
            //$('.mini-shopping-cart .items').height(previousHeight - 200);
            $('.mini-shopping-cart .items').simplebar();

        }
    }

    function repositionLogoOnWidthBreakpointForHeader2(isInitialLoad, themeBreakpoint) {
        if ($('.header.header-2').length > 0) {
            var viewport = ss.getViewPort().width;

            if (isInitialLoad || (viewport > themeBreakpoint && previousWidth <= themeBreakpoint) || (viewport <= themeBreakpoint && previousWidth > themeBreakpoint)) {
                if (viewport >= themeBreakpoint) {
                    $('.header-logo').prependTo('.header-options-wrapper').after($('.store-search-box'));
                }
                else {
                    $('.header-logo').prependTo('.logo-cell');
                }
            }

            previousWidth = viewport;
        }
    }

    function toggleFooterBlocks(isInitialLoad, themeBreakpoint) {
        var viewport = ss.getViewPort().width;

        if (isInitialLoad || (viewport > themeBreakpoint && previousWidth <= themeBreakpoint) || (viewport <= themeBreakpoint && previousWidth > themeBreakpoint)) {
            if (viewport >= themeBreakpoint) {
                $('.footer-block .title').next('div, ul').slideDown();
            }
            else {
                $('.footer-block .title').next('div, ul').slideUp();
            }
        }

        previousWidth = viewport;
    }

    function initializeFlyoutCart(movedElementsSelector, themeBreakpoint) {
        var movedElements = $(movedElementsSelector);
        var timer;

        //$('.header .ico-cart').on('click', function (e) {
        $('.header .ico-cart').on('mouseenter', function (e) {
            var flyoutCart = $('#flyout-cart');

            var flyoutCartCount = $('.flyout-cart .count');
            if (flyoutCartCount.find('.close').length === 0) {
                flyoutCartCount.append('<span class="close"></span>');
            }
            timer = setTimeout(function () {
                if (ss.getViewPort().width > themeBreakpoint) {
                    e.preventDefault();

                    if (flyoutCart.hasClass('active')) {
                        //flyoutCart.removeClass('active');
                        //movedElements.removeClass('move-left');
                    } else {
                        flyoutCart.addClass('active');
                        //movedElements.addClass('move-left');
                    }
                }
            }, 250/* <--- the delay */);
        }).mouseleave(function () { clearTimeout(timer);});

        $('.flyout-cart .count').append('<span class="close"></span>');

        $('.header').on('click', '#flyout-cart .close', function () {
            $('#flyout-cart').removeClass('active');
            movedElements.removeClass('move-left');
        });
        $('#flyout-cart').on('mouseleave', function () {
            if ($('#flyout-cart').hasClass('active')) {
                $('#flyout-cart').removeClass('active');
                //movedElements.removeClass('move-left');
            }
        });
    }
    
	// make categories and blog posts width 100%
    /*function stretchElementsToBodyWidth(elements) {
        var stretchedElements = $(elements);
        var neededHorizontalMargin = -(parseInt($('body').outerWidth()) * .05);

        stretchedElements.css({
            marginLeft: neededHorizontalMargin,
            marginRight: neededHorizontalMargin
        });
    }*/

    //y.chan - custom
    function handleOrderSummaryAccordion() {
        $('.shopping-cart-page .accordion-tab-title').on('click', function () {
            $(this).siblings('.accordion-tab-content').slideToggle().closest('.accordion-tab').toggleClass('active')
                .siblings('.accordion-tab').removeClass('active').find('.accordion-tab-content').slideUp();
        });

        if ($('.shopping-cart-page .shipping-results').length > 0) {
            $('.shopping-cart-page .accordion-tab.estimate-shipping .accordion-tab-title').trigger('click');
        }

        if ($('.shopping-cart-page .coupon-box').find('.message-success, .message-failure').length > 0) {
            $('.shopping-cart-page .accordion-tab.coupon-codes .accordion-tab-title').trigger('click');
        }

        if ($('.shopping-cart-page .giftcard-box').find('.message-success, .message-failure').length > 0) {
            $('.shopping-cart-page .accordion-tab.gift-cards .accordion-tab-title').trigger('click');
        }
    }
    //y.chan - custom end
    
    $(document).ready(function () {
        /*$(window).on('load resize orientationchange', function () {
            if (ss.getViewPort().width <= 480) {
                stretchElementsToBodyWidth('.home-page-category-grid, .sub-category-grid, .rich-blog-homepage .blog-posts, .gallery');
            }
            else {
                $('.home-page-category-grid, .sub-category-grid, .rich-blog-homepage .blog-posts, .gallery').css({ 'margin-left': 'auto', 'margin-right': 'auto' });
            }
        });*/

        var searchBoxBeforeSelector = $('.header-2').length > 0 ? ".header-logo" : ".header-options";

        var responsiveAppSettings = {
            isEnabled: true,
            themeBreakpoint: 1024,
            isSearchBoxDetachable: true,
            isHeaderLinksWrapperDetachable: false,
            doesDesktopHeaderMenuStick: true,
            doesScrollAfterFiltration: true,
            doesSublistHasIndent: true,
            displayGoToTop: false,
            hasStickyNav: true,
            lazyLoadImages: true,
            selectors: {
                menuTitle: ".menu-title",
                headerMenu: ".header-menu",
                closeMenu: ".close-menu span",
                sublist: ".header-menu .sublist",
                overlayOffCanvas: ".overlayOffCanvas",
                withSubcategories: ".with-subcategories",
                filtersContainer: ".nopAjaxFilters7Spikes",
                filtersOpener: ".filters-button span",
                searchBoxOpener: ".search-wrap > span",
                searchBox: ".store-search-box",
                searchBoxBefore: searchBoxBeforeSelector,
                navWrapper: ".responsive-nav-wrapper",
                navWrapperParent: ".responsive-nav-wrapper-parent",
                headerMenuDesktopStickElement: ".header",
                headerMenuDesktopStickParentElement: ".master-wrapper-page",
                headerLinksOpener: "#header-links-opener",
                headerLinksWrapper: ".header-options-wrapper",
                shoppingCartLink: ".shopping-cart-link",
                overlayEffectDelay: 300
            }
        };

        ss.initResponsiveTheme(responsiveAppSettings);

        $(document).on("nopAjaxCartProductAddedToCartEvent load", function () {
            resizeAndInitializeFlyoutCart();
        });

        resizeAndInitializeFlyoutCart();

        resizeSliders();

        $('.flyout-cart .items').perfectScrollbar({
            swipePropagation: false,
            wheelSpeed: 2,
            suppressScrollX: true
        });

        // click to close (search, header links and mobile menu )
		
        $('.responsive-nav-wrapper .search-wrap span').on('click', function () {
		
            if ($('.header-options-wrapper').hasClass('open')) {
                $('.header-options-wrapper').removeClass('open');
            }
            if ($('.header-menu').hasClass('open')) {
                $('.header-menu').removeClass('open');
            }
			if ($('.nopAjaxFilters7Spikes').hasClass('open')) {
                $('.nopAjaxFilters7Spikes').removeClass('open');
            }
        });

        $('.responsive-nav-wrapper .personal-button span').on('click', function () {
            if ($('.store-search-box').hasClass('open')) {
                $('.store-search-box').removeClass('open');
            }
			if ($('.nopAjaxFilters7Spikes').hasClass('open')) {
                $('.nopAjaxFilters7Spikes').removeClass('open');
            }
			if ($('.header-menu').hasClass('open')) {
                $('.header-menu').removeClass('open');
            }
        });

        $('.menu-title span').on('click', function () {
            if ($('.header-options-wrapper').hasClass('open')) {
                $('.header-options-wrapper').removeClass('open');
            }
			if ($('.nopAjaxFilters7Spikes').hasClass('open')) {
                $('.nopAjaxFilters7Spikes').removeClass('open');
            }
            if ($('.store-search-box').hasClass('open')) {
                $('.store-search-box').removeClass('open');
            }
        });
		
		$('.responsive-nav-wrapper .filters-button span').on('click', function () {
            if ($('.header-options-wrapper').hasClass('open')) {
                $('.header-options-wrapper').removeClass('open');
            }
            if ($('.header-menu').hasClass('open')) {
                $('.header-menu').removeClass('open');
            }
			if ($('.store-search-box').hasClass('open')) {
                $('.store-search-box').removeClass('open');
            }
        });

        // footer slide up and down
        $('.footer-block > .title, .footer-1 .newsletter-block .newsletter .title').on('click', function () {
            if (ss.getViewPort().width < responsiveAppSettings.themeBreakpoint) {
                $(this).next('div, ul').slideToggle();
            }
        });

        ss.addWindowEvent('resize', function () {
            toggleFooterBlocks(false, responsiveAppSettings.themeBreakpoint);
            resizeSliders();
            resizeAndInitializeFlyoutCart();
            repositionLogoOnWidthBreakpointForHeader2(true, responsiveAppSettings.themeBreakpoint);
        });
        ss.addWindowEvent('orientationchange', function () {
            toggleFooterBlocks(false, responsiveAppSettings.themeBreakpoint);
            resizeSliders();
            resizeAndInitializeFlyoutCart();
            repositionLogoOnWidthBreakpointForHeader2(true, responsiveAppSettings.themeBreakpoint);
        });

        toggleFooterBlocks(true, responsiveAppSettings.themeBreakpoint);
        repositionLogoOnWidthBreakpointForHeader2(true, responsiveAppSettings.themeBreakpoint);

        initializeFlyoutCart(responsiveAppSettings.selectors.movedElements, responsiveAppSettings.themeBreakpoint);

        //y.chan - custom
        handleOrderSummaryAccordion();
        //y.chan - custom end
		
	
		
		
		
		
		// Implements custom "Product Quantity" functionality (on Product page and in Cart tables).

		function incrementQuantityValue(event) {
			event.preventDefault();
			event.stopPropagation();
			var input = $(this).siblings('.qty-input');
			var value = parseInt(input.val());
			if (isNaN(value)) {
				input.val(1);
				return;
			}
			value++;
			input.val(value);

			//http://stackoverflow.com/a/17110709/6744066
			input.trigger('input'); //input event trigger required by ROPC
			input.trigger('change'); //change event trigger required by IE11
		}
		function decrementQuantityValue(event) {
			event.preventDefault();
			event.stopPropagation();
			var input = $(this).siblings('.qty-input');
			var value = parseInt(input.val());
			if (isNaN(value)) {
				input.val(1);
				return;
			}
			if (value <= 1) {
				return;
			}
			value--;
			input.val(value);

			//http://stackoverflow.com/a/17110709/6744066
			input.trigger('input'); //input event trigger required by ROPC
			input.trigger('change'); //change event trigger required by IE11
		}
		function handlePurchaseQuantityValue() {
			$(document).on('click', '.increase', incrementQuantityValue);
			$(document).on('click', '.decrease', decrementQuantityValue);
		}
		handlePurchaseQuantityValue();



		function showFiltersButton() {

			$(window).scroll(function() {

				var filtersButton = $('.filters-button');

				if(filtersButton.length > 0) {

					var targetElement;

					if($('.featured-product-grid').length > 0) {
						targetElement = $('.featured-product-grid');
					}
					else {
						targetElement = $('.product-selectors');
					}

					var top_of_screen = $(window).scrollTop();
					var top_of_element = targetElement.offset().top - $(window).height()/4;

					if (top_of_screen > top_of_element) {
						filtersButton.addClass('show');// show
					} else {
						filtersButton.removeClass('show');// hide
					}
				}
			});
		}
		showFiltersButton();




		/*function setMenuPadHeight() {
			var gridHeight = 0;
			$('.mega-menu .flyout').each(function() {
				if($(this).height() > gridHeight) {
					gridHeight = $(this).height();
				}
			});
			$('.dropdown-container').height(gridHeight + 20);
		}
		setTimeout(function() {
			setMenuPadHeight();
		}, 1000);
		$(window).on('resize', setMenuPadHeight);*/
		
		
		
		
		function handleFirstOpenedMenuItem() {
			var firstElement = $('.dropdown-container > ul > li:first-child');
			firstElement.addClass('first');

			$('.dropdown-container').on('mouseenter mouseleave', function() {
				firstElement.toggleClass('first');
			});
		}
		handleFirstOpenedMenuItem();
		
		// dynamic height for mega menu dropdown
		function setDropdownListMinimumHeight() {
			var targetElement = $('.dropdown-container > ul');
			
			var paddingIncrement = 0;
			
			if($(window).outerWidth() < 1525) {
				paddingIncrement = 20;
			}
			else {
				paddingIncrement = 30;
			}
			
			$('.all-categories').on('mouseenter', function() {
				var thisElement = $(this);
				setTimeout(function(){
					var initialHeight = thisElement.find('.hasSublist:first-child').find('.row-wrapper').height();
					targetElement.css('min-height', initialHeight + paddingIncrement);
				}, 300);
				
				thisElement.on('mouseleave', function() {
					targetElement.css('min-height', '0');
				});
			});
			
			$('.all-categories .hasSublist').on('mouseenter', function() {
				var targetHeight = $(this).find('.row-wrapper').height();
				targetElement.css('min-height', targetHeight + paddingIncrement);
			});
		}
		setDropdownListMinimumHeight();
		$(window).on('resize', setDropdownListMinimumHeight);
		
		
		
		
		/*function equalizeProductDetailsHeight() {
			var targetElements = $('.gallery, .overview');
			var initialHeight = 0;
			targetElements.each(function(){
				if($(this).height() > initialHeight) {
					initialHeight = $(this).height();
				}
			});
			if($(window).outerWidth() > 1300) {
				targetElements.height(initialHeight);
			}
			else {
				targetElements.removeAttr('style');
			}
		}
		equalizeProductDetailsHeight();
		$(window).on('resize', equalizeProductDetailsHeight);*/
		
    });

    $(document).on("nopAnywhereSlidersFinishedLoading", function () {
        resizeSliders();
        $('.main-banner-2').show();
    });

    //y.chan - custom
    //$(document).on("nopAjaxCartProductAddedToCartEvent", function () {
    //    var subtotalElementVal = $(".mini-shopping-cart .totals strong").text();
    //    // get the text for element above and replace it where you want to show it i.e next to the cart icon
    //    $(".cart-ttl").text(subtotalElementVal);
    //    setTimeout(function () { location.reload(1); }, 5000);
    //});
    $(document).on("nopAjaxCartFlyoutShoppingCartUpdated", function () {
        var subtotalElementVal = $(".mini-shopping-cart .totals strong").text();
        // get the text for element above and replace it where you want to show it i.e next to the cart icon
        $(".cart-ttl").text(subtotalElementVal);
    });
    //y.chan - custom end
	
	$(document).on("navigationHasSticked", function () {
        $('body').toggleClass('nav-sticked', $('.responsive-nav-wrapper').hasClass('stick'));
    });
	
})(jQuery, sevenSpikes);