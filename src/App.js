import "./App.css";

import React, { useEffect, useState } from "react";
import ContentWrapper from "./components/ContentWrapper";
import Header from "./components/Header";
import Footer from "./components/Footer";
import {
  simplifyTriples,
  extractSrmIdsByType,
  buildModel,
  owlIdIsBlank,
} from "./parsing";
import SrmMappingPage from "./components/SrmMappingPage";
import { srmClasses, srmRelations } from "./srm";
import LoadingContainer from "./components/LoadingContainer";
import { Snackbar } from "@mui/material";
import { RdfXmlParser } from "rdfxml-streaming-parser";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import { ActiveClassIdContext } from "./ActiveClassIdContext";

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
  const activeClassIdState = useState("");
  const [activeClassId, setActiveClassId] = activeClassIdState;
  const [errorMessage, setErrorMessage] = useState("");

  function parseStream(readableWebStream, onSuccess, onFailure, autoMap = false) {
    const readableNodeStream = new ReadableWebToNodeStream(readableWebStream);
    const rdfXmlParser = new RdfXmlParser();

    const triples = [];
    rdfXmlParser
      .import(readableNodeStream)
      .on("data", (quad) => {
        triples.push({
          subject: quad.subject,
          predicate: quad.predicate,
          object: quad.object,
        });
      })
      .on("error", (error) => {
        setErrorMessage(`Failed to parse given file: ${error}`);
        onFailure();
      })
      .on("end", () => {
        onSuccess();
        setTriples(triples, autoMap);
      });
  }

  function handleUpload(fileList, onSuccess, onFailure) {
    if (fileList.length <= 0) return;
    console.assert(fileList.length === 1);
    const file = fileList[0];
    const maxSize = 1024 * 1024 * 20;
    if (file.size > maxSize) {
      setErrorMessage(`File "${file.name}" is larger than ${maxSize} bytes!`);
      onFailure();
      return;
    }

    parseStream(file.stream(), onSuccess, onFailure);
  }

  function handleIriDownload(iriToDownload, onSuccess, onFailure, autoMap = false) {
    console.debug(`Downloading: ${iriToDownload}`);
    fetch(iriToDownload, {
      method: "GET",
      headers: { Accept: "application/rdf+xml,*/*" },
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `Server returned failure status: ${response.status} ${response.statusText}`
          );
        return response.body;
      })
      .then((bodyStream) => parseStream(bodyStream, onSuccess, onFailure, autoMap))
      .catch((error) => {
        setErrorMessage(
          `Fetching ontology from given IRI failed: ${error.message}`
        );
        onFailure();
      });
  }

  const guessSrmRelationOwlIds = (srmTypes) =>
    Object.entries(srmRelations).reduce(
      (ids, [srmId, srmRelation]) => {
        if (srmRelation.guessRegex !== null) {
          for (const propertyId of srmTypes.objectPropertyIds) {
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
    );

  const setTriples = (triples, autoMap) => {
    const [srmTypes, nonSrmTypes, nonTypeTriples] = extractSrmIdsByType(
      simplifyTriples(triples)
    );
    let newState = {
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
    };
    if (autoMap) {
      setActiveClassId("");
      newState = {
        ...newState,
        currentActivity: "browse",
        srmRelationOwlIds: guessSrmRelationOwlIds(newState.srmTypes),
        ...buildModel(
          newState.srmTypes,
          newState.nonTypeTriples,
          newState.srmClassOwlIds
        ),
      };
    }
    setSavedState(newState);
  };

  const completeSrmClassOwlIds = (srmClassOwlIds) => {
    console.assert(savedState.currentActivity === "mapSrmClasses");
    console.debug("SRM class mapping done!", srmClassOwlIds);
    setSavedState({
      ...savedState,
      currentActivity: "mapSrmRelations",
      srmClassOwlIds,
      srmRelationOwlIds: guessSrmRelationOwlIds(savedState.srmTypes),
    });
  };

  const completeSrmRelationOwlIds = (srmRelationOwlIds) => {
    console.assert(savedState.currentActivity === "mapSrmRelations");
    console.debug("SRM relation mapping done!", srmRelationOwlIds);
    setActiveClassId("");
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
    <ActiveClassIdContext.Provider value={activeClassIdState}>
      <Header
        showMenu={savedState.currentActivity !== "loadFile"}
        loadingPage={true}
        handleIriDownload={handleIriDownload}
        handleUpload={handleUpload}/>
      {savedState.currentActivity === "loadFile" ? (
        <div style={{ marginTop: "6rem" }}>
          <LoadingContainer
            loadingPage={true}
            handleIriDownload={handleIriDownload}
            handleUpload={handleUpload}
            />
        </div>
      ) : savedState.currentActivity === "mapSrmClasses" ? (
        <SrmMappingPage
          heading="Map SRM classes"
          ids={savedState.srmTypes.classIds.filter((id) => !owlIdIsBlank(id))}
          initialMapping={savedState.srmClassOwlIds}
          onNext={completeSrmClassOwlIds}
          onCancel={resetApp}
          nextButtonLabel="Next"
        />
      ) : savedState.currentActivity === "mapSrmRelations" ? (
        <SrmMappingPage
          heading="Map SRM relations"
          ids={savedState.srmTypes.objectPropertyIds}
          initialMapping={savedState.srmRelationOwlIds}
          onBack={() => setSavedState({
            ...savedState,
            currentActivity: "mapSrmClasses"
          })}
          onNext={completeSrmRelationOwlIds}
          onCancel={resetApp}
          nextButtonLabel="Finish"
        />
      ) : (
        <ContentWrapper model={savedState} onClose={resetApp} />
      )}
      <Snackbar
        open={errorMessage !== ""}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
      <Footer />
    </ActiveClassIdContext.Provider>
  );
};

export default App;
