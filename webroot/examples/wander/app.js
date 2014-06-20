var app = (function( $ ) {

	"use strict";

	var _collection = [];

	/* * * * * * * * * * * * * * * * * * * * */

	function debug() {
		if ( ( window.console ) && ( window.console.log ) ) {
			window.console.log( arguments[0] );
		}
	}

	/* * * * * * * * * * * * * * * * * * * * */

	function _init( options ) {

		var i;

		if ( _collection.length > 0 ) {

			for ( i = 0; i < _collection.length; i++ ) {

				_collection[ i ].destroy();

			}

		}

		var new_obj = new Wanderer({
			'$context': $( '#bounds' ),
			'options': options
		});

		_collection.push( new_obj );

	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	function Wanderer() {

		this.$context = arguments[ 0 ].$context;

		this.$wrap = $( '<div class="node"></div>' );

		this.$context.append( this.$wrap );

		this.options = arguments[ 0 ].options || null;

		/* * * * * * * * * * * * * * * * * * * * */

		this.loop_duration = 10000;

		this.animation_int = null;

		this.trajectory_array = [];

		this.current_step = 0;

		this.start_time = 0;

		this.max_time = 1000000;

		this.constrain_to_bounds = false;

		if ( this.options !== null && ( typeof this.options.constrain_to_bounds !== 'undefined' ) ) {

			this.constrain_to_bounds = this.options.constrain_to_bounds;

		}

		this.move_increment = 2;

		/* * * * * * * * * * * * * * * * * * * * */

		this.generate_trajectories();

		this.start_animation();

	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.start_animation = function() {

		var $this = this,
			t = new Date(),
			time_now = t.getTime();

		this.start_time = time_now;

		this.$wrap
			.css({
				'top': this.$context.height() / 2,
				'left': this.$context.width() / 2
			});

		$this.animation_int = setInterval( function() {

			$this.update();

		}, 10 );

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.generate_trajectories = function() {

		var i,
			j,
			range = 180,
			offset,
			trajectory,
			min_change = 5,
			change = min_change;

		change += Math.round( Math.random() * 50 );

		for ( i = 0; i < this.loop_duration; i++ ) {

			if ( i > 0 ) {

				offset = Math.random() * range;

				trajectory = this.trajectory_array[ i - 1 ] + offset;

				if ( trajectory > 359 ) {

					trajectory = ( trajectory - 359 );

				}

			} else {

				trajectory = Math.random() * 360;

			}

			for ( j = 0; j < change; j++ ) {

				this.trajectory_array.push( trajectory );

			}
		
		}

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.update = function() {

		var t = new Date(),
			time_now = t.getTime();

		if ( this.trajectory_array.length < 1 ) {

			return;

		}

		if ( ( time_now - this.start_time ) > this.max_time ) {

			clearInterval( this.animation_int );

		}

		var pos = {
				'x': this.$wrap.position().left,
				'y': this.$wrap.position().top
			},
			deg = this.trajectory_array[ this.current_step ],
			rad;

		rad = _deg_to_rad( deg );

		pos.x += Math.cos( rad ) * this.move_increment;

		pos.y += Math.sin( rad ) * this.move_increment;

		if ( this.constrain_to_bounds ) {

			pos = this.test_trajectory( pos );

		}

		this.$wrap
			.css({
				'top': pos.y,
				'left': pos.x
			});

		this.current_step = ( this.current_step < ( this.loop_duration - 1 ) ) ? ( this.current_step + 1 ) : 0;

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/* 
	 * 9-zone grid test
	 *
	 */

	Wanderer.prototype.test_trajectory = function( pos ) {

		var new_pos;

		if ( ( pos.x < 0 ) &&
			( pos.y < 0 ) ) {

			// 1
			new_pos = this.redirect( '4' );

		} else if ( ( pos.x > 0 ) &&
					( pos.x < this.$wrap.width() ) &&
					( pos.y < 0 ) ) {

			// 2
			new_pos = this.redirect( 'quadrant-bottom' );

		} else if ( ( pos.x > 0 ) &&
					( pos.y < 0 ) ) {

			// 3
			new_pos = this.redirect( '4' );

		} else if ( ( pos.x < 0 ) &&
					( pos.y >= 0 ) &&
					( pos.y <= this.$wrap.height() ) ) {

			// 4
			new_pos = pos; // pass through

		} else if ( ( pos.x >= 0 ) &&
					( pos.x <= this.$wrap.width() ) &&
					( pos.y >= 0 ) &&
					( pos.y <= this.$wrap.height() ) ) {

			// 5
			new_pos = pos;

		} else if ( ( pos.x > this.$wrap.width() ) &&
					( pos.y >= 0 ) &&
					( pos.y <= this.$wrap.height() ) ) {

			// 6
			new_pos = this.redirect( '4' );

		} else if ( ( pos.x < 0 ) &&
					( pos.y > this.$wrap.height() ) ) {

			// 7
			new_pos = this.redirect( '1' );

		} else if ( ( pos.x >= 0 ) &&
					( pos.x <= this.$wrap.width()) &&
					( pos.y > this.$wrap.height() ) ) {

			// 8
			new_pos = this.redirect( 'quadrant-top' );

		} else if ( ( pos.x > this.$wrap.width() ) &&
					( pos.y > this.$wrap.height() ) ) {

			// 9
			new_pos = this.redirect( 'quadrant-top' );

		}

		return new_pos;

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.redirect = function( quadrant ) {

		var deg,
			rad,
			pos = {
				'x': this.$wrap.position().left,
				'y': this.$wrap.position().top
			};

		if ( quadrant === 'quadrant-right' ) {

			deg = ( Math.random() * 180 );

			deg = ( deg > 90 ) ? ( 360 - ( deg - 90 ) ) : deg;

		} else if ( quadrant === 'quadrant-left' ) {

			deg = ( Math.random() * 180 ) + 90;

		} else if ( quadrant === 'quadrant-top' ) {

			deg = ( Math.random() * 180 );

		} else if ( quadrant === 'quadrant-bottom' ) {

			deg = ( Math.random() * 180 );

		} else if ( quadrant === '1' ) {

			deg = ( Math.random() * 90 );

		} else if ( quadrant === '2' ) {

			deg = ( Math.random() * 90 ) + 90;

		} else if ( quadrant === '3' ) {

			deg = ( Math.random() * 90 ) + 180;

		} else if ( quadrant === '4' ) {

			deg = ( Math.random() * 90 ) + 270;

		}

		rad = _deg_to_rad( deg );

		pos.x += Math.cos( rad ) * this.move_increment;

		pos.y += Math.sin( rad ) * this.move_increment;

		return pos;

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.stop_animation = function() {

		clearInterval( this.animation_int );

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.destroy = function() {

		this.$wrap.empty();

		this.stop_animation();

		_collection = [];

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	function _deg_to_rad( deg ) {

		return ( Math.PI * deg ) / 180;

	}

	function _test() {

		debug( 'Test' );

	}

	return {

		init : _init,
		test : _test

	};

	/* * * * * * * * * * * * * * * * * * * */

})( jQuery );

app.test();