// dependencies
import React, { useEffect, useState } from 'react';

import {
  Route,
  HashRouter,
  Switch,
  useParams,
  useRouteMatch,
  useHistory,
} from 'react-router-dom';

// utility scripts
import PushAlert from '../../commons/notification';
import config from '../../commons/config';

// components
import Header from '../../components/header/headerComponent';
import ProductCategory from '../../components/productCategory/categoryComponent';
import Products from '../../components/products/productComponent';
import Scanner from '../../components/scanner/scannerComponent';
import SwitchToApp from '../../components/misc/switchToApp';
import ProductDetails from '../../components/productDetails/detailsComponent';

// misc
import './homeStyle.css';
import api from '../../commons/api';
import Util from '../../commons/util/util';

export default function Home(props) {
  const params = useParams();
  const rootPath = useRouteMatch();
  const history = useHistory();
  const [isWebView] = useState(Util.isWebView());
  const [headerParams, setHeaderParams] = useState({
    gobackEnabled: true,
    showScanner: true,
    showCart: true,
    staticHeaderText: true,
    isHomeScreen: true,
    gobackLinkRef: '',
    headerText: '',
    headerTextLinkRef: '',
    storecode: '',
    rootPath: rootPath.url,
  });

  useEffect(() => {
    const storecode = props.match.params.storecode;

    function loadBrandLogo(storecode) {
      const reqPath = config.api.storeLogo.replace('{{storecode}}', storecode);
      api
        .get(reqPath)
        .then((resJson) => {
          if (resJson.data) {
            window.store = {
              storename: resJson.data.storeDisplayName
                ? resJson.data.storeDisplayName
                : 'Store',
              storecode: storecode,
            };

            setHeaderParams({
              gobackEnabled: true,
              showScanner: true,
              showCart: true,
              staticHeaderText: false,
              isHomeScreen: true,
              gobackLinkRef: '',
              headerText: window.store.storename,
              headerTextLinkRef: window.store.storecode,
              storecode: window.store.storecode,
              rootPath: rootPath.url,
            });

            if (document.querySelector('.header .header-static img'))
              document.querySelector('.header .header-static img').src =
                resJson.data.shopBrandImageUrl;
          } else {
            history.push('/notfound');
          }
        })
        .catch((err) => {
          console.log('ERROR in rendering brand logo => ', err);
          PushAlert.error(
            `It's not you, it's us. We're working super fast on resolving this issue...`
          );
        });
    }

    loadBrandLogo(storecode);
  }, [props.match.params.storecode]);

  return (
    <HashRouter>
      <div data-id='gmcl' className='gmcl'>
        {isWebView ? null : <Header {...headerParams} />}
        <div
          data-id='content'
          className={isWebView ? 'webview-content' : 'content'}>
          <Switch>
            <Route
              exact
              path={`${rootPath.url}`}
              render={(props) => (
                <ProductCategory storecode={params.storecode} {...props} />
              )}
            />
            <Route
              exact
              path={`${rootPath.url}/products`}
              render={(props) => (
                <Products storecode={params.storecode} {...props} />
              )}
            />
            <Route
              exact
              path={`${rootPath.url}/scanner`}
              render={(props) => (
                <Scanner storecode={params.storecode} {...props} />
              )}
            />
            <Route
              exact
              path={`${rootPath.url}/products/detail/:prodId`}
              render={(props) => (
                <ProductDetails storecode={params.storecode} {...props} />
              )}
            />
          </Switch>
          <Route exact path={`${rootPath.url}`} component={SwitchToApp} />
        </div>
      </div>
    </HashRouter>
  );
}
