import "./App.css";

import React, { useState } from "react";
import BrowsingPage from "./components/BrowsingPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { parseStream, buildModel, owlIdIsRegular } from "./parsing";
import SrmMappingPage from "./components/SrmMappingPage";
import LoadingContainer from "./components/LoadingContainer";
import { Snackbar } from "@mui/material";
import { ActiveClassIdContext } from "./ActiveClassIdContext";
import { useLocalStorage } from "./LocalStorage";

const App = () => {
  const [savedState, setSavedState] = useLocalStorage("savedState", {
    currentActivity: "loadFile",
  });
  const activeClassIdState = useState("");
  const [activeClassId, setActiveClassId] = activeClassIdState;
  const [errorMessage, setErrorMessage] = useState("");

  function handleUpload(fileList, onSuccess, onFailure) {
    if (fileList.length <= 0) return;
    console.assert(fileList.length === 1, fileList);
    const file = fileList[0];
    const maxSize = 1024 * 1024 * 20;
    if (file.size > maxSize) {
      setErrorMessage(`File "${file.name}" is larger than ${maxSize} bytes!`);
      onFailure();
      return;
    }

    parseStream(file.stream(),
                (triples) => {
                  onSuccess();
                  setTriples(triples, false);
                },
                onFailure);
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
      .then((bodyStream) => parseStream(
        bodyStream,
        (triples) => {
          onSuccess();
          setTriples(triples, autoMap);
        },
        onFailure))
      .catch((error) => {
        setErrorMessage(
          `Fetching ontology from given IRI failed: ${error.message}`
        );
        onFailure();
      });
  }

  const setTriples = (triples, autoMap) => {
    let newState = { currentActivity: "mapSrmClasses", ...buildModel(triples) };
    if (autoMap) {
      setActiveClassId("");
      newState.currentActivity = "browse";
    }
    setSavedState(newState);
  };

  const completeSrmClassOwlIds = (srmClassOwlIds) => {
    console.assert(savedState.currentActivity === "mapSrmClasses", savedState);
    console.debug("SRM class mapping done!", srmClassOwlIds);
    setSavedState({
      ...savedState,
      currentActivity: "mapSrmRelations",
      srmClassOwlIds,
    });
  };

  const completeSrmRelationOwlIds = (srmRelationOwlIds) => {
    console.assert(savedState.currentActivity === "mapSrmRelations", savedState);
    console.debug("SRM relation mapping done!", srmRelationOwlIds);
    setActiveClassId("");
    setSavedState({
      ...savedState,
      currentActivity: "browse",
      srmRelationOwlIds,
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
          ids={savedState.knownTypes.classIds.filter(owlIdIsRegular)}
          initialMapping={savedState.srmClassOwlIds}
          onNext={completeSrmClassOwlIds}
          onCancel={resetApp}
          nextButtonLabel="Next"
        />
      ) : savedState.currentActivity === "mapSrmRelations" ? (
        <SrmMappingPage
          heading="Map SRM relations"
          ids={savedState.knownTypes.objectPropertyIds.filter(owlIdIsRegular)}
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
        <BrowsingPage model={savedState} onClose={resetApp} />
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
