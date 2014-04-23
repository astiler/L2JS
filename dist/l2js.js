/*!
* L-System to Javascript Library v0.0.2
*
* Copyright 2013, 2013 Tomáš Konrády (tomas.konrady@uhk.cz)
* Released under the MIT license
*
* Date: 2014-04-22T22:26:53.498Z
*/

(function( global, factory ) {'use strict';

        if ( typeof module === "object" && typeof module.exports === "object" ) {
                // For CommonJS and CommonJS-like environments where a proper window is present,
                // execute the factory and get jQuery
                // For environments that do not inherently posses a window with a document
                // (such as Node.js), expose a jQuery-making factory as module.exports
                // This accentuates the need for the creation of a real window
                // e.g. var jQuery = require("jquery")(window);
                // See ticket #14549 for more info
                module.exports = global.document ?
                        factory( global ) :
                        function( w ) {
                                if ( !w.document ) {
                                        throw new Error( "l2js requires a window with a document" );
                                }
                                return factory( w );
                        };
        } else {
                factory( global );
        }

// Pass this, window may not be defined yet
}(this, function( window ) {

var _l2js = window.l2js;
window.l2js = window.l2js || (window.l2js = {});
window.l2js.files = {};

/**
 * Core of the library. Provides factory for core objects used by other modules.
 */


	l2js.core = l2js.core  || {};

/**
 * Promise object inspired by {@link http://docs.angularjs.org/api/ng.$q}
 * 
 */
// TODO: chain promises, chain errors



	
	
	/** Promise */
	l2js.core.Promise = function Promise(deferred) {
		this.deferred = deferred;
	};
	
	l2js.core.Promise.prototype.then = function(successCallback, errorCallback) {
		
		this.deferred.successCallback = successCallback;
		this.deferred.errorCallback = errorCallback;
		
		this.result = l2js.core.q.deferred();
		return this.result.promise;
		
	};
	
	l2js.core.Promise.prototype.catch = function(errorCallback) {
		this.deferred.errorCallback = errorCallback;
	};
	
	
	/**
	 * Deffered
	 */
	l2js.core.Deferred = function() {
		this.promise = new l2js.core.Promise(this);
	};


	l2js.core.Deferred.prototype.reject = function(reason) {
		if(this.errorCallback) {
			this.promise.result.reject(this.errorCallback(reason) || reason );	
		}
	};

	l2js.core.Deferred.prototype.resolve = function(value) {
		if(this.successCallback) {
			this.promise.result.resolve(this.successCallback(value) || value);	
		}
		
	};
	
	l2js.core.q = {
		/** Factory for deffered object */
		deferred : function() {
			return new l2js.core.Deferred();
		}
	};

/**
 * Utility methods
 */


	
	l2js.utils = {
		copy: function (obj) {
			if (l2js.utils.isUndefined(obj) || typeof obj !== "object") {
				return obj;
			}

			var out = new obj.constructor();

			for (var key in obj) {
				out[key] = l2js.utils.copy(obj[key]);
			}
			return out;
		},

		hasProp: {}.hasOwnProperty,

		// coffeescript
		extend: function (child, parent) {
			for (var key in parent) {
				if (l2js.utils.hasProp.call(parent, key))
					child[key] = parent[key];
			}
			function ctor() {
				this.constructor = child;
			}


			ctor.prototype = parent.prototype;
			child.prototype = new ctor();
			child.__super__ = parent.prototype;
			return child;
		},

		// prototype
		indexOf: function (arr, item, i) {
			i || ( i = 0);
			var length = arr.length;
			if (i < 0)
				i = length + i;
			for (; i < length; i++)
				if (arr[i] === item)
					return i;
			return -1;
		},

		isUndefined: function (v) {
			return typeof v === 'undefined';
		}, 
		isFunction:function (functionToCheck) {
		 var getType = {};
		 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
		},
		toUpperFirstLetter: function (string) {
		    return string.charAt(0).toUpperCase() + string.slice(1);
		},
		/** 
		 * http://xazure.net/2011/06/tips-snippets/javascript/padding-string-in-javascript/ 
		 * @param str - The string to pad. 
		 * @param padChar - The character to pad the string with. 
		 * @param length - The length of the resulting string. 
		 *
		 * @return The padded string. 
		 */ 
		padLeft: function (str, padChar, length) { 
		
		    while(str.length < length) 
		        str = padChar + str;
		    return str; 
		} 	
	};

l2js.compiler = l2js.compiler || {};

l2js.compiler.env = l2js.compiler.env || {};

/**
	 * Alphabet determines what symbols are used by a L-system.
	 * 
	 * @class
	 */
	l2js.compiler.env.Alphabet = (function() {
		function Alphabet(id, symbols) {
			this.id = id;
			this.symbols = symbols;
		}

		/**
		 * @memberOf l2js.Alphabet
		 */
		Alphabet.prototype.hasSymbol = function(symbol) {
			if (!this.symbols && !symbol) {
				return false;
			}
			return (this.symbols && symbol)
					&& l2js.utils.indexOf(this.symbols, symbol) !== -1;
		};

		return Alphabet;
	})();

/** 
 * SubLSystem wraps LSystem for keeping result of last derivation. 
 * Derivation process can be called individually step by step, derivation by derivation respectively. 
 **/



	
	l2js.compiler.env.SubLSystem = (function() {

		/**
		 * @param ctx context for variables
		 * @param lsystem Prototype of lsystem for wrapping
		 * @param axiom
		 * @param maxIterations
		 */
		function SubLSystem(ctx, lsystem, axiom, maxIterations) {
			this.ctx = ctx;
			this.lsystem = lsystem;
			
			if(typeof axiom === "number") {
				maxIteration = axiom;
				axiom = undefined;
			}
			
			this.axiom = axiom;
			this.maxIterations = maxIterations;
		}


		SubLSystem.prototype.derive = function() {

			var result;
			if(!this.lsystemInst) {
				this.lsystemInst = new this.lsystem(this.ctx);
			}
			if (this.derivation) {
				result = this.lsystemInst.derive(this.derivation, this.maxIterations);
			} else {
				result = this.lsystemInst.derive(this.axiom, this.maxIterations);
				this.axiom = result.axiom; // axiom used in the first iteration
			}
			
			this.derivation = result.derivation;
			this.interpretation = result.interpretation;

			return this;

		};

		return SubLSystem;

	})();

l2js.compiler.env.Stack = (function() {

		function Stack(start, end, string) {
			this.start = start;
			this.end = end;
			this.string = string;
		}

		return Stack;

	})();

/**
	 * Abstract LSystem class.
	 * 
	 * @class
	 */
	l2js.compiler.env.LSystem = (function(l2js) {

		function LSystem(ctx) {
			this.ctx = ctx?l2js.utils.copy(ctx):{};
			this.rulesProbabilities = {};
		}
		
		/*
		LSystem.prototype.axiom = [];
		LSystem.prototype.maxIterations = 1;
		LSystem.prototype.self = LSystem;
		*/
		
				
		/**
		 * @memberOf l2js.compiler.env.LSystem
		 */
		LSystem.prototype.checkAlphabetSymbol = function(symbol) {
//			if (!this.self.alphabet.hasSymbol(symbol)) {
//				throw Error("Alphabet '" + this.self.alphabet.name + "' (used in '" + this.name + "') does not contain symbol '" + symbol + "'.");
//			}
		};

		// derive() derive([]) derive(2) derive([], 2)
		/**
		  * @memberOf l2js.compiler.env.LSystem
		  */
		LSystem.prototype.derive = function(axiom, maxIterations) {
			if (arguments.length === 0) {
				axiom = this.axiom();
				maxIterations = this.maxIterations;
			} else if (arguments.length === 1) {
				if ( typeof axiom === "number") {
					maxIterations = arguments[0];
					axiom = this.axiom();
				} else {
					maxIterations = this.maxIterations;
				}
			} else if (arguments.length === 2) {
				axiom = axiom || this.axiom();
				maxIterations = l2js.utils.isUndefined(maxIterations)? this.maxIterations:maxIterations;
			}

			var i, 
				max = maxIterations + 1, // + axiom			
				out = {
					axiom : axiom,
					totalIterations: maxIterations,
					derivations : [],
					interpretations : []
				};
			for ( i = 0; i < max; i++) {

				out.derivation = out.derivation ? this.deriveString(out.derivation, "-") : axiom;
				out.interpretation = this.deriveString(out.derivation, "h");

				// add to history
				// if (i !== 0) {
					out.derivations.push(l2js.utils.copy(out.derivation));
					out.interpretations.push(l2js.utils.copy(out.interpretation));
				// }
			}

			return out;
		};
		
		/**
		  * @memberOf l2js.compiler.env.LSystem
		  */
		LSystem.prototype.deriveString = function(ancestor, type) {
			var successor = [], j;
			for ( j = 0; j < ancestor.length; j++) {

				if (l2js.utils.isUndefined(ancestor[j])) {
					throw Error("Undefined ancestor.");
				}

				// Sub-L-systems should be derived only in main derivation
				if (ancestor[j] instanceof l2js.compiler.env.SubLSystem) {
					type === "-" && successor.push(l2js.utils.copy(ancestor[j]).derive()) || successor.push(l2js.utils.copy(ancestor[j]));
				} else if (ancestor[j] instanceof l2js.compiler.env.Stack) {
					successor.push(new l2js.compiler.env.Stack(ancestor[j].start, ancestor[j].end,this.deriveString(ancestor[j].string, type)));
				} else {
					var symbol = ancestor[j];
					this.checkAlphabetSymbol(symbol.symbol);
					successor = successor.concat(this.findDerivation(symbol, type));
				}
			}
			return successor;
		};
		
		/**
		  * @memberOf l2js.compiler.env.LSystem
		  */
		LSystem.prototype.findDerivation = function(toDerive, ruleType) {
			var hash = LSystem.makeHash(toDerive, ruleType);
			
			if (!l2js.utils.isUndefined(this.rules[hash])) {
				var rules = this.rules[hash];

				if(l2js.utils.isUndefined(this.rulesProbabilities[hash])) {
					this.rulesProbabilities[hash] = 0;
					for ( i = 0; i < rules.length; i++) {
						var rule = rules[i];
						this.rulesProbabilities[hash] += rule.probability;
					}
				}
				if(this.rulesProbabilities[hash] !== 0) {
					var threshold = Math.random() * this.rulesProbabilities[hash], i, sum = 0;
	
					for ( i = 0; i < rules.length; i++) {
						var rule = rules[i];
	
						sum += rule.probability;
						if (threshold <= sum) {
							return rule.successor.apply(this, toDerive.arguments);
						}
					}
				
				}
			
			} 
			return [toDerive]; //identity
		};

		/** Static */
		
		/**
		 * Creates hash of the module.
		 * 
		 * @param {object} module - Module for which hash is returned
		 * @param {string} ruleType - Either '-' or 'h', default is '-'
		 * 
		 * @returns {string} Hash of the module
		 * @memberOf l2js.compiler.env.LSystem
		 */
		LSystem.makeHash = function(module, ruleType) {
			var args = module.arguments || module.params || [], hash = "";
			l2js.utils.isUndefined(ruleType) && (ruleType = '-');
			
			var i;
			for ( i = 0; i < args.length; i++) {
				hash += l2js.utils.isUndefined(args[i]) ? 0 : 1;
			}

			return ruleType + "@" + hash + "_" + module.symbol;
		};
		
		/**
		 * Factory method for the instance of the module
		 * 
		 * @param {string} symbol - Symbol of the alphabet
		 * @param {array} args - Array of the arguments for the module
		 * @param {string} alphabet - Name of the alphabet for the symbol 
		 * 
		 * @returns {object} Instance of the module 
		 * @memberOf l2js.compiler.env.LSystem
		 */
		LSystem.getModule = function(symbol, args, alphabet){
			return {
				alphabet : alphabet,
				symbol : symbol,
				arguments : args
			};
		};
		
		/**
		 * Factory method for the declaration of the module
		 * 
		 * @param {string} symbol - Symbol of alphabet
		 * @param {array} params - Array of names of the parameters for the module
		 * @param {string} alphabet - Name of the alphabet for the symbol 
		 * 
		 * @returns {object} Declaration of the module 
		 * @memberOf l2js.compiler.env.LSystem
		 */
		LSystem.getParamModule = function(symbol, params, alphabet){
			return {
				alphabet : alphabet,
				symbol : symbol,
				params : params
			};
		};

		LSystem.id = "";
		LSystem.alphabet = {};
		
		return LSystem;

	})(l2js);

/**
	 * Abstract LScript class.
	 * 
	 * @class
	 */
	l2js.compiler.env.LScript = (function() {

		function LScript(ctx) {	
			this.ctx = l2js.utils.copy(ctx);	
		}

		/**
		  * @memberOf l2js.LScript
		  */
		LScript.prototype.derive = function(axiom, maxIterations) {
			if(l2js.utils.isUndefined(this.main)) {
				throw new Error('LScript (\'' + this.self.id + '\') has no main call.');
			}
			return new this.main(this.ctx).derive(axiom || this.axiom, maxIterations || this.maxIterations);
		};
		

		
		return LScript;

	})();

/** 
 * SubLScript wraps LScript for keeping result of last derivation. 
 * Derivation process can be called individually step by step, derivation by derivation respectively. 
 **/



	
	l2js.compiler.env.SubLScript = (function() {

		function SubLScript(lscript, axiom, maxIterations) {
			this.lscript = lscript; // instance
			this.axiom = axiom;
			this.maxIterations = maxIterations;
		}


		SubLScript.prototype.derive = function() {

			var result;
			if (this.derivation) {
				result = this.lscript.derive(this.derivation, this.maxIterations);
			} else {
				result = this.lscript.derive(this.axiom, this.maxIterations);
				this.axiom = result.axiom;
			}

			this.derivation = result.derivation;
			this.interpretation = result.interpretation;

			return this;
		};

		return SubLScript;

	})();

/**
 * AST nodes for L2
 */


	
	l2js.compiler.lnodes = (function() {
	
		var lnodes = {};
		lnodes.ASTBlock = function ASTBlock() {
			this.entries = [];
			this.isRoot = false;
		};
		
		lnodes.ASTBlock.prototype.addEntry = function(entry) {
			this.entries.push(entry);
		};
		
		lnodes.ASTId = function ASTId(id, type, e) {
			this.id = id;
			this.type = type;
			this.e = e;
		};
		
		lnodes.ASTOperation = function ASTOperation(op, left, right){
			this.op = op;
			this.left = left;
			this.right = right;
		};
		
		lnodes.ASTBrackets= function ASTBrackets(e){
			this.e = e;
		};
		
		lnodes.ASTFunc = function ASTFunc(id, args) {
			this.id = id;
			this.args = args;
		};
		
		lnodes.ASTLSystem = function ASTLSystem(id, alphabet, axiom, maxIterations, body){
			this.id = id;
			this.body = body;
			this.alphabet = alphabet;
			this.axiom = axiom;
			this.maxIterations = maxIterations;
		};
		
		lnodes.ASTLScript = function ASTLScript(id, body){
			this.id = id;
			this.body = body;
		};
		
		lnodes.ASTRule = function ASTRule(ancestor, successors, type) {
			this.ancestor = ancestor;
			this.successors = successors;
			this.type = type;
		};
		
		lnodes.ASTAncestor = function ASTAncestor(symbol, params) {
			this.symbol = symbol;
			this.params = params;
		};
		
		lnodes.ASTSuccessor = function ASTSuccessor(string, probability) {
			this.string = string;
			this.probability = probability;
		};
		
		lnodes.ASTModule = function ASTModule(symbol, args) {
			this.symbol = symbol;
			this.args = args;
		};
		
		lnodes.ASTCall = function ASTCall(lsystem, axiom, maxIterations) {
			this.lsystem = lsystem;
			this.axiom = axiom;
			this.maxIterations = maxIterations;
			this.isMain = false;
		};
		
		lnodes.ASTDerive= function ASTDerive(lscript) {
			this.lscript  = lscript;
		};
		
		lnodes.ASTSubLSystem = function ASTSubLSystem(lsystem, axiom, maxIterations) {
			this.lsystem = lsystem;
			this.axiom = axiom;
			this.maxIterations = maxIterations;
		};
		
		lnodes.ASTAlphabet = function ASTAlphabet(id, symbols) {
			this.id = id;
			this.symbols = symbols;
		};
		
		lnodes.ASTIncluded = function ASTIncluded(file, body) {
			this.file = file;
			this.body = body;
		};
		
		lnodes.ASTStack = function ASTStack(start, end, string) {
			this.string = string;
			this.start = start;
			this.end = end;
		};
		
		return lnodes;
	
	})();


/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/


l2js.compiler.Lparser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"program_entries":4,"EOF":5,"stmts":6,"stmt":7,";":8,"var":9,"=":10,"e":11,"symbol":12,"text":13,"LSCRIPT":14,"id":15,"{":16,"}":17,"LSYSTEM":18,"(":19,"axiom":20,")":21,"USING":22,",":23,"number":24,"ALPHABET":25,"symbols":26,"INCLUDED":27,"TEXT":28,"ancestor":29,"RULE_OP":30,"successors":31,"H_RULE_OP":32,"main_call":33,"sublsystem":34,"call":35,"DERIVE":36,"stack":37,"SU":38,"string":39,"SS":40,"SUBLSYSTEM":41,"CALL":42,"MAIN":43,"iterations":44,"params":45,"successor":46,"|":47,":":48,"module":49,"arguments":50,"param":51,"ID":52,"VAR":53,"+":54,"term":55,"-":56,"*":57,"factor":58,"/":59,"FUNC":60,"E":61,"PI":62,"NUMBER":63,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",8:";",10:"=",14:"LSCRIPT",16:"{",17:"}",18:"LSYSTEM",19:"(",21:")",22:"USING",23:",",25:"ALPHABET",27:"INCLUDED",28:"TEXT",30:"RULE_OP",32:"H_RULE_OP",36:"DERIVE",38:"SU",40:"SS",41:"SUBLSYSTEM",42:"CALL",43:"MAIN",47:"|",48:":",52:"ID",53:"VAR",54:"+",56:"-",57:"*",59:"/",60:"FUNC",61:"E",62:"PI",63:"NUMBER"},
productions_: [0,[3,2],[4,1],[6,3],[6,1],[6,0],[7,3],[7,3],[7,1],[7,5],[7,10],[7,12],[7,5],[7,5],[7,3],[7,3],[7,1],[7,1],[7,1],[7,2],[37,3],[34,5],[34,7],[34,6],[34,4],[35,5],[35,7],[35,6],[35,4],[33,2],[20,1],[44,1],[29,4],[29,1],[31,3],[31,1],[46,3],[46,1],[39,2],[39,1],[49,4],[49,1],[49,1],[49,1],[49,1],[50,3],[50,2],[50,1],[50,0],[45,3],[45,2],[45,1],[45,0],[51,1],[26,3],[26,1],[26,0],[12,1],[9,1],[15,1],[11,3],[11,3],[11,1],[55,3],[55,3],[55,1],[58,4],[58,1],[58,1],[58,1],[58,1],[58,3],[13,1],[24,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: 
        	// TODO: add restrictions only to valid statements
            /*var i;
			for(i = 0; i < $stmts.length; i++) {
				var errMsg,stmt = $stmts[i];
				if( stmt instanceof yy.ASTRule) {
					errMsg = 'Main program should not contain rule declaration.';
				} else if(stmt instanceof yy.ASTCall && !stmt.isMain) {
					errMsg = 'In global scope use only main call.';
				} 
				
				if(typeof errMsg !== 'undefined') {
					throw new yy.ParseError('Parse error on ' + this._$.first_line + ':' + this._$.last_column + '. ' + errMsg );
				}
			}*/
			
        	var block = new yy.ASTBlock(); 
        	block.isRoot = true;
        	block.entries = $$[$0-1]; 
        	return block; 
        
break;
case 2:this.$ = $$[$0];
break;
case 3:this.$ = $$[$0]; this.$.unshift($$[$0-2]);
break;
case 4:this.$ = [$$[$0]];
break;
case 5:this.$ = [];
break;
case 6:this.$ = $$[$0-2]; this.$.e = $$[$0];
break;
case 7:this.$ = $$[$0-2];this.$.e = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:
			// TODO: add restrictions only to valid statements
			var block = new yy.ASTBlock();
			block.entries = $$[$0-1];
			
			this.$ = new yy.ASTLScript($$[$0-3], block); 
		
break;
case 10:
			var block = new yy.ASTBlock(); 
			block.entries = $$[$0-1];
			this.$ = new yy.ASTLSystem($$[$0-8], $$[$0-3], $$[$0-6], undefined , block);
		
break;
case 11:
			if($$[$0-6] % 1 !== 0) {
				var errMsg = "Number of iterations should be integer.";
				throw new yy.ParseError('Parse error on ' + this._$.first_line + ':' + this._$.last_column + '. ' + errMsg );
			}
			var block = new yy.ASTBlock(); 
			block.entries = $$[$0-1];
			this.$ = new yy.ASTLSystem($$[$0-10], $$[$0-3], $$[$0-8], $$[$0-6], block);
		
break;
case 12:
			$$[$0-3].type='alphabet';
			this.$ = new yy.ASTAlphabet($$[$0-3], $$[$0-1]);
		
break;
case 13:this.$ = new yy.ASTIncluded($$[$0-3], $$[$0-1]);
break;
case 14:this.$ = new yy.ASTRule($$[$0-2], $$[$0]);
break;
case 15:this.$ = new yy.ASTRule($$[$0-2], $$[$0], 'h');
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = new yy.ASTDerive($$[$0]);
break;
case 20:
			var start = new yy.ASTModule(new yy.ASTId($$[$0-2], "symbol")),
			end = new yy.ASTModule(new yy.ASTId($$[$0], "symbol"));
			this.$ = new yy.ASTStack(start, end, $$[$0-1]);
		
break;
case 21:$$[$0-3].type="lsystem"; this.$ = new yy.ASTSubLSystem($$[$0-3], $$[$0-1]);
break;
case 22:
			$$[$0-5].type="lsystem"; this.$ = new yy.ASTSubLSystem($$[$0-5], $$[$0-3], $$[$0-1]);
		
break;
case 23:
		
			$$[$0-4].type="lsystem"; this.$ = new yy.ASTSubLSystem($$[$0-4], undefined, $$[$0-1]);
		
break;
case 24:$$[$0-2].type="lsystem"; this.$ = new yy.ASTSubLSystem($$[$0-2]);
break;
case 25:$$[$0-3].type="lsystem"; this.$ = new yy.ASTCall($$[$0-3], $$[$0-1]);
break;
case 26:
			$$[$0-5].type="lsystem"; this.$ = new yy.ASTCall($$[$0-5], $$[$0-3], $$[$0-1]);
		
break;
case 27:
			$$[$0-4].type="lsystem"; this.$ = new yy.ASTCall($$[$0-4], undefined, $$[$0-1]);
		
break;
case 28:$$[$0-2].type="lsystem"; this.$ = new yy.ASTCall($$[$0-2]);
break;
case 29:this.$ = $$[$0]; this.$.isMain = true;
break;
case 30:this.$ = $$[$0]
break;
case 31:
			if($$[$0] % 1 !== 0) {
				var errMsg = "Number of iterations should be integer.";
				throw new yy.ParseError('Parse error on ' + this._$.first_line + ':' + this._$.last_column + '. ' + errMsg );
			}
			this.$ = $$[$0];
		
break;
case 32:this.$ = new yy.ASTAncestor($$[$0-3], $$[$0-1]);
break;
case 33:this.$ = new yy.ASTAncestor($$[$0]);
break;
case 34:this.$ = $$[$0]; this.$.unshift($$[$0-2]);
break;
case 35:this.$ = [$$[$0]];
break;
case 36:this.$ = new yy.ASTSuccessor($$[$0-2], $$[$0]);
break;
case 37:this.$ = new yy.ASTSuccessor($$[$0]);
break;
case 38:this.$ = $$[$0]; this.$.unshift($$[$0-1]);
break;
case 39:this.$ = [$$[$0]];
break;
case 40:$$[$0-3].type="symbol"; this.$ = new yy.ASTModule($$[$0-3], $$[$0-1]);
break;
case 41:$$[$0].type="symbol"; this.$ =  new yy.ASTModule($$[$0]);
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = $$[$0]; this.$.unshift($$[$0-2]);
break;
case 46:this.$ = $$[$0]; this.$.unshift(undefined);
break;
case 47:this.$ = [$$[$0]];
break;
case 48:this.$ = [];
break;
case 49:this.$ = $$[$0]; this.$.unshift($$[$0-2]);
break;
case 50:this.$ = $$[$0]; this.$.unshift(undefined);
break;
case 51:this.$ = [$$[$0]];
break;
case 52:this.$ = [];
break;
case 53: this.$ = new yy.ASTId($$[$0], 'param');
break;
case 54:this.$ = $$[$0]; this.$.unshift($$[$0-2]);
break;
case 55:this.$ = [$$[$0]];
break;
case 56:this.$ = [];
break;
case 57: this.$ = $$[$0]; this.$.type='symbol';
break;
case 58: this.$ = new yy.ASTId($$[$0], 'var'); 
break;
case 59: this.$ = new yy.ASTId($$[$0]); 
break;
case 60:this.$ = new yy.ASTOperation($$[$0-1], $$[$0-2], $$[$0]);
break;
case 61:this.$ = new yy.ASTOperation($$[$0-1], $$[$0-2], $$[$0]);
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = new yy.ASTOperation($$[$0-1], $$[$0-2], $$[$0]);
break;
case 64:this.$ = new yy.ASTOperation($$[$0-1], $$[$0-2], $$[$0]);
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = new yy.ASTFunc($$[$0-3], $$[$0-1]);
break;
case 67:this.$ = $$[$0];
break;
case 68:this.$ = Math.E;
break;
case 69:this.$ = Math.PI;
break;
case 70:this.$ = $$[$0];
break;
case 71:this.$ = new yy.ASTBrackets($$[$0-1]);
break;
case 72:this.$ = String(yytext);
break;
case 73:this.$ =  Number(yytext);
break;
}
},
table: [{3:1,4:2,5:[2,5],6:3,7:4,9:5,11:7,12:6,14:[1,8],15:18,18:[1,9],19:[1,29],24:26,25:[1,10],27:[1,11],29:12,33:13,34:14,35:15,36:[1,16],41:[1,21],42:[1,22],43:[1,20],52:[1,23],53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{1:[3]},{5:[1,31]},{5:[2,2]},{5:[2,4],8:[1,32],17:[2,4]},{5:[2,70],8:[2,70],10:[1,33],17:[2,70],54:[2,70],56:[2,70],57:[2,70],59:[2,70]},{10:[1,34],19:[1,35],30:[2,33],32:[2,33]},{5:[2,8],8:[2,8],17:[2,8],54:[1,36],56:[1,37]},{15:38,52:[1,23]},{15:39,52:[1,23]},{15:40,52:[1,23]},{28:[1,41]},{30:[1,42],32:[1,43]},{5:[2,16],8:[2,16],17:[2,16]},{5:[2,17],8:[2,17],17:[2,17]},{5:[2,18],8:[2,18],17:[2,18]},{15:44,52:[1,23]},{5:[2,58],8:[2,58],10:[2,58],17:[2,58],21:[2,58],23:[2,58],54:[2,58],56:[2,58],57:[2,58],59:[2,58]},{10:[2,57],17:[2,57],19:[2,57],23:[2,57],30:[2,57],32:[2,57]},{5:[2,62],8:[2,62],17:[2,62],21:[2,62],23:[2,62],54:[2,62],56:[2,62],57:[1,45],59:[1,46]},{35:47,42:[1,22]},{15:48,52:[1,23]},{15:49,52:[1,23]},{5:[2,59],8:[2,59],10:[2,59],16:[2,59],17:[2,59],19:[2,59],21:[2,59],23:[2,59],30:[2,59],32:[2,59],38:[2,59],40:[2,59],41:[2,59],42:[2,59],47:[2,59],48:[2,59],52:[2,59]},{5:[2,65],8:[2,65],17:[2,65],21:[2,65],23:[2,65],54:[2,65],56:[2,65],57:[2,65],59:[2,65]},{19:[1,50]},{5:[2,67],8:[2,67],17:[2,67],21:[2,67],23:[2,67],54:[2,67],56:[2,67],57:[2,67],59:[2,67]},{5:[2,68],8:[2,68],17:[2,68],21:[2,68],23:[2,68],54:[2,68],56:[2,68],57:[2,68],59:[2,68]},{5:[2,69],8:[2,69],17:[2,69],21:[2,69],23:[2,69],54:[2,69],56:[2,69],57:[2,69],59:[2,69]},{9:52,11:51,19:[1,29],24:26,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{5:[2,73],8:[2,73],17:[2,73],21:[2,73],23:[2,73],47:[2,73],54:[2,73],56:[2,73],57:[2,73],59:[2,73]},{1:[2,1]},{5:[2,5],6:53,7:4,9:5,11:7,12:6,14:[1,8],15:18,17:[2,5],18:[1,9],19:[1,29],24:26,25:[1,10],27:[1,11],29:12,33:13,34:14,35:15,36:[1,16],41:[1,21],42:[1,22],43:[1,20],52:[1,23],53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{9:52,11:54,19:[1,29],24:26,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{13:55,28:[1,56]},{21:[2,52],23:[1,59],45:57,51:58,52:[1,60]},{9:52,19:[1,29],24:26,53:[1,17],55:61,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{9:52,19:[1,29],24:26,53:[1,17],55:62,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{16:[1,63]},{19:[1,64]},{16:[1,65]},{16:[1,66]},{15:71,31:67,34:73,35:72,37:74,38:[1,75],39:69,41:[1,21],42:[1,22],46:68,49:70,52:[1,23]},{15:71,31:76,34:73,35:72,37:74,38:[1,75],39:69,41:[1,21],42:[1,22],46:68,49:70,52:[1,23]},{5:[2,19],8:[2,19],17:[2,19]},{9:52,19:[1,29],24:26,53:[1,17],58:77,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{9:52,19:[1,29],24:26,53:[1,17],58:78,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{5:[2,29],8:[2,29],17:[2,29]},{19:[1,79]},{19:[1,80]},{9:52,11:82,19:[1,29],21:[2,48],23:[1,83],24:26,50:81,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{21:[1,84],54:[1,36],56:[1,37]},{5:[2,70],8:[2,70],17:[2,70],21:[2,70],23:[2,70],54:[2,70],56:[2,70],57:[2,70],59:[2,70]},{5:[2,3],17:[2,3]},{5:[2,6],8:[2,6],17:[2,6],54:[1,36],56:[1,37]},{5:[2,7],8:[2,7],17:[2,7]},{5:[2,72],8:[2,72],17:[2,72]},{21:[1,85]},{21:[2,51],23:[1,86]},{21:[2,52],23:[1,59],45:87,51:58,52:[1,60]},{21:[2,53],23:[2,53]},{5:[2,60],8:[2,60],17:[2,60],21:[2,60],23:[2,60],54:[2,60],56:[2,60],57:[1,45],59:[1,46]},{5:[2,61],8:[2,61],17:[2,61],21:[2,61],23:[2,61],54:[2,61],56:[2,61],57:[1,45],59:[1,46]},{6:88,7:4,9:5,11:7,12:6,14:[1,8],15:18,17:[2,5],18:[1,9],19:[1,29],24:26,25:[1,10],27:[1,11],29:12,33:13,34:14,35:15,36:[1,16],41:[1,21],42:[1,22],43:[1,20],52:[1,23],53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{15:71,20:89,34:73,35:72,37:74,38:[1,75],39:90,41:[1,21],42:[1,22],49:70,52:[1,23]},{12:92,15:18,17:[2,56],26:91,52:[1,23]},{6:93,7:4,9:5,11:7,12:6,14:[1,8],15:18,17:[2,5],18:[1,9],19:[1,29],24:26,25:[1,10],27:[1,11],29:12,33:13,34:14,35:15,36:[1,16],41:[1,21],42:[1,22],43:[1,20],52:[1,23],53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{5:[2,14],8:[2,14],17:[2,14]},{5:[2,35],8:[2,35],17:[2,35],47:[1,94]},{5:[2,37],8:[2,37],17:[2,37],47:[2,37],48:[1,95]},{5:[2,39],8:[2,39],15:71,17:[2,39],21:[2,39],23:[2,39],34:73,35:72,37:74,38:[1,75],39:96,40:[2,39],41:[1,21],42:[1,22],47:[2,39],48:[2,39],49:70,52:[1,23]},{5:[2,41],8:[2,41],17:[2,41],19:[1,97],21:[2,41],23:[2,41],38:[2,41],40:[2,41],41:[2,41],42:[2,41],47:[2,41],48:[2,41],52:[2,41]},{5:[2,42],8:[2,42],17:[2,42],21:[2,42],23:[2,42],38:[2,42],40:[2,42],41:[2,42],42:[2,42],47:[2,42],48:[2,42],52:[2,42]},{5:[2,43],8:[2,43],17:[2,43],21:[2,43],23:[2,43],38:[2,43],40:[2,43],41:[2,43],42:[2,43],47:[2,43],48:[2,43],52:[2,43]},{5:[2,44],8:[2,44],17:[2,44],21:[2,44],23:[2,44],38:[2,44],40:[2,44],41:[2,44],42:[2,44],47:[2,44],48:[2,44],52:[2,44]},{15:71,34:73,35:72,37:74,38:[1,75],39:98,41:[1,21],42:[1,22],49:70,52:[1,23]},{5:[2,15],8:[2,15],17:[2,15]},{5:[2,63],8:[2,63],17:[2,63],21:[2,63],23:[2,63],54:[2,63],56:[2,63],57:[2,63],59:[2,63]},{5:[2,64],8:[2,64],17:[2,64],21:[2,64],23:[2,64],54:[2,64],56:[2,64],57:[2,64],59:[2,64]},{15:71,20:99,21:[1,101],23:[1,100],34:73,35:72,37:74,38:[1,75],39:90,41:[1,21],42:[1,22],49:70,52:[1,23]},{15:71,20:102,21:[1,104],23:[1,103],34:73,35:72,37:74,38:[1,75],39:90,41:[1,21],42:[1,22],49:70,52:[1,23]},{21:[1,105]},{21:[2,47],23:[1,106],54:[1,36],56:[1,37]},{9:52,11:82,19:[1,29],21:[2,48],23:[1,83],24:26,50:107,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{5:[2,71],8:[2,71],17:[2,71],21:[2,71],23:[2,71],54:[2,71],56:[2,71],57:[2,71],59:[2,71]},{30:[2,32],32:[2,32]},{21:[2,52],23:[1,59],45:108,51:58,52:[1,60]},{21:[2,50]},{17:[1,109]},{21:[1,110],23:[1,111]},{21:[2,30],23:[2,30]},{17:[1,112]},{17:[2,55],23:[1,113]},{17:[1,114]},{15:71,31:115,34:73,35:72,37:74,38:[1,75],39:69,41:[1,21],42:[1,22],46:68,49:70,52:[1,23]},{24:116,63:[1,30]},{5:[2,38],8:[2,38],17:[2,38],21:[2,38],23:[2,38],40:[2,38],47:[2,38],48:[2,38]},{9:52,11:82,19:[1,29],21:[2,48],23:[1,83],24:26,50:117,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{40:[1,118]},{21:[1,119],23:[1,120]},{9:52,11:121,19:[1,29],24:26,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{5:[2,24],8:[2,24],17:[2,24],21:[2,24],23:[2,24],38:[2,24],40:[2,24],41:[2,24],42:[2,24],47:[2,24],48:[2,24],52:[2,24]},{21:[1,122],23:[1,123]},{9:52,11:124,19:[1,29],24:26,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{5:[2,28],8:[2,28],17:[2,28],21:[2,28],23:[2,28],38:[2,28],40:[2,28],41:[2,28],42:[2,28],47:[2,28],48:[2,28],52:[2,28]},{5:[2,66],8:[2,66],17:[2,66],21:[2,66],23:[2,66],54:[2,66],56:[2,66],57:[2,66],59:[2,66]},{9:52,11:82,19:[1,29],21:[2,48],23:[1,83],24:26,50:125,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{21:[2,46]},{21:[2,49]},{5:[2,9],8:[2,9],17:[2,9]},{22:[1,126]},{24:127,63:[1,30]},{5:[2,12],8:[2,12],17:[2,12]},{12:92,15:18,17:[2,56],26:128,52:[1,23]},{5:[2,13],8:[2,13],17:[2,13]},{5:[2,34],8:[2,34],17:[2,34]},{5:[2,36],8:[2,36],17:[2,36],47:[2,36]},{21:[1,129]},{5:[2,20],8:[2,20],17:[2,20],21:[2,20],23:[2,20],38:[2,20],40:[2,20],41:[2,20],42:[2,20],47:[2,20],48:[2,20],52:[2,20]},{5:[2,21],8:[2,21],17:[2,21],21:[2,21],23:[2,21],38:[2,21],40:[2,21],41:[2,21],42:[2,21],47:[2,21],48:[2,21],52:[2,21]},{9:52,11:130,19:[1,29],24:26,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{21:[1,131],54:[1,36],56:[1,37]},{5:[2,25],8:[2,25],17:[2,25],21:[2,25],23:[2,25],38:[2,25],40:[2,25],41:[2,25],42:[2,25],47:[2,25],48:[2,25],52:[2,25]},{9:52,11:132,19:[1,29],24:26,53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{21:[1,133],54:[1,36],56:[1,37]},{21:[2,45]},{15:134,52:[1,23]},{21:[1,135]},{17:[2,54]},{5:[2,40],8:[2,40],17:[2,40],21:[2,40],23:[2,40],38:[2,40],40:[2,40],41:[2,40],42:[2,40],47:[2,40],48:[2,40],52:[2,40]},{21:[1,136],54:[1,36],56:[1,37]},{5:[2,23],8:[2,23],17:[2,23],21:[2,23],23:[2,23],38:[2,23],40:[2,23],41:[2,23],42:[2,23],47:[2,23],48:[2,23],52:[2,23]},{21:[1,137],54:[1,36],56:[1,37]},{5:[2,27],8:[2,27],17:[2,27],21:[2,27],23:[2,27],38:[2,27],40:[2,27],41:[2,27],42:[2,27],47:[2,27],48:[2,27],52:[2,27]},{16:[1,138]},{22:[1,139]},{5:[2,22],8:[2,22],17:[2,22],21:[2,22],23:[2,22],38:[2,22],40:[2,22],41:[2,22],42:[2,22],47:[2,22],48:[2,22],52:[2,22]},{5:[2,26],8:[2,26],17:[2,26],21:[2,26],23:[2,26],38:[2,26],40:[2,26],41:[2,26],42:[2,26],47:[2,26],48:[2,26],52:[2,26]},{6:140,7:4,9:5,11:7,12:6,14:[1,8],15:18,17:[2,5],18:[1,9],19:[1,29],24:26,25:[1,10],27:[1,11],29:12,33:13,34:14,35:15,36:[1,16],41:[1,21],42:[1,22],43:[1,20],52:[1,23],53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{15:141,52:[1,23]},{17:[1,142]},{16:[1,143]},{5:[2,10],8:[2,10],17:[2,10]},{6:144,7:4,9:5,11:7,12:6,14:[1,8],15:18,17:[2,5],18:[1,9],19:[1,29],24:26,25:[1,10],27:[1,11],29:12,33:13,34:14,35:15,36:[1,16],41:[1,21],42:[1,22],43:[1,20],52:[1,23],53:[1,17],55:19,58:24,60:[1,25],61:[1,27],62:[1,28],63:[1,30]},{17:[1,145]},{5:[2,11],8:[2,11],17:[2,11]}],
defaultActions: {3:[2,2],31:[2,1],87:[2,50],107:[2,46],108:[2,49],125:[2,45],128:[2,54]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip comment */
break;
case 1:/* skip whitespace */
break;
case 2:return 63
break;
case 3: /* 'text' */
									yy_.yytext = this.matches[1];
									return 28;
								
break;
case 4: /* "text" */
									yy_.yytext = this.matches[1];
									return 28;
								
break;
case 5:return 14
break;
case 6:return 18
break;
case 7:return 25
break;
case 8:return 27
break;
case 9:return 22
break;
case 10:return 36
break;
case 11:return 42
break;
case 12:return 41
break;
case 13:return 43
break;
case 14:return 30
break;
case 15:return 32
break;
case 16:return 61
break;
case 17:return 62
break;
case 18:return 60
break;
case 19:return 53
break;
case 20:return 52
break;
case 21:return 38
break;
case 22:return 40
break;
case 23:return 57
break;
case 24:return 59
break;
case 25:return 56
break;
case 26:return 54
break;
case 27:return 19
break;
case 28:return 21
break;
case 29:return 16
break;
case 30:return 17
break;
case 31:return 23
break;
case 32:return 8
break;
case 33:return 48
break;
case 34:return 47
break;
case 35:return '.'
break;
case 36:return 10
break;
case 37:return 5
break;
}
},
rules: [/^(?:\/\/[^\n]*)/,/^(?:\s+)/,/^(?:[0-9]+(\.[0-9]+)?\b)/,/^(?:'(.*?)')/,/^(?:"(.*?)")/,/^(?:lscript\b)/,/^(?:lsystem\b)/,/^(?:alphabet\b)/,/^(?:included\b)/,/^(?:using\b)/,/^(?:derive\b)/,/^(?:call\b)/,/^(?:sublsystem\b)/,/^(?:main\b)/,/^(?:-->)/,/^(?:-h>)/,/^(?:E\b)/,/^(?:PI\b)/,/^(?:__([A-Za-z_][A-Za-z_0-9_]*))/,/^(?:\$([A-Za-z_][A-Za-z_0-9_]*))/,/^(?:([A-Za-z_][A-Za-z_0-9_]*))/,/^(?:\[)/,/^(?:\])/,/^(?:\*)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?:\()/,/^(?:\))/,/^(?:\{)/,/^(?:\})/,/^(?:,)/,/^(?:;)/,/^(?::)/,/^(?:\|)/,/^(?:\.)/,/^(?:=)/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();

// sublscript, environment.ctx.$a = XX



	l2js.compiler.ASTCompiler = (function() {
		var LSystem = l2js.compiler.env.LSystem, lnodes = l2js.compiler.lnodes;

		function ASTCompiler() {
			// stack of states during compilation
			this.states = [];

			// list of names of a parameters if the compiler is in the RULE state
			this.ruleParams = [];
			// In rule state determines rule type
			this.ruleType = [];

			// id of lsystem in current context
			this.lsystems = [];

			// add functions
			this.funcs = [];

		}


		ASTCompiler.funcsSrc = {
			"__color" : "__color: function(r, g, b) {" + "var rgb = r;" + "rgb = rgb << 8;" + "rgb |= g;" + "rgb = rgb << 8;" + "rgb |= b; return rgb/16581375;}"
		};

		ASTCompiler.states = {
			"GLOBAL" : "global",
			"BLOCK" : "block",
			"RULE" : "rule"
		};

		ASTCompiler.prototype.makeRule = function(ancestor, successors, type) {

			// this.checkAlphabetSymbol(symbol.symbol);

			var hash = LSystem.makeHash({
				symbol : ancestor.symbol.id,
				params : this.ruleParams
			}, type);

			var i, src = "";
			for ( i = 0; i < successors.length; i++) {
				if (l2js.utils.isUndefined(successors[i].probability)) {
					successors[i].probability = 1;
				}

				// Add hash to current lsystem to add hash declaration to the lsystem prototype
				this.lsystems[0].rulesHash.push(hash);
				src += this.lsystems[0].id + ".prototype.rules['" + hash + "'].push(" + this.visitSuccessor(successors[i]) + ");";
			}
			return src;
		};

		ASTCompiler.prototype.makeRulesHashDecls = function() {
			var src = this.lsystems[0].id + ".prototype.rules = {};";

			// TODO: nedeklarovat ty samé
			for (var i = 0; i < this.lsystems[0].rulesHash.length; i++) {
				src += this.lsystems[0].id + ".prototype.rules['" + this.lsystems[0].rulesHash[i] + "'] =  [];\n";
			}
			return src;
		};

		/**
		 * Generate code for root ASTBlock
		 */
		ASTCompiler.prototype.visitRoot = function(node) {
			if ( node instanceof lnodes.ASTBlock && node.isRoot) {
				var src;

				src = "(function(l2js){\n";
				src += "var env = l2js.compiler.env,\n";
				src += "ctx = {};\n";

				var block = this.visitBlock(node);
				if (this.funcs && this.funcs.length) {
					src += this.addFuncs();
				}
				src += block;
				src += "\n})(l2js);\n";

				return src;
			} else {
				// TODO: Line numbers for compiling errors.
				throw new Error("Root node in AST should be root ASTBLock.");
			}
		};

		ASTCompiler.prototype.addFuncs = function() {
			var funcsSrc = [];
			for (var i = 0; i < this.funcs.length; i++) {
				ASTCompiler.funcsSrc[this.funcs[i]] && funcsSrc.push(ASTCompiler.funcsSrc[this.funcs[i]]);
			}

			return "var funcs = {" + funcsSrc.join(",\n") + "};\n";
		};

		ASTCompiler.prototype.handleInclude = function(nodes) {
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i] instanceof lnodes.ASTIncluded) {

					for (var j = 0; j < nodes[i].body.length; j++) {
						nodes.splice(1 + i + j, 0, nodes[i].body[j]);
					}
				}
			}
		};

		/**
		 * Call generation of code for all nodes according to its type of
		 * AST object.
		 */
		ASTCompiler.prototype.visitNodes = function(nodes, skipInclude) {

			var src = "";
			!skipInclude && this.handleInclude(nodes);

			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i] instanceof lnodes.ASTBlock) {
					src += visitBlock(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTId) {
					src += this.visitId(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTAlphabet) {
					src += this.visitAlphabet(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTLSystem) {
					src += this.visitLSystem(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTLScript) {
					src += this.visitLScript(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTRule) {
					src += this.visitRule(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTCall) {
					src += this.visitCall(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTDerive) {
					src += this.visitDerive(nodes[i]);
				} else if (nodes[i] instanceof lnodes.ASTIncluded) {

				} else {
					throw new Error("Unexpected AST node ('" + nodes[i] + "').");
				}
			}

			return src;
		};

		ASTCompiler.prototype.visitBlock = function(block, skipInclude) {
			var src = "", declarations = [];

			this.states.unshift(block.isRoot ? ASTCompiler.states.GLOBAL : ASTCompiler.states.BLOCK);

			src = this.visitNodes(block.entries, skipInclude);

			this.states.shift();

			// find declarations of variables, l-systems and alphabets
			var i;
			for ( i = 0; i < block.entries.length; i++) {
				var entry = block.entries[i];
				if ( entry instanceof lnodes.ASTLScript || entry instanceof lnodes.ASTLSystem || entry instanceof lnodes.ASTAlphabet) {
					declarations.push(entry.id.id);
				}
			}

			if (declarations.length) {
				src = "var " + declarations.join(", ") + ";\n" + src;
			}

			return src;
		};

		ASTCompiler.prototype._makeId = function(id) {
			var prefix, newId;

			if (this.states[0] === ASTCompiler.states.RULE) {
				var cleanId = id.substring(1), // parameters are identified without '$' prefix
				isParam = l2js.utils.indexOf(this.ruleParams, cleanId) !== -1;

				prefix = (isParam) ? "" : "this.ctx.";
				newId = (isParam) ? cleanId : id;

			} else if (this.states[0] === ASTCompiler.states.GLOBAL) {
				newId = id;
				prefix = "ctx.";
			} else if (this.states[0] === ASTCompiler.states.BLOCK) {
				newId = id;
				prefix = "this.ctx.";
			} else {
				throw new Error("Unkonown state of the AST compiler.");
			}
			return prefix + newId;
		};

		ASTCompiler.prototype.visitId = function(id) {
			// Variables only with expressions, declaration is made by visitBlock
			if (id.type === "var" && !l2js.utils.isUndefined(id.e)) {
				return this._makeId(id.id) + "=" + this.visitExpression(id.e) + ";\n";
			}
		};

		ASTCompiler.prototype.visitAlphabet = function(alphabet) {
			var id = alphabet.id.id, symbols = [];

			var i;
			for ( i = 0; i < alphabet.symbols.length; i++) {
				symbols.push("'" + alphabet.symbols[i].id + "'");
			}
			return id + " = new env.Alphabet('" + id + "', [" + symbols.join(",") + "]);\n";
		};

		ASTCompiler.prototype.visitLSystem = function(lsystem) {
			var src, id = lsystem.id.id;

			// definition of the L-system
			src = id + "= (function(_super, ctx) {\nl2js.utils.extend(" + id + ", _super);";

			// start constructor

			src += "function " + id + "() {\n" + id + ".__super__.constructor.apply(this, arguments);\n" + "this.self = " + id + ";\n" + "this._init();";

			this.lsystems.unshift({
				id : id,
				rulesHash : []
			});

			// end of constructor and definition of static properties
			src += "}\n";

			// init function of declarations of context variables
			src += id + ".prototype._init = function() {\n";

			this.handleInclude(lsystem.body.entries);
			// separate variable declarations
			var i, entries = lsystem.body.entries, decs = [];
			for ( i = entries.length - 1; i >= 0; i--) {
				if (entries[i] instanceof lnodes.ASTId) {
					decs.unshift(entries.splice(i, 1)[0]);
				}
			}

			src += this.visitBlock({
				entries : decs
			});
			src += "};\n";
			// end of init

			// Static properties
			src += id + ".alphabet = " + lsystem.alphabet.id + ";\n" + id + ".id = '" + id + "';\n";

			// properties
			var blockSrc = this.visitBlock(lsystem.body, true);

			src += this.makeRulesHashDecls();
			src += blockSrc;
			src += id + ".prototype.axiom = function() {return " + this.visitString(lsystem.axiom, id) + ";};\n";
			
			this.lsystems.shift();

			if (!l2js.utils.isUndefined(lsystem.maxIterations)) {
				src += id + ".prototype.maxIterations = " + this.visitExpression(lsystem.maxIterations) + " ;\n";
			}

			// end of the L-system definition
			src += "return " + id + ";\n})(env.LSystem, this.ctx);\n";
			return src;
		};

		ASTCompiler.prototype.visitLScript = function(lscript) {
			var src = "", id = lscript.id.id;

			// find main call
			var i, mainCall;
			if (lscript.body) {
				for ( i = 0; i < lscript.body.entries.length; i++) {
					var entry = lscript.body.entries[i];
					if ( entry instanceof lnodes.ASTCall && entry.isMain) {
						mainCall = entry;
					}
				}
			}

			if (l2js.utils.isUndefined(mainCall)) {
				throw new Error("No main call within the script '" + id + "'.");
			}

			// definition
			src += id + "= (function(_super, ctx) {\nl2js.utils.extend(" + id + ", _super);";

			// start constructor
			src += "function " + id + "() {\n" + id + ".__super__.constructor.apply(this, arguments);\n" + "this.self = " + id + ";\n";

			src += this.visitBlock(lscript.body);

			// end of constructor and definition of static properties
			src += "}\n" + id + ".id = '" + id + "';\n";

			// end of definition
			src += "return " + id + ";\n})(env.LScript, ctx);\n";
			return src;
		};

		ASTCompiler.prototype.visitExpression = function(e) {
			if ( e instanceof lnodes.ASTOperation) {
				return this.visitExpression(e.left) + e.op + this.visitExpression(e.right);
			} else if ( e instanceof lnodes.ASTBrackets) {
				return "(" + this.visitExpression(e.e) + ")";
			} else if ( e instanceof lnodes.ASTId) {
				return this._makeId(e.id);
			} else if ( e instanceof lnodes.ASTFunc) {
				var exps = [];
				for (var i = 0; i < e.args.length; i++) {
					exps.push(this.visitExpression(e.args[i]));
				}
				if (l2js.utils.indexOf(this.funcs, e.id) === -1) {
					this.funcs.push(e.id);
				}
				return "funcs." + e.id + "(" + exps.join(",") + ")";
			} else if ( typeof e === "number") {
				return e;
			} else {
				throw new Error("Unexpected expression symbol: " + e);
			}
		};

		ASTCompiler.prototype.visitString = function(str, lsystem) {
			var i, src = "", modules = [];
			if (l2js.utils.isUndefined(str)) {
				return "";
			}

			// foreach over modules
			for ( i = 0; i < str.length; i++) {
				var module = str[i];
				if ( module instanceof lnodes.ASTModule) {
					modules.push("[" + this.visitModule(module, lsystem) + "]");
				} else if ( module instanceof lnodes.ASTSubLSystem) {
					modules.push("[" + this.visitSubLSystem(module) + "]");
				} else if ( module instanceof lnodes.ASTCall) {
					modules.push(this.visitCall(module));
				} else if ( module instanceof lnodes.ASTStack) {
					modules.push(this.visitStack(module, lsystem));
				} else {
					throw new Error("Expected '" + module + "' to be module, call or sublsystem.");
				}
			}
			var src = modules[0];
			modules.shift();
			return src + ".concat(" + modules.join(", ") + ")";

		};

		/**
		 * Converts ASTModule to JS code.
		 *
		 * @param {object} module - Input module
		 * @param  {array} params - list of parameters name for the determining of context of variables, see visitExpression method
		 * @param  {string} [lsystem] - If passed the alphabet for module is determined as alphabet from passed name,
		 * 								otherwise alphabet of current L-system is used
		 *
		 * @memberOf ASTCompiler
		 */
		ASTCompiler.prototype.visitModule = function(module, lsystem) {

			if (l2js.utils.isUndefined(module.symbol) || l2js.utils.isUndefined(module.symbol.id)) {
				throw new Error("Module symbol is undefined.");
			}

			var arr = module.args || module.params || [], method = module.params ? "getParamModule" : "getModule", alphabetLystem = lsystem || this.lsystems[0].id;

			if (!alphabetLystem) {
				throw new Error("Unknown L-system for the symbol '" + module.symbol.id + "'. Cannot determine the right alphabet.");
			}

			var j, arrJs = [];
			for ( j = 0; j < arr.length; j++) {
				if (module.params) {
					arrJs.push("'" + arr[j].id + "'");
				} else {
					arrJs.push(this.visitExpression(arr[j]));
				}
			}

			return "env.LSystem." + method + "('" + module.symbol.id + "', [" + arrJs.join(", ") + "], " + alphabetLystem + ".alphabet" + ")";

		};

		ASTCompiler.prototype.visitStack = function(stack, lsystem) {
			return "[new env.Stack(" + this.visitModule(stack.start, lsystem) + " ," + this.visitModule(stack.end, lsystem) + ", " + this.visitString(stack.string) + ")]";
		};

		ASTCompiler.prototype.visitSubLSystem = function(subLSystem) {
			var lid = subLSystem.lsystem.id, args = ["this.ctx", lid];

			this.lsystems.unshift({
				id : lid,
				rulesHash : []
			});

			if (!l2js.utils.isUndefined(subLSystem.axiom)) {
				args.push(this.visitString(subLSystem.axiom, lid));
			}

			if (!l2js.utils.isUndefined(subLSystem.maxIterations)) {
				args.push(this.visitExpression(subLSystem.maxIterations));
			}
			this.lsystems.shift();

			return "new env.SubLSystem(" + args.join(", ") + ").derive()";
		};

		ASTCompiler.prototype.visitCall = function(call) {

			var lid = call.lsystem.id, src = "";

			// If main call then set derive parameters (axiom, lsystem, maxIterations) for the parent script
			if (call.isMain) {

				src += "this.main = " + lid + ";\n";

				if (!l2js.utils.isUndefined(call.axiom)) {
					this.states.unshift(ASTCompiler.states.GLOBAL);
					src += this.visitString(call.axiom, lid) + ";\n";
					this.states.shift();

				}

				if (!l2js.utils.isUndefined(call.maxIterations)) {
					src += "this.maxIterations = " + this.visitExpression(call.maxIterations) + " ;\n";
				}

			} else {
				var args = [];
				if (!l2js.utils.isUndefined(call.axiom)) {
					args.push(this.visitString(call.axiom, lid));
				}
				if (!l2js.utils.isUndefined(call.maxIterations)) {
					args.push(this.visitExpression(call.maxIterations));
				}
				var srcDerivation = (this.ruleType === "h") ? "interpretation" : "derivation";
				src = "new " + lid + "(" + (this.states[0] === ASTCompiler.states.GLOBAL ? "ctx" : "this.ctx") + ").derive(" + args.join(", ") + ")." + srcDerivation + "\n";
			}
			return src;
		};

		ASTCompiler.prototype.visitDerive = function(derive) {
			return "return new " + derive.lscript.id + "(ctx).derive();";
		};

		ASTCompiler.prototype.visitSuccessor = function(successor) {

			return "{\nprobability : " + successor.probability + ",\n" + "successor : function(" + this.ruleParams.join(",") + ") { \n" + "return " + this.visitString(successor.string) + ";\n" + "}\n}\n";
		};

		ASTCompiler.prototype.visitRule = function(rule) {
			var src = "", params = [], ancestor = rule.ancestor, successors = rule.successors;

			if (ancestor.params) {
				var i;
				for ( i = 0; i < ancestor.params.length; i++) {
					// params don't have dolar sign
					params.push(ancestor.params[i].id);
				}
			}

			this.states.unshift(ASTCompiler.states.RULE);
			this.ruleParams = params;

			var prevRuleType = this.ruleType;

			this.ruleType = rule.type;

			src += this.makeRule(ancestor, successors, rule.type);

			this.ruleType = prevRuleType;

			this.ruleParams = [];

			this.states.shift();

			return src;
		};

		return ASTCompiler;
	})();

/**
 * Compiles AST of script to L2 language with proper formatting.
 */


	var lnodes = l2js.compiler.lnodes;

	l2js.compiler.L2Compiler = (function() {

		function L2Compiler(ast) {
			this.ast = ast;
			this.level = 0;
		}

		/**
		 *  String for the one level of indentation
		 */
		L2Compiler.PREFIX = "   ";

		L2Compiler.prototype.compile = function() {
			if (this.ast instanceof lnodes.ASTBlock && this.ast.isRoot) {
				return this.visitBlock(this.ast);
			} else {
				throw new Error("AST must be root block");
			}

		};

		L2Compiler.prototype.visitNodes = function(nodes) {
			var src = "";
			for (var i = 0; i < nodes.length; i++) {
				src += this.visitNode(nodes[i]);
			}

			return src;
		};

		L2Compiler.prototype.visitNode = function(node) {
			var src = "";
			if ( node instanceof lnodes.ASTBlock) {
				src += this.visitBlock(node);
			} else if ( node instanceof lnodes.ASTId) {
				src += this.visitId(node);
			} else if ( node instanceof lnodes.ASTAlphabet) {
				src += this.visitAlphabet(node);
			} else if ( node instanceof lnodes.ASTLSystem) {
				src += this.visitLSystem(node);
			} else if ( node instanceof lnodes.ASTLScript) {
				src += this.visitLScript(node);
			} else if ( node instanceof lnodes.ASTRule) {
				src += this.visitRule(node);
			} else if ( node instanceof lnodes.ASTCall) {
				src += this.visitCall(node);
			} else if ( node instanceof lnodes.ASTDerive) {
				src += this.visitDerive(node);
			} else if (node instanceof lnodes.ASTIncluded) {
				src += this.visitIncluded(node);
			} else {
				throw new Error("Unexpected AST node ('" + node + "').");
			}
			return src;
		};

		L2Compiler.prototype.visitBlock = function(node) {
			return this._printLine("include '" + node.file + "'");
		};

		L2Compiler.prototype.visitBlock = function(node) {
			!node.isRoot && this.level++;
			var src = this.visitNodes(node.entries);
			!node.isRoot && this.level--;
			return src;
		};

		L2Compiler.prototype.visitLScript = function(node) {
			var src = this._printLine("lscript " + node.id.id + " {") + this.visitBlock(node.body);
			src += this._printLine("};\n");

			return src;
		};

		L2Compiler.prototype.visitAlphabet = function(node) {
			var src = this._printLine("alphabet " + node.id.id + " {"), symbols = [];

			for (var i = 0; i < node.symbols.length; i++) {
				symbols.push(node.symbols[i].id);
			}

			this.level++;
			src += this._printLine(symbols.join(", "));
			this.level--;

			src += this._printLine("};\n");

			return src;
		};

		L2Compiler.prototype.visitLSystem = function(node) {

			var argsArr = [], args;

			node.axiom && argsArr.push(this.visitString(node.axiom));
			!l2js.utils.isUndefined(node.maxIterations) && argsArr.push(this.visitExpression(node.maxIterations));
			if (argsArr.length) {
				args = "(" + argsArr.join(", ") + ")";
			}

			var src = this._printLine("lsystem " + node.id.id + args + " using " + node.alphabet.id + " {") + this.visitBlock(node.body);
			src += this._printLine("};\n");

			return src;
		};

		L2Compiler.prototype.visitString = function(str) {
			var i, src = "", modules = [];
			if (l2js.utils.isUndefined(str)) {
				return "";
			}

			// foreach over modules
			for ( i = 0; i < str.length; i++) {
				var module = str[i];
				if ( module instanceof lnodes.ASTModule) {
					modules.push(this.visitModule(module));
				} else if ( module instanceof lnodes.ASTSubLSystem) {
					modules.push(this.visitSubLSystem(module));
				} else if ( module instanceof lnodes.ASTCall) {
					modules.push(this.visitCall(module));
				} else if ( module instanceof lnodes.ASTStack) {
					modules.push(this.visitStack(module));
				} else {
					throw new Error("Expected '" + module + "' to be module, call or sublsystem.");
				}
			}

			return modules.join(" ");

		};

		L2Compiler.prototype.visitModule = function(module) {

			if (l2js.utils.isUndefined(module.symbol) || l2js.utils.isUndefined(module.symbol.id)) {
				throw new Error("Module symbol is undefined.");
			}

			var src, arr = module.args || module.params || [];

			var j, args = [];
			for ( j = 0; j < arr.length; j++) {
				if (module.params) {
					args.push(arr[j].id);
				} else {
					args.push(this.visitExpression(arr[j]));
				}
			}
			src = module.symbol.id;
			if (args.length) {
				src += "(" + args.join(", ") + ")";
			}
			return src;

		};

		L2Compiler.prototype.visitStack = function(module) {
			return module.start.symbol.id + ' ' + this.visitString(module.string) + ' ' + module.end.symbol.id;

		};

		L2Compiler.prototype.visitSubLSystem = function(node) {
			var lid = node.lsystem.id, args = [];

			args.push(l2js.utils.isUndefined(node.axiom) && this.visitString(node.axiom) || "");
			!l2js.utils.isUndefined(node.maxIterations) && args.push(this.visitExpression(node.maxIterations));

			return "sublsystem " + lid + "(" + args.join(", ") + ")";
		};

		L2Compiler.prototype.visitCall = function(node) {
			var lid = node.lsystem.id, src, args = [];

			args.push(l2js.utils.isUndefined(node.axiom) && this.visitString(node.axiom) || "");
			!l2js.utils.isUndefined(node.maxIterations) && args.push(this.visitExpression(node.maxIterations));

			src = "call " + lid + "(" + args.join(", ") + ")";

			if (node.isMain) {
				src = this._printLine("main " + src + ";");
			}
			return src;
		};

		L2Compiler.prototype.visitDerive = function(node) {
			return this._printLine("derive " + node.lscript.id + ";");
		};

		L2Compiler.prototype.visitSuccessor = function(successor) {
			var src = this.visitString(successor.string);
			if (!l2js.utils.isUndefined(successor.probability)) {
				src += " : " + successor.probability;
			}
			return src;
		};

		L2Compiler.prototype.visitAncestor = function(ancestor) {
			return this.visitModule(ancestor);
		};

		L2Compiler.prototype.visitRule = function(rule) {
			var src = "", params = [], ancestor = rule.ancestor, successors = [];

			var op = rule.type === "h" ? "-h>" : "-->";

			for (var i = 0; i < rule.successors.length; i++) {
				successors.push(this.visitSuccessor(rule.successors[i]));
			}

			src += this._printLine(this.visitAncestor(ancestor) + " " + op + " " + successors.join(" | ") + ";");

			return src;
		};

		L2Compiler.prototype.visitId = function(node) {
			var src = "";

			if (node.type === "var") {
				src = node.id;

				if (node.e) {
					src = this._printLine(src + " = " + this.visitExpression(node.e) + ";");
				}
			} else {
				src += node.id;
			}
			return src;
		};

		L2Compiler.prototype.visitExpression = function(e) {
			if ( e instanceof lnodes.ASTOperation) {
				return this.visitExpression(e.left) + " " + e.op + " " + this.visitExpression(e.right);
			} else if ( e instanceof lnodes.ASTBrackets) {
				return "(" + this.visitExpression(e.e) + ")";
			} else if ( e instanceof lnodes.ASTId) {
				return this.visitId(e);
			} else if ( e instanceof lnodes.ASTFunc) {
				var exps = [];
				for (var i = 0; i < e.args.length; i++) {
					exps.push(this.visitExpression(e.args[i]));
				}
				return e.id + "(" + exps.join(",") + ")";
			} else if ( typeof e === "number") {
				return e;
			} else {
				throw new Error("Unexpected expression symbol: " + e);
			}
		};

		L2Compiler.prototype.visitIncluded = function(node) {
			return this._printLine('include "'+ node.file +'";');
		};
		
		L2Compiler.prototype._printLine = function(text) {
			var level = this.level, prefix = "";
			while (level) {
				prefix += L2Compiler.PREFIX;
				level--;
			}
			return prefix + text + "\n";
		};

		return L2Compiler;
	})();

/**
 * Compiler compiles L2 code to JavaScript sequence of symbols generated as the
 * result derivation.
 * @class
 */




	function ParseError(msg, line) {
		this.msg = msg;
		this.line = line;
	}


	ParseError.prototype.toString = function() {
		return this.msg;
	};

	l2js.compiler.Compiler = (function() {

		function Compiler() {
			this.ASTCompiler = l2js.compiler.ASTCompiler;
			this.L2Compiler = l2js.compiler.L2Compiler;
		};

		/**
		 * Get code by file name
		 * @param {string} code
		 */
		Compiler.prototype.getFile = function(name) {
			if (!l2js.files[name]) {
				throw new Error("File [" + name + "] does not exist.");
			}
			return l2js.files[name];
		};

		/**
		 * link external code to pragram
		 * @param {string} code
		 */
		Compiler.prototype.linkCode = function(code) {
			var matched, that = this, replacer = function(match, file) {
				matched = true;
				return "included '" + file + "' {" + that.getFile(file) + "};";
			};
			
			do {
				matched = false;
				code = code.replace(/include\s+\"([^\"]+)\";/, replacer).replace(/include\s+\'([^\']+)\';/, replacer);
			} while (matched);
			return code;
		};

		Compiler.prototype.compile = function(input) {
			var that = this, q = l2js.core.q, deferred = q.deferred(), code = input;

			function errCb(e) {
				deferred.reject(e);
			}

			setTimeout(function() {
				try {

					that.toAST(code).then(function(ast) {
						that.ASTToJS(ast).then(function(src) {
							deferred.resolve(src);
						}, errCb);
					}, errCb);

				} catch (e) {
					deferred.reject(e);
				}

			}, 0);

			return deferred.promise;
		};

		Compiler.prototype.toAST = function(code) {
			var that = this, q = l2js.core.q, deferred = q.deferred();
			setTimeout(function() {
				try {
					var linkedCode = that.linkCode(code), ast = l2js.compiler.Lparser.parse(linkedCode);
					console.log(ast);
					deferred.resolve(ast);
				} catch (e) {
					deferred.reject(e);
				}
			}, 0);
			return deferred.promise;
		};

		Compiler.prototype.ASTToJS = function(ast) {
			var that = this, q = l2js.core.q, deferred = q.deferred();
			setTimeout(function() {
				try {
					var src = new that.ASTCompiler().visitRoot(ast);
					console.log(src)
					deferred.resolve(src);

				} catch (e) {
					deferred.reject(e);
				}
			}, 0);
			return deferred.promise;
		};

		Compiler.prototype.ASTToL2 = function(ast) {
			var that = this, deferred = l2js.core.q.deferred();
			
			setTimeout(function() {
				try {
					var src = new that.L2Compiler(ast).compile();
					deferred.resolve(src);

				} catch (e) {
					deferred.reject(e);
				}
			}, 0);
			return deferred.promise;
		};

		return Compiler;

	})();

	l2js.compiler.Lparser.yy = l2js.compiler.lnodes;
	l2js.compiler.Lparser.yy.ParseError = ParseError;

l2js.interpret = l2js.interpret || {};

/**
 * Interpret of the symbols of L-system. Used Builder design pattern. 
 *
 * @class
 */





	l2js.interpret.Turtle2DBuilder =  (function()	{
		function Turtle2DBuilder(options) {
			this.options = options;
		};
		
		Turtle2DBuilder.options = {
			container: "",
			width:100,
			height:100,
			skipUnknownSymbols: true,
			turtle: {
				initPosition: [0, 0],
				initOrientation: 0
			}
		};
		
		Turtle2DBuilder.turtleTransforms = {
			left: function(angle, turtle) {
				
			}, 
			right: function(angle, turtle) {
				
			},
			forward: function(step, turtle) {
				var pos = turtle.position;
				var orientation = turtle.orientation * Math.PI / 180;
				return [step*Math.cos(orientation)+pos[0], step*Math.sin(orientation)+pos[1]];
			}
			
		};
		
		Turtle2DBuilder.prototype.interpret = function(symbol, ctx) {
			if(!ctx.turtle2D) {
				this._init(ctx);
			}
			this._resolveSymbol(symbol, ctx);
			//console.log(symbol);
		};
	
		Turtle2DBuilder.prototype._resolveSymbol = function(symbol, ctx) {
			if(this._symbols[symbol.symbol]) {
				this._symbols[symbol.symbol].call(this, symbol, ctx);
			} else if(!this.options.skipUnknownSymbols){
				throw new Error('Unexpected symbol (\''+symbol.symbol+'\')');	
			}
		};
	
		Turtle2DBuilder.prototype._init = function(ctx){
			
			this.options = l2js.utils.extend(l2js.utils.copy(Turtle2DBuilder.options), this.options);
			if(!this.options.container) {
				throw new Error("Turtle2D should have set the container to draw on.");
			}
			
			var turtle2D = ctx.turtle2D = {},
				opts = this.options;
			turtle2D.stage  = new Kinetic.Stage({
			    container: opts.container,
				width: opts.width,
				height: opts.height
			});
			turtle2D.baseLayer = new Kinetic.Layer();
			turtle2D.stage.add(turtle2D.baseLayer);
			
			turtle2D.stack = [];
			turtle2D.turtle = {
				position: opts.turtle.initPosition, 
				orientation: opts.turtle.initOrientation
			};
		};	
		
		Turtle2DBuilder.prototype._normalizeStep = function(step) {
			return step * Math.max(this.options.width, this.options.height);
		};
		
		Turtle2DBuilder.prototype._normalizeAngle = function(angle) {
			var interval = angle % 360;
			return angle<0?360+interval:interval;
		};
		 
		Turtle2DBuilder.prototype._realColorToHexString= function(color) {
			return '#' + l2js.utils.padLeft( Math.round(16581375*color).toString(16), 0, 6);
		};

		Turtle2DBuilder.prototype._symbols = {
			/**
			 * 
			 * Forward and draw line
			 * F(step, stroke, color) 
			 * @param {Object} symbol
			 * @param {Object} ctx
			 */
			'F': function(symbol, ctx) {
				var step = this._normalizeStep(symbol.arguments[0]);
				var stroke = this._normalizeStep(symbol.arguments[1]);
				var color = this._realColorToHexString(symbol.arguments[2]);
				var turtle2D = ctx.turtle2D;
				var newPos = Turtle2DBuilder.turtleTransforms.forward(step, turtle2D.turtle);
				
				turtle2D.baseLayer.add( new Kinetic.Line({
			        points: [turtle2D.turtle.position[0], turtle2D.turtle.position[1], newPos[0], newPos[1]],
			        stroke: color,
			        strokeWidth: stroke,
			        lineCap: 'round',
			        lineJoin: 'round'
			    }));
     
				turtle2D.baseLayer.batchDraw();
				turtle2D.turtle.position = newPos;
			},
			/**
			 * 
			 * Move by step
			 * f(step) 
			 * @param {Object} symbol
			 * @param {Object} ctx
			 */
			'f': function(symbol, ctx) {
				var step = this._normalizeStep(symbol.arguments[0]);
				var turtle2D = ctx.turtle2D;
				var newPos = Turtle2DBuilder.turtleTransforms.forward(step, turtle2D.turtle);
				turtle2D.turtle.position = newPos;
			},
			/**
			 * Turn left
			 * 
			 * L(angle)
			 * 
			 * @param {Object} symbol
			 * @param {Object} ctx
			 */
			'L': function(symbol, ctx) {
				var turtle = ctx.turtle2D.turtle;
				var angle = symbol.arguments[0];
				angle && (turtle.orientation = this._normalizeAngle(turtle.orientation - angle));
				
			},
			'R': function(symbol, ctx) {
				var turtle = ctx.turtle2D.turtle;
				var angle = symbol.arguments[0];
				angle && (turtle.orientation = this._normalizeAngle(turtle.orientation + angle));
			},
			'[': function(symbol, ctx) {
				var turtle2D = ctx.turtle2D;
				turtle2D.stack = turtle2D.stack || [];
				turtle2D.stack.unshift(l2js.utils.copy(turtle2D.turtle));
			},
			']': function(symbol, ctx) {
				var turtle2D = ctx.turtle2D;
				if(l2js.utils.isUndefined(turtle2D.stack)||!turtle2D.stack.length) {
					throw new Error('Cannot read from undefined of empty indices stack.');
				}
				turtle2D.turtle = turtle2D.stack.shift();
			},
			/**
			 * Start of polygon 
			 *
			 * PU(fillColor, stroke, strokeColor)
			 * 
			 * @param {Object} symbol
			 * @param {Object} ctx
			 */
			'PU': function(symbol, ctx) {
				var turtle2D = ctx.turtle2D, poly, fillColor, stroke, strokeColor;
				turtle2D.polyStack = turtle2D.polyStack || [];
				fillColor = this._realColorToHexString(symbol.arguments[0]);
				stroke = this._normalizeStep(symbol.arguments[1]);
				strokeColor = this._realColorToHexString(symbol.arguments[2]);
				
				poly = new Kinetic.Line({
			        points: [],
			        fill: fillColor,
			        stroke: stroke,
			        strokeWidth: strokeColor,
			        closed: true
			    });
				
				turtle2D.baseLayer.add(poly);
				turtle2D.polyStack.unshift(poly);
			},
			/**
			 * End of Polygon 
			 * @param {Object} symbol
			 * @param {Object} ctx
			 */
			'PS': function(symbol, ctx) {
				var turtle2D = ctx.turtle2D;
				if(l2js.utils.isUndefined(turtle2D.polyStack)||!turtle2D.polyStack.length) {
					throw new Error('Cannot read from undefined of empty polygon stack.');
				}
				turtle2D.polyStack.shift();
			},
			/**
			 * Add vertex to polygon 
			 * @param {Object} symbol
			 * @param {Object} ctx
			 */
			'V': function(symbol, ctx) {
				var turtle2D = ctx.turtle2D, turtle = turtle2D.turtle;
				if(l2js.utils.isUndefined(turtle2D.polyStack)||!turtle2D.polyStack.length) {
					throw new Error('Cannot read from undefined of empty polygon stack.');
				}
				var poly = turtle2D.polyStack[0];
				poly.points(poly.points().concat(turtle.position));
				turtle2D.baseLayer.batchDraw();
			}
			
			
		};
		
		return Turtle2DBuilder;

	})();

/**
 * Interpret of the symbols of L-system. Used Builder design pattern.
 *
 * @class
 */




	l2js.interpret.Interpret = (function(l2js) {

		Interpret.options = {
			callbacks : {
				// end of interpretation
				end : function() {

				},
				// start reading symbols generated in next sublsystem
				newLSystem : function(lsys) {

				},
				// end reading symbols in sublsystem
				endOfLSystem : function(lsys) {

				}
			}
		};

		function Interpret(result, options) {
			this.result = this._clearOutEmptyLSystems(this._serializeBuffers(l2js.utils.copy(result)));
			this.options = options && l2js.utils.extend(l2js.utils.copy(Interpret.options), options) || Interpret.options;
			this.ctx = {};
		};

		/**
		 * Factory method for builder
		 * @param {object} symbol Symbol that shoud be interpreted by the right builder
		 * @return Implementation of Builder according Alphabet including 'symbol'
		 */
		Interpret.prototype.getBuilder = function(symbol) {
			switch(symbol.alphabet.id) {
				case "Turtle2D":
					this._turtle2dBuilder || (this._turtle2dBuilder = new l2js.interpret.Turtle2DBuilder(this.options), this.ctx);
					return this._turtle2dBuilder;
			}
			throw new Error("Unsupported alphabet: '" + symbol.alphabet.id + "'");
		};

		/**
		 * Interpret next symbol
		 */
		Interpret.prototype.next = function() {
			var symbol = this.getNextSymbol();
			if (symbol) {
				console.log(symbol)
				this.getBuilder(symbol).interpret(symbol, this.ctx);
			}
			return symbol;
		};

		/**
		 * Interpret all the symbols
		 */
		Interpret.prototype.all = function() {
			while (this.hasNextSymbol()) {
				this.next();
			}
		};

		Interpret.prototype.hasNextSymbol = function() {
			if (!this._lSysBuf) {
				return !!(this.result && this.result.interpretation.length);
			}

			var bufLevel = 0;
			while (this._lSysBuf[bufLevel] && l2js.utils.isUndefined(this._lSysBuf[bufLevel].interpretation[this._indexBuf[bufLevel] + 1])) {
				bufLevel++;
			};
			return !!this._lSysBuf[bufLevel];
		};

		Interpret.prototype.getNextSymbol = function() {
			this._setupBuffers();

			var symbol, readIndex, result;

			readIndex = this._indexBuf.length === 0 ? 0 : ++this._indexBuf[0];
			result = this._lSysBuf.length === 0 ? this.result : this._lSysBuf[0];

			// Set position of previous symbol if we are at the end of l-system buffer (if exists)
			// Also skip empty sublsystems
			while (result && l2js.utils.isUndefined(result.interpretation[readIndex])) {
				this._lSysBuf.shift();
				this._indexBuf.shift();
				this._trigger('endOfLSystem', result);

				result = this._lSysBuf[0];
				readIndex = ++this._indexBuf[0];
			}

			// Next symbol does not exists
			if (!result) {
				this._trigger('end');
				this._clearBuffers();
				return;
			}

			symbol = result.interpretation[readIndex];
			this._indexBuf[0] = readIndex;
			this._lSysBuf[0] = result;

			if ( symbol instanceof l2js.compiler.env.SubLSystem) {
				this._trigger('newLSystem', symbol);
				this._indexBuf.unshift(0);
				this._lSysBuf.unshift(symbol);
				symbol = symbol.interpretation[0];
			}
			return symbol;
		};

		Interpret.prototype._trigger = function(event) {
			var args = Array.prototype.slice.call(arguments, 1);
			this.options.callbacks[event] && this.options.callbacks[event].apply(args);
		};

		Interpret.prototype._setupBuffers = function() {
			// Buffer of symbol of the result of currently read l-system
			this._lSysBuf = this._lSysBuf || [];

			// Buffer of curent position in the lSysBuf
			this._indexBuf = this._indexBuf || [];
		};

		Interpret.prototype._clearBuffers = function() {
			this._lSysBuf = null;
			this._indexBuf = null;
		};

		Interpret.prototype._clearOutEmptyLSystems = function(result) {
			if (result.interpretation) {
				var dels = [];
				for (var i = 0; i < result.interpretation.length; i++) {
					if (result.interpretation[i] instanceof l2js.compiler.env.SubLSystem) {
						result.interpretation[i] = this._clearOutEmptyLSystems(result.interpretation[i]);
						if (!result.interpretation[i].interpretation || result.interpretation[i].interpretation.length === 0) {
							dels.push(i);
						}
					}
				}
				for (var i = dels.length - 1; i >= 0; i--) {
					result.interpretation.splice(dels[i], 1);
				}
			}
			return result;

		};

		Interpret.prototype._serializeBuffers = function(result) {

			if (result.interpretation) {
				var dels = [];
				for (var i = 0; i < result.interpretation.length; i++) {
					if (result.interpretation[i] instanceof l2js.compiler.env.SubLSystem) {
						result.interpretation[i] = this._serializeBuffers(result.interpretation[i]);
					}
					
					
					if (result.interpretation[i] instanceof l2js.compiler.env.Stack) {
						
						var stack = result.interpretation.splice(i, 1)[0];
						result.interpretation.splice(i, 0, stack.start);
						for (var j = 0; j < stack.string.length; j++) {
							result.interpretation.splice(1 + i + j, 0, stack.string[j]);
						}
						result.interpretation.splice(1 + i + j, 0, stack.end);	
						
					}

				}
				

			}
			return result;
		};

		return Interpret;
	})(l2js);

l2js.mutator = l2js.mutator || {};

l2js.mutator.Mutator =  (function(l2js)	{
	
		function Mutator() {
			
		}
		
		
		return Mutator;
	})(l2js);

l2js.compile = function(code) {
		return new l2js.compiler.Compiler().compile(code);
	};

	l2js.derive = function(lsystemCode) {
		var out = eval(lsystemCode);
		console.log(out.interpretation);
		return out;
	};

	l2js.interpretAll = function(symbols, options) {
		return new l2js.interpret.Interpret(symbols, options).all();
	};

	l2js.format = function(lsystemCode) {
		var deferred = l2js.core.q.deferred();
		setTimeout(function() {
			var errHandler = function(err) {
				deferred.reject(err);
			};
			try {
				var compiler = new l2js.compiler.Compiler();

				compiler.toAST(lsystemCode).then(function(ast) {
					compiler.ASTToL2(ast).then(function(l2) {
						deferred.resolve(l2);
					}, errHandler);
				}, errHandler);
			} catch(e) {
				errHandler(e);
			}

		}, 0);

		return deferred.promise;
	};
	
	l2js.mutate = function() {
		
	};
	


}));