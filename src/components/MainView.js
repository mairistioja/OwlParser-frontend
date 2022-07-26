import React from "react";
import { owlIdIsBlank } from "../parsing";
import { srmClasses, srmRelations } from "../srm.js";
import { minimizeOwlId } from "../misc.js";
import { SrmClassText } from "./SrmClassText";
import { Box, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PropTypes } from "prop-types";
import { ActiveClassIdContext } from "../ActiveClassIdContext";
import { ClassLink } from "./ClassLink";
import { ClassLinkWithSrmTypes } from "./ClassLinkWithSrmTypes";

const classHierachyContains = (classId, model, srmId) => {
  const srmClassOwlId = model.srmClassOwlIds[srmId];
  if (!srmClassOwlId)
    return false;
  return model.classDerivationChains[classId].some(
    (chain) => chain.some(owlClass => owlClass.id == srmClassOwlId));
};

const isThreat = (classId, model) =>
  classHierachyContains(classId, model, "threat");

const isVulnerability = (classId, model) =>
  classHierachyContains(classId, model, "vulnerability");

const vulnerabilityMitigations = (classId, model) => {
  const r = [];
  const mitigatesPropertyId =
    model.srmRelationOwlIds["securityRequirementMitigatesRisk"];
  for (const relation of model.classUsedInRelations[classId])
    if (relation.relation.propertyId === mitigatesPropertyId)
      if (!r.slice(-1).includes(relation.classId)) // r already sorted because relations are
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

function renderDerivationChain_(chain, model) {
  return (
    <ul>
      <li>
        {chain.length > 1
         ? (
          <>
            <ClassLinkWithSrmTypes classId={chain[0].id} model={model} />
            {renderDerivationChain_(chain.slice(1), model)}
          </>)
         : (<ClassLink classId={chain[0].id} model={model} />)}
      </li>
    </ul>
  );
}

function renderDerivationChain(chain, model) {
  const renderedChain = renderDerivationChain_(chain, model);
  // For assets show derivation from asset even if none in model
  for (const subAsset of ["informationSystemAsset", "businessAsset"]) {
    const subAssetOwlId = model.srmClassOwlIds[subAsset];
    if (subAssetOwlId) {
      if (chain[0].id === subAssetOwlId) {
        return (
          <ul>
            <li>
              <strong>{srmClasses["asset"].name}</strong>
              {renderedChain}
            </li>
          </ul>
        );
      }
    }
  }
  return renderedChain;
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
    } else if ("complementOf" in target) {
      return renderList("Complement of:", target.complementOf);
    } else {
      return <span>{"<UNSUPPORTED>"}</span>; // TODO relations
    }
  }
  const classLink = <ClassLinkWithSrmTypes classId={target.classId} model={model} />;
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
                  <ClassLinkWithSrmTypes classId={id} model={model} />
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

const MainView = ({ model, onClose }) => {
  return (
    <ActiveClassIdContext.Consumer>
      {([activeClassId, setActiveClassId]) => (
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
            <Box sx={{ p:2 }}>
              No class selected
            </Box>
          ) : (
            <>
              <div id="content">
                <h3 id="classTitle">{minimizeOwlId(activeClassId, model)}</h3>
                {activeClassId in model.comments && (
                  <>
                    <h3>Comments:</h3>
                    <ul>
                      {model.comments[activeClassId].map((comment, index) => (
                        <li key={index}>{comment}</li>
                      ))}
                    </ul>
                  </>
                )}
                <h3>Derivations:</h3>
                {model.classDerivationChains[activeClassId].length > 0
                 ? model.classDerivationChains[activeClassId].map((chain, index) => (
                    <div key={index}>
                      {renderDerivationChain([...chain, model.classHierarchies[activeClassId]], model)}
                    </div>
                  ))
                 : (
                    <p>
                      <ClassLink classId={activeClassId} model={model} /> is a top-level class.
                    </p>
                  )
                }
                <h3>Subclasses:</h3>
                <ul>
                  {model.classHierarchies[activeClassId].regularChildren.length <= 0
                   ? (<p>No subclasses.</p>)
                   : model.classHierarchies[activeClassId].regularChildren.map((subclass, index) => (
                      <li key={index}>
                        <ClassLink classId={subclass.id} model={model} />
                      </li>
                    ))}
                </ul>
                {model.disjointsWith[activeClassId].length > 0 && (
                  <>
                    <h3>Disjoint with:</h3>
                    <ul>
                      {model.disjointsWith[activeClassId].map((id, index) => (
                        <li key={index}><ClassLink classId={id} model={model} /></li>
                      ))}
                    </ul>
                  </>
                )}
                <h3>Relations:</h3>
                {model.classRelations[activeClassId].length <= 0 ? (
                  <p>No known relations.</p>
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
                  <p>No known relations.</p>
                ) : (
                  <ul>
                    {model.classUsedInRelations[activeClassId].map(
                      ({ classId, relation }, index) => {
                        return (
                          <li key={index}>
                            <ClassLinkWithSrmTypes classId={classId} model={model} />:
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
                {/* {activeClassId in model.seeAlso && (
                  <>
                    <h3>See also:</h3>
                    <ul>
                      {model.seeAlso[activeClassId].map((id, index) => (
                        <li key={index}>
                          {id in model.classHierarchies
                           ? (<ClassLink classId={id} model={model} />)
                           : id}
                        </li>
                      ))}
                    </ul>
                  </>
                )} */}
                <h3>Other</h3>
                {!(activeClassId in model.unhandledTriples) || model.unhandledTriples[activeClassId].length <= 0
                  ? (<p>No other relations.</p>)
                  : model.unhandledTriples[activeClassId].map((elem, index) => (
                      <ul key={index}>
                        <li>
                        {elem.subjectId in model.classHierarchies ? (
                          <ClassLinkWithSrmTypes classId={elem.subjectId} model={model} />
                        ) : (
                          elem.subjectId
                        )}
                          <ul>
                            <li>
                              {elem.predicateId}
                              <ul>
                                <li>
                                  {elem.objectId in model.classHierarchies ? (
                                    <ClassLinkWithSrmTypes classId={elem.objectId} model={model} />
                                  ) : (
                                    elem.objectId
                                  )}
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    ))
                }
              </div>
            </>
          )}
        </div>
      )}
    </ActiveClassIdContext.Consumer>
  );
};

const propertyClassProp = {
  classId: PropTypes.string.isRequired,
};
propertyClassProp.unionOf = PropTypes.arrayOf(propertyClassProp);
propertyClassProp.intersectionOf = PropTypes.arrayOf(propertyClassProp);

MainView.propTypes = {
  model: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MainView;
