import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { owlIdIsBlank } from "../parsing";
import { srmClasses, srmRelations } from "../srm.js";
import { minimizeOwlId } from "../misc.js";
import { SrmClassText } from "./SrmClassText";
import ClassLink from "./ClassLink";
import { IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PropTypes } from "prop-types";

const classHierachyContains = (classId, hierarchyArray) => {
  const toExamine = [...hierarchyArray];
  while (toExamine.length > 0) {
    const first = toExamine.shift();
    if (first.id === classId) return true;
    toExamine.push(...first.children);
  }
  return false;
};

const isThreat = (classId, model) =>
  classHierachyContains(classId, model.srmClassHierarchy["threat"]);

const isVulnerability = (classId, model) =>
  classHierachyContains(classId, model.srmClassHierarchy["vulnerability"]);

const vulnerabilityMitigations = (classId, model) => {
  const r = [];
  const mitigatesPropertyId =
    model.srmRelationOwlIds["securityRequirementMitigatesRisk"];
  for (const relation of model.classUsedInRelations[classId])
    if (relation.relation.propertyId === mitigatesPropertyId)
      r.push(relation.classId);
  return r;
};

function renderRelationItemHead(propertyId, model) {
  for (const srmRelation in model.srmRelationOwlIds) {
    if (propertyId === model.srmRelationOwlIds[srmRelation]) {
      const r = srmRelations[srmRelation];
      return (
        <>
          <Tooltip title={propertyId}>
            <strong>{r.name}</strong>
          </Tooltip>{" "}
          <SrmClassText srmClass={r.fromClass} model={model} /> &#8594;{" "}
          <SrmClassText srmClass={r.toClass} model={model} />:
        </>
      );
    }
  }
  return (
    <Tooltip title={propertyId}>
      <em>{minimizeOwlId(propertyId, model)}</em>
    </Tooltip>
  );
}

function renderDerivationChain(chain, model) {
  return (
    <ul>
      <li>
        {chain[0] in srmClasses ? (
          <Tooltip title={model.srmClassOwlIds[chain[0]]}>
            <strong>{srmClasses[chain[0]].name}</strong>
          </Tooltip>
        ) : (
          <ClassLink
            classId={chain[0]}
            model={model}
            renderTypes={chain.length > 1}
          />
        )}
        {chain.length > 1 && renderDerivationChain(chain.slice(1), model)}
      </li>
    </ul>
  );
}

function renderTargetClass(target, model, expandVulnerabilityMitigations) {
  if (owlIdIsBlank(target.classId)) {
    function renderList(name, list) {
      console.assert(list.length > 0);
      return (
        <>
          <em>{name}</em>
          <ul>
            {list.map((sub, index) => (
              <li key={index}>
                {renderTargetClass(sub, model, expandVulnerabilityMitigations)}
              </li>
            ))}
          </ul>
        </>
      );
    }
    if ("unionOf" in target) {
      return renderList("Union of:", target.unionOf);
    } else if ("intersectionOf" in target) {
      return renderList("Intersection of:", target.intersectionOf);
    } else {
      console.assert("complementOf" in target);
      return renderList("Complement of:", target.complementOf);
    }
  }
  const classLink = <ClassLink classId={target.classId} model={model} />;
  if (
    expandVulnerabilityMitigations &&
    isVulnerability(target.classId, model)
  ) {
    return (
      <>
        {classLink}
        <ul>
          <li>Mitigated by:</li>
          <ul>
            {vulnerabilityMitigations(target.classId, model).map(
              (id, index) => (
                <li key={index}>
                  <ClassLink classId={id} model={model} />
                </li>
              )
            )}
          </ul>
        </ul>
      </>
    );
  }
  return classLink;
}

