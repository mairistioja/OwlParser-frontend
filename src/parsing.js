/**
 * Returns if the class is an anonymous class
 * @param {string} id
 * @return {boolean}
 */
export function owlIdIsBlank(id) {
  return id.startsWith("_:");
}

/**
 * Simplifies an array of triple objects to an array of 3-element arrays of IDs
 * @param {Object[]} triples of object, predicate and subject
 * @returns {Object[]} simplifiedTriples TODO fix
 */
export function simplifyTriples(triples) {
  /**
   * Returns a name for a triple element
   * @param {Object} node
   * @returns {string}
   */
  function nodeName(node) {
    // Data model: http://rdf.js.org/data-model-spec/
    console.assert(typeof node.termType === "string");
    console.assert(typeof node.value === "string");
    if (node.value.startsWith("_:") || node.termType !== "BlankNode") {
      return node.value;
    }
    return "_:" + node.value;
  }
  return triples.map((t) => [t.object, t.predicate, t.subject].map(nodeName));
}

export function extractSrmIdsByType(simplifiedTriples) {
  const classIds = []; // [id]
  const restrictionIds = []; // [id]
  const objectPropertyIds = []; // [id]
  const namedIndividualIds = []; // [id]
  const annotationPropertyIds = []; // [id]
  const ontologyIds = []; // [id]
  const nonSrmTypes = {}; // id -> [id]
  const nonTypeTriples = simplifiedTriples.filter((t) => {
    const [object, predicate, subject] = t;
    if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
      if (object === "http://www.w3.org/2002/07/owl#Class") {
        classIds.push(subject);
      } else if (object === "http://www.w3.org/2002/07/owl#Restriction") {
        restrictionIds.push(subject);
      } else if (object === "http://www.w3.org/2002/07/owl#ObjectProperty") {
        objectPropertyIds.push(subject);
      } else if (object === "http://www.w3.org/2002/07/owl#NamedIndividual") {
        namedIndividualIds.push(subject);
      } else if (
        object === "http://www.w3.org/2002/07/owl#AnnotationProperty"
      ) {
        annotationPropertyIds.push(subject);
      } else if (object === "http://www.w3.org/2002/07/owl#Ontology") {
        ontologyIds.push(subject);
      } else {
        if (subject in nonSrmTypes) {
          nonSrmTypes[subject].push(object);
        } else {
          nonSrmTypes[subject] = [object];
        }
      }
      return false;
    }
    return true;
  });
  for (const id in nonSrmTypes) nonSrmTypes[id].sort();
  return [
    {
      classIds: classIds.sort(),
      restrictionIds: restrictionIds.sort(),
      objectPropertyIds: objectPropertyIds.sort(),
      namedIndividualIds: namedIndividualIds.sort(),
      annotationPropertyIds: annotationPropertyIds.sort(),
      ontologyIds: ontologyIds.sort(),
    },
    nonSrmTypes,
    nonTypeTriples,
  ];
}

/**
 * Parses triples from RdfXMLParser stream
 * @param {Object[]} triples of object, predicate and subject TODO fix
 * @returns {Object} parsedTriples
 * @returns {{id: string, creator: string, title: string,
 *            comment: string, versionIRI: string, versionInfo: string}} parsedTriples.metadata
 * @returns {Object} parsedTriples.srmClassHierarchy, srmClass -> [{ontId, children: [x]} : x]
 * @returns {Object[]} parsedTriples.otherClassHierarchy, [{ontId, children: [x]} : x]
 * @returns {Object} parsedTriples.classRelations, id -> [{propertyId, targetClass}]
 * @returns {Object} parsedTriples.classUsedInRelations, targetClassId -> [{classId, relation}]
 * @returns {Object} parsedTriples.classDerivationChains, class -> [[srmClass, ...ancestorIds]]
 * @returns {Object} parsedTriples.subClasses, id -> [id]
 * @returns {string[]} parsedTriples.blockchainAppIds
 * @returns {string[]} parsedTriples.traditionalAppIds
 */
