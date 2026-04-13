<?php
/**
 * Minimal WordPress API stubs so pin-attribute tests run without loading WordPress.
 */

if ( ! function_exists( 'esc_attr' ) ) {
	function esc_attr( $text ) {
		return htmlspecialchars( (string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
	}
}

if ( ! function_exists( 'wp_kses' ) ) {
	function wp_kses( $text, $allowed_html ) {
		return $text;
	}
}

require dirname( __DIR__ ) . '/plugin/includes/public/class-jpibfi-content-image-pin-attributes.php';
