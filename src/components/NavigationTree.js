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
import { InputAdornment, Tooltip } from "@mui/material";
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
    if ("nodeId" in node) { // category
      let label = node.label;
      if ("id" in node) {
        label = (
          <ClassLink
            classId={node.id}
            model={model}
            tooltip={<>{node.tooltip}<br/><br/>{node.id}</>} />
        );
      } else {
        label = (
          <Tooltip title={node.tooltip} disableInteractive>
            <span>{label}</span>
          </Tooltip>
        );
      }
      label = (<>{label}{" " + numItemsText(node.children.length)}</>);
      itemProperties = { label, nodeId: `category:${node.nodeId}` };
    } else {
      itemProperties = {
        label: (
          <>
            <ClassLink classId={node.id} model={model} />
            {numItemsText(node.children.length)}
          </>
        ),
        nodeId: `id:${node.id}`,
      };
    }
    return { ...itemProperties, key: itemProperties.nodeId };
  }
  function generateCategoryTree(key) {
    const srmClassOwlId = model.srmClassOwlIds[key];
    const itemArray =
      (srmClassOwlId && srmClassOwlId in model.classHierarchies)
      ? model.classHierarchies[srmClassOwlId].regularChildren
      : [];
    console.assert(itemArray !== undefined, key, srmClassOwlId, model.classHierarchies[srmClassOwlId]);
    const tree = {
      label: srmClasses[key].name,
      tooltip: srmClasses[key].tooltip,
      nodeId: `category:${key}`,
      children: itemArray,
      canBeHidden: itemArray.length <= 0,
    };
    return srmClassOwlId ? {...tree, id: srmClassOwlId} : tree;
  }

  const generateCategory = ({ label, nodeId, children, tooltip }) => {
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
    return { label, nodeId, children, canBeHidden, tooltip };
  };

  const tree = [
    generateCategory({
      label: "Risk-related concepts",
      nodeId: "risk_related",
      tooltip: "Risk-related concepts present definitions for risks",
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
      tooltip: "Risk treatment-related concepts depict which decisions, requirements " +
      "and other means should be specified and implemented for the sake of mitigating potential risks",
      children: [
        generateCategoryTree("control"),
        generateCategoryTree("riskTreatment"),
        generateCategoryTree("securityRequirement"),
      ],
    }),
    generateCategory({
      label: "Asset-related concepts",
      nodeId: "asset_related",
      tooltip: "Asset-related concepts define which assets need protection and by which criteria " +
      "to ensure the safety of the assets",
      children: [
        generateCategory({
          label: srmClasses.asset.name,
          nodeId: "asset",
          tooltip: srmClasses.asset.tooltip,
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
    </>
  );
};

const classHierarchyNode = {
  ontId: PropTypes.string.isRequired,
};
classHierarchyNode.children = PropTypes.arrayOf(classHierarchyNode).isRequired;

NavigationTree.propTypes = {
  model: PropTypes.object.isRequired,
};

export default NavigationTree;
