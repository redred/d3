var app = (function( $ ) {

	"use strict";

	var _collection = [],
		_ready = false,
		_load_int,
		_constrain_to_bounds = false,

		_loop_duration = 5,
		_max_travel = 3000,
		_direction_range = 100,
		_min_direction_change = 5,
		_redirect_distance = 10
	;

	/* * * * * * * * * * * * * * * * * * * * */

	function debug() {
		if ( ( window.console ) && ( window.console.log ) ) {
			window.console.log( arguments[0] );
		}
	}

	/* * * * * * * * * * * * * * * * * * * * */

	function _setup() {

		_load_int = setInterval( function() {

			if ( $( '#load-indicator' ).css( 'display' ) === 'block' ) {

				clearInterval( _load_int );

				_ready = true;

			}

		}, 20 );

	}

	/* * * * * * * * * * * * * * * * * * * * */

	function _init( options ) {

		if ( options && ( typeof options.constrain_to_bounds !== 'undefined' ) ) {

			_constrain_to_bounds = options.constrain_to_bounds;

		}

		if ( _ready === false ) {

			return;

		}

		var i;

		if ( _collection.length > 0 ) {

			for ( i = 0; i < _collection.length; i++ ) {

				_collection[ i ].destroy();

			}

		}

		var new_obj = new Wanderer({
			'$context': $( '#bounds' )
		});

		_collection.push( new_obj );

		debug( 'Initialized.' );

	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	function Wanderer() {

		this.$context = arguments[ 0 ].$context;

		this.$node = $( '<div class="node"></div>' );

		this.$context.append( this.$node );

		/* * * * * * * * * * * * * * * * * * * * */

		this.loop_duration = _loop_duration;

		this.animation_int = null;

		this.trajectory_array = [];

		this.current_step = 0;

		this.start_time = 0;

		this.max_time = _max_travel;

		this.constrain_to_bounds = _constrain_to_bounds;

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

		this.$node
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
			range = _direction_range,
			offset,
			trajectory,
			min_change = _min_direction_change,
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
				'x': this.$node.position().left,
				'y': this.$node.position().top
			},
			deg = this.trajectory_array[ this.current_step ],
			rad;

		rad = _deg_to_rad( deg );

		pos.x += Math.cos( rad ) * this.move_increment;

		pos.y += Math.sin( rad ) * this.move_increment;

		if ( this.constrain_to_bounds ) {

			pos = this.test_trajectory( pos );

		}

		this.$node
			.css({
				'top': pos.y,
				'left': pos.x
			});

		this.current_step = ( this.current_step < ( this.trajectory_array.length - 1 ) ) ? ( this.current_step + 1 ) : 0;

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/* 
	 * 9-zone grid test 
	 *
	 * Redirect to a particular direction based on the trajectory
	 *
	 */

	Wanderer.prototype.test_trajectory = function( pos ) {

		var new_pos;

		if ( ( pos.x <= 0 ) &&
			( pos.y <= 0 ) ) {

			// 1
			new_pos = this.redirect( '4' );

		} else if ( ( pos.x > 0 ) &&
					( pos.x < this.$context.width() ) &&
					( pos.y <= 0 ) ) {

			// 2
			new_pos = this.redirect( 'bottom' );

		} else if ( ( pos.x >= this.$context.width() ) &&
					( pos.y <= 0 ) ) {

			// 3
			new_pos = this.redirect( '3' );

		} else if ( ( pos.x <= 0 ) &&
					( pos.y > 0 ) &&
					( pos.y < this.$context.height() ) ) {

			// 4
			new_pos = this.redirect( 'right' );

		} else if ( ( pos.x > 0 ) &&
					( pos.x < this.$context.width() ) &&
					( pos.y > 0 ) &&
					( pos.y < this.$context.height() ) ) {

			// 5
			new_pos = pos;

		} else if ( ( pos.x >= this.$context.width() ) &&
					( pos.y > 0 ) &&
					( pos.y < this.$context.height() ) ) {

			// 6
			new_pos = this.redirect( 'left' );

		} else if ( ( pos.x < 0 ) &&
					( pos.y >= this.$context.height() ) ) {

			// 7
			new_pos = this.redirect( '1' );

		} else if ( ( pos.x > 0 ) &&
					( pos.x < this.$context.width()) &&
					( pos.y >= this.$context.height() ) ) {

			// 8
			new_pos = this.redirect( 'top' );

		} else if ( ( pos.x >= this.$context.width() ) &&
					( pos.y >= this.$context.height() ) ) {

			// 9
			new_pos = this.redirect( '2' );

		}

		return new_pos;

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.redirect = function( direction ) {

		debug( direction );

		var deg,
			rad,
			pos = {
				'x': this.$node.position().left,
				'y': this.$node.position().top
			};

		switch ( direction ) {

			case 'right':

				deg = ( Math.random() * 180 );

				deg -= 90;

				deg = ( deg < 0 ) ? ( 360 + deg ) : deg;

				break;

			case 'left':

				deg = ( Math.random() * 180 ) + 90;

				break;

			case 'top':

				deg = ( Math.random() * 180 );

				break;

			case 'bottom':

				deg = ( Math.random() * 180 );

				break;

			case '1':

				deg = ( Math.random() * 90 );

				break;

			case '2':
			
				deg = ( Math.random() * 90 ) + 90;

				break;

			case '3':

				deg = ( Math.random() * 90 ) + 180;

				break;

			case '4':
			
				deg = ( Math.random() * 90 ) + 270;

				break;

		}

		this.push_new_trajectory( deg );

		rad = _deg_to_rad( deg );

		pos.x += Math.cos( rad ) * this.move_increment;

		pos.y += Math.sin( rad ) * this.move_increment;

		return pos;

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.push_new_trajectory = function( deg ) {

		var i,
			new_direction = [],
			count = _redirect_distance;

		while ( i < count ) {

			new_direction.push( deg );

		}

		debug( this.trajectory_array );

		debug( 'deg: ' + deg );

		debug( 'starting: ' + this.current_step );

		for ( i = 0; i < count; i++ ) {

			this.trajectory_array.splice( this.current_step, 0, deg );

		}

		debug( this.trajectory_array );

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.stop_animation = function() {

		clearInterval( this.animation_int );

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	Wanderer.prototype.destroy = function() {

		this.$node.empty();

		this.stop_animation();

		_collection = [];

	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	function _deg_to_rad( deg ) {

		return ( Math.PI * deg ) / 180;

	}

	return {

		init  : _init,
		setup : _setup

	};

	/* * * * * * * * * * * * * * * * * * * */

})( jQuery );

app.setup();
