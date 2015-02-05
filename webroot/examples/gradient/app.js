(function( $ ) {

  "use strict";

  var _collection = [];

  function debug() {
    if ( ( window.console ) && ( window.console.log ) ) {
      window.console.log( arguments[0] );
    }
  }

  var d3 = window.d3,
    stop_sets = [
      [ 
        {
          "colors": [
            "#ff0000",
            "#00ff00",
            "#0000ff"
          ] 
        },
      ],
      [ 
        {
          "colors": [
            "#33cccc",
            "#cc33cc",
            "#cccc33"
          ] 
        },
      ],
      [ 
        {
          "colors": [
            "#cc0033",
            "#3300cc",
            "#00cc33"
          ] 
        }
      ]
    ];

  /* * * * * * * * * * * * * * * * * * * */

  var w = '100%',
    h = '100%';

  var svg = d3.select( "#page" ).append( "svg:svg" )
    .attr( "width", w )
    .attr( "height", h );

  var gradient = svg.append("svg:defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient.append("svg:stop")
    .attr("class", "stop1")
    .attr("offset", "0%")
    .attr("stop-color", "#000")
    .attr("stop-opacity", 1);

  gradient.append("svg:stop")
    .attr("class", "stop2")
    .attr("offset", "50%")
    .attr("stop-color", "#999")
    .attr("stop-opacity", 1);

  gradient.append("svg:stop")
    .attr("class", "stop3")
    .attr("offset", "100%")
    .attr("stop-color", "#333")
    .attr("stop-opacity", 1);

  svg.append("svg:rect")
    .attr("width", w)
    .attr("height", h)
    .style("fill", "url(#gradient)");

  /* * * * * * * * * * * * * * * * * * * */

  function _draw( idx ) {

    var set = stop_sets[ idx ],
      html;

    html = set[0].colors.join(' : ');

    $( 'textarea' ).html( html );
    
    debug( set );

    /* * * * * * * * * * * * * * * * * * * */

    gradient.selectAll( ".stop1" )
      .data( set )
      .transition()
      .duration( 1000 )
      .attr( "stop-color", function( s ) {
        return s.colors[0];
      });

    gradient.selectAll( ".stop2" )
      .data( set )
      .transition()
      .duration( 1000 )
      .attr( "stop-color", function( s ) {
        return s.colors[1];
      });
      
    gradient.selectAll( ".stop3" )
      .data( set )
      .transition()
      .duration( 1000 )
      .attr( "stop-color", function( s ) {
        return s.colors[3];
      });

    /* * * * * * * * * * * * * * * * * * * */

  }

  /* * * * * * * * * * * * * * * * * * * */

  function MyButton() {

    this.id = arguments[0].id;    

    this.label = 'Button ' + ( this.id + 1 );

    this.$button = $( '<button></button>' );

    this.$button.html( this.label );

    $( '.buttons' ).append( this.$button );

    this.bind_handlers();

  }

  MyButton.prototype.bind_handlers = function(){

    var $this = this;

    this.$button
      .on( 'click', function() {
        _draw( $this.id );
      });

  };

  /* * * * * * * * * * * * * * * * * * * */

  for ( var i = 0; i < 3; i++ ) {

    var temp = new MyButton({
      'id': i
    });

    _collection.push( temp );

  }

  /* * * * * * * * * * * * * * * * * * * */

})( jQuery );