/**
* ff-slider.js
*
* @fileoverview Minimal slider zero dependency
*
* @author David Félix-Faure
* @author http://www.felixfaure.fr/
*
*/
(function(global){

    'use strict';

    function ffslider(selector, options) {
        //Tests
        if (!selector) {
            throw new Error('No selector');
        } else if (selector.length > 0) {
            throw new Error('Selector is an array');
        }
        for (var i = 0; i < sliders.length; i++) {
            if (sliders[i] === selector) {
                throw new Error('Already init');
            }
        }

        this.$s = selector;

        this.args = {
            btnPrev: 'ffs_prev',
            btnNext: 'ffs_next',
            items: 'ffs_i',
            currentClass: 'ffs_i-current',
            showPrevClass: 'ffs_i-showPrev',
            showNextClass: 'ffs_i-showNext',
            hidePrevClass: 'ffs_i-hidePrev',
            hideNextClass: 'ffs_i-hideNext',
            infinite: true,
            keys: true
        };

        this.args = extend(this.args, options);
        this.event = null;

        // "Global vars"
        this.items = Array.prototype.slice.call(this.$s.querySelectorAll(' .' + this.args.items));
        this.nb = this.items.length - 1; // otherwise starts from 1. weird?
        this.idx = this.items.indexOf(this.$s.querySelector(' .' + this.args.currentClass));
        this.btnPrev = this.$s.querySelector(' .' + this.args.btnPrev);
        this.btnNext = this.$s.querySelector(' .' + this.args.btnNext);

        this.bindEvts();
        this.addEvt();

        // For focus
        this.$s.setAttribute('tabindex', -1);

        // If there is no active item, start at 0
        if (this.idx < 0) {
            this.idx = 0;
            addClass(this.items[this.idx], this.args.currentClass);
        }

        //Update attr btn in start and fix bug when actualize navigator
        this.btnPrev.removeAttribute('disabled');
        this.btnNext.removeAttribute('disabled');
        this.updateBtns();

        // Wrapped in timeout function so event can
        // be listened from outside at anytime
        var _this = this;
        setTimeout(function() {
            _this.event.detail.current = _this.idx;
            _this.$s.dispatchEvent(_this.event);
        }, 0);
    }

    var sliders = [];

    var FS = ffslider.prototype;

    // Update prev/next disabled attribute
    FS.updateBtns = function () {
        if (!this.btnPrev && !this.btnNext) { return; }

        if (this.idx === this.nb && this.args.infinite !== true) {
            this.btnNext.setAttribute('disabled', 'disabled');
        } else if (this.idx === 0 && this.args.infinite !== true) {
            this.btnPrev.setAttribute('disabled', 'disabled');
        }
    };

    // Reset all classes and attr added
    FS.removeAttrs = function () {
        removeClass(this.items[this.idx], this.args.currentClass);
        removeClass($$(this.args.hidePrevClass)[0], this.args.hidePrevClass);
        removeClass($$(this.args.hideNextClass)[0], this.args.hideNextClass);
        removeClass($$(this.args.showPrevClass)[0], this.args.showPrevClass);
        removeClass($$(this.args.showNextClass)[0], this.args.showNextClass);

        if (!this.btnPrev && !this.btnNext) { return; }

        this.btnPrev.removeAttribute('disabled');
        this.btnNext.removeAttribute('disabled');
    };

    // Method to add classes to the right elements depending on the index passed
    FS.goTo = function (index) {
        if (index === this.idx) { return; }

        // Check if it's infinite and if so, change index to be last item when clicking previous on first item
        if (this.args.infinite && index === -1) { index = this.nb - 1; }
        else if (index > this.nb || index < 0) { return; }

        this.removeAttrs();

        addClass(this.items[this.idx], index > this.idx ? this.args.hidePrevClass : this.args.hideNextClass);
        addClass(this.items[index], this.args.currentClass + ' ' + (index > this.idx ? this.args.showNextClass : this.args.showPrevClass));

        this.idx = index;

        this.updateBtns();

        this.event.detail.current = this.idx;
        this.$s.dispatchEvent(this.event);
    };

    // Previous item handler
    FS.prev = function () {
        if (this.args.infinite && this.idx === 0) {
            this.goTo(this.nb);
        } else {
            this.goTo(this.idx - 1);
        }
    };

    // Next item handler
    FS.next = function () {
        if (this.idx >= this.nb && this.args.infinite) {
            this.goTo(0);
        } else {
            this.goTo(this.idx + 1);
        }
    };

    // Attach events handlers
    FS.bindEvts = function () {
        sliders.push(this.$s);

        var _this = this;

        if (this.btnPrev) {
            this.btnPrev.addEventListener('click', function (event) {
                event.preventDefault();
                _this.prev();
            });
        }

        if (this.btnNext) {
            this.btnNext.addEventListener('click', function (event) {
                event.preventDefault();
                _this.next();
            });
        }

        if(this.args.keys) {
            this.$s.onkeydown = function(e) {
                switch (e.keyCode) {
                    case 37:
                        _this.prev();
                        break;
                    case 39:
                        _this.next();
                        break;
                }
            };
        }
    };

    // Method so it is nicer for the user to use custom events
    FS.on = function (eventName, callback) {
        this.$s.addEventListener(eventName, function(event) {
            return callback(event);
        }, false);
    };

    // Create custom Event
    FS.addEvt = function () {
        var _this = this;
        this.event = new CustomEvent('change', {
            detail: {
                slider: _this.$s,
                current: Number(_this.idx)
            },
            bubbles: true,
            cancelable: true
        });
    };



    //Helper functions
    function addClass(element, className) {
        if (!element) { return; }
        element.className = element.className.replace(/\s+$/gi, '') + ' ' + className;
    }

    function removeClass(element, className) {
        if (!element) { return; }
        element.className = element.className.replace(className, '');
    }

    function $$(element) {
        if (!element) { return; }
        return document.querySelectorAll('.' + element);
    }

    function extend(origOptions, userOptions){
        var extendOptions = {}, attrname;
        for (attrname in origOptions) { extendOptions[attrname] = origOptions[attrname]; }
        for (attrname in userOptions) { extendOptions[attrname] = userOptions[attrname]; }
        return extendOptions;
    }

    // Pollyfill for CustomEvent() Constructor - thanks to Internet Explorer
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.CustomEvent.prototype;
    window.CustomEvent = CustomEvent;

    // Exports to multiple environments
    global['ffslider'] = ffslider;

}(this));
