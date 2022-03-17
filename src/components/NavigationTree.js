import React from "react";
import { TreeItem, TreeView, treeItemClasses } from "@mui/lab";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { IdLink } from "../misc";
import { styled } from "@mui/material/styles";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  padding: "0px 0px",
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    padding: "0px 0px",
  },
}));

export default function NavigationTree({ model }) {
  function numItemsText(numItems) {
    return numItems <= 0 ? "" : ` (${numItems})`;
  }
  function treeItemPropertiesForNode(node) {
    let props;
    if ("id" in node) {
      props = {
        label: (
          <>
            <IdLink id={node.id} ontologyId={model.metadata.id} />
            {numItemsText(node.children.length)}
          </>
        ),
        nodeId: `id:${node.id}`,
      };
    } else {
      props = {
        label: node.label + numItemsText(node.children.length),
        nodeId: `category:${node.nodeId}`,
      };
    }
    return { ...props, key: props.nodeId };
  }
  function renderTree(node) {
    return (
      <TreeItem {...treeItemPropertiesForNode(node)}>
        {node.children.map((child) => renderTree(child))}
      </TreeItem>
    );
  }
  function subTree(name, key) {
    const itemArray =
      key in model.srmClassHierarchy ? model.srmClassHierarchy[key] : [];
    return renderTree({
      label: name,
      nodeId: `category:${key}`,
      children: itemArray,
    });
  }

  return (
    <>
      <TreeView
        className="sidebar"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        defaultExpanded={[
          "category:risk_related",
          "category:risk_treatment_related",
          "category:asset_related",
          "category:asset",
        ]}
        sx={{ padding: "1rem 0.5rem" }}
      >
        <StyledTreeItem
          label="Risk-related concepts"
          nodeId="category:risk_related"
        >
          {subTree("Risk", "risk")}
          {subTree("Event", "event")}
          {subTree("Impact", "impact")}
          {subTree("Threat", "threat")}
          {subTree("Vulnerability", "vulnerability")}
          {subTree("Threat agent", "threatAgent")}
          {subTree("Attack method", "attackMethod")}
        </StyledTreeItem>
        <StyledTreeItem
          label="Risk-treatment-related concepts"
          nodeId="category:risk_treatment_related"
        >
          {subTree("Risk treatment", "riskTreatment")}
          {subTree("Security requirement", "securityRequirement")}
          {subTree("Control", "control")}
        </StyledTreeItem>
        <StyledTreeItem
          label="Asset-related concepts"
          nodeId="category:asset_related"
        >
          {subTree("Security Criterion", "securityCriterion")}
          <StyledTreeItem label="Asset" nodeId="category:asset">
            {subTree("IS asset", "informationSystemAsset")}
            {subTree("Business asset", "businessAsset")}
          </StyledTreeItem>
        </StyledTreeItem>
      </TreeView>
      <hr></hr>
      <TreeView>
        <StyledTreeItem
          label={
            "Other classes" + numItemsText(model.otherClassHierarchy.length)
          }
          nodeId="category:other"
        >
          {model.otherClassHierarchy.map((child) => renderTree(child))}
        </StyledTreeItem>
      </TreeView>
    </>
  );
}