export function buildModel(srmTypes, nonTypeTriples, srmClassOwlIds) {
  const metadata = {
    id: srmTypes.ontologyIds[srmTypes.ontologyIds.length - 1],
    creator: "",
    title: "",
    comment: "",
    versionIRI: "",
    versionInfo: "",
  };
  const subClassOf = {}; // id -> [id]
  for (const id of srmTypes.classIds) {
    subClassOf[id] = [];
  }
  const subClasses = {}; // id -> [id]
  for (const id of srmTypes.classIds) {
    subClasses[id] = [];
  }
  const restrictionOnPropertyIds = {}; // id -> [id]
  for (const id of srmTypes.restrictionIds) {
    restrictionOnPropertyIds[id] = [];
  }
  const restrictionSomeValuesFromIds = {}; // id -> [id]
  for (const id of srmTypes.restrictionIds) {
    restrictionSomeValuesFromIds[id] = [];
  }
  const unionOfList = {}; // id -> id
  const intersectionOfList = {}; // id -> id
  const listFirstIds = {}; // id -> id
  const listRestIds = {}; // id -> id?
  const traditionalAppIds = []; // [id]
  const blockchainAppIds = []; // [id]
  const unhandledTriples = {}; // subjectId -> [{predicateId, objectId}]
  for (const [object, predicate, subject] of nonTypeTriples) {
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#subClassOf") {
      console.assert(
        srmTypes.classIds.includes(object) ||
          srmTypes.restrictionIds.includes(object)
      );
      console.assert(
        srmTypes.classIds.includes(subject) ||
          srmTypes.restrictionIds.includes(subject)
      );
      if (subject in subClassOf) {
        subClassOf[subject].push(object);
      } else {
        subClassOf[subject] = [object];
      }
      if (object in subClasses) {
        subClasses[object].push(subject);
      } else {
        subClasses[object] = [subject];
      }
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#onProperty") {
      console.assert(srmTypes.objectPropertyIds.includes(object));
      console.assert(
        srmTypes.classIds.includes(subject) ||
          srmTypes.restrictionIds.includes(subject)
      );
      if (subject in restrictionOnPropertyIds) {
        restrictionOnPropertyIds[subject].push(object);
      } else {
        restrictionOnPropertyIds[subject] = [object];
      }
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#someValuesFrom") {
      console.assert(
        srmTypes.classIds.includes(subject) ||
          srmTypes.restrictionIds.includes(subject)
      );
      console.assert(
        srmTypes.classIds.includes(object) ||
          srmTypes.restrictionIds.includes(object)
      );
      if (subject in restrictionSomeValuesFromIds) {
        restrictionSomeValuesFromIds[subject].push(object);
      } else {
        restrictionSomeValuesFromIds[subject] = [object];
      }
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#unionOf") {
      console.assert(!(subject in unionOfList));
      unionOfList[subject] = object;
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#intersectionOf") {
      console.assert(!(subject in intersectionOfList));
      intersectionOfList[subject] = object;
      continue;
    }
    if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#first") {
      listFirstIds[subject] = object;
      continue;
    }
    if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest") {
      if (object !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil")
        listRestIds[subject] = object;
      continue;
    }
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#range") {
      continue; /// TODO ignore?
    }
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#domain") {
      continue; /// TODO ignore?
    }
    if (predicate === "http://www.w3.org/2002/07/owl#inverseOf") {
      continue; /// TODO ignore?
    }
    if (predicate === "http://www.w3.org/2002/07/owl#disjointWith") {
      continue; /// TODO ignore?
    }
    if (predicate === "http://purl.org/dc/elements/1.1/creator") {
      if (subject === metadata.id) {
        metadata.creator = object;
        continue;
      }
    }
    if (predicate === "http://purl.org/dc/elements/1.1/title") {
      if (subject === metadata.id) {
        metadata.title = object;
        continue;
      }
    }
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#comment") {
      if (subject === metadata.id) {
        metadata.comment = object;
        continue;
      }
    }
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#label") {
      if (subject === metadata.id) {
        metadata.label = object;
        continue;
      }
    }
    if (predicate === "http://www.w3.org/2002/07/owl#versionIRI") {
      if (subject === metadata.id) {
        metadata.versionIRI = object;
        continue;
      }
    }
    if (predicate === "http://www.w3.org/2002/07/owl#versionInfo") {
      if (subject === metadata.id) {
        metadata.versionInfo = object;
        continue;
      }
    }
    if (predicate === "http://purl.org/dc/elements/1.1/domain" || predicate === "http://purl.org/dc/terms/isPartOf") {
      if (object === "BlockchainApplication") {
        blockchainAppIds.push(subject);
        continue;
      }
      if (object === "TraditionalApplication") {
        traditionalAppIds.push(subject);
        continue;
      }
    }
    console.debug("unhandled triple", object, predicate, subject);
    const pred = { predicateId: predicate, objectId: object };
    if (subject in unhandledTriples) {
      unhandledTriples[subject].push(pred);
    } else {
      unhandledTriples[subject] = [pred];
    }
  }

  // Reconstruct lists:
  const lists = {}; // id -> [id]
  function getList(id) {
    if (id in listRestIds)
      return [listFirstIds[id], ...getList(listRestIds[id])];
    return [listFirstIds[id]];
  }
  for (const id in listFirstIds) {
    lists[id] = getList(id);
  }

  const unionOf = {}; // id -> [id]
  for (const id of srmTypes.classIds) {
    unionOf[id] = [];
  }
  for (const id in unionOfList) {
    unionOf[id] = lists[unionOfList[id]];
  }
  const intersectionOf = {}; // id -> [id]
  for (const id of srmTypes.classIds) {
    intersectionOf[id] = [];
  }
  for (const id in intersectionOfList) {
    intersectionOf[id] = lists[intersectionOfList[id]];
  }

  const srmClassIds = []; // [id]
  let srmClassHierarchy = {}; // srmClass -> [{ontId, children: [x]} : x]
  let classDerivationChains = {}; // class -> [[srmClass, ...ancestorIds]]
  for (const classId of srmTypes.classIds) {
    classDerivationChains[classId] = [];
  }
  for (const srmClass in srmClassOwlIds) {
    const ontClass = srmClassOwlIds[srmClass];
    if (ontClass.length <= 0) continue; // Ignore unsupported

    srmClassIds.push(ontClass);
    srmClassHierarchy[srmClass] = [];
    let parentArray = srmClassHierarchy[srmClass];
    if (ontClass in subClasses) {
      // Only if present
      let toExamine = []; // [{parentArray, id, derivationChain: [srmClass, ...ancestorIds]}]
      for (const subClassId of subClasses[ontClass]) {
        srmClassIds.push(subClassId);
        toExamine.push({
          parentArray: parentArray,
          id: subClassId,
          derivationChain: [srmClass],
        });
      }
      while (toExamine.length > 0) {
        const { parentArray, id, derivationChain } = toExamine.shift();
        const elem = { id, children: [] };
        for (const subClassId of subClasses[id]) {
          srmClassIds.push(subClassId);
          toExamine.push({
            parentArray: elem.children,
            id: subClassId,
            derivationChain: [...derivationChain, id],
          });
        }
        parentArray.push(elem);
        classDerivationChains[id].push(derivationChain);
      }
    }
  }

  const topLevelNonSrmClassIds = []; // [id]
  for (const classId of srmTypes.classIds) {
    // Ignore anonymous classes:
    if (owlIdIsBlank(classId)) continue;

    // Ignore if SRM class:
    if (srmClassIds.includes(classId)) continue;

    // Ignore if not top-level:
    let isSubclass = false;
    for (const superClassId of subClassOf[classId]) {
      // TODO: Buggy check to ignore restrictions and such:
      if (!owlIdIsBlank(superClassId)) {
        isSubclass = true;
        break;
      }
    }
    if (isSubclass) continue;

    // Hack to ignore, if it looks like "asset":
    if (/^[^#]*#asset$/i.test(classId)) {
      let stillLooksLikeAsset = true;
      for (const subClassId of subClasses[classId]) {
        if (
          subClassId != srmClassOwlIds["informationSystemAsset"] &&
          subClassId != srmClassOwlIds["businessAsset"]
        ) {
          stillLooksLikeAsset = false;
        }
      }
      if (stillLooksLikeAsset) continue;
    }

    topLevelNonSrmClassIds.push(classId);
  }
  const otherClassHierarchy = []; // [{ontId, children: [x]} : x]
  for (const classId of topLevelNonSrmClassIds) {
    const toExamine = [
      {
        parentArray: otherClassHierarchy,
        id: classId,
        derivationChain: [],
      },
    ];
    while (toExamine.length > 0) {
      const { parentArray, id, derivationChain } = toExamine.shift();
      const elem = { id, children: [] };
      for (const subClassId of subClasses[id]) {
        toExamine.push({
          parentArray: elem.children,
          id: subClassId,
          derivationChain: [...derivationChain, id],
        });
      }
      parentArray.push(elem);
      classDerivationChains[id].push(derivationChain);
    }
  }

  // recursively constructs an object representing a target of a property
  function propertyClass(classId) {
    let r = { classId };
    const u = unionOf[classId];
    const i = intersectionOf[classId];
    if (u.length > 0) r.unionOf = u.map(propertyClass);
    if (i.length > 0) r.intersectionOf = i.map(propertyClass);
    return r;
  }

  let classRelations = {}; // id -> [{propertyId, targetClass}]
  for (const classId of srmTypes.classIds) {
    if (owlIdIsBlank(classId)) continue;
    classRelations[classId] = [];
    let allSuperClasses = [...subClassOf[classId]];
    for (let i = 0; i < allSuperClasses.length; ++i) {
      if (srmTypes.restrictionIds.includes(allSuperClasses[i])) {
        console.assert(
          restrictionOnPropertyIds[allSuperClasses[i]].length === 1
        );
        console.assert(
          restrictionSomeValuesFromIds[allSuperClasses[i]].length === 1
        );
        const propertyId = restrictionOnPropertyIds[allSuperClasses[i]][0];
        const targetClassId =
          restrictionSomeValuesFromIds[allSuperClasses[i]][0];

        classRelations[classId].push({
          propertyId,
          targetClass: propertyClass(targetClassId),
        });
      }
      // "recurse" only for classes, not on restrictions:
      if (allSuperClasses[i] in subClassOf) {
        for (const superClassId of subClassOf[allSuperClasses[i]]) {
          if (!allSuperClasses.includes(superClassId)) {
            allSuperClasses.push(superClassId);
          }
        }
      }
    }
  }

  // Construct inverse of classRelations
  let classUsedInRelations = {}; // targetClassId -> [{classId, relation}]
  for (const targetClassId of srmTypes.classIds) {
    classUsedInRelations[targetClassId] = [];
    for (const classId in classRelations) {
      for (const relation of classRelations[classId]) {
        let classesToExamine = [relation.targetClass];
        do {
          const first = classesToExamine.shift();
          if (first.classId === targetClassId) {
            classUsedInRelations[targetClassId].push({
              classId,
              relation,
            });
            break;
          }
          if ("unionOf" in first) classesToExamine.push(...first.unionOf);
          if ("intersectionOf" in first)
            classesToExamine.push(...first.intersectionOf);
          if ("complementOf" in first)
            classesToExamine.push(...first.complementOf);
        } while (classesToExamine.length > 0);
      }
    }
  }

  // TODO equivalentClass https://www.w3.org/TR/owl-ref/#equivalentClass-def
  // TODO disjointWith https://www.w3.org/TR/owl-ref/#disjointWith-def
  // TODO individuals

  return {
    metadata,
    srmClassHierarchy,
    otherClassHierarchy,
    classRelations,
    classUsedInRelations,
    classDerivationChains,
    subClasses,
    blockchainAppIds,
    traditionalAppIds,
    unhandledTriples,
  };
}
