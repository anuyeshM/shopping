// dependencies
import React, { useEffect, useState, useRef, useContext } from 'react';

// utility scripts
import config from '../../commons/config';
import ProductTile from './subcomponent/productTemplate';
import SearchInput from '../search/searchInput';

// misc
import Loader from '../loader/loader';
import './productStyle.css';
import { useHistory } from 'react-router-dom';
import AppContext from '../../commons/context';
import $ from 'jquery';

import { Context as PromoContext } from '../../context/PromoContext';
import { Context as AuthContext } from '../../context/AuthContext';
import api from '../../commons/api';
import Util from '../../commons/util/util';

//filtersData
window.filterData = [];
window.filterCategories = [];
window.filterSubCategories = [];
window.filters = [];
window.selectedCategory = '';
window.selectedSubCategory = '';
window.selectedFilters = [];

export default function Products(props) {
  const history = useHistory();
  const $root = $(document);
  const ClientCart = useContext(AppContext);
  const { state: promoState } = useContext(PromoContext);
  const { state: authState } = useContext(AuthContext);
  const [isWebView] = useState(Util.isWebView());
  const [triggerGetFiltered, setTriggerGetFiltered] = useState(true);
  const [showMoreScreenFilters, setShowMoreScreenFilters] = useState(false);
  const [showScreenFilters, setShowScreenFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productListingData, setProductListingData] = useState({
    productList: [],
    page: 0,
    limit: 10,
  });
  const [filteredProductsData, setFilteredProductsData] = useState({
    filteredProductsList: [],
    page: 0,
    limit: 10,
  });
  const [filterFlag, setFilterFlag] = useState(false);

  const [triggerFiltersBelowSearch, setTriggerFiltersBelowSearch] =
    useState(false);

  const userSearch =
    props.location.state && props.location.state.searchString
      ? props.location.state.searchString
      : '';

  const searchDropdownLoading =
    props.location.state && props.location.state.isLoading
      ? props.location.state.isLoading
      : null;

  const [productSearchString, setProductSearchString] = useState(
    userSearch ? userSearch : ''
  );

  const bottomLineDivRef = useRef();

  const retainIfPreviousVersions = () => {
    /*
    if (void 0 === productSearchString || '' === productSearchString) {
      let pss = window.productSearchString ? window.productSearchString : void 0;
      pss && setProductSearchString(pss);
    }
    */

    if (
      void 0 === props.location.categoryId ||
      '' === props.location.categoryId
    ) {
      let cid = window.categoryId ? window.categoryId : void 0;
      cid && (props.location.categoryId = cid);
    }

    if (
      void 0 === props.location.categoryName ||
      '' === props.location.categoryName
    ) {
      let cnm = window.categoryName ? window.categoryName : void 0;
      cnm && (props.location.categoryName = cnm);
    }
  };

  const handleScroll = (event) => {
    const CONTAINER_HEIGHT = event.target.getBoundingClientRect().height;
    const { top: bottomLineOffsetTop } =
      bottomLineDivRef.current.getBoundingClientRect();

    if (bottomLineOffsetTop <= CONTAINER_HEIGHT + 80) {
      filterFlag ? getFilteredProducts(true) : getProductList(true);
    }
  };

  useEffect(() => {
    getProductList(false);
  }, [props.storecode, productSearchString]);

  useEffect(() => {
    getFilteredProducts();
  }, [triggerGetFiltered]);

  useEffect(() => {
    getFiltersBelowSearch();
  }, [triggerFiltersBelowSearch]);

  useEffect(() => {
    getFilterData();
    if (window.selectedCategory) {
      // window.selectedCategory = props.location.categoryName;
      setShowScreenFilters(true);
      // window.filterSubCategories = [];

      // window.filterData.map((filterDataItem) => {
      //   if (window.selectedCategory === filterDataItem.label) {
      //     if (filterDataItem.subCategories.length > 0) {
      //       filterDataItem.subCategories.map((subCategoryItem) => {
      //         window.filterSubCategories.push(subCategoryItem.label);
      //       });
      //     }
      //   }
      // });
      // console.log('getFilterSubCategories:', window.filterSubCategories);
      getFilteredProducts();
    }

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    sendDataToReactNative();
  }, [window.store]);

  function sendDataToReactNative() {
    if (window.ReactNativeWebView && window.store) {
      window.ReactNativeWebView.postMessage(
        window.store.storename +
          '-' +
          ClientCart.isEmpty() +
          '-' +
          props.storecode
      );
    }
  }

  async function getProductList(isScroll) {
    let ruleId = [];
    promoState.applicablePromo &&
      promoState.applicablePromo.forEach((x) => {
        if (x['call-at'] === 'ONCART') {
          ruleId = x.rule_id;
        }
      });

    const { productList, page, limit } = productListingData;

    // retain last available value
    retainIfPreviousVersions();

    if (
      (void 0 === productSearchString || '' === productSearchString) &&
      (void 0 === props.location.categoryId ||
        '' === props.location.categoryId) &&
      (void 0 === props.location.categoryName ||
        '' === props.location.categoryName)
    ) {
      history.push(`/${props.storecode}`);
    } else {
      //window.productSearchString = productSearchString;
      window.categoryName = props.location.categoryName;
      window.categoryId = props.location.categoryId;

      api
        .get(config.api.productListing, {
          shopId: props.storecode,
          page,
          limit,
          productName: productSearchString,
          productCategory: '',
          // customer: '60b8dcdb865f207b4fb823c7',
          customer: authState.accountID,
          rule_id: JSON.stringify(ruleId),
        })
        .then((data) => {
          if (data.statusCode === 200) {
            if (!isScroll) {
              setProductListingData({
                productList: data.data,
                page: 0,
                limit,
              });
            } else {
              let uniqueProducts = {};

              productList
                .concat(data.data)
                .forEach((x) => (uniqueProducts[x._id] = x));

              setProductListingData({
                productList: Object.values(uniqueProducts),
                page: page + 1,
                limit,
              });
            }
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function getFilterData() {
    function getFilterCategories(response) {
      window.filterCategories = [];
      response.map((item) => {
        window.filterCategories.push(item.label);
      });
      // console.log('getFilterCategories:', window.filterCategories);
    }

    Array.isArray(window.filterData) &&
      0 === window.filterData.length &&
      api
        .post(config.api.productsFilterList, {
          shopId: props.storecode,
        })
        .then((data) => {
          if (data.data) {
            const response = data.data[0].filters;
            // console.log('getfilterdata:', response);
            window.filterData = response;
            getFilterCategories(response);
          }
        })
        .catch((err) => {
          console.log(err);
        });
  }

  function getFilteredProducts(isScroll) {
    // console.log('isscroll', isScroll);
    const { filteredProductsList, page, limit } = filteredProductsData;

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
            if (item.label !== 'price') {
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
            if (item.label !== 'price') {
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
          shopId: props.storecode,
          page,
          limit,
          filters: {
            category: window.selectedCategory,
            subCategory: window.selectedSubCategory,
            attributes: attributesArray,
          },
          rule_id: ruleId,
          // customer: "60b8dcdb865f207b4fb823c7"
          customer: authState.accountID,
        })
        .then((response) => {
          if (response.data) {
            // console.log('filteredProducts', json.data);
            if (response.statusCode === 200) {
              if (!isScroll) {
                setFilteredProductsData({
                  filteredProductsList: response.data,
                  page: 0,
                  limit,
                });
              } else {
                let uniqueProducts = {};

                filteredProductsList
                  .concat(response.data)
                  .forEach((x) => (uniqueProducts[x._id] = x));
                setFilteredProductsData({
                  filteredProductsList: Object.values(uniqueProducts),
                  page: page + 1,
                  limit,
                });
              }
            }
            setFilterFlag(true);
            setProductSearchString('');
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function handleNoProducts() {
    setFilterFlag(false);
  }

  return (
    <div
      data-id='storeListing'
      className='store-listing'
      style={
        isWebView
          ? { height: 'calc(100vh - 10pt' }
          : { height: 'calc(100vh - 60pt' }
      }
      onScroll={(e) => handleScroll(e)}>
      {/* <div className="page-title">{props.location.categoryName}</div> */}
      <SearchInput
        {...props}
        searchStateSetter={setProductSearchString}
        searchString={productSearchString}
        isOverride={false}
        shopId={props.storecode}
        setFilteredProductsData={setFilteredProductsData}
        setFilterFlag={setFilterFlag}
        isLoading={searchDropdownLoading}
        showScreenFilters={showScreenFilters}
        setShowScreenFilters={setShowScreenFilters}
        triggerFiltersBelowSearch={triggerFiltersBelowSearch}
        setTriggerFiltersBelowSearch={setTriggerFiltersBelowSearch}
        setShowMoreScreenFilters={setShowMoreScreenFilters}
      />
      {showScreenFilters ? getFiltersBelowSearch() : null}
      {filterFlag ? (
        filteredProductsData.filteredProductsList.length > 0 ? (
          <div data-id='productListing' className='product-listing'>
            {isLoading ? (
              <Loader />
            ) : (
              filteredProductsData.filteredProductsList.map((item, index) => (
                <ProductTile
                  image={item._source.productImageUrl[0]}
                  productName={item._source.title}
                  price={item._source.price}
                  discountPct={item._source.discountPct}
                  priceAftDiscount={(
                    item._source.price *
                    (1 - item._source.discountPct / 100)
                  ).toFixed(2)}
                  productId={item._id}
                  currency='Rs'
                  prepTime={
                    item._source.prepTime ? item._source.prepTime : null
                  }
                  offer={item._source.offer ? item._source.offer : null}
                  applicableOffer={
                    item._source.applicableOffer
                      ? item._source.applicableOffer
                      : []
                  }
                  key={`key_${index}`}
                />
              ))
            )}
          </div>
        ) : (
          <>{handleNoProducts()}</>
        )
      ) : (
        <div
          data-id='productListing'
          className='product-listing'
          //onScroll={(e) => handleScroll(e)}
        >
          {isLoading ? (
            <Loader />
          ) : (
            productListingData.productList.map((item, index) => (
              <ProductTile
                image={item._source.productImageUrl[0]}
                productName={item._source.title}
                price={item._source.price}
                discountPct={item._source.discountPct}
                priceAftDiscount={(
                  item._source.price *
                  (1 - item._source.discountPct / 100)
                ).toFixed(2)}
                productId={item._id}
                currency='Rs'
                prepTime={item._source.prepTime ? item._source.prepTime : null}
                offer={item._source.offer ? item._source.offer : null}
                key={`key_${index}`}
              />
            ))
          )}
        </div>
      )}
      <div className='product-card' ref={bottomLineDivRef}></div>
    </div>
  );
  function getFiltersBelowSearch() {
    return (
      <div>
        <div
          className={
            showMoreScreenFilters
              ? 'filter-searchBox filter-searchBox-dropdown'
              : 'filter-searchBox'
          }
          data-id='filterSearchBox'>
          <div className='allFilters-container'>
            {window.selectedCategory ? (
              <div className='filter-item-container'>
                <div className='filter-item-container-text'>
                  {window.selectedCategory}
                </div>
                <div
                  className='filter-item-icon-container-searchBox'
                  onClick={() => {
                    resetAllFilters('Category');
                    setFilteredProductsData({
                      filteredProductsList: [],
                      page: 0,
                      limit: 10,
                    });
                    setShowScreenFilters(false);
                  }}></div>
              </div>
            ) : null}
            {window.selectedSubCategory ? (
              <div className='filter-item-container'>
                <div className='filter-item-container-text'>
                  {window.selectedSubCategory}
                </div>
                <div
                  className='filter-item-icon-container-searchBox'
                  onClick={() => {
                    resetAllFilters('SubCategory');
                  }}></div>
              </div>
            ) : null}
            {window.selectedFilters
              ? window.selectedFilters.map((item, index) => (
                  <div key={index}>
                    {item.label !== 'price' ? (
                      item.options.map((optionItem, optionIndex) => (
                        <div
                          className='filter-item-container'
                          key={optionIndex}>
                          <div className='filter-item-container-text'>
                            {optionItem}
                            {item.label === 'discountPct' && ' %'}
                          </div>
                          <div
                            className='filter-item-icon-container-searchBox'
                            onClick={() => {
                              handleRemoveFilterTwo(
                                false,
                                index,
                                optionIndex,
                                true
                              );
                            }}></div>
                        </div>
                      ))
                    ) : (
                      <div className='filter-item-container'>
                        {/* {console.log('this run')} */}
                        <div className='filter-item-container-text'>
                          ₹ {item.min} - {item.max}
                        </div>
                        <div
                          className='filter-item-icon-container-searchBox'
                          onClick={() => {
                            handleRemoveFilterTwo(true, index, null, true);
                            setTriggerGetFiltered(!triggerGetFiltered);
                          }}></div>
                      </div>
                    )}
                  </div>
                ))
              : null}
          </div>
        </div>
        {window.selectedFilters.length > 0 ? (
          <div className='showMore-button-container'>
            {/* {console.log('are we inside', showMoreScreenFilters)} */}
            <span
              className='showMore-button'
              onClick={() => {
                setShowMoreScreenFilters(!showMoreScreenFilters);
                setTriggerFiltersBelowSearch(triggerFiltersBelowSearch);
              }}>
              {showMoreScreenFilters ? 'Show Less' : 'Show More'}
            </span>
          </div>
        ) : null}
      </div>
    );
  }
  function resetAllFilters(indicator) {
    if (indicator === 'Category') {
      window.selectedCategory = '';
      window.selectedSubCategory = '';
      window.filterSubCategories = [];
      window.selectedFilters = [];
      window.filters = [];
    } else if (indicator === 'SubCategory') {
      window.selectedSubCategory = '';
      window.filters = [];
      window.selectedFilters = [];
      setTriggerGetFiltered(!triggerGetFiltered);
      setTriggerFiltersBelowSearch(!triggerFiltersBelowSearch);
    }
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
    setTriggerGetFiltered(!triggerGetFiltered);
    setTriggerFiltersBelowSearch(!triggerFiltersBelowSearch);
  }
}
