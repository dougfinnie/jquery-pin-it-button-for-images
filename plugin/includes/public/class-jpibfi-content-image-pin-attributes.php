<?php

/**
 * Injects data-jpibfi-* attributes into <img> tags for the Pinterest client script.
 *
 * Uses per-match replacement so duplicate identical <img> fragments each receive
 * the correct attributes (str_replace on repeated markup would corrupt the HTML).
 */
class JPIBFI_Content_Image_Pin_Attributes {

	/** @var callable */
	private $resolve_attachment;

	/**
	 * @param callable $resolve_attachment function ( string $id, string $src ): ?WP_Post
	 */
	public function __construct( $resolve_attachment ) {
		$this->resolve_attachment = $resolve_attachment;
	}

	/**
	 * @param string $content          HTML fragment.
	 * @param array  $post_snapshot    Keys: post_excerpt, post_url, post_title (plain strings).
	 * @param bool   $get_description  Whether to resolve attachment description.
	 * @param bool   $get_caption      Whether to resolve attachment caption.
	 *
	 * @return string
	 */
	public function inject_attributes( $content, array $post_snapshot, $get_description, $get_caption ) {
		$post_excerpt = isset( $post_snapshot['post_excerpt'] ) ? $post_snapshot['post_excerpt'] : '';
		$post_url     = isset( $post_snapshot['post_url'] ) ? $post_snapshot['post_url'] : '';
		$post_title   = isset( $post_snapshot['post_title'] ) ? $post_snapshot['post_title'] : '';

		$attr_pattern = '/ ([-\w]+)[ ]*=[ ]*([\"\'])(.*?)\2/i';

		return preg_replace_callback(
			'/<img[^>]*>/i',
			function ( $match ) use ( $attr_pattern, $get_description, $get_caption, $post_excerpt, $post_url, $post_title ) {
				$img_tag = $match[0];
				preg_match_all( $attr_pattern, $img_tag, $attributes, PREG_SET_ORDER );

				$new_img = '<img';
				$src     = '';
				$id      = '';

				foreach ( $attributes as $att ) {
					$full  = $att[0];
					$name  = $att[1];
					$value = $att[3];

					$new_img .= $full;

					if ( 'class' === $name ) {
						$id = self::post_id_from_image_classes( $value );
					}

					if ( 'src' === $name ) {
						$src = $value;
					}
				}

				$att_obj = ( $get_description || $get_caption )
					? call_user_func( $this->resolve_attachment, $id, $src )
					: null;

				if ( null !== $att_obj ) {
					$new_img .= $get_description ? sprintf( ' data-jpibfi-description="%s"', esc_attr( $att_obj->post_content ) ) : '';
					$new_img .= $get_caption ? sprintf( ' data-jpibfi-caption="%s"', esc_attr( $att_obj->post_excerpt ) ) : '';
				}

				$new_img .= sprintf( ' data-jpibfi-post-excerpt="%s"', esc_attr( wp_kses( $post_excerpt, array() ) ) );
				$new_img .= sprintf( ' data-jpibfi-post-url="%s"', esc_attr( $post_url ) );
				$new_img .= sprintf( ' data-jpibfi-post-title="%s"', esc_attr( $post_title ) );
				$new_img .= sprintf( ' data-jpibfi-src="%s"', esc_attr( $src ) );
				$new_img .= ' >';

				return $new_img;
			},
			$content
		);
	}

	/**
	 * @param string $class_attribute Value of the HTML class attribute.
	 *
	 * @return string Attachment ID or empty string.
	 */
	public static function post_id_from_image_classes( $class_attribute ) {
		$classes = preg_split( '/\s+/', $class_attribute, -1, PREG_SPLIT_NO_EMPTY );
		$prefix  = 'wp-image-';

		foreach ( $classes as $class ) {
			if ( $prefix === substr( $class, 0, strlen( $prefix ) ) ) {
				return str_replace( $prefix, '', $class );
			}
		}

		return '';
	}
}
