//dependencies
import React, { useEffect, useState, useContext } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

//misc
import Loader from "../loader/loader";
import config from "../../commons/config";
import api from "../../commons/api";
import Header from "../header/headerComponent";
import DropDown from "../premiumServices/subcomponent/dropdown";
import ServiceTile from "./subcomponent/serviceTile";
import { Context as MyFlightsContext } from "../../context/FlightsContext";
import { Context as AuthContext } from "../../context/AuthContext";
import { PremiumServiceContext } from "../../context/PremiumServiceProvider";
import AppContext from "../../commons/context";
import "./premiumServices.css";
import Util from "../../commons/util/util";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core/styles";

const PremiumServices = (props) => {
  const { state: flightState } = useContext(MyFlightsContext);
  const { state: authState } = useContext(AuthContext);
  const tabContext = useContext(PremiumServiceContext);
  const ClientCart = useContext(AppContext);
  const history = useHistory();
  const rootPath = useRouteMatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isWebView] = useState(Util.isWebView());
  const [isServiceAdded, setIsServiceAdded] = useState(false);
  const [headerParams] = useState({
    gobackEnabled: true,
    showScanner: true,
    showCart: true,
    staticHeaderText: true,
    gobackLinkRef: "",
    headerText: "Premium Services",
    headerTextLinkRef: "",
    storecode: "",
    rootPath: rootPath.url,
    // customNavLink: false
  });
  const [flightData, setFlightData] = useState(flightState.flightData);
  const [selected, setSelected] = useState(
    flightData[0] ? flightData[0].flightId : ""
  );
  const [selectedFightUID, setSelectedFlightUID] = useState(
    flightData[0] ? flightData[0].UID : ""
  );
  const [flightPickerDetails, setFlightPickerDetails] = useState({
    flightId: "",
    baseAirport: "",
    terminal: "",
    srcDestAirport: "",
    scheduleDate: "",
    scheduleTime: "",
    movementType: "",
    sector: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [packageList, setPackageList] = useState([
    {
      _id: "pacZ5PJPEpQvJAtGFv9o",
      title: "Platinum Package",
      serviceImageUrlMain: "/serviceImages/package/platinumpackage.jpg",
    },
    {
      _id: "pacZ5PJPEpQvJAtGFv91",
      title: "Gold Package",
      serviceImageUrlMain: "/serviceImages/package/goldpackage.jpg",
    },
    {
      _id: "pacZ5PJPEpQvJAtGFv8o",
      title: "Silver Package",
      serviceImageUrlMain: "/serviceImages/package/silverpackage.jpg",
    },
  ]);

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    console.log("handle close");
    setOpen(false);
  };

  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getServiceListing();
    // console.log('PS Flight Check', flightState.flightData, flightPickerDetails);
  }, [tabContext.selectedCategories, selected]);

  useEffect(() => {
    sendDataToReactNative();
  }, [isServiceAdded]);

  function getFlightInformation() {
    if (flightPickerDetails.flightId) {
      return (
        <p className="flight-select-info">
          {flightPickerDetails.baseAirport} -{" "}
          {flightPickerDetails.srcDestAirport} {flightPickerDetails.terminal}
          {"\n"}
          {flightPickerDetails.scheduleDate.slice(8, 10)}
          {"-"}
          {flightPickerDetails.scheduleDate.slice(5, 7)}
          {"-"}
          {flightPickerDetails.scheduleDate.slice(0, 4)}{" "}
          {flightPickerDetails.scheduleTime.slice(0, 5)}
        </p>
      );
    }
    if (flightState.flightData.length === 1) {
      return flightState.flightData.map((item, index) => {
        if (index === 0) {
          return (
            <p key={index} className="flight-select-info">
              {item.baseAirport} - {item.srcDestAirport} {item.terminal}{" "}
              {item.scheduleDate.slice(8, 10)}
              {"-"}
              {item.scheduleDate.slice(5, 7)}
              {"-"}
              {item.scheduleDate.slice(0, 4)} {item.scheduleTime.slice(0, 5)}
            </p>
          );
        }
      });
    }
    if (flightState.flightData.length > 0 && flightPickerDetails.flightId) {
      return (
        <p className="flight-select-info">
          {flightPickerDetails.baseAirport} -{" "}
          {flightPickerDetails.srcDestAirport} {flightPickerDetails.terminal}{" "}
          {flightPickerDetails.scheduleDate.slice(8, 10)}
          {"-"}
          {flightPickerDetails.scheduleDate.slice(5, 7)}
          {"-"}
          {flightPickerDetails.scheduleDate.slice(0, 4)}{" "}
          {flightPickerDetails.scheduleTime.slice(0, 5)}
        </p>
      );
    }
    if (flightState.flightData.length > 0) {
      return flightState.flightData.map((item, index) => {
        if (index === 0) {
          return (
            <p key={index} className="flight-select-info">
              {item.baseAirport} - {item.srcDestAirport} {item.terminal}{" "}
              {item.scheduleDate.slice(8, 10)}
              {"-"}
              {item.scheduleDate.slice(5, 7)}
              {"-"}
              {item.scheduleDate.slice(0, 4)} {item.scheduleTime.slice(0, 5)}
            </p>
          );
        }
      });
    }
    return <p />;
  }

  function handlePicker(e) {
    setSelectedFlightUID(e.target.value);
    flightData.forEach((element) => {
      if (element.UID === e.target.value) {
        setFlightPickerDetails({
          ...flightPickerDetails,
          flightId: element.flightId,
          baseAirport: element.baseAirport,
          terminal: element.terminal,
          srcDestAirport: element.srcDestAirport,
          scheduleDate: element.scheduleDate,
          scheduleTime: element.scheduleTime,
          sector: element.sector,
          movementType: element.movementType,
        });
        setSelected(element.flightId);
      }
    });
  }

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        "Premium Services" + "-" + ClientCart.isEmpty()
      );
  }

  const getServiceListing = async () => {
    let movementType = "";
    let sector = "";
    flightState.flightData.forEach((item) => {
      if (item.flightId === selected) {
        if (
          item.connectingFlight &&
          Object.keys(item.connectingFlight).length > 0
        ) {
          let f1Sector = "";
          let f2Sector = "";
          if (item.sector === "D" || item.sector === "Domestic")
            f1Sector = "Domestic";
          else if (item.sector === "I" || item.sector === "International")
            f1Sector = "International";
          else f1Sector = "Domestic";

          if (
            item.connectingFlight.sector === "D" ||
            item.connectingFlight.sector === "Domestic"
          )
            f2Sector = "Domestic";
          else if (
            item.connectingFlight.sector === "I" ||
            item.connectingFlight.sector === "International"
          )
            f2Sector = "International";
          else f2Sector = "Domestic";

          sector = `${f1Sector}-${f2Sector}`;
          movementType = "Transit";
        } else {
          if (item.movementType === "D" || item.movementType === "Departure")
            movementType = "Departure";
          else if (item.movementType === "A" || item.movementType === "Arrival")
            movementType = "Arrival";
          else if (item.movementType === "T" || item.movementType === "Transit")
            movementType = "Transit";
          else movementType = "Departure";

          if (item.sector === "D" || item.sector === "Domestic")
            sector = "Domestic";
          else if (item.sector === "I" || item.sector === "International")
            sector = "International";
          else sector = "Domestic";
        }
      }
    });
    let category = [];
    tabContext.selectedCategories.map((item) => {
      category.push(item.id);
    });
    try {
      let apiURL = config.api.serviceListing;
      let apiResponse = await api.patch(apiURL, {
        movementType,
        sector,
        category,
      });
      let regResponse = apiResponse;
      if (regResponse.status === 200) {
        setServiceList(regResponse.data);
        setIsLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getCategories = async () => {
    try {
      let apiURL = config.api.serviceCategories;
      let apiResponse = await api.get(apiURL);
      let regResponse = apiResponse;

      if (regResponse.status === 200) {
        if (tabContext.selectedCategories.length > 0) {
          regResponse.data.forEach((element) => {
            tabContext.selectedCategories.forEach((selectedElement) => {
              if (selectedElement.id === element._id) {
                element.selectedFlag = true;
              }
            });
          });
        } else {
          regResponse.data.forEach(function (element) {
            element.selectedFlag = false;
          });
        }

        tabContext.setCategories(regResponse.data);
      }

      // PushAlert.success(regResponse.message);
      // setIsRegistered(true);
    } catch (e) {
      console.log(e);
    }
  };

  function removeSelectedCategory(item, index) {
    let array = tabContext.selectedCategories;
    array = array.filter((ele) => ele.id !== item);
    let subData = tabContext.categories;
    for (let data of subData) {
      if (data._id == item) {
        data.selectedFlag = false;
        break;
      }
    }
    tabContext.setCategories([...subData]);
    tabContext.setSelectedCategories([...array]);
  }

  function clearAllSelectedCategories() {
    let subData = tabContext.categories;
    for (let data of subData) {
      data.selectedFlag = false;
    }
    tabContext.setCategories([...subData]);
    tabContext.setSelectedCategories([]);
  }

  return (
    <div className="premium-service-container">
      {/* <Header {...headerParams} /> */}
      {isWebView ? null : <Header {...headerParams} />}
      {isLoading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <div
          className={
            isWebView ? "content-webview-container" : "content-container"
          }
        >
          {flightState.flightData.length > 0 ? (
            <div className="flight-select-container">
              <p className="flight-select-text">Flight</p>
              <div className="picker-container">
                <select
                  value={selectedFightUID}
                  className="picker"
                  onChange={(e) => handlePicker(e)}
                >
                  {flightData &&
                    flightData.map((option, index) => (
                      <option
                        value={option.UID}
                        key={`opt_${index}`}
                        // data-type={item.type}
                        // className="picker-option"
                      >
                        {option.flightId}
                      </option>
                    ))}
                </select>
              </div>
              {getFlightInformation()}
            </div>
          ) : (
            <div className="addFlightContainer-container">
              <span
                className="addFlightText"
                onClick={() =>
                  history.push({
                    pathname: `/addNewFlight`,
                  })
                }
              >
                + Add Flight
              </span>
            </div>
          )}
          <Tabs
            selectedIndex={tabContext.tabIndex}
            onSelect={(index) => console.log(index)}
          >
            <TabList className="tab-list-container">
              <Tab onClick={() => tabContext.setTabIndex(0)}>
                Individual Services
              </Tab>
              <Tab onClick={() => tabContext.setTabIndex(1)}>
                Exclusive Packages
              </Tab>
            </TabList>

            <TabPanel style={{ width: "100%", height: "100%" }}>
              <div className="premium-service-listing-container">
                <div className="dropdown-container">
                  <div className="search-container">
                    Search By: &ensp;
                    <DropDown
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                      categories={tabContext.categories}
                      // selectedCategories={tabContext.selectedCategories}
                      // setSelectedCategories={tabContext.setSelectedCategories}
                      // setCategories={tabContext.setCategories}
                    />
                  </div>
                  {tabContext.selectedCategories.length > 1 ? (
                    <span
                      className={showMore ? "show-less" : "show-more"}
                      onClick={() => setShowMore(!showMore)}
                    >
                      {showMore ? "Show Less" : "Show All"} (
                      {tabContext.selectedCategories.length.toString()})
                      <img
                        src={
                          showMore
                            ? require("../../assets/images/arrowUpGreen.svg")
                            : require("../../assets/images/arrowDownGreen.svg")
                        }
                        style={{
                          width: "10px",
                          height: "10px",
                          paddingLeft: "5px",
                        }}
                      />
                    </span>
                  ) : null}
                </div>
                <div style={{ width: "100%" }}>
                  {tabContext.selectedCategories.length > 0 ? (
                    <div
                      className={
                        showMore
                          ? "filter-searchBox filter-searchBox-dropdown"
                          : "filter-searchBox"
                      }
                      data-id="filterSearchBox"
                    >
                      <div className="allFilters-container">
                        {tabContext.selectedCategories &&
                          tabContext.selectedCategories.map((item, index) => (
                            <div
                              className="category-filter-item-container"
                              key={item.id}
                            >
                              <div className="category-filter-item-container-text">
                                {item.name}
                              </div>
                              <div
                                className="category-filter-item-icon-container-searchBox"
                                onClick={() =>
                                  removeSelectedCategory(item.id, index)
                                }
                              ></div>
                            </div>
                          ))}
                        <div className="category-filter-item-container">
                          <div className="category-filter-item-container-text">
                            Clear All
                          </div>
                          <div
                            className="category-filter-item-icon-container-searchBox"
                            onClick={() => clearAllSelectedCategories()}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div data-id="serviceListing" className="service-listing">
                  {serviceList.map((item, index) => (
                    <ServiceTile
                      image={item.serviceImageUrlMain}
                      description={item.description}
                      title={item.title}
                      serviceId={item.id}
                      serviceFlightMapping={item.serviceFlightMapping}
                      isServiceAdded={isServiceAdded}
                      setIsServiceAdded={setIsServiceAdded}
                      selFlightId={selected}
                      selFlightUID={selectedFightUID}
                      index={index}
                      key={`key_${index}`}
                      handleClickOpen={handleClickOpen}
                    />
                  ))}
                </div>
              </div>
            </TabPanel>
            <TabPanel style={{ width: "100%", height: "100%" }}>
              <div className="premium-service-listing-container">
                {/* <div className='dropdown-container'>
                  <div className='search-container'>
                    Search By: &ensp;
                    <DropDown
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                      categories={[]}
                    />
                  </div>
                  {tabContext.selectedCategories.length > 1 ? (
                    <span
                      className={showMore ? 'show-less' : 'show-more'}
                      onClick={() => setShowMore(!showMore)}>
                      {showMore ? 'Show Less' : 'Show All'} (
                      {tabContext.selectedCategories.length.toString()})
                      <img
                        src={
                          showMore
                            ? require('../../assets/images/arrowUpGreen.svg')
                            : require('../../assets/images/arrowDownGreen.svg')
                        }
                        style={{
                          width: '10px',
                          height: '10px',
                          paddingLeft: '5px',
                        }}
                      />
                    </span>
                  ) : null}
                </div>
                <div style={{ width: '100%' }}>
                  {tabContext.selectedCategories.length > 0 ? (
                    <div
                      className={
                        showMore
                          ? 'filter-searchBox filter-searchBox-dropdown'
                          : 'filter-searchBox'
                      }
                      data-id='filterSearchBox'>
                      <div className='allFilters-container'>
                        {tabContext.selectedCategories &&
                          tabContext.selectedCategories.map((item, index) => (
                            <div
                              className='category-filter-item-container'
                              key={item}>
                              <div className='category-filter-item-container-text'>
                                {item}
                              </div>
                              <div
                                className='category-filter-item-icon-container-searchBox'
                                onClick={() =>
                                  removeSelectedCategory(item, index)
                                }></div>
                            </div>
                          ))}
                        <div className='category-filter-item-container'>
                          <div className='category-filter-item-container-text'>
                            Clear All
                          </div>
                          <div
                            className='category-filter-item-icon-container-searchBox'
                            onClick={() => clearAllCategories()}></div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div> */}
                <div data-id="serviceListing" className="service-listing">
                  {packageList.map((item, index) => (
                    <ServiceTile
                      image={item.serviceImageUrlMain}
                      description={item.description}
                      title={item.title}
                      serviceId={item.id}
                      serviceFlightMapping={item.serviceFlightMapping}
                      isServiceAdded={isServiceAdded}
                      setIsServiceAdded={setIsServiceAdded}
                      selFlightId={selected}
                      selFlightUID={selectedFightUID}
                      key={`key_${index}`}
                      packageFlag={true}
                    />
                  ))}
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Add a flight
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            The service you are looking for needs a flight to be added, please
            add a flight to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
              history.push({
                pathname: `/addNewFlight`,
              });
            }}
            color="primary"
            autoFocus
          >
            Add Flight
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PremiumServices;
