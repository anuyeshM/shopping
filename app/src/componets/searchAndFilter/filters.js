import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';

import './filters.css';
import arrowLeft from '../../assets/images/arrowLeft.svg';

import FilterListItem from './subComponent/filterListItem';
import config from '../../commons/config';
import PushAlert from '../../commons/notification';
import api from '../../commons/api';

export default function Filters(props) {
  const { filterList } = props;
  const { setStoreList } = props;
  const { setShowBannerTabs } = props;
  const { storeData } = props;
  const { setSelectedFiltersParent } = props;
  const { selectedFiltersParent } = props;
  const { setShowScreenFilters } = props;
  // console.log('filterList', filterList);
  // if (filterList) console.log('filterList', filterList);

  const [showModalOne, setShowModalOne] = useState(false);
  const [transitionFlag, setTransitionFlag] = useState(false);
  const [triggerFooter, setTriggerFooter] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState(selectedFiltersParent);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    getFooterFilters();
    var count = 0;
    selectedFilters.forEach((i) => {
      count = count + i.values.length;
    });
    setSelectedCount(count);
  }, [triggerFooter]);

  function triggerModalOne() {
    setShowModalOne(!showModalOne);
  }
  return (
    <div>
      <div
        className='filterIcon-container'
        onClick={() => triggerModalOne()}></div>
      <Modal
        show={showModalOne}
        onHide={() => setShowModalOne(false)}
        className='filter-modal-filters'
        dialogClassName={
          transitionFlag
            ? 'filter-modal-dialog display-none-css'
            : 'filter-modal-dialog'
        }
        contentClassName={
          transitionFlag
            ? 'filter-modal-content filter-modal-content-display'
            : 'filter-modal-content'
        }
        // scrollable={true}

        // onExited={() => handleDisplayModal()}
      >
        <div className='filter-modal-content'>
          <div
            data-id='modalCloseLineContainer'
            className='modal-close-line-container'
            draggable={true}
            // onDragEnd={() => setModalIsVisible(false)}
            onClick={() => {
              triggerModalOne();
              // console.log('onclick', showModalOne);
            }}
            onTouchEnd={() => triggerModalOne()}>
            <span data-id='modalCloseLine' className='modal-close-line'></span>
          </div>
          <div style={{ width: '100%' }}>
            <div data-id='filterModalHeader' className='filter-modal-header'>
              <div
                data-id='storefilterModalHeaderText'
                className='store-filter-modal-header-text'>
                <button
                  className='back-arrow-modal'
                  onClick={() => triggerModalOne()}>
                  <img src={arrowLeft} alt='la' height='24' width='24' />
                </button>
                <span>Filters</span>
              </div>
              <div
                data-id='reloadIcon'
                className='reload-icon'
                onClick={() => {
                  setSelectedFilters([]);
                  setTriggerFooter(!triggerFooter);
                  setSelectedCount(0);
                }}></div>
            </div>
          </div>
          <div className='filter-modal-body-style'>
            {filterList.map((item, index) => (
              <FilterListItem
                key={index}
                parentLabel={item.parentLabel}
                label={item.label}
                values={item.values}
                type={'checkbox'}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                transitionFlagSetter={setTransitionFlag}
                selectedCount={selectedCount}
                setSelectedCount={setSelectedCount}
              />
            ))}
          </div>
          <div className='filter-modal-footer-style'>
            <div className='allFilters-container'>
              {/* {getFooterCategories()}
              {getFooterSubCategories()}
              {getFooterFiltersTwo()} */}
              {/* {getFooterFilters()} */}
              {getFooterFilters()}
            </div>

            <div className='footer-button-container'>
              <div
                className='footer-button'
                onClick={() => {
                  onApply();
                }}>
                <span className='footer-button-text'>
                  Apply {selectedCount > 0 ? '(' + selectedCount + ')' : null}
                </span>
                {/* {getCountDiv()} */}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
  function handleRemoveFilter(index, optionIndex) {
    let localAr = JSON.parse(JSON.stringify(selectedFilters));
    localAr[index].values.splice(optionIndex, 1);
    if (!localAr[index].values.length) {
      localAr.splice(index, 1);
    }
    setSelectedFilters(localAr);
    setSelectedCount(selectedCount - 1);
    setTriggerFooter(!triggerFooter);
  }
  function getFooterFilters() {
    return selectedFilters.map((item, index) =>
      item.values.map((option, optionIndex) => (
        <div className='filter-item-container' key={optionIndex}>
          <div className='filter-item-container-text'>{option}</div>
          <div
            className='filter-item-icon-container'
            onClick={() => handleRemoveFilter(index, optionIndex)}></div>
        </div>
      ))
    );
  }
  function onApply() {
    const convertArrayToObject = (array, key) => {
      const initialValue = {};
      return array.reduce((obj, item) => {
        return {
          ...obj,
          [item[key]]: item.values,
        };
      }, initialValue);
    };

    let localObj = {};
    let localAr = JSON.parse(JSON.stringify(selectedFilters));
    localObj = convertArrayToObject(localAr, 'parentLabel');

    if (selectedFilters.length) {
      api
        .post(config.api.getFilteredStores, localObj)
        .then((response) => {
          if (response.data) {
            const response = response.data;
            // console.log('filteredStores:', response);
            setStoreList(response);
            setSelectedFiltersParent(selectedFilters);
            setShowScreenFilters(true);
            setShowModalOne(false);
            setShowBannerTabs(false);
          } else {
            PushAlert.info(`No Stores found!\n Please select other filters.`);
            setSelectedFilters([]);
            setSelectedCount(0);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setShowBannerTabs(true);
      setStoreList(storeData);
      setShowModalOne(false);
      setSelectedFiltersParent([]);
      setShowScreenFilters(false);
    }
  }
}
