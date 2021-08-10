/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );

module.exports = function() {
	const fileName = path.join( __dirname, '3.js' );
	console.log( `[${ fileName }]: Executing.` );

	return new Promise( resolve => {
		console.log( `[${ fileName }]: Entering the promise block.` );

		setTimeout( () => {
			console.log( `[${ fileName }]: Inside setTimeout:1000.` );
			resolve();
		}, 1000 );
	} );
};
