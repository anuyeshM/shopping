import React, { useState, useEffect, useContext } from 'react';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

//misc
import Loader from '../loader/loader';
import config from '../../commons/config';

import AppContext from '../../commons/context';
import CategoryContent from './subComponent/categoryContent';
import './myOffers.css';
import api from '../../commons/api';
import Util from '../../commons/util/util';

const MyOffers = (props) => {
  const ClientCart = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebView, setIsWebView] = useState(Util.isWebView());
  const [storeCategories, setStoreCategories] = useState([
    { index: 0, label: 'All', disabled: false },
  ]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isWebView) sendDataToReactNative();
    getStoresCategory();
  }, []);

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        'My Offers' + '-' + ClientCart.isEmpty()
      );
  }

  function getStoresCategory() {
    api
      .get(config.api.getStoresCategory)
      .then((data) => {
        if (data.data) {
          console.log('getStoresCategory', data.data);
          let localIndex = 1;
          let localAr = [];
          data.data.forEach((item) => {
            localAr.push({ index: localIndex, label: item, disabled: false });
            localIndex = localIndex + 1;
          });
          setStoreCategories([...storeCategories, ...localAr]);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function handleTabClick(event, value) {
    setIndex(value);
  }

  function handleChangeIndex(index) {
    setIndex(index);
  }

  function getStyle(isActive) {
    return isActive ? styles.activeTab : styles.defaultTab;
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role='tabpanel'
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}>
        {value === index && <Box p={0}>{children}</Box>}
      </div>
    );
  }

  return (
    <div className='myOffers-container'>
      <AppBar position='static' color='default'>
        <Tabs
          value={index}
          fullWidth
          variant='scrollable'
          scrollButtons='auto'
          TabIndicatorProps={{ style: { backgroundColor: '#47b896' } }}
          onChange={handleTabClick}>
          {storeCategories.map((tab) => (
            <Tab
              label={`${tab.label}`}
              style={getStyle(index === tab.index)}
              key={tab.index}
            />
          ))}
        </Tabs>
      </AppBar>
      {isLoading ? (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Loader />
        </div>
      ) : (
        <React.Fragment>
          <SwipeableViews index={index} onChangeIndex={handleChangeIndex}>
            {storeCategories.map((tab) => (
              <TabPanel value={index} index={tab.index} key={tab.index}>
                <CategoryContent
                  categoryName={storeCategories[tab.index]}
                  storeCategories={storeCategories}
                  setStoreCategories={setStoreCategories}
                />
              </TabPanel>
            ))}
          </SwipeableViews>
        </React.Fragment>
      )}
    </div>
  );
};

const styles = {
  slide: {
    height: '',
  },
  activeTab: {
    fontWeight: 'bold',
    fontSize: '12pt',
  },
  defaultTab: {
    fontSize: '12pt',
  },
};

export default MyOffers;
