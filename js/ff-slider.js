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

      var o = this;

      //Default options
      o.args = {
        btnPrev: 'ffs_prev',
        btnNext: 'ffs_next',
        dots: 'ffs_dot',
        dotCurrent: 'is-active',
        items: 'ffs_i',
        currentClass: 'is-active',
        showPrevClass: 'ffs_i-showPrev',
        showNextClass: 'ffs_i-showNext',
        hidePrevClass: 'ffs_i-hidePrev',
        hideNextClass: 'ffs_i-hideNext',
        infinite: true,
        keys: true,
        idx: 0
      };
      o.args = extend(o.args, options);

      // Vars
      o.$s = selector;
      o.event = null;

      // "Global vars"
      o.reset();
      o.btnPrev = o.args.btnPrev ? o.$s.querySelector(' .' + o.args.btnPrev) : false;
      o.btnNext = o.args.btnNext ? o.$s.querySelector(' .' + o.args.btnNext) : false;
      o.dots = o.args.dots ? Array.prototype.slice.call(o.$s.querySelectorAll('.' + o.args.dots)) : false;

      //Init event and custom event
      o.bindEvts();
      o.addEvt();

      // If there is no active item, start at 0
      if (o.idx === -1) {
        o.idx = 0;
        addClass(o.items[o.idx], o.args.currentClass);
      }

      // o.items = Array.prototype.slice.call(o.$s.querySelectorAll('.' + o.args.items));
      // o.nb = o.items.length - 1;
      // o.idx = o.args.idx;
      // o.btnPrev = o.$s.querySelector('.' + o.args.btnPrev);
      // o.btnNext = o.$s.querySelector('.' + o.args.btnNext);
      // o.dots = o.args.dots ? Array.prototype.slice.call(o.$s.querySelectorAll('.' + o.args.dots)) : false;

      // For focus needing for navigation with keys
      if (o.args.keys) { o.$s.setAttribute('tabindex', -1); }

      // Class for active slide
      // addClass(o.items[o.idx], o.args.currentClass);

      //Class for active dot
      if (o.dots) { addClass(o.dots[o.idx], o.args.dotCurrent); }

      //Update attr btn in start and fix bug when navigator is actualized
      if (o.btnPrev) o.btnPrev.removeAttribute('disabled');
      if (o.btnNext) o.btnNext.removeAttribute('disabled');
      if (o.btnPrev || o.btnNext) o.updateBtns();

      // Wrapped in timeout function so event can
      // be listened from outside at anytime
      setTimeout(function() {
        o.event.detail.current = o.idx;
        o.$s.dispatchEvent(o.event);
      }, 0);
  }

  //Array with all instances of sliders
  var sliders = [];

  var FS = ffslider.prototype;

  // Update prev/next disabled attribute
  FS.updateBtns = function () {
    var o = this;

    if (!o.btnPrev && !o.btnNext) { return; }

    if (o.idx === o.nb && !o.args.infinite) {
      o.btnNext.setAttribute('disabled', 'disabled');
    } else if (o.idx === 0 && !o.args.infinite) {
      o.btnPrev.setAttribute('disabled', 'disabled');
    }
  };

  // Reset all classes and attr added
  FS.removeAttrs = function () {
    var o = this;

    removeClass(o.items[o.idx], o.args.currentClass);
    removeClass($$(o.args.hidePrevClass,o.$s)[0], o.args.hidePrevClass);
    removeClass($$(o.args.hideNextClass,o.$s)[0], o.args.hideNextClass);
    removeClass($$(o.args.showPrevClass,o.$s)[0], o.args.showPrevClass);
    removeClass($$(o.args.showNextClass,o.$s)[0], o.args.showNextClass);

    if (o.btnPrev) o.btnPrev.removeAttribute('disabled');
    if (o.btnNext) o.btnNext.removeAttribute('disabled');

    if (o.dots) { removeClass($$(o.args.dotCurrent,o.$s)[0], o.args.dotCurrent); }
  };

  // Method to add classes to the right elements depending on the index passed
  FS.goTo = function (index) {
    var o = this;
    var reverse = false;

    if (index === o.idx) { return; }

    // Check if it's infinite and if so, change index to be last item when clicking previous on first item
    if (o.args.infinite && index === -1) {
      index = o.nb;
      reverse = true;
    } else if (o.args.infinite && index > o.nb) {
      index = 0;
      reverse = true;
    } else if (index > o.nb || index < 0) {
      return;
    }

    o.removeAttrs();

    addClass(o.items[o.idx], index > o.idx && !reverse || index === 0 && reverse ? o.args.hidePrevClass : o.args.hideNextClass);
    addClass(o.items[index], o.args.currentClass + ' ' + (index > o.idx  && !reverse || index === 0 && reverse ? o.args.showNextClass : o.args.showPrevClass));
    if (o.dots) { addClass(o.dots[index], o.args.dotCurrent); }

    o.idx = index;

    o.updateBtns();

    o.event.detail.current = o.idx;
    o.$s.dispatchEvent(o.event);
  };

  // Previous item handler
  FS.prev = function () {
    var o = this;

    // if (o.args.infinite && o.idx === 0) {
    //   o.goTo(o.nb);
    // } else {
      o.goTo(o.idx - 1);
    // }
  };

  // Next item handler
  FS.next = function () {
    var o = this;

    // if (o.idx >= o.nb && o.args.infinite) {
    //   o.goTo(0);
    // } else {
      o.goTo(o.idx + 1);
    // }
  };

  FS.reset = function () {
    var o = this;

    o.items = Array.prototype.slice.call(o.$s.querySelectorAll(' .' + o.args.items));
    o.idx = o.items.indexOf(o.$s.querySelector(' .' + o.args.currentClass));
    o.nb = o.items.length - 1;
  };

  // Attach events handlers
  FS.bindEvts = function () {
    var o = this;

    //Add the new slider in the array which list sliders
    sliders.push(o.$s);

    if (o.btnPrev) {
      o.btnPrev.addEventListener('click', function (event) {
        event.preventDefault();
        o.prev();
      });
    }

    if (o.btnNext) {
      o.btnNext.addEventListener('click', function (event) {
        event.preventDefault();
        o.next();
      });
    }

    if(o.dots) {
      o.dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function() {
          o.goTo(idx);
        });
      });
    }

    if(o.args.keys) {
      o.$s.onkeydown = function(e) {
        switch (e.keyCode) {
          case 37:
            o.prev();
            break;
          case 39:
            o.next();
            break;
        }
      };
    }
  };

  // Method so it is nicer for the user to use custom events
  FS.on = function (eventName, callback) {
    var o = this;
    o.$s.addEventListener(eventName, function(event) {
      return callback(event);
    }, false);
  };

  // Create custom Event
  FS.addEvt = function () {
    var o = this;
    o.event = new CustomEvent('change', {
      detail: {
        slider: o.$s,
        current: Number(o.idx)
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

  function $$(element,container) {
    if (!element) { return; }
    return (container || document).querySelectorAll('.' + element);
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

  // Exports in global environment
  global.ffslider = ffslider;

}(this));
