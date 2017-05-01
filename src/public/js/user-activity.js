"use strict";
(() => {
	function init() {
		const idleLimit = 5*60; // 5 minutes in seconds
		let idleCounter = 0; // counter in seconds

		// Track most common events and reste counter
		$(document)
		.on('click', (event) => {
			idleCounter = 0;
		})
		.on('keypress', (event) => {
			idleCounter = 0;
		})
		.on('mousemove', (event) => {
			idleCounter = 0;
		})
		.on('wheel', (event) => {
			idleCounter = 0;
		});

		let intervalInstance = setInterval(() => {
			idleCounter++;
			if(idleCounter == idleLimit) {
				alert('You will be logged out for being inactive more than 5 minutes');
				location.href = '/logout';
			}
		}, 1000);
	}

	$(document).ready((event) => {
		init();
	});
})();