const Content = ({ model, onClose }) => {
  const { hash } = useLocation();
  const [activeClassId, setActiveClassId] = useState("");

  useEffect(() => {
    if (hash.startsWith("#id:")) {
      const classIdCandidate = hash.slice(4);
      setActiveClassId(
        model.srmTypes.classIds.includes(classIdCandidate)
          ? classIdCandidate
          : ""
      );
    } else if (hash.length > 0) {
      console.warn("Unsupported URL fragment!");
    }
  }, [hash, model.srmTypes.classIds]);

  return (
    <div id="contentContainer">
      <div id="ontologyHeader">
        <div id="metadata">
          <h3>{model.metadata.title}</h3>
          <p>by {model.metadata.creator}</p>
        </div>
        <Tooltip title="Close current ontology">
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </div>
      {activeClassId.length === 0 ? (
        "No class selected"
      ) : (
        <>
          <div id="content">
            <h3 id="classTitle">{minimizeOwlId(activeClassId, model)}</h3>
            <h3>Derivations:</h3>
            {model.classDerivationChains[activeClassId].map((chain, index) => (
              <div key={index}>
                {["informationSystemAsset", "businessAsset"].includes(chain[0])
                  ? renderDerivationChain(
                      ["asset", ...chain, activeClassId],
                      model
                    )
                  : renderDerivationChain([...chain, activeClassId], model)}
              </div>
            ))}
            {model.subClasses[activeClassId].length > 0 && (
              <>
                <h3>Subclasses:</h3>
                <ul>
                  {model.subClasses[activeClassId].map((subclass, index) => (
                    <li key={index}>
                      <ClassLink
                        classId={subclass}
                        model={model}
                        renderTypes={false}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h3>Relations:</h3>
            {model.classRelations[activeClassId].length <= 0 ? (
              <p>No known relations</p>
            ) : (
              <ul>
                {model.classRelations[activeClassId].map((relation, index) => {
                  return (
                    <li key={index}>
                      {renderRelationItemHead(relation.propertyId, model)}
                      <ul>
                        <li>
                          {renderTargetClass(
                            relation.targetClass,
                            model,
                            isThreat(activeClassId, model)
                          )}
                        </li>
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
            <h3>Also used in:</h3>
            {model.classUsedInRelations[activeClassId].length <= 0 ? (
              <p>No known relations</p>
            ) : (
              <ul>
                {model.classUsedInRelations[activeClassId].map(
                  ({ classId, relation }, index) => {
                    return (
                      <li key={index}>
                        <ClassLink classId={classId} model={model} />:
                        <ul>
                          <li>
                            {renderRelationItemHead(relation.propertyId, model)}
                            <ul>
                              <li>
                                {renderTargetClass(
                                  relation.targetClass,
                                  model,
                                  isThreat(activeClassId, model)
                                )}
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    );
                  }
                )}
              </ul>
            )}
            <h3>Other</h3>
            {activeClassId in model.unhandledTriples &&
            model.unhandledTriples[activeClassId].length > 0
              ? model.unhandledTriples[activeClassId].map((elem, index) => (
                  <ul key={index}>
                    <li>
                      {elem.predicateId}
                      <ul>
                        <li>
                          {elem.objectId in model.subClasses ? (
                            <ClassLink classId={elem.objectId} model={model} />
                          ) : (
                            elem.objectId
                          )}
                        </li>
                      </ul>
                    </li>
                  </ul>
                ))
              : "Nothing to show here"}
          </div>
        </>
      )}
    </div>
  );
};

const propertyClassProp = {
  classId: PropTypes.string.isRequired,
};
propertyClassProp.unionOf = PropTypes.arrayOf(propertyClassProp);
propertyClassProp.intersectionOf = PropTypes.arrayOf(propertyClassProp);

const relationProp = PropTypes.exact({
  propertyId: PropTypes.string.isRequired,
  targetClass: propertyClassProp,
});

Content.propTypes = {
  model: PropTypes.shape({
    srmTypes: PropTypes.shape({
      classIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    metadata: PropTypes.shape({
      title: PropTypes.string.isRequired,
      creator: PropTypes.string.isRequired,
    }).isRequired,
    classDerivationChains: PropTypes.objectOf(
      PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
    ).isRequired,
    subClasses: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
    classRelations: PropTypes.objectOf(PropTypes.arrayOf(relationProp))
      .isRequired,
    classUsedInRelations: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.exact({
          classId: PropTypes.string.isRequired,
          relation: relationProp,
        })
      )
    ).isRequired,
    unhandledTriples: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.exact({
          predicateId: PropTypes.string.isRequired,
          objectId: PropTypes.string.isRequired,
        })
      )
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Content;
