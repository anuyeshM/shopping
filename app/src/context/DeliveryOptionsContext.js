import CreateDataContext from './CreateDataContext';
import Util from '../commons/util/util';

const deliveryDataReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'createDeliveries':
      return {
        ...state,
        deliveryData: action.payload.deliveryData,
      };
    case 'createSelected':
      return {
        ...state,
        selectedDeliveryData: action.payload.selectedDeliveryData,
      };
    default:
      return state;
  }
};

const createDeliveries = (dispatch) => (storeData) => {
  var localAr = [];
  storeData.forEach((item) => {
    var localDel = [];
    var gateFlag = false;
    var storeFlag = false;
    var addressFlag = false;

    if (item._source.deliveryOptions.length) {
      item._source.deliveryOptions.forEach((deliveryItem) => {
        let newDeliveryItem = Util.titleCase(deliveryItem);
        if (newDeliveryItem === 'Collect At Store') storeFlag = true;
        else if (newDeliveryItem === 'Collect At Gate') gateFlag = true;
        else if (
          newDeliveryItem === 'Delivery At Address' ||
          'Collect At Address'
        ) {
          addressFlag = true;
          newDeliveryItem = 'Delivery At Address';
        }
        localDel.push({
          name: newDeliveryItem,
          status: 'enabled',
        });
      });
      if (storeFlag === false) {
        localDel.push({
          name: 'Collect At Store',
          status: 'disabled',
        });
      }
      if (gateFlag === false) {
        localDel.push({
          name: 'Collect At Gate',
          status: 'disabled',
        });
      }
      if (addressFlag === false) {
        localDel.push({
          name: 'Delivery At Address',
          status: 'disabled',
        });
      }
    } else {
      localDel.push(
        {
          name: 'Collect At Store',
          status: 'disabled',
        },
        {
          name: 'Collect At Gate',
          status: 'disabled',
        },
        {
          name: 'Delivery At Address',
          status: 'disabled',
        }
      );
    }

    localAr.push({
      shopId: item._id,
      storeName: item._source.storeDisplayName,
      deliveryOptions: localDel,
    });
  });

  dispatch({
    type: 'createDeliveries',
    payload: {
      deliveryData: localAr,
    },
  });
};

const createSelectedDeliveries =
  (dispatch) => (priceSummaryData, selectedDeliveryData, deliveryData) => {
    let localAr = selectedDeliveryData;

    priceSummaryData.forEach((item) => {
      item.cartItems.forEach((subItem) => {
        let includes = false;
        let delDisabled = true;

        deliveryData.forEach((delDataItem) => {
          if (subItem.itemId === delDataItem.shopId) {
            delDataItem.deliveryOptions.forEach((delOption) => {
              if (delOption.status === 'enabled') delDisabled = false;
            });
          }
        });
        localAr.forEach((delItem) => {
          if (subItem.itemId === delItem.storeId) includes = true;
        });

        if (!includes && !delDisabled) {
          localAr.push({
            storeId: subItem.itemId,
            storeName: subItem.itemName,
            itemtype: subItem.itemType,
            flightUID: '',
            flightId: '',
            deliveryTime: '',
            deliveryOption: '',
            deliveryPincode: '',
            deliveryAddress: '',
            selected: false,
          });
        }
      });
    });

    dispatch({
      type: 'createSelected',
      payload: {
        selectedDeliveryData: localAr,
      },
    });
  };

const resetSelectedDeliveries = (dispatch) => (isCartEmpty) => {
  if (isCartEmpty) {
    dispatch({
      type: 'createSelected',
      payload: {
        selectedDeliveryData: [],
      },
    });
  }
};

const updateSelectedDeliveries =
  (dispatch) =>
  (
    storeId,
    flightUID,
    flightId,
    collectionTime,
    deliveryOption,
    selectedDeliveryData,
    selectedDeliveryPincode,
    selectedDeliveryAddress
  ) => {
    var localAr = JSON.parse(JSON.stringify(selectedDeliveryData));
    localAr.forEach((item) => {
      if (item.storeId === storeId) {
        item.flightUID = flightUID;
        item.flightId = flightId;
        item.deliveryTime = collectionTime;
        item.deliveryOption = deliveryOption;
        item.deliveryAddress = selectedDeliveryAddress;
        item.deliveryPincode = selectedDeliveryPincode;
        item.selected = true;
      }
    });

    dispatch({
      type: 'createSelected',
      payload: {
        selectedDeliveryData: localAr,
      },
    });
  };

const removeSelectedDelivery = (dispatch) => (shopId, selectedDeliveryData) => {
  const localAr = [];

  selectedDeliveryData.forEach((item) => {
    if (!(item.storeId === shopId)) localAr.push(item);
  });

  dispatch({
    type: 'createSelected',
    payload: {
      selectedDeliveryData: localAr,
    },
  });
};

const createDeliveriesRedir = (dispatch) => (deliveryData) => {
  dispatch({
    type: 'createDeliveries',
    payload: {
      deliveryData,
    },
  });
};

const createSelectedDeliveriesRedir = (dispatch) => (selectedDeliveryData) => {
  dispatch({
    type: 'createSelected',
    payload: {
      selectedDeliveryData,
    },
  });
};

export const { Context, Provider } = CreateDataContext(
  deliveryDataReducer,
  {
    createDeliveries,
    createSelectedDeliveries,
    updateSelectedDeliveries,
    resetSelectedDeliveries,
    removeSelectedDelivery,
    createDeliveriesRedir,
    createSelectedDeliveriesRedir,
  },
  { deliveryData: [], selectedDeliveryData: [] }
);
