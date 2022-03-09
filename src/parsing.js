import { srmClassOwlIds } from "./srm.js";

export function owlIdIsBlank(id) {
  return id.startsWith("_:");
}

function owlArrayOfIdObjectsToArrayOfIds(smth) {
  let ids = [];
  for (let i of smth) ids.push(i["@id"]);
  return ids;
}

function owlAttrArrayOfIdObjectsToArrayOfIds(smth, attr) {
  if (attr in smth) return owlArrayOfIdObjectsToArrayOfIds(smth[attr]);
  return [];
}

function owlSuperClassIds(smth) {
  return owlAttrArrayOfIdObjectsToArrayOfIds(
    smth,
    "http://www.w3.org/2000/01/rdf-schema#subClassOf"
  );
}

function owlDomainIds(smth) {
  return owlAttrArrayOfIdObjectsToArrayOfIds(
    smth,
    "http://www.w3.org/2000/01/rdf-schema#domain"
  );
}

function owlRangeIds(smth) {
  return owlAttrArrayOfIdObjectsToArrayOfIds(
    smth,
    "http://www.w3.org/2000/01/rdf-schema#range"
  );
}

function owlOnPropertyIds(smth) {
  return owlAttrArrayOfIdObjectsToArrayOfIds(
    smth,
    "http://www.w3.org/2002/07/owl#onProperty"
  );
}

function owlSomeValuesOfIds(smth) {
  return owlAttrArrayOfIdObjectsToArrayOfIds(
    smth,
    "http://www.w3.org/2002/07/owl#someValuesFrom"
  );
}

function owlUnionOfIds(smth) {
  const attr = "http://www.w3.org/2002/07/owl#unionOf";
  if (attr in smth) {
    /// TODO: type checks?
    return owlArrayOfIdObjectsToArrayOfIds(smth[attr][0]["@list"]);
  }
  return [];
}

function owlIntersectionOfIds(smth) {
  const attr = "http://www.w3.org/2002/07/owl#intersectionOf";
  if (attr in smth) {
    /// TODO: type checks?
    return owlArrayOfIdObjectsToArrayOfIds(smth[attr][0]["@list"]);
  }
  return [];
}

