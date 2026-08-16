/* ==========================================================================
   RUI YANG — PORTFOLIO
   3D mouse tilt

   Applied to .stage only. The nav rail is a SIBLING of .stage, never a
   descendant, so it is structurally excluded from the transform — the menu
   can never tilt, whatever the cursor does.

   Smoothing lives in CSS: .stage carries `transition: transform .1s ease-out`.
   This file only writes the target angle, throttled to one write per frame,
   so fast mouse movement cannot queue up redundant style writes.
   ========================================================================== */

(function () {
	var stage = document.querySelector('.stage');
	if (!stage) return;

	/* Re-read on every move rather than caching, so a resize, a reduced-motion
	   preference change, or a newly plugged-in mouse is picked up for free. */
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	var allowed = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 861px)');

	var MAX_TILT = 4;                 /* degrees at the very edge of the screen */
	var rotY = 0, rotX = 0;
	var queued = false;

	if (!reduced.matches && allowed.matches) stage.style.willChange = 'transform';

	function write() {
		queued = false;
		stage.style.transform =
			'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg)' +
			' rotateY(' + rotY.toFixed(2) + 'deg)';
	}

	function queue() {
		if (!queued) { queued = true; requestAnimationFrame(write); }
	}

	window.addEventListener('mousemove', function (e) {
		if (reduced.matches || !allowed.matches) {
			if (stage.style.transform) { stage.style.transform = ''; }
			return;
		}

		var cx = window.innerWidth  / 2;
		var cy = window.innerHeight / 2;

		rotY =  ((e.clientX - cx) / cx) * MAX_TILT;   /* left/right → rotateY */
		rotX = -((e.clientY - cy) / cy) * MAX_TILT;   /* up/down    → rotateX */
		queue();
	}, { passive: true });

	/* settle back to flat when the cursor leaves the window entirely */
	window.addEventListener('mouseout', function (e) {
		if (!e.relatedTarget) { rotY = 0; rotX = 0; queue(); }
	});
})();
