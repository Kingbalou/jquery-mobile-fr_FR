/*
 * mobile support unit tests
 */

(function( $ ) {
	$.testHelper = {
		// This function takes sets of files to load asynchronously. Each set will be loaded after
		// the previous set has completed loading. That is, each require and it's dependencies in a
		// set will be loaded asynchronously, but each set will be run in serial.
		asyncLoad: function( seq, baseUrl ) {
			require({
				baseUrl: ( baseUrl || "../../../js" )
			});

			function loadSeq( seq, i ){
				if( !seq[i] ){
					$( document ).ready( function() {
						var $fixture = $( '#qunit-fixture' );
						if ( $fixture.length ) {
							QUnit.config.fixture = $fixture.html();
						}
						QUnit.start();
					});
					return;
				}

				require( seq[i], function() {
					loadSeq(seq, i + 1);
				});
			}

			// stop qunit from running the tests until everything is in the page
			QUnit.config.autostart = false;

			loadSeq( seq, 0 );
		},

		excludeFileProtocol: function(callback){
			var message = "Tests require script reload and cannot be run via file: protocol";

			if (location.protocol == "file:") {
				test(message, function(){
					ok(false, message);
				});
			} else {
				callback();
			}
		},

		// TODO prevent test suite loads when the browser doesn't support push state
		// and push-state false is defined.
		setPushState: function() {
			if( $.support.pushState && location.search.indexOf( "push-state" ) >= 0 ) {
				$.support.pushState = false;
			}
		},

		pushStateRedirect: function( filename ) {
			var search, pairs = [];

			search = location.search.replace( "?", "");

			if( search ){
				pairs = search.split( "&" );
			}

			pairs.push( "push-state=false" );

			location.href = location.href.toString()
				 .replace(/\/[^\/]*\?|\/[^\/]*$/, "/" + filename )
				 .replace( search, "") + "?" + pairs.join( "&" );
		},

		reloads: {},

		reloadModule: function(libName){
			var deferred = $.Deferred(),
				context;

			// where a module loader isn't defined use the old way
			if( !window.require ) {
				this.reloadLib( libName );
				deferred.resolve();
				return deferred;
			}

			if(this.reloads[libName] === undefined) {
				this.reloads[libName] = {
					count: 0
				};
			}

			//Clear internal cache of module inside of require
			context = require.s.contexts._;
			delete context.defined[libName];
			delete context.specified[libName];
			delete context.loaded[libName];
			delete context.urlFetched[require.toUrl(libName + '.js')];

			require(
				{
					baseUrl: "../../../js"
				}, [libName],
				function() {
					deferred.resolve();
				}
			);

			return deferred;
		},

		reloadLib: function(libName){
			if(this.reloads[libName] === undefined) {
				this.reloads[libName] = {
					lib: $("script[src$='" + libName + "']"),
					count: 0
				};
			}

			var lib = this.reloads[libName].lib.clone(),
				src = lib.attr('src');

			//NOTE append "cache breaker" to force reload
			lib.attr('src', src + "?" + this.reloads[libName].count++);
			$("body").append(lib);
		},

		rerunQunit: function(){
			var self = this;
			QUnit.init();
			$("script:not([src*='.\/'])").each(function(i, elem){
				var src = elem.src.split("/");
				self.reloadLib(src[src.length - 1]);
			});
			QUnit.start();
		},

		alterExtend: function(extraExtension){
			var extendFn = $.extend;

			$.extend = function(object, extension){
				// NOTE extend the object as normal
				var result = extendFn.apply(this, arguments);

				// NOTE add custom extensions
				result = extendFn(result, extraExtension);
				return result;
			};
		},

		hideActivePageWhenComplete: function() {
			if( $('#qunit-testresult').length > 0 ) {
				$('.ui-page-active').css('display', 'none');
			} else {
				setTimeout($.testHelper.hideActivePageWhenComplete, 500);
			}
		},

		openPage: function(hash){
			location.href = location.href.split('#')[0] + hash;
		},

		sequence: function(fns, interval){
			$.each(fns, function(i, fn){
				setTimeout(fn, i * interval);
			});
		},

		pageSequence: function( fns ){
			this.eventSequence( "pagechange", fns );
		},

		eventSequence: function( event, fns, timedOut ){
			var seq = [];
			$.each(fns, function( i, fn ) {
				seq.push( fn );
				if( i !== fns.length - 1) seq.push( event );
			});

			this.eventCascade( seq );
		},

		eventCascade: function( sequence, timedOut ) {
			var fn = sequence.shift(),
				event = sequence.shift(),
				self = this;

			if( fn === undefined ) {
				return;
			}

			if( event ){
				// if a pagechange or defined event is never triggered
				// continue in the sequence to alert possible failures
				var warnTimer = setTimeout(function() {
					self.eventCascade( sequence, true );
				}, 2000);

				// bind the recursive call to the event
				$.mobile.pageContainer.one(event, function() {
					clearTimeout( warnTimer );

					// Let the current stack unwind before we fire off the next item in the sequence.
					// TODO setTimeout(self.pageSequence, 0, sequence);
					setTimeout(function(){ self.eventCascade(sequence); }, 0);
				});
			}

			// invoke the function which should, in some fashion,
			// trigger the next event
			fn( timedOut );
		},

// detailedEventCascade: call a function and expect a series of events to be triggered (or not to be triggered), and guard
// with a timeout against getting stood up. Record the result (timed out / was triggered) for each event, and the order
// in which the event arrived wrt. any other events expected.
//		seq : [
//			fn(result),
//			{ key: {
//					src: event source (is jQuery object or function returning jQuery object),
//					event: event name (is string),
//					       NB: It's a good idea to namespace your events, because the handler will be removed
//					       based on the name you give here if a timeout occurs before the event fires.
//					userData1: value,
//					...
//					userDatan: value
//			  },
//				...
//			]
//			...
//		]
//		result: {
//			key: {
//				idx: order in which the event fired
//				src: event source (is jQuery object),
//				event: event name (is string)
//				timedOut: timed out (is boolean)
//				userData1: value,
//				...
//				userDatan: value
//			}
//			...
//		}
		detailedEventCascade: function( seq, result ) {
			// grab one step from the sequence
			var fn = seq.shift(),
			    events = seq.shift(),
			    self = this,
			    derefSrc = function( src ) {
						return ( $.isFunction( src ) ? src() : src );
					};

			// we're done
			if ( fn === undefined ) {
				return;
			}

			// Attach handlers to the various objects which are to be checked for correct event generation
			if ( events ) {
				var newResult = {},
					nEventsDone = 0,
					nEvents = 0,
					// set a failsafe timer in case one of the events never happens
					warnTimer = setTimeout( function() {
						$.each( events, function( key, event ) {
							if ( newResult[ key ] === undefined ) {
								// clean up the unused handler
								derefSrc( event.src ).unbind( event.event );
								newResult[ key ] = $.extend( {}, event, { timedOut: true } );
							}
						});

						// Move on to the next step
						self.detailedEventCascade( seq, newResult );
					}, 20000);

				function recordResult( key, event, result ) {
					// Record the result
					newResult[ key ] = $.extend( {}, event, result );
					// Increment the number of received responses
					nEventsDone++;
					if ( nEventsDone === nEvents ) {
						// clear the timeout and move on to the next step when all events have been received
						clearTimeout( warnTimer );
						setTimeout( function() {
							self.detailedEventCascade( seq, newResult );
						}, 0);
					}
				}

				$.each( events, function( key, event ) {
					// Count the events so that we may know how many responses to expect
					nEvents++;
					// If it's an event
					if ( event.src ) {
						// Hook up to the event
						derefSrc( event.src ).one( event.event, function() {
							recordResult( key, event, { timedOut: false, idx: nEventsDone } );
						});
					}
					// If it's a timeout
					else {
						setTimeout( function() {
							recordResult( key, event, { timedOut: true, idx: -1 } );
						}, event.length );
					}
				});
			}

			// Call the function with the result of the events
			fn( result );
		},

		deferredSequence: function(fns) {
			var fn = fns.shift(),
				deferred = $.Deferred(),
				self = this, res;

			if (fn) {
				res = fn();
				if ( res && $.type( res.done ) === "function" ) {
					res.done(function() {
						self.deferredSequence( fns ).done(function() {
							deferred.resolve();
						});
					});
				} else {
					self.deferredSequence( fns ).done(function() {
						deferred.resolve();
					});
				}
			} else {
				deferred.resolve();
			}
			return deferred;
		},

		decorate: function(opts){
			var thisVal = opts.self || window;

			return function(){
				var returnVal;
				opts.before && opts.before.apply(thisVal, arguments);
				returnVal = opts.fn.apply(thisVal, arguments);
				opts.after && opts.after.apply(thisVal, arguments);

				return returnVal;
			};
		},

		assertUrlLocation: function( args ) {
			var parts = $.mobile.path.parseUrl( location.href ),
				pathnameOnward = location.href.replace( parts.domain, "" );

			if( $.support.pushState ) {
				deepEqual( pathnameOnward, args.hashOrPush || args.push, args.report );
			} else {
				deepEqual( parts.hash, "#" + (args.hashOrPush || args.hash), args.report );
			}
		},

		navReset: function( url ) {
			var pageReset = function( hash ) {
				var timeout;

				stop();

				timeout = setTimeout( start, 2000);

				$(document).one( "pagechange", function() {
					clearTimeout( timeout );
					start();
				});

				location.hash = hash ? "#" + hash : "";
			};

			// force the page reset for hash based tests
			if ( location.hash && !$.support.pushState ) {
				pageReset();
			}

			// force the page reset for all pushstate tests
			if ( $.support.pushState ) {
				pageReset( url );
			}
		}
	};
})(jQuery);
