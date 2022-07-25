function srmClass(name, tooltip, guessRegex, needMapping = true) {
  return { name, tooltip, guessRegex, needMapping };
}

export const srmClasses = {
  // Risk treatment related:
  riskTreatment: srmClass(
    "Risk treatment",
    "A risk treatment is the decision to handle detected risks",
    /^[^#]*[/#](sec(urity)?[ _]*)?(risk[ _]*)?treatment$/i
  ),
  securityRequirement: srmClass(
    "Security Requirement",
    "A security requirement is the elaboration of a decision to mitigate the risk",
    /^[^#]*[/#](sec(urity)?[ _]*)?req(uirement)?$/i
  ),
  control: srmClass(
    "Countermeasure",
    "Countermeasures are instruments for enhancing security",
    /^[^#]*[/#](sec(urity)?[ _]*)?(control|countermeasure)$/i
  ),
  // Risk related:
  risk: srmClass(
    "Risk",
    "A risk is the combination of one or more vulnerabilities and a threat which leads to adverse impact to the assets",
    /^[^#]*[/#](sec(urity)?[ _]*)?risk$/i
  ),
  event: srmClass(
    "Event",
    "An event is the combination of a threat and one or more vulnerabilities",
    /^[^#]*[/#](sec(urity)?[ _]*)?event$/i
  ),
  impact: srmClass(
    "Impact",
    "An impact describes the consequence of a risk in a case when the threat is carried out",
    /^[^#]*[/#](sec(urity)?[ _]*)?impact$/i
  ),
  threat: srmClass(
    "Threat",
    "A threat describes a possible attack or security breach which might extend to damaging the assets",
    /^[^#]*[/#](sec(urity)?[ _]*)?threat$/i
  ),
  vulnerability: srmClass(
    "Vulnerability",
    "A vulnerability is a weakness or a flaw of an information system asset",
    /^[^#]*[/#](sec(urity)?[ _]*)?vuln(erability)?$/i
  ),
  threatAgent: srmClass(
    "Threat agent",
    "A threat agent may harm the infosystem assets",
    /^[^#]*[/#](sec(urity)?[ _]*)?(threat[ _]*)?agent$/i
  ),
  attackMethod: srmClass(
    "Attack method",
    "An attack method is a means how a threat agent executes a threat",
    /^[^#]*[/#](sec(urity)?[ _]*)?attack([ _]*method)?$/i
  ),
  // Asset related:
  securityCriterion: srmClass(
    "Security criteria",
    "Security criteria describe the security needs of a business assets",
    /^[^#]*[/#](sec(urity)?[ _]*)?criteri(a|on)$/i
  ),
  asset: srmClass(
    "Asset",
    "Assets can be anything that has an importance to the organization in terms of attaining its objectives",
    null, // no guessRegex
    false // no mapping
  ),
  informationSystemAsset: srmClass(
    "System asset",
    "A system asset is a part of the information system that supports business asset",
    /^[^#]*[/#](is|(information[ _]*)?system)[ _]*asset$/i
  ),
  businessAsset: srmClass(
    "Business asset",
    "A business asset is a resource such as information, processes, capabilities, and skills" +
    " that is valuable for the organization",
    /^[^#]*[/#]business[ _]*asset$/i
  ),
};

/**
 * Returns relation parameters from srmRelations constants
 * @param {string} str
 * @return {{fromClass: string, name: string, toClass: string,
 *          fromCardinality: string, toCardinality: string}} srmRelation
 */
function srmRelation(str, guessRegex) {
  function create(
    fromClass,
    name,
    toClass,
    fromCardinality,
    toCardinality,
    guessRegex
  ) {
    return {
      fromClass,
      name,
      toClass,
      fromCardinality,
      toCardinality,
      guessRegex,
    };
  }
  return create(...str.split("|"), guessRegex);
}

export const srmRelations = {
  // Risk treatment related:
  riskTreatmentLeadsToSecurityRequirement: srmRelation(
    "riskTreatment|Leads to|securityRequirement|1..*|0..*",
    /^[^#]*[/#]((risk[ _]*)?treatment[ _]*)?leads[ _]*to[ _]*(sec(urity)?[ _]*)?requirement$/i
  ),
  riskTreatmentDecisionToTreatRisk: srmRelation(
    "riskTreatment|Decision to treat|risk|1..*|1..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?(risk[ _]*)?treatment[ _]*)?(decision[ _]*to[ _]*treat|treats)([ _]*(sec(urity)?[ _]*)?risk)?$/i
  ),
  securityRequirementMitigatesRisk: srmRelation(
    "securityRequirement|Mitigates|risk|0..1|1..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?req(uirement)[ _]*)?mitigates[ _]*((sec(urity)?[ _]*)?[ _]*risk)?$/i
  ),
  controlImplementsSecurityRequirement: srmRelation(
    "control|Implements|securityRequirement|1..*|1..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?(control|countermeasure)[ _]*)?implements([ _]*(sec(urity)?[ _]*)?req(uirement)?)?$/i
  ),
  // Risk related:
  riskSignificanceAssessedBySecurityCriterion: srmRelation(
    "risk|Significance assessed by|securityCriterion|0..1|1..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?risk[ _]*)?(significance[ _]*)?assessed[ _]*by([ ]*(sec(urity)?[ _]*)?criteri(a|on))?$/i
  ),
  riskConsistsOfEvent: srmRelation(
    "risk|Consists of|event|0..1|1",
    /^[^#]*[/#](risk[ _]*)?consists[ _]*of[ _]*event$/i
  ),
  riskConsistsOfImpact: srmRelation(
    "risk|Consists of|impact|0..1|1..*",
    /^[^#]*[/#](risk[ _]*)?consists[ _]*of[ _]*impact$/i
  ),
  eventLeadsToImpact: srmRelation(
    "event|Leads to|impact|0..*|0..*",
    /^[^#]*[/#](event[ _]*)?leads[ _]*to[ _]*impact$/i
  ),
  eventConsistsOfThreat: srmRelation(
    "event|Consists of|threat|0..1|1",
    /^[^#]*[/#](event[ _]*)?consists[ _]*of[ _]*threat$/i
  ),
  eventConsistsOfVulnerability: srmRelation(
    "event|Consists of|vulnerability|0..1|1..*",
    /^[^#]*[/#](event[ _]*)?consists[ _]*of[ _]*vulnerability$/i
  ),
  threatExploitsVulnerability: srmRelation(
    "threat|Exploits|vulnerability|0..*|0..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?threat[ _]*)?exploits([ _]*(sec(urity)?[ _]*)?vuln(erability)?)?$/i
  ),
  threatTargetsInformationSystemAsset: srmRelation(
    "threat|Targets|informationSystemAsset|0..*|1..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?threat[ _]*)?targets([ _]*(is|(information[ _]*)?system)[ _]*asset)?$/i
  ),
  threatConsistsOfThreatAgent: srmRelation(
    "threat|Consists of|threatAgent|0..1|1",
    /^[^#]*[/#](threat[ _]*)?consists[ _]*of[ _]*threat[ _]*agent$/i
  ),
  threatConsistsOfAttackMethod: srmRelation(
    "threat|Consists of|attackMethod|0..1|1",
    /^[^#]*[/#](threat[ _]*)?consists[ _]*of[ _]*(sec(urity)?[ _]*)?attack([ _]*method)?$/i
  ),
  threatAgentUsesAttackMethod: srmRelation(
    "threat|Uses|attackMethod|0..*|0..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?threat[ _]*)?uses([ _]*(sec(urity)?[ _]*)?attack([ _]*method)?)?$/i
  ),
  vulnerabilityCharacteristicOfInformationSystemAsset: srmRelation(
    "vulnerability|Characteristic of|informationSystemAsset|1..*|0..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?vulnerability[ _]*)?characteristic[ _]*of([ _]*(is|(information[ _]*)?system)[ _]*asset)?$/i
  ),
  impactProvokesImpact: srmRelation(
    "impact|Provokes|impact|0..*|0..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?impact[ _]*)?provokes([ _]*(sec(urity)?[ _]*)?impact)?$/i
  ),
  impactNegatesSecurityCriterion: srmRelation(
    "impact|Negates|securityCriterion|0..*|1..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?impact[ _]*)?negates([ _]*(sec(urity)?[ _]*)?criteri(a|on))?$/i
  ),
  impactHarmsAsset: srmRelation(
    "impact|Harms|asset|0..*|2..*",
    /^[^#]*[/#]((sec(urity)?[ _]*)?impact[ _]*)?harms([ _]*((business|is|(information[ _]*)?system)[ _]*)?asset)?$/i
  ),
  // Asset related:
  securityCriterionConstraintOfBusinessAsset: srmRelation(
    "securityCriterion|Constraint of|businessAsset|unknown|unknown",
    null // TODO
  ),
  businessAssetHasConstraintSecurityCriterion: srmRelation(
    // hack for healthont
    "businessAsset|Has constraint|securityCriterion|unknown|unknown",
    /^[^#]*[/#](business[ _]*asset[ _]*)?has[ _]*constraint([ _]*(sec(urity)?[ _]*)?criteri(a|on))?$/i
  ),
  informationSystemAssetSupportsBusinessAsset: srmRelation(
    "informationSystemAsset|Supports|businessAsset|0..*|1..*",
    /^[^#]*[/#]((is|(information[ _]*)?system)[ _]*asset[ _]*)?supports([ _]*business[ _]*asset)?$/i
  ),
};

const SRM = { srmClasses, srmRelations };

export default SRM;
