import { RdfXmlParser } from "rdfxml-streaming-parser";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import { insertToSortedArray, insertToSortedUniqueArray } from "./misc";
import { srmClasses, srmRelations } from "./srm";

export function parseStream(readableWebStream, onSuccess, onFailure) {
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
      onSuccess(triples);
    });
}

/**
 * Returns if the class is an anonymous class
 * @param {string} id
 * @return {boolean}
 */
export function owlIdIsBlank(id) {
  return id.startsWith("_:");
}

export const owlIdIsRegular = (id) => !owlIdIsBlank(id);

export const hasRegularOwlId = (o) => owlIdIsRegular(o.id);

/**
 * Simplifies an array of triple objects to an array of 3-element arrays of IDs
 * @param {Object[]} triples of object, predicate and subject
 * @returns {Object[]} simplifiedTriples TODO fix
 */
function simplifyTriples(triples) {
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
  return triples.reduce((result, t) => {
    const t2 = [t.object, t.predicate, t.subject].map(nodeName);
    // Don't allow duplicates:
    if (result.every((tr) => (tr[0] !== t2[0]) || (tr[1] !== t2[1]) || (tr[2] !== t2[2])))
      result.push(t2);
    return result;
  }, []);
}

function extractIdsByType(simplifiedTriples) {
  const classIds = []; // [id]
  const restrictionIds = []; // [id]
  const objectPropertyIds = []; // [id]
  const namedIndividualIds = []; // [id]
  const annotationPropertyIds = []; // [id]
  const ontologyIds = []; // [id]
  //const unknownTypes = {}; // id -> [id]
  const nonTypeTriples = simplifiedTriples.filter((t) => {
    const [object, predicate, subject] = t;
    if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
      if (object === "http://www.w3.org/2002/07/owl#Class") {
        insertToSortedUniqueArray(classIds, subject);
      } else if (object === "http://www.w3.org/2002/07/owl#Restriction") {
        insertToSortedUniqueArray(restrictionIds, subject);
      } else if (object === "http://www.w3.org/2002/07/owl#ObjectProperty") {
        insertToSortedUniqueArray(objectPropertyIds, subject);
      } else if (object === "http://www.w3.org/2002/07/owl#NamedIndividual") {
        insertToSortedUniqueArray(namedIndividualIds, subject);
      } else if (
        object === "http://www.w3.org/2002/07/owl#AnnotationProperty"
      ) {
        insertToSortedUniqueArray(annotationPropertyIds, subject);
      } else if (object === "http://www.w3.org/2002/07/owl#Ontology") {
        insertToSortedUniqueArray(ontologyIds, subject);
      } /*else {
        if (subject in unknownTypes) {
          insertToSortedUniqueArray(unknownTypes[subject], object);
        } else {
          unknownTypes[subject] = [object];
        }
      }*/
      return false;
    }
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#subClassOf") {
      insertToSortedUniqueArray(classIds, subject);
      insertToSortedUniqueArray(classIds, object);
    }
    return true;
  });
  return [
    {
      classIds,
      restrictionIds,
      objectPropertyIds,
      namedIndividualIds,
      annotationPropertyIds,
      ontologyIds,
    },
    //unknownTypes,
    nonTypeTriples,
  ];
}

function guessSrmClassOwlIds(knownTypes) {
  return Object.entries(srmClasses).reduce(
    (ids, [srmId, srmClass]) => {
      if (!srmClass.needMapping) return ids;
      for (const classId of knownTypes.classIds) {
        if (
          !Object.values(ids).includes(classId) &&
          srmClass.guessRegex.test(classId)
        )
          return { ...ids, [srmId]: classId };
      }
      return { ...ids, [srmId]: "" };
    },
    {}
  );
}

