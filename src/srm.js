export const srmClassNames = {
  // Risk treatment related:
  riskTreatment: "Risk treatment",
  securityRequirement: "Security Requirement",
  control: "Control",
  // Risk related:
  risk: "Risk",
  event: "Event",
  impact: "Impact",
  threat: "Threat",
  vulnerability: "Vulnerability",
  threatAgent: "Threat agent",
  attackMethod: "Attack method",
  // Asset related:
  securityCriterion: "Security criterion",
  asset: "Asset",
  informationSystemAsset: "Information system asset",
  businessAsset: "Business asset",
};

function srmRelation(str) {
  function create(fromClass, name, toClass, fromCardinality, toCardinality) {
    return { fromClass, name, toClass, fromCardinality, toCardinality };
  }
  return create(...str.split("|"));
}

export const srmRelations = {
  // Risk treatment related:
  riskTreatmentLeadsToSecurityRequirement: srmRelation(
    "riskTreatment|Leads to|securityRequirement|1..*|0..*"
  ),
  riskTreatmentDecisionToTreatRisk: srmRelation(
    "riskTreatment|Decision to treat|risk|1..*|1..*"
  ),
  securityRequirementMitigatesRisk: srmRelation(
    "securityRequirement|Mitigates|risk|0..1|1..*"
  ),
  controlImplementsSecurityRequirement: srmRelation(
    "control|Implements|securityRequirement|1..*|1..*"
  ),
  // Risk related:
  riskSignificanceAssessedBySecurityCriterion: srmRelation(
    "risk|Significance assessed by|securityCriterion|0..1|1..*"
  ),
  riskConsistsOfEvent: srmRelation("risk|Consists of|event|0..1|1"),
  riskConsistsOfImpact: srmRelation("risk|Consists of|impact|0..1|1..*"),
  eventLeadsToImpact: srmRelation("event|Leads to|impact|0..*|0..*"),
  eventConsistsOfThreat: srmRelation("event|Consists of|threat|0..1|1"),
  eventConsistsOfVulnerability: srmRelation(
    "event|Consists of|vulnerability|0..1|1..*"
  ),
  threatExploitsVulnerability: srmRelation(
    "threat|Exploits|vulnerability|0..*|0..*"
  ),
  threatTargetsInformationSystemAsset: srmRelation(
    "threat|Targets|informationSystemAsset|0..*|1..*"
  ),
  threatConsistsOfThreatAgent: srmRelation(
    "threat|Consists of|threatAgent|0..1|1"
  ),
  threatConsistsOfAttackMethod: srmRelation(
    "threat|Consists of|attackMethod|0..1|1"
  ),
  threatAgentUsesAttackMethod: srmRelation(
    "threat|Uses|attackMethod|0..*|0..*"
  ),
  vulnerabilityCharacteristicOfInformationSystemAsset: srmRelation(
    "vulnerability|Characteristic of|informationSystemAsset|1..*|0..*"
  ),
  impactProvokesImpact: srmRelation("impact|Provokes|impact|0..*|0..*"),
  impactNegatesSecurityCriterion: srmRelation(
    "impact|Negates|securityCriterion|0..*|1..*"
  ),
  impactHarmsAsset: srmRelation("impact|Harms|asset|0..*|2..*"),
  // Asset related:
  securityCriterionConstraintOfBusinessAsset: srmRelation(
    "securityCriterion|Constraint of|businessAsset|unknown|unknown"
  ),
  informationSystemAssetSupportsBusinessAsset: srmRelation(
    "informationSystemAsset|Supports|businessAsset|0..*|1..*"
  ),
};

export const srmClassOwlIds = {
  // Risk treatment related:
  riskTreatment: "",
  securityRequirement: "",
  control: "https://mmisw.org/ont/~mubashar/HealthOnt#Countermeasure",
  // Risk related:
  risk: "",
  event: "",
  impact: "",
  threat: "https://mmisw.org/ont/~mubashar/HealthOnt#Threat",
  vulnerability: "https://mmisw.org/ont/~mubashar/HealthOnt#Vulnerability",
  threatAgent: "",
  attackMethod: "",
  // Asset related:
  securityCriterion:
    "https://mmisw.org/ont/~mubashar/HealthOnt#SecurityCriteria",
  // asset: "https://mmisw.org/ont/~mubashar/HealthOnt#Asset", // not useful
  informationSystemAsset:
    "https://mmisw.org/ont/~mubashar/HealthOnt#SystemAsset",
  businessAsset: "https://mmisw.org/ont/~mubashar/HealthOnt#BusinessAsset",
};

// srmName -> propertyId
export const srmRelationOwlIds = {
  // Risk treatment related:
  riskTreatmentLeadsToSecurityRequirement: "", // 1..* -> 0..*
  riskTreatmentDecisionToTreatRisk: "", // 1..* -> 1..*
  securityRequirementMitigatesRisk: "", // 0..1 -> 1..*
  controlImplementsSecurityRequirement: "", // 1..* -> 1..*
  // Risk related:
  riskSignificanceAssessedBySecurityCriterion: "", // 0..1 -> 1..*
  riskConsistsOfEvent: "", // 0..1 -> 1
  riskConsistsOfImpact: "", // 0..1 -> 1..*
  eventLeadsToImpact: "", // 0..* -> 0..*
  eventConsistsOfThreat: "", // 0..1 -> 1
  eventConsistsOfVulnerability: "", // 0..1 -> 1..*
  threatExploitsVulnerability:
    "https://mmisw.org/ont/~mubashar/HealthOnt#exploits", // 0..* -> 0..*
  threatTargetsInformationSystemAsset:
    "https://mmisw.org/ont/~mubashar/HealthOnt#targets", // 0..* -> 1..*
  threatConsistsOfThreatAgent: "", // 0..1 -> 1
  threatConsistsOfAttackMethod: "", // 0..1 -> 1
  threatAgentUsesAttackMethod: "", // 0..* -> 0..*
  vulnerabilityCharacteristicOfInformationSystemAsset:
    "https://mmisw.org/ont/~mubashar/HealthOnt#characteristicOf", // 1..* -> 0..*
  impactProvokesImpact: "", // 0..* -> 0..*
  impactNegatesSecurityCriterion: "", // 0..* -> 1..*
  impactHarmsAsset: "", // 0..* -> 2..*
  // Asset related:
  securityCriterionConstraintOfBusinessAsset:
    "https://mmisw.org/ont/~mubashar/HealthOnt#constraintOf", // ??? TODO inverse "https://mmisw.org/ont/~mubashar/HealthOnt#hasConstraint"
  informationSystemAssetSupportsBusinessAsset:
    "https://mmisw.org/ont/~mubashar/HealthOnt#supports", // 0..* -> 1..*

  // "https://mmisw.org/ont/~mubashar/HealthOnt#mitigates" Countermeasure mitigates Vulnerability!?!? TODO
  // "https://mmisw.org/ont/~mubashar/HealthOnt#harms" Asset harms IS Asset and/or Business Asset !?!? TODO
  // "https://mmisw.org/ont/~mubashar/HealthOnt#negates" Vulnerability negates Security Criterion !?!? TODO
};
