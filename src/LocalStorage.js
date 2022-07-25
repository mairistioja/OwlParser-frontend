import { useState } from "react";

// Based on https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/cycle.js:
function decycle(object, replacer) {
  "use strict";
  var objects = new WeakMap();
  return (function derez(value, path) {
    var old_path;
    var nu;
    if (replacer !== undefined)
      value = replacer(value);
    if (typeof value === "object"
        && value !== null
        && !(value instanceof Boolean)
        && !(value instanceof Date)
        && !(value instanceof Number)
        && !(value instanceof RegExp)
        && !(value instanceof String)
    ) {
      old_path = objects.get(value);
      if (old_path !== undefined)
        return {$ref: old_path};
      objects.set(value, path);

      if (Array.isArray(value)) {
          nu = [];
          value.forEach(function (element, i) {
              nu[i] = derez(element, path + "[" + i + "]");
          });
      } else {
          nu = {};
          Object.keys(value).forEach(function (name) {
              nu[name] = derez(
                  value[name],
                  path + "[" + JSON.stringify(name) + "]"
              );
          });
      }
      return nu;
    }
    return value;
  }(object, "$"));
};

// Based on https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/cycle.js:
function retrocycle($) {
  "use strict";
  var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;
  (function rez(value) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach(function (element, i) {
          if (typeof element === "object" && element !== null) {
            var path = element.$ref;
            if (typeof path === "string" && px.test(path)) {
              value[i] = eval(path);
            } else {
              rez(element);
            }
          }
        });
      } else {
        Object.keys(value).forEach(function (name) {
          var item = value[name];
          if (typeof item === "object" && item !== null) {
            var path = item.$ref;
            if (typeof path === "string" && px.test(path)) {
              value[name] = eval(path);
            } else {
              rez(item);
            }
          }
        });
      }
    }
  }($));
  return $;
};

// Based on https://usehooks.com/useLocalStorage/
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? retrocycle(JSON.parse(item)) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(decycle(valueToStore)));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
