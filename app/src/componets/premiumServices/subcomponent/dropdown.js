import React, { useState, useEffect, useRef, useContext } from "react";
import styled from "styled-components";
import config from "../../../commons/config";
import Checkbox from "./checkbox";
import { PremiumServiceContext } from "../../../context/PremiumServiceProvider";
import ArrowUp from "../../../assets/images/iconUp.png";
import ArrowDown from "../../../assets/images/iconDown.png";

const DropDownContainer = styled("div")`
  display: inline;
  width: "fit-content";
  height: "fit-content";
  ${
    "" /* padding-right: 20px;
  background-repeat: no-repeat;
  background-position: top;
  background-position-x: right;
  background-size: 18px 18px;
  background-image: ${props => props.isOpen ? `url(${ArrowUp})` : `url(${ArrowDown})` }; */
  }
`;

const DropDownHeader = styled("span")`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: "fit-content";
  height: "fit-content";
  font-size: 14px;
  font-weight: bold;
  color: #000;
`;

const DropDownListContainer = styled("div")`
  position: absolute;
  z-index: 100;
  width: 160pt;
`;

const DropDownList = styled("ul")`
  padding: 0;
  margin: 0;
  color: #000;
  font-size: 16px;
  font-weight: 500;
  display: block;
  &:first-child {
    padding-top: 0em;
  }
`;
const ListItem = styled("li")`
  display: "flex";
  flexdirection: row;
  alignitems: center;
  list-style: none;
  background-color: #fff;
  height: 30pt;
  padding-left: 1rem;
  border: none;
`;

export default function DropDown(props) {
  const node = useRef();
  const tabContext = useContext(PremiumServiceContext);
  const toggling = () => props.setIsOpen(!props.isOpen);

  const handleClick = (e) => {
    if (node.current.contains(e.target)) {
      return;
    } else {
      props.setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  useEffect(() => {
    // getCategories();
  }, []);

  // const getCategories = async () => {
  //   try {
  //       let apiURL      = config.api.serviceCategories;
  //       let apiResponse = await callAPI.get(apiURL);
  //       let regResponse = await apiResponse.json();

  //       regResponse.data.forEach(function (element) {
  //           element.selectedFlag = false;
  //       })
  //         tabContext.setCategories(regResponse.data);

  //       // PushAlert.success(regResponse.message);
  //       // setIsRegistered(true);
  //   }
  //   catch(e) {
  //       console.log(e);
  //   }
  // }
  function handleCheckbox(id) {
    var arr = new Array();
    let subData = tabContext.categories;
    for (let data of subData) {
      if (data._id == id) {
        data.selectedFlag =
          data.selectedFlag == null ? true : !data.selectedFlag;
        break;
      }
    }
    for (let fdata of subData) {
      if (fdata.selectedFlag) {
        arr.push({ id: fdata._id, name: fdata.categoryName });
      }
    }
    tabContext.setSelectedCategories(arr);
    tabContext.setCategories([...subData]);
  }

  function clearAll() {
    let subData = tabContext.categories;
    for (let data of subData) {
      data.selectedFlag = false;
    }
    tabContext.setCategories([...subData]);
    tabContext.setSelectedCategories([]);
  }
  return (
    <DropDownContainer ref={node}>
      <DropDownHeader onClick={toggling}>
        Categories
        <img
          src={
            props.isOpen
              ? require("../../../assets/images/iconUp.png")
              : require("../../../assets/images/iconDown.png")
          }
          style={{
            width: "18px",
            height: "18px",
            paddingLeft: "1px",
            paddingBottom: "2px",
          }}
        />
      </DropDownHeader>
      {props.isOpen && (
        <DropDownListContainer>
          <DropDownList>
            <ListItem
              onClick={() => clearAll()}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontSize: "16px",
                fontWeight: "500",
                color: "red",
                paddingBottom: "5px",
              }}
            >
              <img
                src={require("../../../assets/images/resetRed.svg")}
                style={{ width: "18px", height: "18px", paddingRight: "10px" }}
              />
              Clear All
            </ListItem>
            {props.categories.map((item, index) =>
              item.activeFlag ? (
                <ListItem key={index}>
                  <label>
                    <Checkbox
                      checked={item.selectedFlag}
                      onChange={() => handleCheckbox(item._id)}
                    />
                    <span style={{ marginLeft: "10px", fontSize: "14px" }}>
                      {item.categoryName}
                    </span>
                  </label>
                </ListItem>
              ) : null
            )}
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownContainer>
  );
}
