import React, { useState } from 'react';
import './filterOptionStyle.css';
import './searchInputStyle.css';
import Modal from 'react-bootstrap/Modal';
import ModalFooter from 'react-bootstrap/ModalFooter';
import ModalHeader from 'react-bootstrap/ModalHeader';
import ModalBody from 'react-bootstrap/ModalBody';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import arrowLeft from '../../assets/images/arrowLeft.svg';
let localFilterObject;
function FilterOption(props) {
  const { filterOptionHeader } = props;
  const { transitionFlagSetter } = props;
  const { globalFilterFlag } = props;
  const { secondaryGlobalFilterFlag } = props;
  const { getSubCategory } = props;
  const { getLabels } = props;
  const { filterObject } = props;
  const { getCount } = props;
  // const { data } = props;
  const { triggerFooter } = props;
  const { setTriggerFooter } = props;

  const [detailModalIsVisible, setDetailModalIsVisible] = useState(false);
  const [localFilterArray, setLocalFilterArray] = useState([]);
  const [selectedGlobalFilter, setSelectedGlobalFilter] = useState('');
  const [rangeMinValue, setRangeMinValue] = useState(0);
  const [rangeMaxValue, setRangeMaxValue] = useState(0);
  const [data, setData] = useState([]);

  //**on entering modal */
  function getInitialValues() {
    if (globalFilterFlag === true) {
      if (secondaryGlobalFilterFlag === 'Category') {
        setData(window.filterCategories);

        if (window.selectedCategory !== '') {
          setSelectedGlobalFilter(window.selectedCategory);
        } else {
          setSelectedGlobalFilter('');
        }
      } else if (secondaryGlobalFilterFlag === 'SubCategory') {
        setData(window.filterSubCategories);

        if (window.selectedSubCategory !== '') {
          setSelectedGlobalFilter(window.selectedSubCategory);
        } else {
          setSelectedGlobalFilter('');
        }
      }
    } else {
      if (filterObject.label === 'price') {
        setRangeMinValue(0);
        setRangeMaxValue(filterObject.max);
      } else {
        let localAr = [];
        filterObject.options.map((item) => {
          localAr.push({ label: item, isChecked: false });
        });
        if (window.selectedFilters.length > 0) {
          window.selectedFilters.map((selectedItem) => {
            if (selectedItem._id === filterObject._id) {
              selectedItem.options.map((selectedOption) => {
                localAr.map((localItem) => {
                  if (selectedOption === localItem.label) {
                    localItem.isChecked = true;
                  }
                });
              });
            }
          });
          setLocalFilterArray([...localAr]);
        } else {
          setLocalFilterArray([...localAr]);
        }
      }
    }
  }

  function showDetailModal() {
    transitionFlagSetter(true);
    setDetailModalIsVisible(true);
    getInitialValues();
  }

  function hideDetailModal() {
    setDetailModalIsVisible(false);
    transitionFlagSetter(false);
  }

  function handleOnChange(item, index) {
    if (globalFilterFlag === true) {
      setSelectedGlobalFilter(item);
    } else {
      const array = localFilterArray;
      if (array[index].isChecked === true) {
        array[index].isChecked = false;
      } else {
        array[index].isChecked = true;
      }
      setLocalFilterArray([...array]);
    }
  }

  function onSubmit() {
    if (globalFilterFlag === true) {
      if (secondaryGlobalFilterFlag === 'Category') {
        if (selectedGlobalFilter !== '') {
          window.selectedCategory = selectedGlobalFilter;
          getSubCategory();
        } else {
          window.selectedCategory = '';
          window.filterSubCategories = [];
          window.selectedSubCategory = '';
          window.filters = [];
          window.selectedFilters = [];
        }
      }
      if (secondaryGlobalFilterFlag === 'SubCategory') {
        if (selectedGlobalFilter !== '') {
          window.selectedSubCategory = selectedGlobalFilter;
          getLabels();
        } else {
          window.selectedSubCategory = '';
          window.filters = [];
          window.selectedFilters = [];
        }
      }
    } else {
      localFilterObject = JSON.parse(JSON.stringify(filterObject));
      if (localFilterObject.label === 'price') {
        localFilterObject.min = rangeMinValue;
        localFilterObject.max = rangeMaxValue;
        let present = false;
        window.selectedFilters.map((item, index) => {
          if (item._id === localFilterObject._id) {
            window.selectedFilters[index] = localFilterObject;
            present = true;
          }
        });
        if (!present) {
          window.selectedFilters.push(localFilterObject);
        }
      } else {
        let newOptions = [];
        var spliceItem = true;
        localFilterArray.forEach((item) => {
          if (item.isChecked === true) {
            spliceItem = false;
            newOptions.push(item.label);
          }
        });
        if (spliceItem) {
          window.selectedFilters.map((item, index) => {
            if (item._id === localFilterObject._id) {
              window.selectedFilters.splice(index, 1);
            }
          });
        } else {
          var present = false;
          window.selectedFilters.forEach((item) => {
            if (item._id === localFilterObject._id) {
              present = true;
              item.options = newOptions;
            }
          });
          if (!present) {
            // const obj = localFilterObject;
            localFilterObject.options = newOptions;
            window.selectedFilters.push(localFilterObject);
          }
        }
      }
    }
    getCount();
    hideDetailModal();
  }

  function resetAllFilters() {
    if (!globalFilterFlag) {
      if (filterObject.label === 'price') {
        setRangeMinValue(0);
        setRangeMaxValue(filterObject.max);
      } else {
        let array = localFilterArray;
        array.map((item) => {
          item.isChecked = false;
        });
        setLocalFilterArray([...array]);
      }
    } else {
      setSelectedGlobalFilter('');
    }
  }

  function handleOnExit() {
    // if (globalFilterFlag === true) {
    //   if (secondaryGlobalFilterFlag === 'Category') {
    //     // getSubCategory();
    //   } else if (secondaryGlobalFilterFlag === 'SubCategory') {
    //     // getLabels();
    //     setTriggerFooter(!triggerFooter);
    //   }
    // }
    !globalFilterFlag && setTriggerFooter(triggerFooter);
  }

  function getPlaceholderText() {
    if (globalFilterFlag) {
      if (secondaryGlobalFilterFlag === 'Category') {
        if (window.selectedCategory === '') {
          return (
            <span className="placeholder-text-select">Select Category</span>
          );
        } else {
          return (
            <span className="placeholder-text">{window.selectedCategory}</span>
          );
        }
      } else if (secondaryGlobalFilterFlag === 'SubCategory') {
        if (window.selectedSubCategory === '') {
          return (
            <span className="placeholder-text-select">Select SubCategory</span>
          );
        } else {
          return (
            <span className="placeholder-text">
              {window.selectedSubCategory}
            </span>
          );
        }
      }
    } else {
      let present = false;

      let localStr = [];
      window.selectedFilters.map((selectedItem) => {
        if (selectedItem._id === filterObject._id) {
          present = true;
          if (selectedItem.label !== 'price') {
            localStr = selectedItem.options.join(', ');
          } else {
            console.log('selectedItem', selectedItem);
            localStr = '₹' + selectedItem.min + '-' + selectedItem.max;
          }
        }
      });

      if (!present) {
        return (
          <span className="placeholder-text-select">
            Select {filterObject.label}
          </span>
        );
      } else if (filterObject.label === 'price') {
        if (!present) {
          return (
            <span className="placeholder-text">
              ₹ {filterObject.min} - {filterObject.max}
            </span>
          );
        } else {
          return <span className="placeholder-text">{localStr}</span>;
        }
      } else {
        return <span className="placeholder-text">{localStr}</span>;
      }
    }
  }

  return (
    <div className="filterOption">
      <span
        data-id="filterOptionHeaderContainer"
        className="filterOptionHeaderContainer"
      >
        {filterOptionHeader}
      </span>
      <div
        data-id="filterOptionContainer"
        className="filter-option-container"
        onClick={() => showDetailModal()}
      >
        <span data-id="filterOptionText" className="filter-option-text">
          {getPlaceholderText()}
        </span>

        <div
          data-id="filterOptionIconContainer"
          className="filter-option-icon-container"
        ></div>
      </div>

      <Modal
        show={detailModalIsVisible}
        onHide={() => hideDetailModal()}
        className="detail-modal-filters"
        dialogClassName="detail-modal-content"
        contentClassName="detail-modal-content"
        scrollable={true}
        // onShow={() => getInitialValues()}
        onExited={() => handleOnExit()}
      >
        <ModalHeader style={{ width: '100%', paddingTop: 15 }}>
          <div
            data-id="detailFilterModalHeader"
            className="detail-filter-modal-header"
          >
            <div
              data-id="secondModalHeaderText"
              className="second-modal-header-text"
            >
              <button
                className="back-arrow-modal"
                onClick={() => hideDetailModal()}
              >
                <img src={arrowLeft} alt="la" height="24" width="24" />
              </button>
              <div className="second-modal-header-text">
                {filterOptionHeader}
              </div>
            </div>
            <div
              data-id="reloadIcon"
              className="reload-icon"
              onClick={() => resetAllFilters()}
            ></div>
          </div>
        </ModalHeader>
        <ModalBody style={{ width: '100%', height: '60%' }}>
          {globalFilterFlag ? (
            <div className="checkbox-list-container">
              <ul style={{ listStyleType: 'none' }}>
                {data.map((item, index) => (
                  <li className="checkbox-listitem-style" key={index}>
                    <input
                      type="radio"
                      className="checkbox-style"
                      id={'item- ${index}'}
                      name="globalFilter"
                      value={item}
                      checked={item == selectedGlobalFilter}
                      onChange={() => handleOnChange(item, index)}
                    />
                    <label
                      className="checkbox-label-style"
                      onClick={() => handleOnChange(item, index)}
                    >
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : filterObject.label != 'price' ? (
            <div className="checkbox-list-container">
              <ul style={{ listStyleType: 'none' }}>
                {localFilterArray.map((item, index) => (
                  <li className="checkbox-listitem-style" key={index}>
                    <input
                      type="checkbox"
                      className="checkbox-style"
                      checked={item.isChecked}
                      onChange={() => handleOnChange(item, index)}
                      id={'item- ${index}'}
                    />
                    <label
                      className="checkbox-label-style"
                      onClick={() => handleOnChange(item, index)}
                    >
                      {item.label}
                      {getDiscountPercExtra()}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="range-container">
              <div>
                <Range
                  min={0}
                  max={filterObject.max}
                  value={[rangeMinValue, rangeMaxValue]}
                  className="price-filter-range"
                  // onAfterChange={values => {setPriceFromAndTo(...values)}}
                  disabled={filterObject.max === 0}
                  onChange={(values) => handleOnChangeRange(values)}
                  allowCross={false}
                  step={filterObject.max / 5}
                  dots={true}
                  marks={{
                    0: '0',
                    [filterObject.max]: filterObject.max.toString(),
                  }}
                  dotStyle={{
                    borderColor: '#e8e9e9',
                    backgroundColor: '#e8e9e9',
                  }}
                  trackStyle={[
                    {
                      backgroundColor: '#47b896',
                    },
                  ]}
                  railStyle={{
                    backgroundColor: '#e8e9e9',
                  }}
                  activeDotStyle={{
                    borderColor: '#47b896',
                    backgroundColor: '#e8e9e9',
                  }}
                />
              </div>
              <div className="range-indicator-container">
                <span>Min: {rangeMinValue}</span>
                <span>Max: {rangeMaxValue}</span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="second-modal-footer-style">
          <div className="footer-button" onClick={() => onSubmit()}>
            <p>Select</p>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
  function getDiscountPercExtra() {
    if (globalFilterFlag === false) {
      if (filterObject.label === 'discountPct') {
        return '% or more';
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  function handleOnChangeRange(values) {
    setRangeMinValue(values[0]);
    setRangeMaxValue(values[1]);
  }
}

export default FilterOption;
