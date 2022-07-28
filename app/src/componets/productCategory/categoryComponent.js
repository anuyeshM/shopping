// dependencies
import React, { useContext, useEffect, useState } from 'react';
import OfferBanner from './subcomponent/offerBanner';
import ProductClassification from './subcomponent/productClassification';
import CategoryItem from './subcomponent/categoryItem';
import config from '../../commons/config';
import SearchInput from '../search/searchInput';
import { Context as PromoContext } from '../../context/PromoContext';
import { Context as AuthContext } from '../../context/AuthContext';

// misc
import Loader from '../loader/loader';
import './categoryStyle.css';
import AppContext from '../../commons/context';
import api from '../../commons/api';

function ProductCategoryRaw(props) {
  const ClientCart = useContext(AppContext);
  const { state: promoState } = useContext(PromoContext);
  const { state: authState } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [productSearchString, setProductSearchString] = useState('');

  const checkPayRedir = () => {
    const redirStr = window.sessionStorage.getItem('payRedir');

    if (
      !(
        void 0 === redirStr ||
        '' === redirStr ||
        ' ' === redirStr ||
        null === redirStr
      )
    ) {
      const redirObj = JSON.parse(redirStr);

      ClientCart.set(redirObj);
    }

    window.sessionStorage.setItem('payRedir', '');
  };

  useEffect(() => {
    // clear category state
    window.categoryName = '';
    window.categoryId = '';

    function loadStoreCategories() {
      let ruleId = [];
      promoState.applicablePromo &&
        promoState.applicablePromo.forEach((x) => {
          if (x['call-at'] === 'ONCART') {
            ruleId = x.rule_id;
          }
        });
      api
        .post(config.api.productCategory, {
          id: props.storecode,
          rule_id: ruleId,
          // customer: "60b8dcdb865f207b4fb823c7",
          customer: authState.accountID,
        })
        .then((data) => {
          if (data.data) {
            setCategoryList(data.data);
            setIsLoading(false);
          }
        })
        .catch((err) => console.log(err));
    }

    // load product listing for store
    loadStoreCategories();

    // check for payment redirections
    checkPayRedir();

    window.scrollTo(0, 0);
  }, [props.storecode]);

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

  return (
    <div data-id='storeCategoryWrapper' className='store-category-wrapper'>
      {isLoading ? (
        <div style={{ paddingTop: '2rem', textAlign: 'center' }}>
          <Loader />
        </div>
      ) : (
        <div data-id='storeCategory' className='store-category'>
          <div style={{ height: '4rem' }}>
            <SearchInput
              {...props}
              shopId={props.storecode}
              searchStateSetter={setProductSearchString}
              searchString={productSearchString}
              isOverride={true}
            />
          </div>
          {0 === categoryList.offers.length ? (
            ''
          ) : (
            <div className='offer-container'>
              <div
                className='horz-scroll-offer'
                style={{
                  gridTemplateColumns: `repeat(
                    ${categoryList.offers.length}, 
                    ${1 === categoryList.offers.length ? '90vw' : '17rem'}
                  )`,
                }}>
                {categoryList.offers.map((item, index) => (
                  <OfferBanner
                    storecode={props.storecode}
                    {...item}
                    key={`offer_${index}`}
                  />
                ))}
              </div>
            </div>
          )}
          {0 === categoryList.classification.length ? (
            ''
          ) : (
            <div className='classification-container'>
              <div
                className='horz-scroll-classification'
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    4,
                    categoryList.classification.length
                  )}, 5rem)`,
                }}>
                {categoryList.classification.map((item, index) => (
                  <ProductClassification
                    storecode={props.storecode}
                    {...item}
                    key={`classification_${index}`}
                  />
                ))}
              </div>
            </div>
          )}
          {0 === categoryList.categories.length ? (
            ''
          ) : (
            <div className='category-container'>
              {categoryList.categories.map((item, index) => (
                <CategoryItem
                  storecode={props.storecode}
                  {...item}
                  key={`category_${index}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ProductCategory = React.memo(ProductCategoryRaw);

export default ProductCategory;
