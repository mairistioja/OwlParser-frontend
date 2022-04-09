function srmClass(name, guessRegex, needMapping = true) {
  return { name, guessRegex, needMapping };
}

export const srmClasses = {
  // Risk treatment related:
  riskTreatment: srmClass(
    "Risk treatment",
    /^[^#]*#(sec(urity)?[ _]*)?(risk[ _]*)?treatment$/i
  ),
  securityRequirement: srmClass(
    "Security Requirement",
    /^[^#]*#(sec(urity)?[ _]*)?req(uirement)?$/i
  ),
  control: srmClass(
    "Countermeasure",
    /^[^#]*#(sec(urity)?[ _]*)?(control|countermeasure)$/i
  ),
  // Risk related:
  risk: srmClass("Risk", /^[^#]*#(sec(urity)?[ _]*)?risk$/i),
  event: srmClass("Event", /^[^#]*#(sec(urity)?[ _]*)?event$/i),
  impact: srmClass("Impact", /^[^#]*#(sec(urity)?[ _]*)?impact$/i),
  threat: srmClass("Threat", /^[^#]*#(sec(urity)?[ _]*)?threat$/i),
  vulnerability: srmClass(
    "Vulnerability",
    /^[^#]*#(sec(urity)?[ _]*)?vuln(erability)?$/i
  ),
  threatAgent: srmClass(
    "Threat agent",
    /^[^#]*#(sec(urity)?[ _]*)?(threat[ _]*)?agent$/i
  ),
  attackMethod: srmClass(
    "Attack method",
    /^[^#]*#(sec(urity)?[ _]*)?attack[ _]*method$/i
  ),
  // Asset related:
  securityCriterion: srmClass(
    "Security criteria",
    /^[^#]*#(sec(urity)?[ _]*)?criteri(a|on)$/i
  ),
  asset: srmClass("Asset", null, false), // no mapping
  informationSystemAsset: srmClass(
    "System asset",
    /^[^#]*#(is|(information[ _]*)?system)[ _]*asset$/i
  ),
  businessAsset: srmClass("Business asset", /^[^#]*#business[ _]*asset$/i),
};

/**
 * Returns relation parameters from srmRelations constants
 * @param {string} str
 * @return {{fromClass: string, name: string, toClass: string, fromCardinality: string, toCardinality: string}} srmRelation
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
    null // TODO
  ),
  riskTreatmentDecisionToTreatRisk: srmRelation(
    "riskTreatment|Decision to treat|risk|1..*|1..*",
    /^[^#]*#((sec(urity)?[ _]*)?(risk[ _]*)?treatment[ _]*)?(decision[ _]*to[ _]*treat|treats)([ _]*(sec(urity)?[ _]*)?risk)?$/i
  ),
  securityRequirementMitigatesRisk: srmRelation(
    "securityRequirement|Mitigates|risk|0..1|1..*",
    /^[^#]*#((sec(urity)?[ _]*)?req(uirement))?mitigates((sec(urity)?[ _]*)?[ _]*risk)?$/i
  ),
  controlImplementsSecurityRequirement: srmRelation(
    "control|Implements|securityRequirement|1..*|1..*",
    /^[^#]*#((sec(urity)?[ _]*)?(control|countermeasure)[ _]*)?implements([ _]*(sec(urity)?[ _]*)?req(uirement)?)?$/i
  ),
  // Risk related:
  riskSignificanceAssessedBySecurityCriterion: srmRelation(
    "risk|Significance assessed by|securityCriterion|0..1|1..*",
    /^[^#]*#((sec(urity)?[ _]*)?risk[ _]*)?(significance[ _]*)?assessed[ _]*by([ ]*(sec(urity)?[ _]*)?criteri(a|on))?$/i
  ),
  riskConsistsOfEvent: srmRelation(
    "risk|Consists of|event|0..1|1",
    null // TODO
  ),
  riskConsistsOfImpact: srmRelation(
    "risk|Consists of|impact|0..1|1..*",
    null // TODO
  ),
  eventLeadsToImpact: srmRelation(
    "event|Leads to|impact|0..*|0..*",
    null // TODO
  ),
  eventConsistsOfThreat: srmRelation(
    "event|Consists of|threat|0..1|1",
    null // TODO
  ),
  eventConsistsOfVulnerability: srmRelation(
    "event|Consists of|vulnerability|0..1|1..*",
    null // TODO
  ),
  threatExploitsVulnerability: srmRelation(
    "threat|Exploits|vulnerability|0..*|0..*",
    /^[^#]*#((sec(urity)?[ _]*)?threat[ _]*)?exploits([ _]*(sec(urity)?[ _]*)?vuln(erability)?)?$/i
  ),
  threatTargetsInformationSystemAsset: srmRelation(
    "threat|Targets|informationSystemAsset|0..*|1..*",
    /^[^#]*#((sec(urity)?[ _]*)?threat[ _]*)?targets([ _]*(is|(information[ _]*)?system)[ _]*asset)?$/i
  ),
  threatConsistsOfThreatAgent: srmRelation(
    "threat|Consists of|threatAgent|0..1|1",
    null // TODO
  ),
  threatConsistsOfAttackMethod: srmRelation(
    "threat|Consists of|attackMethod|0..1|1",
    null // TODO
  ),
  threatAgentUsesAttackMethod: srmRelation(
    "threat|Uses|attackMethod|0..*|0..*",
    /^[^#]*#((sec(urity)?[ _]*)?threat[ _]*)?uses([ _]*(sec(urity)?[ _]*)?attack[ _]*method)?$/i
  ),
  vulnerabilityCharacteristicOfInformationSystemAsset: srmRelation(
    "vulnerability|Characteristic of|informationSystemAsset|1..*|0..*",
    /^[^#]*#((sec(urity)?[ _]*)?vulnerability[ _]*)?characteristic[ _]*of([ _]*(is|(information[ _]*)?system)[ _]*asset)?$/i
  ),
  impactProvokesImpact: srmRelation(
    "impact|Provokes|impact|0..*|0..*",
    /^[^#]*#((sec(urity)?[ _]*)?impact[ _]*)?provokes([ _]*(sec(urity)?[ _]*)?impact)?$/i
  ),
  impactNegatesSecurityCriterion: srmRelation(
    "impact|Negates|securityCriterion|0..*|1..*",
    /^[^#]*#((sec(urity)?[ _]*)?impact[ _]*)?negates([ _]*(sec(urity)?[ _]*)?criteri(a|on))?$/i
  ),
  impactHarmsAsset: srmRelation(
    "impact|Harms|asset|0..*|2..*",
    /^[^#]*#((sec(urity)?[ _]*)?impact[ _]*)?harms([ _]*((business|is|(information[ _]*)?system)[ _]*)?asset)?$/i
  ),
  // Asset related:
  securityCriterionConstraintOfBusinessAsset: srmRelation(
    "securityCriterion|Constraint of|businessAsset|unknown|unknown",
    null // TODO
  ),
  businessAssetHasConstraintSecurityCriterion: srmRelation(
    // hack for healthont
    "businessAsset|Has constraint|securityCriterion|unknown|unknown",
    /^[^#]*#(business[ _]*asset[ _]*)?has[ _]*constraint([ _]*(sec(urity)?[ _]*)?criteri(a|on))?$/i
  ),
  informationSystemAssetSupportsBusinessAsset: srmRelation(
    "informationSystemAsset|Supports|businessAsset|0..*|1..*",
    /^[^#]*#((is|(information[ _]*)?system)[ _]*asset[ _]*)?supports([ _]*business[ _]*asset)?$/i
  ),
};

const SRM = { srmClasses, srmRelations };

export default SRM;
