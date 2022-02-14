import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { owlIdIsBlank } from "../parsing";
import { srmClassNames, srmRelations } from "../srm.js";
import ClassLink from "./ClassLink";

function renderSrmRelationItemHead(srmRelation) {
  const r = srmRelations[srmRelation];
  return (
    <>
      <strong>{r.name}</strong> ({srmClassNames[r.fromClass]} &#8594;{" "}
      {srmClassNames[r.toClass]}):
    </>
  );
}

function renderDerivationChain(chain, info) {
  return (
    <ul>
      <li>
        {chain[0] in srmClassNames ? (
          <strong>{srmClassNames[chain[0]]}</strong>
        ) : (
          <ClassLink
            classId={chain[0]}
            info={info}
            renderTypes={chain.length > 1}
          />
        )}
        {chain.length > 1 && renderDerivationChain(chain.slice(1), info)}
      </li>
    </ul>
  );
}

function renderTargetClass(target, info) {
  if (owlIdIsBlank(target.classId)) {
    function renderList(name, list) {
      console.assert(list.length > 0);
      return (
        <>
          <em>{name}</em>
          <ul>
            {list.map((sub, index) => (
              <li key={index}>{renderTargetClass(sub, info)}</li>
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
  return <ClassLink classId={target.classId} info={info} />;
}

const Content = ({ info }) => {
  const { hash } = useLocation();
  const [activeClassId, setActiveClassId] = useState("");

  useEffect(() => {
    if (hash.startsWith("#id:")) {
      setActiveClassId(hash.slice(4));
    } else {
      console.warn("Unsupported URL fragment!");
    }
  }, [hash]);

  return (
    <div className="content">
      {activeClassId.length === 0 ? (
        "No class selected"
      ) : (
        <>
          <div>
            <h2>Derivations:</h2>
            {info.classDerivationChains[activeClassId].map((chain, index) => (
              <div key={index}>
                {["informationSystemAsset", "businessAsset"].includes(chain[0])
                  ? renderDerivationChain(
                      ["asset", ...chain, activeClassId],
                      info
                    )
                  : renderDerivationChain([...chain, activeClassId], info)}
              </div>
            ))}
            {info.subClasses[activeClassId].length > 0 && (
              <>
                <h3>Direct children:</h3>
                <ul>
                  {info.subClasses[activeClassId].map((subclass, index) => (
                    <li key={index}>
                      <ClassLink
                        classId={subclass}
                        info={info}
                        renderTypes={false}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h2>Relations:</h2>
            {info.classRelations[activeClassId].length <= 0 ? (
              <p>No known relations</p>
            ) : (
              <ul>
                {info.classRelations[activeClassId].map((relation, index) => {
                  return (
                    <li key={index}>
                      {renderSrmRelationItemHead(relation.property)}
                      <ul>
                        <li>{renderTargetClass(relation.targetClass, info)}</li>
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
            <h2>Also used in:</h2>
            {info.classUsedInRelations[activeClassId].length <= 0 ? (
              <p>No known relations</p>
            ) : (
              <ul>
                {info.classUsedInRelations[activeClassId].map(
                  ({ classId, relation }, index) => {
                    return (
                      <li key={index}>
                        <ClassLink classId={classId} info={info} />:
                        <ul>
                          <li>
                            {renderSrmRelationItemHead(relation.property)}
                            <ul>
                              <li>
                                {renderTargetClass(relation.targetClass, info)}
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
