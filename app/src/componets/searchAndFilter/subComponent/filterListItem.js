import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

import './filterListItem.css';
import arrowLeft from '../../../assets/images/arrowLeft.svg';

export default function FilterListItem({
  parentLabel,
  values,
  label,
  selectedFilters,
  setSelectedFilters,
  transitionFlagSetter,
  type,
  setSelectedCount,
  selectedCount,
}) {
  const [showModalTwo, setShowModalTwo] = useState(false);
  const [localFilterArray, setLocalFilterArray] = useState([]);

  function showDetailModal() {
    transitionFlagSetter(true);
    setShowModalTwo(true);
    getInitialValues();
  }

  function hideDetailModal() {
    setShowModalTwo(false);
    transitionFlagSetter(false);
  }

  function getInitialValues() {
    // console.log('parentLabel', parentLabel);
    let localAr = [];
    values.forEach((item) => {
      localAr.push({ label: item, isChecked: false });
    });

    selectedFilters.length &&
      selectedFilters.forEach((i) => {
        if (parentLabel === i.parentLabel)
          i.values.forEach((j) => {
            localAr.forEach((k) => {
              if (j === k.label) k.isChecked = true;
            });
          });
      });

    setLocalFilterArray([...localAr]);
  }

  function onSubmit() {
    const localAr = JSON.parse(JSON.stringify(localFilterArray));
    const selectedArray = [];
    localAr.forEach((i) => {
      if (i.isChecked == true) {
        selectedArray.push(i.label);
      }
    });
    // console.log('selected', selectedArray);

    let present = false;
    let spliceItem = false;
    let localSelectedAr = selectedFilters;

    if (selectedArray.length == 0) spliceItem = true;

    if (localSelectedAr.length) {
      localSelectedAr.map((selectedItem, index) => {
        if (selectedItem.parentLabel === parentLabel) {
          present = true;
          if (spliceItem) {
            localSelectedAr.splice(index, 1);
          } else {
            selectedItem.values = selectedArray;
          }
        }
      });
    }
    if (!present) {
      localSelectedAr.push({
        parentLabel: parentLabel,
        label: label,
        values: selectedArray,
      });
    }

    // console.log('object', localSelectedAr);
    setSelectedFilters(localSelectedAr);
    var count = 0;
    localSelectedAr.forEach((i) => {
      count = count + i.values.length;
    });
    setSelectedCount(count);
    hideDetailModal();
  }

  function handleOnChange(item, index) {
    const array = localFilterArray;
    if (array[index].isChecked == true) {
      array[index].isChecked = false;
    } else {
      array[index].isChecked = true;
    }
    setLocalFilterArray([...array]);
  }

  function resetList() {
    let array = localFilterArray;
    array.map((item) => {
      item.isChecked = false;
    });
    setLocalFilterArray([...array]);
  }

  function getPlaceholderText() {
    let localStr = [];
    let present = false;
    if (selectedFilters.length) {
      selectedFilters.forEach((i) => {
        if (i.parentLabel === parentLabel) {
          present = true;
          localStr = i.values.join(',  ');
        }
      });
    }
    if (!present) {
      return <span className="placeholder-text-select">Select {label}</span>;
    } else {
      return <span className="placeholder-text">{localStr}</span>;
    }
  }
  return (
    <div className="filterOption">
      <span
        data-id="filterOptionHeaderContainer"
        className="filterOptionHeaderContainer"
      >
        {label}
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
        show={showModalTwo}
        onHide={() => setShowModalTwo(false)}
        className="detail-modal-filters"
        dialogClassName="detail-modal-content"
        contentClassName="detail-modal-content"
        scrollable={true}
        onShow={() => getInitialValues()}
      >
        <div style={{ width: '100%', paddingTop: 15 }}>
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
              <div className="second-modal-header-text">{label}</div>
            </div>
            <div
              data-id="reloadIcon"
              className="reload-icon"
              onClick={() => resetList()}
            ></div>
          </div>
        </div>
        <div style={{ width: '100%', height: '60%' }}>
          {
            (type = 'checkbox' ? (
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
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null)
          }
        </div>
        <div className="second-modal-footer-style">
          <div className="footer-button" onClick={() => onSubmit()}>
            <p>Select</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
