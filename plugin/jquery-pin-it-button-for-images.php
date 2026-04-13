<?php
/*
Plugin Name: jQuery Pin It Button for Images
Plugin URI: https://dougfinnie.github.io/jquery-pin-it-button-for-images/docs/
Description: Highlights images on hover and adds a "Pin It" button over them for easy pinning.
Text Domain: jquery-pin-it-button-for-images
Domain Path: /languages
Author: Marcin Skrzypiec
Version: 4.0.0
Author URI: https://github.com/dougfinnie/jquery-pin-it-button-for-images
*/

if ( !defined( 'WPINC' ) )
	die;

if ( ! defined( 'JPIBFI_VERSION' ) ) {
	$jpibfi_headers = get_file_data( __FILE__, array( 'Version' => 'Version' ), 'plugin' );
	define( 'JPIBFI_VERSION', ! empty( $jpibfi_headers['Version'] ) ? $jpibfi_headers['Version'] : '4.0.0' );
}

if ( !class_exists( 'jQuery_Pin_It_Button_For_Images' ) ) {

	final class jQuery_Pin_It_Button_For_Images {

		function __construct() {
			require_once plugin_dir_path(__FILE__) . 'includes/jpibfi.php';
			new JPIBFI(__FILE__, JPIBFI_VERSION);
		}
	}

	$JPIBFI = new jQuery_Pin_It_Button_For_Images();

	function jpibfi_activation_hook() {
		// Bail if activating from network, or bulk
		if ( is_network_admin() || isset( $_GET['activate-multi'] ) ) {
			return;
		}

		// Add the transient to redirect
		set_transient( '_jpibfi_activation_redirect', true, 30 );
    }
	register_activation_hook( __FILE__, 'jpibfi_activation_hook' );

} else {
	function jpibfi_duplicate_error() {
		?>
		<div class="notice notice-error">
			<p><strong>
				<?php _e('You have two versions of jQuery Pin It Button for Images installed. Please deactivate and remove one of them.', 'jquery-pin-it-button-for-images'); ?>
			</strong></p>
		</div>
		<?php
	}
	add_action( 'admin_notices', 'jpibfi_duplicate_error' );
}
