import React, { useState } from "react";
import { TreeItem, TreeView, treeItemClasses } from "@mui/lab";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { srmClasses } from "../srm";
import ClassLink from "./ClassLink";
import { PropTypes } from "prop-types";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  padding: "0px 0px",
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    padding: "0px 0px",
  },
}));

export const NavigationTree = ({ model }) => {
  const [showEmpty, setShowEmpty] = useState(false);

  function numItemsText(numItems) {
    return numItems <= 0 ? "" : ` (${numItems})`;
  }
  function treeItemPropertiesForNode(node) {
    let itemProperties;
    if ("id" in node) {
      itemProperties = {
        label: (
          <>
            <ClassLink classId={node.id} model={model} renderTypes={false} />
            {numItemsText(node.children.length)}
          </>
        ),
        nodeId: `id:${node.id}`,
      };
    } else {
      itemProperties = {
        label: node.label + numItemsText(node.children.length),
        nodeId: `category:${node.nodeId}`,
      };
    }
    return { ...itemProperties, key: itemProperties.nodeId };
  }
  function generateCategoryTree(key) {
    const itemArray =
      key in model.srmClassHierarchy ? model.srmClassHierarchy[key] : [];
    return {
      label: srmClasses[key].name,
      nodeId: `category:${key}`,
      children: itemArray,
      canBeHidden: itemArray.length <= 0,
    };
  }

  const generateCategory = ({ label, nodeId, children }) => {
    let canBeHidden = true;
    for (const child of children) {
      if ("canBeHidden" in child) {
        if (!child.canBeHidden) {
          canBeHidden = false;
          break;
        }
      } else {
        canBeHidden = false;
        break;
      }
    }
    return { label, nodeId, children, canBeHidden };
  };

  const tree = [
    generateCategory({
      label: "Risk-related concepts",
      nodeId: "risk_related",
      children: [
        generateCategoryTree("risk"),
        generateCategoryTree("event"),
        generateCategoryTree("impact"),
        generateCategoryTree("threat"),
        generateCategoryTree("vulnerability"),
        generateCategoryTree("threatAgent"),
        generateCategoryTree("attackMethod"),
      ],
    }),
    generateCategory({
      label: "Risk-treatment-related concepts",
      nodeId: "risk_treatment_related",
      children: [
        generateCategoryTree("riskTreatment"),
        generateCategoryTree("securityRequirement"),
        generateCategoryTree("control"),
      ],
    }),
    generateCategory({
      label: "Asset-related concepts",
      nodeId: "asset_related",
      children: [
        generateCategoryTree("securityCriterion"),
        generateCategory({
          label: "Asset",
          nodeId: "asset",
          children: [
            generateCategoryTree("informationSystemAsset"),
            generateCategoryTree("businessAsset"),
          ],
        }),
      ],
    }),
  ];

  const renderTree = (items, showEmptyCategories) => {
    return items.reduce((result, node) => {
      if (
        showEmptyCategories ||
        !("canBeHidden" in node) ||
        !node.canBeHidden
      ) {
        result.push(
          <StyledTreeItem {...treeItemPropertiesForNode(node)}>
            {renderTree(node.children, showEmptyCategories)}
          </StyledTreeItem>
        );
      }
      return result;
    }, []);
  };

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={showEmpty}
              onChange={(event) => {
                setShowEmpty(event.target.checked);
              }}
            />
          }
          label="Show empty categories"
        />
      </FormGroup>
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
        {renderTree(tree, showEmpty)}
      </TreeView>
      <hr />
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
      >
        <StyledTreeItem
          label={
            "Extra Details" + numItemsText(model.otherClassHierarchy.length)
          }
          nodeId="category:other"
        >
          {renderTree(model.otherClassHierarchy, showEmpty)}
        </StyledTreeItem>
      </TreeView>
    </>
  );
};

const classHierarchyNode = {
  ontId: PropTypes.string.isRequired,
};
classHierarchyNode.children = PropTypes.arrayOf(classHierarchyNode).isRequired;

NavigationTree.propTypes = {
  model: PropTypes.shape({
    srmClassHierarchy: PropTypes.objectOf(PropTypes.arrayOf(classHierarchyNode))
      .isRequired,
    otherClassHierarchy: PropTypes.objectOf(
      PropTypes.arrayOf(classHierarchyNode)
    ).isRequired,
  }).isRequired,
};

export default NavigationTree;
