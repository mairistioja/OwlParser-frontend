import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { owlIdIsBlank } from "../parsing";
import { srmClassNames, srmRelations, srmRelationOwlIds } from "../srm.js";
import { minimizeOwlId } from "../misc.js";
import ClassLink from "./ClassLink";

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
    srmRelationOwlIds["securityRequirementMitigatesRisk"];
  console.log("classId", classId);
  console.log("mitigatesPropertyId", mitigatesPropertyId);
  console.log(
    "model.classUsedInRelations[classId]",
    model.classUsedInRelations[classId]
  );
  for (const relation of model.classUsedInRelations[classId])
    if (relation.relation.propertyId === mitigatesPropertyId)
      r.push(relation.classId);
  return r;
};

function renderRelationItemHead(propertyId, model) {
  for (const srmRelation in srmRelationOwlIds) {
    if (propertyId === srmRelationOwlIds[srmRelation]) {
      const r = srmRelations[srmRelation];
      return (
        <>
          <strong>{r.name}</strong> ({srmClassNames[r.fromClass]} &#8594;{" "}
          {srmClassNames[r.toClass]}):
        </>
      );
    }
  }
  return <em>{minimizeOwlId(propertyId, model.metadata.id)}</em>;
}

function renderDerivationChain(chain, model) {
  return (
    <ul>
      <li>
        {chain[0] in srmClassNames ? (
          <strong>{srmClassNames[chain[0]]}</strong>
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

const Content = ({ model }) => {
  const { hash } = useLocation();
  const [activeClassId, setActiveClassId] = useState("");

  useEffect(() => {
    if (hash.startsWith("#id:")) {
      setActiveClassId(hash.slice(4));
    } else if (hash.length > 0) {
      console.warn("Unsupported URL fragment!");
    }
  }, [hash]);

  return (
    <div id="content">
      {activeClassId.length === 0 ? (
        "No class selected"
      ) : (
        <>
          <div>
            <h2>Derivations:</h2>
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
                <h3>Direct children:</h3>
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
            <h2>Relations:</h2>
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
            <h2>Also used in:</h2>
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
          </div>
        </>
      )}
    </div>
  );
};

export default Content;
