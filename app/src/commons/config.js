import env from "./env";

const promotionURL = env.promotionURL;

const config = {
  api: {
    storeLogo: `/pax/api/store/{{storecode}}`,

    /* -------------------------------PRODUCTS---------------------------------------- */

    productCategory: `/pax/api/category`,
    productListing: `/pax/api/getProducts`,
    searchSuggestions: `/pax/api/_search`,
    productDetails: `/pax/api/items/item`,
    productId: `/pax/api/items/productId`,
    productsFilterList: `/pax/api/filterproduct`,

    /*  -------------------------------STORES---------------------------------------- */
    filteredProductsList: `/pax/api/filteredproducts`,
    storeListing: `/pax/api/getStores/20201203D12224483T`,
    storeFilters: `/pax/api/filtershop`,
    searchSuggestionsStore: `/pax/api/_searchShop`,
    getFilteredStores: `/pax/api/getFilteredStores`,

    /*  -------------------------------ORDER---------------------------------------- */
    orderConfirmation: `/pax/api/orders/confirmorder`,

    /*  -------------------------------COUPON---------------------------------------- */
    generateCoupon: `/pax/api/generatecoupon`,
    updateCoupon: `/pax/api/updatecoupon`,

    /*  -------------------------------PAYMENT COMPLETION---------------------------------------- */
    orderSummary: `/pax/api/orders/getOrderSummary`,

    /*  -------------------------------HOME---------------------------------------- */
    homescreen: `/pax/api/homescreen`,
    newsBroadcast: `/pax/api/news/broadcast`,

    /*  -------------------------------FLIGHTS---------------------------------------- */
    flightListing: `/pax/api/aodb/flights`,
    homeAirports: `/pax/api/aodb/homeAirports`,
    airportSearchResults: `/pax/api/aodb/airports`,
    myFlights: `/pax/api/myFlights`,
    addNewFlight: `/pax/api/aodb/addMyFlights`,
    removeFlight: `/pax/api/removeMyFlight`,

    /*  -------------------------------SERVICES---------------------------------------- */
    serviceListing: `/pax2/v2/api/service/list`,
    serviceCategories: `/pax2/v2/api/service/category`,
    serviceVariants: `/pax2/v2/api/service/variant`,
    serviceInfo: `/pax2/v2/api/service/info`,

    /*  -------------------------------USER ADDRESS---------------------------------------- */
    getAddress: `/pax/api/getAddress`,
    addAddress: `/pax/api/addAddress`,
    updateAddress: `/pax/api/updateAddress`,
    deleteAddress: `/pax/api/deleteAddress`,

    /*  -------------------------------USER PROFILE/AUTH---------------------------------------- */
    getUserDetails: `/pax/api/getUser/{{id}}`,
    updateUserDetails: `/pax/api/updateUser`,
    resetPassword: `/pax2/v2/api/user/updatePwd`,

    /*  -------------------------------AIRPORT GUIDE---------------------------------------- */
    airportGuide: `/pax/api/airportGuide`,

    /* -------------------------------PARTNERS---------------------------------------- */
    partners: `/pax/api/partners`,

    /* -------------------------------My OFFERS---------------------------------------- */
    getStoresCategory: `/pax/api/getStoresCategory`,
    getOffers: `/pax/api/getOffers`,
    /* -------------------------------Payments---------------------------------------- */
    mySavedCards: `/pax/api/mySavedCards`,
    saveCard: `/pax/api/saveCard`,
    updateCard: `/pax/api/updateCard`,
    deleteCard: `/pax/api/deleteCard`,
    /* -------------------------------PriceSummary---------------------------------------- */
    summary: `/pax2/v2/api/cart/summary`,
    checkout: `/pax2/v2/api/cart/checkout`,
    review: `/pax2/v2/api/cart/review`,
    getPaymentTypes: `/pax/api/getPaymentTypes`,
    makePayment: `${env.serverURL}/api/makePayment`,
    mycart: `/pax2/v2/api/cart/mycart`,
    moreInfo: `/pax2/v2/api/service/mandatoryfields`,

    /* -------------------------------Payment Get Way Configuartion---------------------------------------- */
    gatewayConfiguration: `${env.serverURL_v2}/v2/api/payment/gatewayConfiguration`,
    //gatewayConfiguration: `${env.gatewayURL}/v2/api/payment/gatewayConfiguration`,

    /* -------------------------------OTP---------------------------------------- */
    validateOtp_v2: `/pax2/v2/api/user/validateOtp`,
    genOtp_v2: `/pax2/v2/api/user/genOtp`,
    validateToReg_v2: `/pax2/v2/api/user/validateToReg`,
    /* -------------------------------USER---------------------------------------- */
    getUserDetails_v2: `/pax2/v2/api/user/getUser/{{id}}`,
    updateUser: `/pax2/v2/api/user/updateUser`,
    /* -------------------------------USER/PASSPORT DETAILS---------------------------------------- */
    getUserPassportDetails_v2: `/pax2/v2/api/user/passport/{{id}}`,
    updatePassportDetails_v2: `/pax2/v2/api/user/passport/{{id}}`,
    /* -------------------------------USER/CONTACT DETAILS---------------------------------------- */
    getSegment: `/pax2/v2/api/user/getSegment`,
    /* -------------------------------USER/SOCIAL MEDIA LINKING---------------------------------------- */
    linkWithGoogle: `/gw/api/user/link/google/{{token}}/{{email}}`,
    linkWithFacebook: `/gw/api/user/link/facebook/{{token}}/{{email}}`,
    /*  -------------------------------AUTH---------------------------------------- */
    guestLogin: `/login/guest`,
    refresh: `/login/refresh`,
    login: `/login/local`,
    /*  -------------------------------BOOKINGS---------------------------------------- */
    activeOrders: `/pax2/v2/api/order/active`,
    pastOrders: `/pax2/v2/api/order/past`,
    feedback: `/pax2/v2/api/order/write`,
    cancelService: `/pax2/v2/api/order/cancel`,
    /*  -------------------------------PROMOTIONS---------------------------------------- */
    getApplicablePromo: `promotions/v1/api/promotion/getapplicablePromo`,
    applyPromo: `promotions/applyPromo`,
    /*  -------------------------------FEEDBACK---------------------------------------- */
    feedback: {
      item: {
        pendingItem: `/feedback/api/pending/item`,
        saveItem: `/feedback/api/save/item`,
        saveRapidfireItem: `/feedback/api/save/rapidfire/item`,
      },
      overall: {
        saveRapidfireOverall: `/feedback/api/save/rapidfire/overall`,
        saveOverall: `/feedback/api/save/overall`,
      },
      experience: {
        saveRapidfireExperience: `/feedback/api/save/rapidfire/experience`,
        saveExperience: `/feedback/api/save/experience`,
      },
      pendingRapidfire: `/feedback/api/pending/rapidfire/{{type}}`,
    },
  },
  ux: {
    throttleControl: 500,
  },
  auth: {
    token: "8n7fnANnmWyw7dknYfCzThzWIs8OCfOqSJr",
    refUrl:
      // 'http://172.31.145.155:8080'
      "https://ecommerce.contactless-shoppingdev.com",
  },
  url: {
    serverURL: env.serverURL,
    gatewayURL: env.gatewayURL,
  },
  cart: {
    emptyMessage: [
      `Let's revamp your inventory!!!`,
      `Amazing products are just a click away...`,
      `I heard there's this superb deal going on...`,
      `Have you seen our latest collection !?`,
      `Not able to decide, let's take a walk on listing page :)`,
    ],
  },
  phiCom: {
    defaultPhNo: env.phiComDefaultMobileNumber,
    defaultEmailId: env.phiComDefaultEmailId,
  },
  days: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30,
  ],
  hours: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24,
  ],
  minutes: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60,
  ],
  moreInfo: {
    vehicleType: [
      { value: "SUV", label: "SUV" },
      { value: "Sedan", label: "Sedan" },
      { value: "Hatchback", label: "Hatchback" },
      { value: "Others", label: "Others" },
    ],
  },
  myBooking: {
    cancellationReason: [
      { value: "r01", label: "Service not required" },
      { value: "r02", label: "Service booked by mistake" },
      { value: "r03", label: "Need to change payment method" },
      { value: "r04", label: "Others" },
    ],
  },
};

export default config;
