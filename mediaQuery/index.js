
// QueryHandler
class QueryHandler {
  constructor(options) {
    this.options = options;
    !options.deferSetup && this.setup();
  }

  /**
   * coordinates setup of the handler
   *
   * @function
   */
  setup() {
      if(this.options.setup) {
          this.options.setup();
      }
      this.initialised = true;
  }

  /**
   * coordinates setup and triggering of the handler
   *
   * @function
   */
  on() {
      !this.initialised && this.setup();
      this.options.match && this.options.match();
  }

  /**
   * coordinates the unmatch event for the handler
   *
   * @function
   */
  off() {
      this.options.unmatch && this.options.unmatch();
  }

  /**
   * called when a handler is to be destroyed.
   * delegates to the destroy or unmatch callbacks, depending on availability.
   *
   * @function
   */
  destroy() {
      this.options.destroy ? this.options.destroy() : this.off();
  }

  /**
   * determines equality by reference.
   * if object is supplied compare options, if function, compare match callback
   *
   * @function
   * @param {object || function} [target] the target for comparison
   */
  equals(target) {
      return this.options === target || this.options.match === target;
  }

}

class MediaQuery {

  constructor(query, isUnconditional) {
    this.query = query;
    this.isUnconditional = isUnconditional;
    this.handlers = [];
    this.mql = window.matchMedia(query);

    var self = this;
    this.listener = function(mql) {
        // Chrome passes an MediaQueryListEvent object, while other browsers pass MediaQueryList directly
        self.mql = mql.currentTarget || mql;
        self.assess();
    };
    this.mql.addListener(this.listener);
  }

  /**
   * add a handler for this query, triggering if already active
   *
   * @param {object} handler
   * @param {function} handler.match callback for when query is activated
   * @param {function} [handler.unmatch] callback for when query is deactivated
   * @param {function} [handler.setup] callback for immediate execution when a query handler is registered
   * @param {boolean} [handler.deferSetup=false] should the setup callback be deferred until the first time the handler is matched?
   */
  addHandler(handler) {
      var qh = new QueryHandler(handler);
      this.handlers.push(qh);

      this.matches() && qh.on();
  }

  /**
   * removes the given handler from the collection, and calls it's destroy methods
   *
   * @param {object || function} handler the handler to remove
   */
  removeHandler(handler) {
      var handlers = this.handlers;
      each(handlers, function(h, i) {
          if(h.equals(handler)) {
              h.destroy();
              return !handlers.splice(i,1); //remove from array and exit each early
          }
      });
  }

  /**
   * Determine whether the media query should be considered a match
   *
   * @return {Boolean} true if media query can be considered a match, false otherwise
   */
  matches() {
      return this.mql.matches || this.isUnconditional;
  }

  /**
   * Clears all handlers and unbinds events
   */
  clear() {
      each(this.handlers, function(handler) {
          handler.destroy();
      });
      this.mql.removeListener(this.listener);
      this.handlers.length = 0; //clear array
  }

  /*
      * Assesses the query, turning on all handlers if it matches, turning them off if it doesn't match
      */
  assess() {
      var action = this.matches() ? 'on' : 'off';

      each(this.handlers, function(handler) {
          handler[action]();
      });
  }
}

class MediaQueryDispatch {
  constructor() {
    const matchMediaPolyfill = mediaQuery => {
      return {
        media: mediaQuery,
        matches: false,
        addListener() {},
        removeListener() {}
      };
    };
    window.matchMedia = window.matchMedia || matchMediaPolyfill;
    this.queries = {};
    this.browserIsIncapable = !window.matchMedia('only all').matches;
  }

  register(q, options, shouldDegrade) {
    let { queries }     = this,
        isUnconditional = shouldDegrade && this.browserIsIncapable;

    if(!queries[q]) {
        queries[q] = new MediaQuery(q, isUnconditional);
    }

    //normalise to object in an array
    if(isFunction(options)) {
        options = { match : options };
    }
    if(!isArray(options)) {
        options = [options];
    }
    each(options, function(handler) {
        if (isFunction(handler)) {
            handler = { match : handler };
        }
        queries[q].addHandler(handler);
    });

    return this;
  }

  unregister(q, handler) {
    var query = this.queries[q];

    if(query) {
        if(handler) {
            query.removeHandler(handler);
        }
        else {
            query.clear();
            delete this.queries[q];
        }
    }

    return this;
  }
}

let enquireJs = new MediaQueryDispatch(); 

function each(collection, fn) {
  var i      = 0,
      length = collection.length,
      cont;

  for(i; i < length; i++) {
      cont = fn(collection[i], i);
      if(cont === false) {
          break; //allow early exit
      }
  }
}

function isArray(target) {
  return Object.prototype.toString.apply(target) === '[object Array]';
}

function isFunction(target) {
  return typeof target === 'function';
}

let mediaQueryList = window.matchMedia("(orientation: portrait)");

function handleOrientationChange(evt) {
  if (evt.matches) {
    console.log('from match');
  } else {
    console.log('from not match');
  }
}

mediaQueryList.addListener(handleOrientationChange);

handleOrientationChange(mediaQueryList);

// mediaQueryList.removeListener(handleOrientat

if (typeof window !== 'undefined') {
  const matchMediaPolyfill = mediaQuery => {
    return {
      media: mediaQuery,
      matches: false,
      addListener() {},
      removeListener() {}
    };
  };
  window.matchMedia = window.matchMedia || matchMediaPolyfill;
}

function enquireScreen(cb, str) {
  if (!enquireJs) {
    return;
  }
  enquireJs.register(str || 'only screen and (max-width: 400.99px)', {
    match: () => {
      cb && cb(true);
    },
    unmatch: () => {
      cb && cb();
    },
  });
}
enquireScreen((mobile) => console.log(mobile));

