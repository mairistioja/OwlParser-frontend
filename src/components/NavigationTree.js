import React, { useState } from "react";
import { TreeItem, TreeView, treeItemClasses } from "@mui/lab";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import { srmClasses } from "../srm";
import ClassLink from "./ClassLink";
import { PropTypes } from "prop-types";
import { InputAdornment } from "@mui/material";
import { minimizeOwlId } from "../misc";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  padding: "0px 0px",
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    padding: "0px 0px",
  },
}));

export const NavigationTree = ({ model }) => {
  const [showEmpty, setShowEmpty] = useState(true);
  const [filterText, setFilterText] = useState("");

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
        generateCategoryTree("attackMethod"),
        generateCategoryTree("event"),
        generateCategoryTree("impact"),
        generateCategoryTree("risk"),
        generateCategoryTree("threat"),
        generateCategoryTree("threatAgent"),
        generateCategoryTree("vulnerability"),
      ],
    }),
    generateCategory({
      label: "Risk-treatment-related concepts",
      nodeId: "risk_treatment_related",
      children: [
        generateCategoryTree("control"),
        generateCategoryTree("riskTreatment"),
        generateCategoryTree("securityRequirement"),
      ],
    }),
    generateCategory({
      label: "Asset-related concepts",
      nodeId: "asset_related",
      children: [
        generateCategory({
          label: "Asset",
          nodeId: "asset",
          children: [
            generateCategoryTree("businessAsset"),
            generateCategoryTree("informationSystemAsset"),
          ],
        }),
        generateCategoryTree("securityCriterion"),
      ],
    }),
  ];

  const renderTree = (items) => {
    const filterItems = (items) => {
      const matchText = filterText.toLowerCase();
      const filtered = [];
      for (const item of items) {
        if ("id" in item) {
          if (minimizeOwlId(item.id, model).toLowerCase().includes(matchText)) {
            filtered.push(item);
          }
        } else if (item.label.toLowerCase().includes(matchText)) {
          filtered.push(item);
        } else {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0)
            filtered.push({ ...item, children: filteredChildren });
        }
      }
      return filtered;
    };
    return filterItems(items).reduce((result, node) => {
      if (showEmpty || !("canBeHidden" in node) || !node.canBeHidden) {
        result.push(
          <StyledTreeItem {...treeItemPropertiesForNode(node)}>
            {renderTree(node.children)}
          </StyledTreeItem>
        );
      }
      return result;
    }, []);
  };

  return (
    <>
      <FormGroup>
        <TextField
          placeholder="Filter"
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterAltIcon />
              </InputAdornment>
            ),
          }}
          onChange={(event) => setFilterText(event.target.value)}
          value={filterText}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={!showEmpty}
              onChange={(event) => {
                setShowEmpty(!event.target.checked);
              }}
            />
          }
          label="Hide empty categories"
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
        {renderTree(tree)}
      </TreeView>
      <hr />
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
      >
        {renderTree([
          {
            label: "Extra Details",
            nodeId: "category:other",
            children: model.otherClassHierarchy,
          },
        ])}
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