function owlTypeIds(smth) {
  return owlAttrArrayOfIdObjectsToArrayOfIds(
    smth,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );
}
export function parseOwlJsonLd(inputJsonLd) {
  let metadata = {
    id: "",
    creator: "",
    title: "",
    comment: "",
    version: "",
  };
  let classes = {}; // id -> class
  let subClassOf = {}; // id -> [id]
  let unionOf = {}; // id -> [id]
  let intersectionOf = {}; // id -> [id]
  let properties = {}; // id -> property
  let propertyDomains = {}; // id -> [id]
  let propertyRanges = {}; // id -> [id]
  let inverseOf = {}; // id -> [id]
  let restrictions = {}; // id -> restriction
  let restrictionOnPropertyIds = {}; // id -> [id]
  let restrictionSomeValuesFromIds = {}; // id -> [id]
  let namedIndividuals = {}; // id -> individual
  let namedIndividualTypes = {}; // id -> id
  for (const i of inputJsonLd) {
    const id = i["@id"];
    const type = i["@type"];

    if (type.includes("http://www.w3.org/2002/07/owl#Ontology")) {
      metadata.id = id;
      const creatorKey = "http://purl.org/dc/elements/1.1/creator";
      if (creatorKey in i) {
        metadata.creator = i[creatorKey][0]["@value"];
      }
      const titleKey = "http://purl.org/dc/elements/1.1/title";
      if (titleKey in i) {
        metadata.title = i[titleKey][0]["@value"];
      }
      const commentKey = "http://www.w3.org/2000/01/rdf-schema#comment";
      if (commentKey in i) {
        metadata.comment = i[commentKey][0]["@value"];
      }
      const versionKey = "http://www.w3.org/2002/07/owl#versionInfo";
      if (versionKey in i) {
        metadata.version = i[versionKey][0]["@value"];
      }
    }

    if (type.includes("http://www.w3.org/2002/07/owl#Class")) {
      classes[id] = i;
      subClassOf[id] = owlSuperClassIds(i);
      unionOf[id] = owlUnionOfIds(i);
      intersectionOf[id] = owlIntersectionOfIds(i);
      // TODO complementOf https://www.w3.org/TR/owl-ref/#complementOf-def
    }
    if (type.includes("http://www.w3.org/2002/07/owl#Restriction")) {
      restrictions[id] = i;
      restrictionOnPropertyIds[id] = owlOnPropertyIds(i);
      restrictionSomeValuesFromIds[id] = owlSomeValuesOfIds(i);
      // TODO allvaluesfrom
      // TODO subproperties https://www.w3.org/TR/owl-ref/#subPropertyOf-def
    }
    if (type.includes("http://www.w3.org/2002/07/owl#ObjectProperty")) {
      properties[id] = i;
      propertyDomains[id] = owlDomainIds(i);
      propertyRanges[id] = owlRangeIds(i);
      const inverseOfAttr = "http://www.w3.org/2002/07/owl#inverseOf";
      if (inverseOfAttr in i) {
        const inverseId = i[inverseOfAttr][0]["@id"];
        if (!(id in inverseOf)) inverseOf[id] = [];
        inverseOf[id].push(inverseId);
        if (!(inverseId in inverseOf)) inverseOf[inverseId] = [];
        inverseOf[inverseId].push(id);
        // TODO: transitive?
      }
    }
    if (type.includes("http://www.w3.org/2002/07/owl#NamedIndividual")) {
      namedIndividuals[id] = i;
      namedIndividualTypes[id] = owlTypeIds(i);
    }

    const knownTypes = [
      "http://www.w3.org/2002/07/owl#Ontology",
      "http://www.w3.org/2002/07/owl#Class",
      "http://www.w3.org/2002/07/owl#ObjectProperty",
      "http://www.w3.org/2002/07/owl#Restriction",
      "http://www.w3.org/2002/07/owl#NamedIndividual",
      "http://www.w3.org/2002/07/owl#AnnotationProperty", // Ignore
    ];
    for (const t of type) {
      if (!knownTypes.includes(t)) {
        console.log("Item with unknown type:", i);
        break;
      }
    }
  }

  // Construct inverse of subClassOf
  let subClasses = {}; // classId -> [classId]
  for (const id in classes) subClasses[id] = [];
  for (const id in restrictions) subClasses[id] = [];
  for (const id in classes)
    for (const superClassId of subClassOf[id])
      subClasses[superClassId].push(id);

  const srmClassIds = []; // [id]
  let srmClassHierarchy = {}; // srmClass -> [{ontId, children: [x]} : x]
  let classDerivationChains = {}; // class -> [[srmClass, ...ancestorIds]]
  for (const classId in classes) {
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
  for (const classId in classes) {
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

    // Ignore if contains SRM class as subclass:
    /*
    let hasSrmSubclass = false;
    let subClassIdsToExamine = subClasses[classId];
    while (subClassIdsToExamine.length > 0) {
      const subClassId = subClassIdsToExamine.shift();
      if (srmClassIds.includes(subClassId)) {
        hasSrmSubclass = true;
        break;
      }
    }
    if (hasSrmSubclass) continue;*/

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
  for (const classId in classes) {
    if (owlIdIsBlank(classId)) continue;
    classRelations[classId] = [];
    let allSuperClasses = [...subClassOf[classId]];
    for (let i = 0; i < allSuperClasses.length; ++i) {
      if (allSuperClasses[i] in restrictions) {
        console.assert(
          restrictionOnPropertyIds[allSuperClasses[i]].length === 1
        );
        console.assert(
          restrictionSomeValuesFromIds[allSuperClasses[i]].length === 1
        );
        const propertyId = restrictionOnPropertyIds[allSuperClasses[i]][0];
        const targetClassId =
          restrictionSomeValuesFromIds[allSuperClasses[i]][0];

        /*
          // Only add known relations:
          for (const srmRelation in srmRelationOwlIds) {
            // TODO: Sanity-check domain and range?
            // TODO: handle inverse relations somehow
            if (srmRelationOwlIds[srmRelation] === propertyId) {
              classRelations[classId].push({
                property: srmRelation,
                targetClass: propertyClass(targetClassId),
              });
            }
          }
        */
        classRelations[classId].push({
          propertyId: propertyId,
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
  for (const targetClassId in classes) {
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
  };
}
