import React, { useEffect, useState, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import ModalFooter from 'react-bootstrap/ModalFooter';
import ModalHeader from 'react-bootstrap/ModalHeader';
import ModalBody from 'react-bootstrap/ModalBody';
import { useHistory } from 'react-router-dom';
import { Context as PromoContext } from '../../context/PromoContext';
import { Context as AuthContext } from '../../context/AuthContext';

//css
import './searchInputStyle.css';

//components
import config from '../../commons/config';
import FilterOption from './filterOption';
import PushAlert from '../../commons/notification';
import api from '../../commons/api';

const SearchInput = (props) => {
  const { state: promoState } = useContext(PromoContext);
  const { state: authState } = useContext(AuthContext);
  const { isOverride } = props;
  const { searchStateSetter } = props;
  const { shopId } = props;
  const { setFilterFlag } = props;
  const { setFilteredProductsData } = props;
  const { setShowScreenFilters } = props;
  const { triggerFiltersBelowSearch } = props;
  const { setTriggerFiltersBelowSearch } = props;
  const { setShowMoreScreenFilters } = props;

  // State and setter for search term
  const [searchString, setsearchString] = useState(
    props.searchString ? props.searchString : ''
  );

  // State and setter for search results
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(
    props.isLoading ? props.isLoading : true
  );
  const [transitionFlag, setTransitionFlag] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [triggerFooter, setTriggerFooter] = useState(false);

  const [isSearchOverride, setIsSearchOverride] = useState(
    props.location.state && props.location.state.isSearchOverride
      ? props.location.state.isSearchOverride
      : false
  );

  //**contains function for searchResults API */
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchString && !isSearchOverride) {
        // console.log('api search results called', searchString);
        api
          .get(config.api.searchSuggestions, { searchString, shopId })
          .then((response) => {
            if (response.data) {
              setSearchResults(response.data.suggestions);
              setIsLoading(false);
            }
          })
          .catch((err) => {
            console.log(err);
            setSearchResults([]);
            setIsLoading(true);
          });
      } else {
        setIsSearchOverride(false);
        setSearchResults([]);
        setIsLoading(true);
      }
    }, config.ux.throttleControl);

    return () => clearTimeout(handler);
  }, [searchString]);

  useEffect(() => {
    getFooterCategories();
    getFooterSubCategories();
    getFooterFilters();
    showSubCategories();
    showFilters();
    getCount();
  }, [triggerFooter]);

  function getFilteredProducts() {
    if (window.selectedCategory) {
      let ruleId = [];
      promoState.applicablePromo &&
        promoState.applicablePromo.forEach((x) => {
          if (x['call-at'] === 'ONCART') {
            ruleId = x.rule_id;
          }
        });

      const attributesArray = [];
      if (window.selectedFilters) {
        window.selectedFilters.map((item) => {
          let attributeObject = {};
          const response = item.hasOwnProperty('attribute');
          if (response) {
            if (item.label != 'price') {
              attributeObject = {
                attribute: item.attribute,
                type: item.label,
                value: item.options,
              };
            } else {
              attributeObject = {
                attribute: item.attribute,
                type: item.label,
                min: item.min,
                max: item.max,
              };
            }
          } else {
            if (item.label != 'price') {
              attributeObject = {
                type: item.label,
                value: item.options,
              };
            } else {
              attributeObject = {
                type: item.label,
                min: item.min,
                max: item.max,
              };
            }
          }
          attributesArray.push(attributeObject);
        });
      }

      api
        .post(config.api.filteredProductsList, {
          shopId,
          filters: {
            category: window.selectedCategory,
            subCategory: window.selectedSubCategory,
            attributes: attributesArray,
          },
          rule_id: ruleId,
          // customer: "60b8dcdb865f207b4fb823c7",
          customer: authState.accountID,
        })
        .then((data) => {
          if (data.data) {
            if (setFilteredProductsData) {
              setFilteredProductsData({
                filteredProductsList: data.data,
                page: 0,
                limit: 10,
              });
              setFilterFlag(true);
            } else {
              resetAllFilters('Category');
            }

            setsearchString('');
            if (data.data.length === 0) {
              resetAllFilters('Category');
            }

            setModalIsVisible(false);
          } else {
            PushAlert.info(`No Products found!\n Please select other filters.`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      if (!isOverride) {
        {
          // console.log('selectedCatgory', window.selectedCategory);
        }
        setFilteredProductsData({
          filteredProductsList: [],
          page: 0,
          limit: 10,
        });
        setModalIsVisible(false);
        setShowScreenFilters(false);
      }
    }
  }

  //**function to get subCategory in seperate array */
  function getSubCategory() {
    window.selectedSubCategory = '';
    window.filterSubCategories = [];
    window.selectedFilters = [];
    window.filters = [];

    if (window.selectedCategory !== '') {
      window.filterData.map((filterDataItem) => {
        if (window.selectedCategory === filterDataItem.label) {
          if (filterDataItem.subCategories.length > 0) {
            filterDataItem.subCategories.map((subCategoryItem) => {
              window.filterSubCategories.push(subCategoryItem.label);
            });
          }
        }
      });
    } else {
      window.filterSubCategories = [];
      window.selectedFilters = [];
    }
    // console.log('getSubCategory', window.filterSubCategories);
    if (window.filterSubCategories.length) setTriggerFooter(!triggerFooter);
  }

  //**function to get labels in seperate array */
  function getLabels() {
    window.selectedFilters = [];
    window.filters = [];
    // console.log('getLabel Triggered', window.filterData);
    if (window.selectedCategory !== '' && window.selectedSubCategory !== '') {
      for (var i = 0; i < window.filterData.length; i++) {
        if (window.filterData[i].label === window.selectedCategory) {
          for (var k = 0; k < window.filterData[i].subCategories.length; k++) {
            if (
              window.filterData[i].subCategories[k].label ===
              window.selectedSubCategory
            ) {
              for (
                var n = 0;
                n < window.filterData[i].subCategories[k].filters.length;
                n++
              ) {
                window.filters.push(
                  window.filterData[i].subCategories[k].filters[n]
                );
              }
            }
          }
        }
      }
    } else {
      PushAlert.info(
        'No Filters available.\nPlease select another Category or SubCategory!'
      );
    }

    // console.log('getLabel', window.filters);
    if (window.filters) setTriggerFooter(!triggerFooter);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      if (isOverride) {
        props.history.push({
          pathname: `/${props.storecode}/products`,
          state: {
            searchString,
            isSearchOverride: true,
          },
        });
        // searchStateSetter(searchString);
        searchStateSetter(searchString);
        setIsLoading(true);
      } else {
        searchStateSetter(searchString);
        setIsLoading(true);
        if (isOverride === false) {
          setFilteredProductsData({
            filteredProductsList: [],
            page: 0,
            limit: 10,
          });
          setFilterFlag(false);
          setShowScreenFilters(false);
          resetAllFilters('Category', true);
        }
      }
    } else if (event.keyCode === 8) {
      setIsLoading(false);
    }
  }

  function handleListItemClick(e) {
    if (isOverride) {
      props.history.push({
        pathname: `/${props.storecode}/products`,
        state: {
          searchString: e.target.innerHTML.replace(/(<([^>]+)>)/gi, ''),
        },
      });
    } else {
      setShowScreenFilters(false);
      resetAllFilters('Category', true);
      setsearchString(e.target.innerHTML.replace(/(<([^>]+)>)/gi, ''));
      searchStateSetter(e.target.innerHTML.replace(/(<([^>]+)>)/gi, ''));
      setIsLoading(true);
      if (isOverride === false) {
        setFilteredProductsData({
          filteredProductsList: [],
          page: 0,
          limit: 10,
        });
      }
    }
  }

  function getBoldedText(suggestion, searchString) {
    if (
      suggestion.toLowerCase().indexOf(searchString.toLowerCase()) > -1 &&
      searchString.length > 0
    ) {
      const main = suggestion;
      const val =
        main.slice(0, main.toLowerCase().indexOf(searchString.toLowerCase())) +
        '<b>' +
        searchString +
        '</b>' +
        main.slice(
          main.toLowerCase().indexOf(searchString.toLowerCase()) +
            searchString.length,
          main.length
        );

      return (
        <div>
          <span dangerouslySetInnerHTML={{ __html: val }} />
        </div>
      );
    } else {
      return <span>{suggestion}</span>;
    }
  }

  function resetAllFilters(indicator, isScreenFilters) {
    if (isScreenFilters) {
      if (indicator === 'Category') {
        window.selectedCategory = '';
        window.selectedSubCategory = '';
        window.filterSubCategories = [];
        window.selectedFilters = [];
        window.filters = [];

        setTriggerFooter(!triggerFooter);
      } else if (indicator === 'SubCategory') {
        window.selectedSubCategory = '';
        window.filters = [];

        window.selectedFilters = [];
        setTriggerFooter(!triggerFooter);
      }
    } else {
      if (indicator === 'Category') {
        window.selectedCategory = '';
        window.selectedSubCategory = '';
        window.filterSubCategories = [];
        window.selectedFilters = [];
        window.filters = [];

        setTriggerFooter(!triggerFooter);
      } else if (indicator === 'SubCategory') {
        window.selectedSubCategory = '';
        window.filters = [];

        window.selectedFilters = [];
        setTriggerFooter(!triggerFooter);
      }
    }
  }

  function getCount() {
    if (window.selectedCategory) {
      if (window.selectedSubCategory) {
        if (window.selectedFilters) {
          setSelectedCount(2 + getFiltersLength());
        } else {
          setSelectedCount(2);
        }
      } else {
        setSelectedCount(1);
      }
    } else {
      setSelectedCount(0);
    }

    function getFiltersLength() {
      let count = 0;
      window.selectedFilters.forEach((element) => {
        if (element.label === 'price') {
          count = count + 1;
        } else {
          count = count + element.options.length;
        }
      });
      return count;
    }
  }

  function onApply() {
    setShowScreenFilters(true);
    if (window.selectedFilters.length > 0) {
      setShowMoreScreenFilters(true);
    }
    getFilteredProducts();
    setTriggerFiltersBelowSearch(!triggerFiltersBelowSearch);
  }

  function determineSubCategory() {
    if (window.selectedCategory) {
      // console.log('i am inside here', window.filterSubCategories.length);
      if (!window.filterSubCategories.length > 0) {
        // console.log('i am inside');
        window.filterData.map((filterDataItem) => {
          if (window.selectedCategory === filterDataItem.label) {
            if (filterDataItem.subCategories.length > 0) {
              filterDataItem.subCategories.map((subCategoryItem) => {
                window.filterSubCategories.push(subCategoryItem.label);
              });
            }
          }
        });
      }
    }
    setTriggerFooter(!triggerFooter);
  }

  return (
    <div>
      <div
        className={isOverride ? 'search-filter' : 'search-filter-productsPage'}>
        <div data-id='searchIcon' className='search-icon'></div>
        <div data-id='searchInputWrapper' className='search-input-wrapper'>
          <input
            type='search'
            data-id='searchInput'
            className='no-select search-input'
            placeholder='Search items'
            value={searchString}
            onChange={(e) => setsearchString(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
        </div>
        {isOverride ? null : (
          <div
            data-id='filterProduct'
            className='filter-product'
            onClick={() => {
              setModalIsVisible(true);
            }}></div>
        )}
        {!isLoading && searchResults.length > 0 ? (
          <div
            data-id='searchSuggestions'
            className='search-suggestions-container'>
            {searchResults && (
              <ul className='searchResultList'>
                {searchResults.map((item, index) => (
                  <li
                    className='searchResultListItem'
                    key={`key_${index}`}
                    onClick={handleListItemClick}>
                    {getBoldedText(item, searchString)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <Modal
          show={modalIsVisible}
          onHide={() => setModalIsVisible(false)}
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
          scrollable={true}
          onEnter={() => determineSubCategory()}>
          <div className='filter-modal-content'>
            <div
              data-id='modalCloseLineContainer'
              className='modal-close-line-container'
              draggable={true}
              // onDragEnd={() => setModalIsVisible(false)}
              onClick={() => setModalIsVisible(false)}
              onTouchEnd={() => setModalIsVisible(false)}>
              <span
                data-id='modalCloseLine'
                className='modal-close-line'></span>
            </div>
            <ModalHeader style={{ width: '100%' }}>
              <div data-id='filterModalHeader' className='filter-modal-header'>
                <div
                  data-id='filterModalHeaderText'
                  className='filter-modal-header-text'>
                  Filters
                </div>
                <div
                  data-id='reloadIcon'
                  className='reload-icon'
                  onClick={() => resetAllFilters('Category')}></div>
              </div>
            </ModalHeader>
            <ModalBody className='filter-modal-body-style'>
              <FilterOption
                transitionFlagSetter={setTransitionFlag}
                filterOptionHeader={'Shop Category'}
                globalFilterFlag={true}
                secondaryGlobalFilterFlag={'Category'}
                getSubCategory={() => getSubCategory()}
                data={window.filterCategories}
                getCount={() => getCount()}
              />
              {showSubCategories()}
              {showFilters()}
            </ModalBody>
          </div>
          <ModalFooter className='filter-modal-footer-style'>
            <div className='allFilters-container'>
              {getFooterCategories()}
              {getFooterSubCategories()}
              {getFooterFiltersTwo()}
              {/* {getFooterFilters()} */}
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
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
  function getFooterCategories() {
    return window.selectedCategory != '' ? (
      <div className='filter-item-container'>
        <div className='filter-item-container-text'>
          {window.selectedCategory}
        </div>
        <div
          className='filter-item-icon-container'
          onClick={() => resetAllFilters('Category')}></div>
      </div>
    ) : null;
  }
  function getFooterSubCategories() {
    return window.selectedSubCategory != '' ? (
      <div className='filter-item-container'>
        <div className='filter-item-container-text'>
          {window.selectedSubCategory}
        </div>
        <div
          className='filter-item-icon-container'
          onClick={() => resetAllFilters('SubCategory')}></div>
      </div>
    ) : null;
  }
  function getFooterFilters() {
    return window.selectedFilters.map((item, index) => (
      <div className='filter-item-container' key={index}>
        <div className='filter-item-container-text'>{item.label}</div>
        <div
          className='filter-item-icon-container'
          onClick={() => handleRemoveFilter(index)}></div>
      </div>
    ));
  }
  function getFooterFiltersTwo() {
    return window.selectedFilters
      ? window.selectedFilters.map((item, index) => (
          <div key={index} style={{ display: 'contents' }}>
            {item.label != 'price' ? (
              item.options.map((optionItem, optionIndex) => (
                <div className='filter-item-container' key={optionIndex}>
                  <div>
                    {optionItem}
                    {item.label === 'discountPct' && ' %'}
                  </div>
                  <div
                    className='filter-item-icon-container'
                    onClick={() =>
                      handleRemoveFilterTwo(false, index, optionIndex)
                    }></div>
                </div>
              ))
            ) : (
              <div className='filter-item-container'>
                <div className='filter-item-container-text'>
                  ₹ {item.min} - {item.max}
                </div>
                <div
                  className='filter-item-icon-container'
                  onClick={() => {
                    handleRemoveFilterTwo(true, index);
                  }}></div>
              </div>
            )}
          </div>
        ))
      : null;
  }
  function handleRemoveFilter(index) {
    window.selectedFilters.splice(index, 1);
    setTriggerFooter(!triggerFooter);
  }
  function handleRemoveFilterTwo(isPrice, index, optionIndex) {
    let localAr = JSON.parse(JSON.stringify(window.selectedFilters));
    if (!isPrice) {
      localAr[index].options.splice(optionIndex, 1);
      if (!localAr[index].options.length) {
        localAr.splice(index, 1);
      }
    } else {
      localAr.splice(index, 1);
    }
    window.selectedFilters = localAr;
    setTriggerFooter(!triggerFooter);
  }
  function showSubCategories() {
    return window.filterSubCategories.length ? (
      <FilterOption
        transitionFlagSetter={setTransitionFlag}
        filterOptionHeader={'Sub Category'}
        globalFilterFlag={true}
        secondaryGlobalFilterFlag={'SubCategory'}
        getLabels={() => getLabels()}
        data={window.filterSubCategories}
        getCount={() => getCount()}
      />
    ) : null;
  }
  function showFilters() {
    return window.filters.length
      ? window.filters.map((item, index) => (
          <FilterOption
            key={index}
            transitionFlagSetter={setTransitionFlag}
            filterOptionHeader={item.label}
            filterObject={item}
            globalFilterFlag={false}
            getCount={() => getCount()}
            triggerFooter={triggerFooter}
            setTriggerFooter={setTriggerFooter}
          />
        ))
      : null;
  }
};

export default SearchInput;
