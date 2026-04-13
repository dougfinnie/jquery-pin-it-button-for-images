#!/usr/bin/env node
/**
 * Sync WordPress plugin Version (and JPIBFI_VERSION fallback) + readme Stable tag
 * from package.json "version" (semver). Run after changing package.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join( dirname( fileURLToPath( import.meta.url ) ), '..' );
const pkgPath = join( root, 'package.json' );
const phpPath = join( root, 'plugin', 'jquery-pin-it-button-for-images.php' );
const readmePath = join( root, 'plugin', 'readme.txt' );

const { version } = JSON.parse( readFileSync( pkgPath, 'utf8' ) );
if ( ! /^\d+\.\d+\.\d+/.test( version ) ) {
	console.error( 'package.json version must look like semver (e.g. 4.0.1):', version );
	process.exit( 1 );
}

let php = readFileSync( phpPath, 'utf8' );
php = php.replace( /^Version:\s*.+$/m, `Version: ${version}` );
php = php.replace(
	/define\(\s*'JPIBFI_VERSION',\s*![^?]+\?\s*\$jpibfi_headers\['Version'\]\s*:\s*'[^']*'\s*\)/,
	`define( 'JPIBFI_VERSION', ! empty( $jpibfi_headers['Version'] ) ? $jpibfi_headers['Version'] : '${version}' )`
);
writeFileSync( phpPath, php );

let readme = readFileSync( readmePath, 'utf8' );
readme = readme.replace( /^Stable tag:\s*.+$/m, `Stable tag: ${version}` );
writeFileSync( readmePath, readme );

console.log( `Synced Version + Stable tag to ${version} (from package.json).` );
