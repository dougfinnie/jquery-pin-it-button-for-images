<?php

use PHPUnit\Framework\TestCase;

final class ContentImagePinAttributesTest extends TestCase {

	public function test_each_img_match_gets_its_own_src_even_when_markup_is_parallel(): void {
		$injector = new JPIBFI_Content_Image_Pin_Attributes(
			static function () {
				return null;
			}
		);

		$html = '<p><img src="/a.jpg" class="size-full"><img src="/b.jpg" class="size-full"></p>';
		$out  = $injector->inject_attributes(
			$html,
			array(
				'post_excerpt' => 'ex',
				'post_url'     => 'https://example.com/p/',
				'post_title'   => 'T',
			),
			false,
			false
		);

		$this->assertStringContainsString( 'data-jpibfi-src="/a.jpg"', $out );
		$this->assertStringContainsString( 'data-jpibfi-src="/b.jpg"', $out );
	}

	public function test_resolves_attachment_description_and_caption_when_requested(): void {
		$attachment         = new stdClass();
		$attachment->post_content   = 'D&x';
		$attachment->post_excerpt = 'Cap';

		$injector = new JPIBFI_Content_Image_Pin_Attributes(
			static function ( $id ) use ( $attachment ) {
				return '99' === (string) $id ? $attachment : null;
			}
		);

		$html = '<img src="/x.jpg" class="alignnone wp-image-99">';
		$out  = $injector->inject_attributes(
			$html,
			array(
				'post_excerpt' => '',
				'post_url'     => 'https://example.com/p/',
				'post_title'   => 'T',
			),
			true,
			true
		);

		$this->assertStringContainsString( 'data-jpibfi-description="', $out );
		$this->assertStringContainsString( 'data-jpibfi-caption="', $out );
	}

	public function test_post_id_from_image_classes(): void {
		$this->assertSame(
			'42',
			JPIBFI_Content_Image_Pin_Attributes::post_id_from_image_classes( 'foo wp-image-42 bar' )
		);
		$this->assertSame(
			'',
			JPIBFI_Content_Image_Pin_Attributes::post_id_from_image_classes( 'no-id-here' )
		);
	}
}
