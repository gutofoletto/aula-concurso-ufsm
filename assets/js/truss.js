/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );

var content = document.getElementById('content');
var menu_toggle = document.getElementById('menu-toggle');
var menu = document.getElementById('menu');
var menu_active = false;
var submenu = document.getElementById('submenu');
var submenu_toggle = document.getElementById('submenu-toggle');
var submenu_active = false;

menu_toggle.onclick = function(e){
	classie.toggle(menu, 'sidebar-hidden');
	classie.toggle(content, 'content-push');
	menu_active = true;
	e.preventDefault();

};

submenu_toggle.onclick = function(e){
	classie.toggle(submenu, 'sidebar-hidden');
	submenu_active = true;
	e.preventDefault();
};


content.onclick = function(e){
	if(submenu_active === true){
		classie.toggle(submenu, 'sidebar-hidden');
		classie.toggle(menu, 'sidebar-hidden');
		classie.toggle(content, 'content-push');
		submenu_active = false;
	}
};

(function (name, context, definition) {
    if (typeof define === 'function' && define.amd) {
        define(definition);
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition();
    }
    else {
        context[name] = definition();
    }
})('Tabs', this, function() {

    /**
     * Tabs
     * @description Keyboard and screen reader accessible tabs.
     * @constructor
     * @param element
     */
    var Tabs = function(element) {
        this.target = element;
        this.tabs = element.getElementsByTagName('a');
        this.panels = [];

        for (var i = 0, len = this.tabs.length; i < len; i++) {
            this.panels.push( document.getElementById(this.tabs[i].hash.replace('#', '')) );
        }

        if (this.active === undefined) {
            this.init();
        }
    };

    /**
     * Init
     */
    Tabs.prototype.init = function() {
        var self = this;

        this.target.setAttribute('role', 'tablist');

        this.clickListener = function(e) {
            var target = e.srcElement || e.target;

            if (target  && target.nodeName.toLowerCase() === 'a') {

                if (e.preventDefault) {
                    e.preventDefault();
                }
                else {
                    e.returnValue = false;
                }

                self.toggle(target);
            }
        };

        this.keyupListener = function(e) {
            var tab;

            // Right
            if (e.keyCode === 39 && self.active.index < self.tabs.length) {
                tab = self.tabs[self.active.index + 1];
            }

            // Left
            else if (e.keyCode === 37 && self.active.index > 0) {
                tab = self.tabs[self.active.index - 1];
            }

            if (tab) {
                tab.focus();
                self.toggle(tab);
            }
        };

        for (var i = this.tabs.length - 1; i >= 0; i--) {
            var tab = this.tabs[i];
            var panel = this.panels[i];
            var preSelected = tab.className.indexOf('is-selected') > -1;
            var selected = ! this.active && (preSelected || i === 0);

            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', selected);
            tab.setAttribute('aria-controls', this.tabs[i].hash.replace('#', ''));

            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-hidden', ! selected);

            if (selected) {

                if (!preSelected) {
                    tab.className+= ' is-selected ';
                }

                this.active = {
                    tab: tab,
                    index: i,
                    panel: panel
                };
            }
            else {
                panel.style.display = 'none';
            }
        }

        if (this.target.addEventListener) {
            this.target.addEventListener('click', this.clickListener, false);
            this.target.addEventListener('keyup', this.keyupListener, false);
        }
        else {
            // Presume legacy IE
            this.target.attachEvent('onclick', this.clickListener);
            this.target.attachEvent('onclick', this.keyupListener);
        }

    };

    /**
     * Toggle
     * @param {Object} tab
     */
    Tabs.prototype.toggle = function(tab) {
        var panel = document.getElementById(tab.hash.replace('#', ''));

        this.active.tab.className = this.active.tab.className.replace('is-selected', '');
        this.active.tab.setAttribute('aria-selected', false);

        this.active.panel.style.display = 'none';
        this.active.panel.setAttribute('aria-hidden', true);

        tab.className+= ' is-selected ';
        tab.setAttribute('aria-selected', true);

        panel.style.display = '';
        panel.setAttribute('aria-hidden', false);

        // Find tab index
        for (var i = 0, len = this.tabs.length; i < len; i++) {
            if (tab === this.tabs[i]) {
                break;
            }
        }

        this.active.tab = tab;
        this.active.index = i;
        this.active.panel = panel;
    };

    /**
     * Teardown
     */
    Tabs.prototype.teardown = function() {

        this.target.removeAttribute('role');

        if (this.target.removeEventListener) {
            this.target.removeEventListener('click', this.clickListener, false);
            this.target.removeEventListener('click', this.keyupListener, false);
        }
        else {
            // Presume legacy IE
            this.target.detachEvent('onclick', this.clickListener);
            this.target.detachEvent('onclick', this.keyupListener);
        }

        for (var i = 0, len = this.tabs.length; i < len; i++) {
            var tab = this.tabs[i];
            var panel = this.panels[i];

            tab.removeAttribute('role');
            tab.removeAttribute('aria-selected');
            tab.removeAttribute('aria-controls');

            panel.style.display = '';
            panel.removeAttribute('role');
        }

        delete this.active;
    };

    return Tabs;

});

// You were going to wrap the above as an AMD/CommonJS module and load on demand, right?
var instance = new Tabs( document.querySelector('[data-directive=tabs]') );