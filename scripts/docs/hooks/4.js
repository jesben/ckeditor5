/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );

module.exports = function() {
	const fileName = path.join( __dirname, '4.js' );
	console.log( `[${ fileName }]: Executing.` );
	console.log( `[${ fileName }]: Throwing an error.` );

	throw new Error( 'Synchronous error in 4.js' );
};
