import "./App.css";

import React, { useState } from "react";
import ContentWrapper from "./components/ContentWrapper";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter } from "react-router-dom";
import {
  simplifyTriples,
  extractSrmIdsByType,
  buildModel,
  owlIdIsBlank,
} from "./parsing";
import SrmMappingPage from "./components/SrmMappingPage";
import { srmClasses, srmRelations } from "./srm";

// Copied from https://usehooks.com/useLocalStorage/
function useLocalStorage(key, initialValue) {
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
      return item ? JSON.parse(item) : initialValue;
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
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const App = () => {
  const [savedState, setSavedState] = useLocalStorage("savedState", {
    currentActivity: "loadFile",
  });

  const setTriples = (triples) => {
    const [srmTypes, nonSrmTypes, nonTypeTriples] = extractSrmIdsByType(
      simplifyTriples(triples)
    );
    setSavedState({
      currentActivity: "mapSrmClasses",
      srmTypes,
      nonSrmTypes,
      nonTypeTriples,
      srmClassOwlIds: Object.entries(srmClasses).reduce(
        (ids, [srmId, srmClass]) => {
          if (!srmClass.needMapping) return ids;
          for (const classId of srmTypes.classIds) {
            if (
              !Object.values(ids).includes(classId) &&
              srmClass.guessRegex.test(classId)
            )
              return { ...ids, [srmId]: classId };
          }
          return { ...ids, [srmId]: "" };
        },
        {}
      ),
    });
  };

  const completeSrmClassOwlIds = (srmClassOwlIds) => {
    console.assert(savedState.currentActivity === "mapSrmClasses");
    console.debug("SRM class mapping done!", srmClassOwlIds);
    setSavedState({
      ...savedState,
      currentActivity: "mapSrmRelations",
      srmClassOwlIds,
      srmRelationOwlIds: Object.entries(srmRelations).reduce(
        (ids, [srmId, srmRelation]) => {
          if (srmRelation.guessRegex !== null) {
            for (const propertyId of savedState.srmTypes.objectPropertyIds) {
              if (
                !Object.values(ids).includes(propertyId) &&
                srmRelation.guessRegex.test(propertyId)
              ) {
                return { ...ids, [srmId]: propertyId };
              }
            }
          }
          return { ...ids, [srmId]: "" };
        },
        {}
      ),
    });
  };

  const completeSrmRelationOwlIds = (srmRelationOwlIds) => {
    console.assert(savedState.currentActivity === "mapSrmRelations");
    console.debug("SRM relation mapping done!", srmRelationOwlIds);
    setSavedState({
      ...savedState,
      currentActivity: "browse",
      srmRelationOwlIds,
      ...buildModel(
        savedState.srmTypes,
        savedState.nonTypeTriples,
        savedState.srmClassOwlIds
      ),
    });
  };

  const resetApp = () => {
    setSavedState({ currentActivity: "loadFile" });
  };

  return (
    <BrowserRouter>
      <Header />
      {savedState.currentActivity === "loadFile" ? (
        <LandingPage setTriples={setTriples} />
      ) : savedState.currentActivity === "mapSrmClasses" ? (
        <SrmMappingPage
          heading="Map SRM classes"
          ids={savedState.srmTypes.classIds.filter((id) => !owlIdIsBlank(id))}
          initialMapping={savedState.srmClassOwlIds}
          doneButtonLabel="Continue"
          onCancel={resetApp}
          onDone={completeSrmClassOwlIds}
        />
      ) : savedState.currentActivity === "mapSrmRelations" ? (
        <SrmMappingPage
          heading="Map SRM relations"
          ids={savedState.srmTypes.objectPropertyIds}
          initialMapping={savedState.srmRelationOwlIds}
          doneButtonLabel="Continue"
          onCancel={resetApp}
          onDone={completeSrmRelationOwlIds}
        />
      ) : (
        <ContentWrapper model={savedState} onClose={resetApp} />
      )}
      <Footer />
    </BrowserRouter>
  );
};

export default App;
