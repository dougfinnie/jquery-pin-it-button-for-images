( function ( $ ) {
	'use strict';

	if ( ! window.jpibfi_options ) return;

	// ── Options ──────────────────────────────────────────────────────────────

	var opts = $.extend( {
		pageUrl:         document.URL,
		pageTitle:       document.title,
		pageDescription: $( 'meta[name="description"]' ).attr( 'content' ) || ''
	}, window.jpibfi_options.hover );

	// ── CSS injection (button sizing) ─────────────────────────────────────────
	//
	// Injects a small set of rules that size the overlay button element.
	// Uses a single shared <style> element rather than one per rule.

	var _sheet = null;

	function injectRule( rule ) {
		if ( ! _sheet ) {
			var style = document.createElement( 'style' );
			document.head.appendChild( style );
			_sheet = style.sheet;
		}
		_sheet.insertRule( rule, _sheet.cssRules.length );
	}

	function iconFontSize( height, icon ) {
		var base = height * 36 / 54;
		return ( icon === 'pushpin' || icon === 'thumb-tack' ) ? 0.7 * base : base;
	}

	function iconOffset( fontSize, icon ) {
		switch ( icon ) {
			case 'circle':
				return 'margin-top:' + ( -0.5 * fontSize ) + 'px;' +
				       'margin-left:' + ( -0.5 * fontSize * 55 / 64 ) + 'px';
			case 'plain':
				return 'margin-top:' + ( -0.46875 * fontSize ) + 'px;' +
				       'margin-left:' + ( -0.5 * fontSize * 51 / 73 ) + 'px';
			case 'thumb-tack':
				return 'margin-top:' + ( -29.5 / 64 * fontSize ) + 'px;' +
				       'margin-left:' + ( -0.5 * fontSize * 41 / 64 ) + 'px';
			default:
				return 'margin-top:' + ( -0.5 * fontSize ) + 'px;' +
				       'margin-left:' + ( -0.5 * fontSize ) + 'px';
		}
	}

	function injectButtonCss() {
		var w = opts.pinImageWidth, h = opts.pinImageHeight;

		if ( opts.pin_image === 'default' ) {
			var fs = iconFontSize( h, opts.pin_image_icon );
			injectRule( 'a.pinit-button{height:' + h + 'px !important;width:' + w + 'px !important}' );
			injectRule( 'a.pinit-button span{height:' + h + 'px !important;width:' + w + 'px !important;font-size:' + fs + 'px}' );
			injectRule( 'a.pinit-button span:before{' + iconOffset( fs, opts.pin_image_icon ) + '}' );
		} else {
			// custom or old_default
			injectRule( 'a.pinit-button{height:' + h + 'px !important;width:' + w + 'px !important}' );
			injectRule( 'a.pinit-button span{height:' + h + 'px !important;width:' + w + 'px !important;' +
			            'background-size:' + w + 'px ' + h + 'px !important}' );
		}
	}

	// ── Description ───────────────────────────────────────────────────────────
	//
	// Tries each source in opts.description_option in order, returns the first
	// non-empty value.

	function getDescription( $img ) {
		var sources = opts.description_option || [];
		var fns = {
			img_title:            function () { return $img.attr( 'title' )                    || $img.attr( 'data-jpibfi-title' )   || ''; },
			img_alt:              function () { return $img.attr( 'alt' )                      || $img.attr( 'data-jpibfi-alt' )     || ''; },
			post_title:           function () { return $img.attr( 'data-jpibfi-post-title' )   || ''; },
			post_excerpt:         function () { return $img.attr( 'data-jpibfi-post-excerpt' ) || ''; },
			img_description:      function () { return $img.attr( 'data-jpibfi-description' )  || ''; },
			img_caption:          function () { return $img.attr( 'data-jpibfi-caption' )      || ''; },
			site_title:           function () { return opts.siteTitle                          || ''; },
			data_pin_description: function () { return $img.attr( 'data-pin-description' )    || ''; }
		};
		for ( var i = 0; i < sources.length; i++ ) {
			var val = fns[ sources[ i ] ] ? fns[ sources[ i ] ]() : '';
			if ( val ) return val;
		}
		return '';
	}

	// ── Pinterest link generation ─────────────────────────────────────────────

	function fileExtension( url ) {
		var path = ( url || '' ).replace( /^https?:\/\/[^/?#]+(?:[/?#]|$)/i, '' );
		var parts = path.split( '.' );
		return parts.length === 1 ? '' : parts[ parts.length - 1 ].replace( /\?.*/i, '' ).toLowerCase();
	}

	function getImageUrl( $img, anchor ) {
		var url = $img.attr( 'data-pin-media' ) || $img.attr( 'data-jpibfi-src' ) || $img.prop( 'src' );
		if ( ! url ) return null;
		if ( anchor && fileExtension( url ) === anchor.extension ) return anchor.href;
		return url;
	}

	function getPageUrl( $img, anchor ) {
		if ( $img.attr( 'data-pin-url' ) ) return $img.attr( 'data-pin-url' );
		if ( opts.pin_linked_url && anchor ) {
			var hostname = ( window.location.hostname || '' ).replace( 'www.', '' );
			if ( anchor.href.indexOf( hostname ) >= 0 ) {
				var ext = anchor.extension;
				if ( ext === '' || ext === 'html' || ext === 'php' ) return anchor.href;
			}
		}
		return $img.attr( 'data-jpibfi-post-url' ) || window.location.href;
	}

	function buildPinterestUrl( $img ) {
		var $anchor = $img.closest( 'a[href]' );
		var anchor  = $anchor.length
			? { href: $anchor.prop( 'href' ), extension: fileExtension( $anchor.prop( 'href' ) ) }
			: null;

		var imageUrl = getImageUrl( $img, anchor );
		if ( ! imageUrl ) return null;

		return 'https://pinterest.com/pin/create/bookmarklet/?is_video=false' +
			'&url='         + encodeURIComponent( getPageUrl( $img, anchor ) ) +
			'&media='       + encodeURIComponent( imageUrl ) +
			'&description=' + encodeURIComponent( getDescription( $img ) );
	}

	// ── Image eligibility ─────────────────────────────────────────────────────

	function parseClasses( str ) {
		return ( str || '' ).split( ';' ).map( function ( c ) { return c.trim(); } ).filter( Boolean );
	}

	var enabledClasses  = parseClasses( opts.enabled_classes );
	var disabledClasses = parseClasses( opts.disabled_classes );
	var minWidth  = opts.min_image_width;
	var minHeight = opts.min_image_height;

	function updateSizeConstraints() {
		var mobile = window.outerWidth < 768;
		minWidth  = mobile ? opts.min_image_width_small  : opts.min_image_width;
		minHeight = mobile ? opts.min_image_height_small : opts.min_image_height;
	}

	function matchesClass( $el, cls ) {
		return $el.hasClass( cls ) || $el.parents( '.' + cls ).length > 0;
	}

	function imageEligible( $img ) {
		if ( $img[ 0 ].clientWidth  < minWidth )  return false;
		if ( $img[ 0 ].clientHeight < minHeight ) return false;
		if ( enabledClasses.length  && ! enabledClasses.some(  function ( c ) { return matchesClass( $img, c ); } ) ) return false;
		if ( disabledClasses.some( function ( c ) { return matchesClass( $img, c ); } ) ) return false;
		return true;
	}

	// ── Button element ────────────────────────────────────────────────────────

	var $buttonTemplate = ( function () {
		var iconClass = opts.pin_image === 'default' ? 'jpibfi-icon-' + opts.pin_image_icon : '';
		var $a = $( '<a />', {
			target: '_blank',
			'class': 'pinit-button ' + opts.pin_image
		} );
		$a.html( '<span class="' + iconClass + '"></span>' );
		if ( opts.pin_image === 'default' ) $a.addClass( 'jpibfi-button-' + opts.pin_image_button );
		return $a;
	}() );

	function createButton( $img ) {
		var href = buildPinterestUrl( $img );
		if ( ! href ) return null;
		return $buttonTemplate.clone( false ).attr( 'href', href ).on( 'click', function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			if ( this.href.slice( -1 ) !== '#' ) {
				window.open( this.href, 'mw' + e.timeStamp, 'left=20,top=20,width=600,height=500,toolbar=1,resizable=0' );
			}
		} );
	}

	// ── Button positioning ────────────────────────────────────────────────────

	function calculatePosition( imgOffset, imgBottom, imgRight, btnWidth, btnHeight ) {
		var mt = opts.button_margin_top,    mb = opts.button_margin_bottom,
		    ml = opts.button_margin_left,   mr = opts.button_margin_right;
		switch ( opts.button_position ) {
			case 'top-left':     return { top: imgOffset.top + mt,          left: imgOffset.left + ml };
			case 'top-right':    return { top: imgOffset.top + mt,          left: imgRight  - mr - btnWidth };
			case 'bottom-left':  return { top: imgBottom - mb - btnHeight,  left: imgOffset.left + ml };
			case 'bottom-right': return { top: imgBottom - mb - btnHeight,  left: imgRight  - mr - btnWidth };
			default:             return {
				top:  imgOffset.top  + ( ( imgBottom - imgOffset.top  ) / 2 - btnHeight / 2 ),
				left: imgOffset.left + ( ( imgRight  - imgOffset.left ) / 2 - btnWidth  / 2 )
			};
		}
	}

	// ── Hover interaction ─────────────────────────────────────────────────────

	var HIDE_DELAY   = 100;
	var INDEXER_ATTR = 'data-jpibfi-indexer';
	var TIMEOUT_ATTR = 'data-jpibfi-timeout';
	var indexCounter = 0;

	function getButton( index ) {
		return $( 'a.pinit-button[' + INDEXER_ATTR + '="' + index + '"]' );
	}

	function scheduleHide( $img, $btn ) {
		return setTimeout( function () {
			$img.removeClass( 'pinit-hover' );
			$btn.remove();
		}, HIDE_DELAY );
	}

	function addContainers() {
		var $inputs   = $( '.jpibfi' );
		var $closest  = $inputs.closest( 'div, article' );
		( $closest.length ? $closest : $inputs.parent() ).addClass( 'jpibfi_container' );
	}

	function start() {
		addContainers();
		updateSizeConstraints();
		window.addEventListener( 'resize', updateSizeConstraints, false );

		var selector  = opts.image_selector;
		var btnWidth  = opts.pinImageWidth;
		var btnHeight = opts.pinImageHeight;

		$( document ).on( 'mouseenter', selector, function () {
			var $img  = $( this );
			if ( ! imageEligible( $img ) ) return;

			var index = $img.attr( INDEXER_ATTR );
			if ( ! index ) {
				index = indexCounter++;
				$img.attr( INDEXER_ATTR, index );
			}

			var $existing = getButton( index );
			if ( $existing.length ) {
				clearTimeout( $existing.attr( TIMEOUT_ATTR ) );
				return;
			}

			var $btn = createButton( $img );
			if ( ! $btn ) return;

			var offset = $img.offset();
			var pos    = calculatePosition(
				offset,
				offset.top  + $img[ 0 ].clientHeight,
				offset.left + $img[ 0 ].clientWidth,
				btnWidth,
				btnHeight
			);

			$img.addClass( 'pinit-hover' );
			$img.after( $btn );
			$btn.attr( INDEXER_ATTR, index )
				.css( 'visibility', 'hidden' )
				.show()
				.offset( pos )
				.css( 'visibility', 'visible' )
				.on( 'mouseenter', function () {
					clearTimeout( $btn.attr( TIMEOUT_ATTR ) );
				} )
				.on( 'mouseleave', function () {
					$btn.attr( TIMEOUT_ATTR, scheduleHide( $img, $btn ) );
				} );
		} );

		$( document ).on( 'mouseleave', selector, function () {
			var $img  = $( this );
			var index = $img.attr( INDEXER_ATTR );
			if ( ! index ) return;
			var $btn = getButton( index );
			if ( $btn.length ) $btn.attr( TIMEOUT_ATTR, scheduleHide( $img, $btn ) );
		} );
	}

	// ── Init ──────────────────────────────────────────────────────────────────

	$( document ).ready( function () {
		injectButtonCss();
		start();
	} );

}( window.jQuery ) );