function guessSrmRelationOwlIds(knownTypes) {
  return Object.entries(srmRelations).reduce(
   (ids, [srmId, srmRelation]) => {
     if (srmRelation.guessRegex !== null) {
       for (const propertyId of knownTypes.objectPropertyIds) {
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
}

/**
 * Parses triples from RdfXMLParser stream
 * @param {Object[]} triples of object, predicate and subject TODO fix
 * @returns {Object} parsedTriples
 * @returns {{id: string, creator: string, title: string,
 *            comment: string, versionIRI: string, versionInfo: string}} parsedTriples.metadata
 * @returns {Object} parsedTriples.srmClassHierarchy, srmClass -> [{ontId, children: [x]} : x]
 * @returns {Object} parsedTriples.classRelations, id -> [{propertyId, targetClass}]
 * @returns {Object} parsedTriples.classUsedInRelations, targetClassId -> [{classId, relation}]
 * @returns {Object} parsedTriples.classDerivationChains, class -> [[srmClass, ...ancestorIds]]
 * @returns {Object} parsedTriples.subClasses, id -> [id]
 * @returns {string[]} parsedTriples.blockchainAppIds
 * @returns {string[]} parsedTriples.traditionalAppIds
 */
export function buildModel(triples) {
  const [knownTypes, nonTypeTriples] = extractIdsByType(simplifyTriples(triples));

  const metadata = {
    id: knownTypes.ontologyIds[knownTypes.ontologyIds.length - 1],
    creator: "",
    title: "",
    comment: "",
    versionIRI: "",
    versionInfo: "",
  };
  const comments = {}; // id -> [str]
  //const seeAlso = {}; // id -> [id]
  const subClassOf = {}; // id -> [id]
  for (const id of knownTypes.classIds) {
    subClassOf[id] = [];
  }
  const subClasses = {}; // id -> [id]
  for (const id of knownTypes.classIds) {
    subClasses[id] = [];
  }
  const restrictionOnPropertyIds = {}; // id -> [id]
  for (const id of knownTypes.restrictionIds) {
    restrictionOnPropertyIds[id] = [];
  }
  const restrictionSomeValuesFromIds = {}; // id -> [id]
  for (const id of knownTypes.restrictionIds) {
    restrictionSomeValuesFromIds[id] = [];
  }
  const disjointsWith = {}; // id -> [id]
  for (const id of knownTypes.classIds) {
    disjointsWith[id] = [];
  }
  const complementsOf = {}; // id -> [id]
  for (const id of knownTypes.classIds) {
    complementsOf[id] = [];
  }
  for (const id of knownTypes.restrictionIds) {
    complementsOf[id] = [];
  }
  const unionOfList = {}; // id -> id
  const intersectionOfList = {}; // id -> id
  const listFirstIds = {}; // id -> id
  const listRestIds = {}; // id -> id?
  const traditionalAppIds = []; // [id]
  const blockchainAppIds = []; // [id]
  const unhandledTriples = {}; // id -> [{objectId, predicateId, subjectId}]
  for (const nonTypeTriple of nonTypeTriples) {
    const [object, predicate, subject] = nonTypeTriple;
    if (predicate === "http://www.w3.org/2000/01/rdf-schema#subClassOf") {
      console.assert(
        knownTypes.classIds.includes(object)
        || knownTypes.restrictionIds.includes(object),
        nonTypeTriple);
      console.assert(
        knownTypes.classIds.includes(subject)
        || knownTypes.restrictionIds.includes(subject),
        nonTypeTriple);
      if (subject in subClassOf) {
        insertToSortedUniqueArray(subClassOf[subject], object);
      } else {
        subClassOf[subject] = [object];
      }
      if (object in subClasses) {
        insertToSortedUniqueArray(subClasses[object], subject);
      } else {
        subClasses[object] = [subject];
      }
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#onProperty") {
      console.assert(knownTypes.objectPropertyIds.includes(object), nonTypeTriple);
      console.assert(
        knownTypes.classIds.includes(subject)
        || knownTypes.restrictionIds.includes(subject),
        nonTypeTriple);
      if (subject in restrictionOnPropertyIds) {
        insertToSortedUniqueArray(restrictionOnPropertyIds[subject], object);
      } else {
        restrictionOnPropertyIds[subject] = [object];
      }
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#someValuesFrom") {
      console.assert(
        knownTypes.classIds.includes(subject)
        || knownTypes.restrictionIds.includes(subject),
        nonTypeTriple);
      console.assert(
        knownTypes.classIds.includes(object)
        || knownTypes.restrictionIds.includes(object),
        nonTypeTriple);
      if (subject in restrictionSomeValuesFromIds) {
        insertToSortedUniqueArray(restrictionSomeValuesFromIds[subject], object);
      } else {
        restrictionSomeValuesFromIds[subject] = [object];
      }
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#unionOf") {
      console.assert(!(subject in unionOfList), nonTypeTriple);
      unionOfList[subject] = object;
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#intersectionOf") {
      console.assert(!(subject in intersectionOfList), nonTypeTriple);
      intersectionOfList[subject] = object;
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#inverseOf") {
      // TODO?
    }
    if (predicate === "http://www.w3.org/2002/07/owl#complementOf") {
      insertToSortedUniqueArray(complementsOf[subject], object);
      continue;
    }
    if (predicate === "http://www.w3.org/2002/07/owl#disjointWith") {
      insertToSortedUniqueArray(disjointsWith[subject], object);
      insertToSortedUniqueArray(disjointsWith[object], subject);
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
    /* if (predicate === "http://www.w3.org/2000/01/rdf-schema#seeAlso") {
      if (subject in seeAlso) {
        insertToSortedUniqueArray(seeAlso[subject], object);
      } else {
        seeAlso[subject] = [object];
      }
      continue;
    } */
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
      } else {
        if (subject in comments) {
          comments[subject].push(object);
        } else {
          comments[subject] = [object];
        }
      }
      continue;
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
        insertToSortedUniqueArray(blockchainAppIds, subject);
        //continue;
      }
      else if (object === "TraditionalApplication") {
        insertToSortedUniqueArray(traditionalAppIds, subject);
        //continue;
      }
    }
    console.debug("unhandled triple", object, predicate, subject);
    const pred = { objectId: object, predicateId: predicate, subjectId: subject };
    if (subject in unhandledTriples) {
      unhandledTriples[subject].push(pred);
    } else {
      unhandledTriples[subject] = [pred];
    }
    if (object in unhandledTriples) {
      unhandledTriples[object].push(pred);
    } else {
      unhandledTriples[object] = [pred];
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
  const intersectionOf = {}; // id -> [id]
  for (const id of knownTypes.classIds) {
    unionOf[id] = [];
    intersectionOf[id] = [];
  }
  for (const id of knownTypes.restrictionIds) {
    unionOf[id] = [];
    intersectionOf[id] = [];
  }
  for (const id in unionOfList) {
    unionOf[id] = lists[unionOfList[id]].reduce((r, v) => insertToSortedUniqueArray(r, v), []);
  }
  for (const id in intersectionOfList) {
    intersectionOf[id] = lists[intersectionOfList[id]].reduce((r, v) => insertToSortedUniqueArray(r, v), []);
  }

  const classHierarchies = {}; // id -> ({id, children: [x], parents: [x]} : x)
  for (const classId of knownTypes.classIds) {
    classHierarchies[classId] = {id: classId};
  }
  for (const classId of knownTypes.classIds) {
    const hierarchy = classHierarchies[classId];
    hierarchy.children = subClasses[classId].map(id => classHierarchies[id]);
    hierarchy.parents = subClassOf[classId].map(id => classHierarchies[id]);
    hierarchy.regularChildren = hierarchy.children.filter(hasRegularOwlId);
    hierarchy.regularParents = hierarchy.parents.filter(hasRegularOwlId);
  }
  const classDerivationChains = {}; // id -> [[...ancestors : x]]
  for (const classId of knownTypes.classIds) {
    classDerivationChains[classId] = [];
    const toExamine = classHierarchies[classId].regularParents.map(parent => [parent]);
    while (toExamine.length > 0) {
      const chain = toExamine.shift();
      const regularParents = chain[0].regularParents;
      if (regularParents.length <= 0) {
        classDerivationChains[classId].push(chain);
      } else {
        toExamine.push(...regularParents.map(parent => [parent, ...chain]));
      }
    }
  }

  // recursively constructs an object representing a target of a property
  function propertyClass(classId) {
    let r = { classId };
    const u = unionOf[classId];
    const i = intersectionOf[classId];
    const c = complementsOf[classId];
    if (u.length > 0) r.unionOf = u.map(propertyClass);
    if (i.length > 0) r.intersectionOf = i.map(propertyClass);
    if (c.length > 0) r.complementOf = i.map(propertyClass);
    return r;
  }

  let classRelations = {}; // id -> [{propertyId, targetClass}]
  for (const classId of knownTypes.classIds) {
    if (owlIdIsBlank(classId)) continue;
    classRelations[classId] = [];
    let allSuperClasses = [...subClassOf[classId]];
    for (let i = 0; i < allSuperClasses.length; ++i) {
      if (knownTypes.restrictionIds.includes(allSuperClasses[i])) {
        console.assert(
          restrictionOnPropertyIds[allSuperClasses[i]].length === 1
        );
        console.assert(
          restrictionSomeValuesFromIds[allSuperClasses[i]].length === 1
        );
        const propertyId = restrictionOnPropertyIds[allSuperClasses[i]][0];
        const targetClassId =
          restrictionSomeValuesFromIds[allSuperClasses[i]][0];

        insertToSortedArray(classRelations[classId], {
          propertyId,
          targetClass: propertyClass(targetClassId),
        }, (a, b) => [a.propertyId, a.targetClass.classId] < [b.propertyId, b.targetClass.classId]);
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
  for (const targetClassId of knownTypes.classIds) {
    classUsedInRelations[targetClassId] = [];
    for (const classId in classRelations) {
      for (const relation of classRelations[classId]) {
        let classesToExamine = [relation.targetClass];
        do {
          const first = classesToExamine.shift();
          if (first.classId === targetClassId) {
            insertToSortedArray(classUsedInRelations[targetClassId], {
              classId,
              relation,
            }, (a, b) => [a.classId, a.relation.propertyId, a.relation.targetClass.classId]
                       < [b.classId, b.relation.propertyId, b.relation.targetClass.classId]);
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
  // TODO individuals

  const model = {
    knownTypes,
    metadata,
    comments,
    //seeAlso,
    disjointsWith,
    classHierarchies,
    classDerivationChains,
    classRelations,
    classUsedInRelations,
    blockchainAppIds,
    traditionalAppIds,
    unhandledTriples,
    srmClassOwlIds: guessSrmClassOwlIds(knownTypes),
    srmRelationOwlIds: guessSrmRelationOwlIds(knownTypes),
  };
  console.debug(model);
  return model;
}
