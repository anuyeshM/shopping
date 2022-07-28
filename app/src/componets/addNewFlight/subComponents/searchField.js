import React, { useState, useEffect, useRef } from "react";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme } from "@material-ui/core/styles";
import { MuiThemeProvider } from "@material-ui/core/styles";

//apicall
import config from "../../../commons/config";

//components
import UseOutsideClick from "../../../commons/useOutsideClick";

//media
import "../addNewFlight.css";
import IconClose from "../../../assets/images/iconClose.svg";
import api from "../../../commons/api";

const SearchField = ({
  subText,
  setSearchField,
  placeholder,
  searchFieldName,
  clearSearchInput,
  setDestIsDisabled,
  isDestDisabled,
}) => {
  const ref = useRef();
  const [flightSearch, setFlightSearch] = useState("");
  const [flightSearchResults, setFlightSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  UseOutsideClick(ref, () => {
    setIsDropdownOpen(!isDropdownOpen);
  });

  useEffect(() => {
    clearAndDisableInput();
  }, [clearSearchInput]);

  useEffect(() => {
    if (searchFieldName) {
      setFlightSearch(searchFieldName);
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      // Make sure we have a value (user has entered something in input)
      if (flightSearch && isSearching) {
        const apiURL = config.api.airportSearchResults;
        // Fire off our API call
        api
          .get(apiURL, { apName: flightSearch })
          .then((response) => {
            if (response.data) {
              const searchResponse = response.data;
              // console.log('airports', response);
              setFlightSearchResults(searchResponse);
              setIsDropdownOpen(true);
            }
          })
          .catch((error) => {
            console.log(error);
            setFlightSearchResults([]);
          });
      } else {
        setFlightSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [flightSearch]);

  function handleListItemClick(item) {
    setFlightSearch(item.airportname);
    setSearchField({ code: item.airportcode, name: item.airportname });
    setIsDropdownOpen(false);
    setIsSearching(false);
  }

  function handleClear() {
    setFlightSearch("");
    setIsDropdownOpen(false);
    setSearchField({ code: "", name: "" });
  }

  function clearAndDisableInput() {
    setFlightSearch("");
    setIsDropdownOpen(false);
    setSearchField({ code: "", name: "" });
    setIsDisabled(true);
  }

  return (
    <div className="fromAndTo-container">
      <span className="subText">{subText}</span>
      <span className="fromAndTo-textInput-clearIcon-wrapper">
        <div className="search-dropdown-wrapper">
          <MuiThemeProvider theme={inputBoxTheme}>
            <TextField
              className="fromAndTo-textInput"
              placeholder={placeholder}
              value={flightSearch}
              onChange={(e) => {
                setFlightSearch(e.target.value);
                setIsSearching(true);
              }}
              disabled={isDestDisabled}
            />
          </MuiThemeProvider>
          {flightSearch ? (
            <span
              style={isDestDisabled ? { opacity: "0.3" } : {}}
              className="clearIcon"
              onClick={() => (!isDestDisabled ? handleClear() : null)}
            >
              <img src={IconClose} />
            </span>
          ) : null}
          {isDropdownOpen && flightSearchResults.length ? (
            <div className="search-dropdown-content" ref={ref}>
              {flightSearchResults.map((item, index) => (
                <div
                  className="search-dropdown-content-tile"
                  key={index}
                  style={{
                    borderBottom:
                      index === flightSearchResults.length - 1
                        ? "0pt solid #e9e9e9"
                        : "",
                  }}
                  onClick={() => handleListItemClick(item)}
                >
                  {`${item.airportname}(${item.airportcode})`}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </span>
    </div>
  );
};

const inputBoxTheme = createMuiTheme({
  overrides: {
    MuiInput: {
      underline: {
        "&:before": {
          borderBottom: "2px solid #e9e9e9 !important",
        },
        "&:after": {
          borderBottom: "2px solid #47b896 !important",
        },
      },
    },
  },
});

export default SearchField;
