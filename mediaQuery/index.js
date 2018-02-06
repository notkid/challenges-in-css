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

// mediaQueryList.removeListener(handleOrientationChange);
let enquireJs;

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
  enquireJs = require('enquire.js');
}

function enquireScreen(cb, str) {
  if (!enquire) {
    return;
  }
  enquireJs.register(str || 'only screen and (max-width: 767.99px)', {
    match: () => {
      cb && cb(true);
    },
    unmatch: () => {
      cb && cb();
    },
  });
}
enquireScreen((mobile) => console.log(mobile));

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
    var queries         = this.queries,
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

// QueryHandler
class QueryHandler {
  constructor(options) {

  }
}