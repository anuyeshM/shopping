// dependencies
import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import MainProvider from "./context/MainProvider";
// styles
import "./App.css";

// components
import PaymentSuccess from "./components/paymentSuccess/paymentSuccess";
import PaymentFail from "./components/paymentFail/paymentFail";
import SwitchToApp from "./components/misc/switchToApp";
import Stores from "./components/stores/storeComponent";
import Home from "./screens/home/homeScreen";
import NotFound from "./components/misc/notFound";
import GlobalFonts from "./assets/fonts/fonts";
import Cart from "./components/cart/cartComponent";
import Payment from "./components/payment/paymentComponent";
import Homepage from "./components/homepage/homepage";
import PremiumServices from "./components/premiumServices/premiumServices";
import ServiceDetail from "./components/premiumServices/IndivudualServiceFlow/serviceDetail";
import PackageDetail from "./components/premiumServices/IndivudualServiceFlow/packageDetail";
import AddNewFlight from "./components/addNewFlight/addNewFlight";
import FlightListing from "./components/flightListing/flightListing";
import MyFlights from "./components/myFlights/myFlights";
import MyBookings from "./components/myBooking/myBooking";
import OrderDelivery from "./components/cart/orderDelivery/orderDelivery";
import UserProfile from "./components/userProfile/userProfile";
import Passport from "./components/userProfile/screens/passport/passport";
import Contact from "./components/userProfile/screens/contact/contact";
import MoreAboutYou from "./components/userProfile/screens/contact/moreAboutYou";
import Address from "./components/userProfile/screens/delAddress/delAddress";
import SocialMediaConnect from "./components/userProfile/screens/socialMediaConnect/socialMediaConnect";
import PaymentInfo from "./components/userProfile/screens/paymentInfo/paymentInfo";
import AirportGuide from "./components/airportGuide/airportGuide";
import Partners from "./components/partners/partners";
import MyOffers from "./components/myOffers/myOffers";
import MyFavorites from "./components/myFavorites/myFavorites";
import Notifications from "./components/notifications/notifications";
import ShoppingDetails from "./components/paymentSeamless/shoppingDetails";
import ReviewCart from "./components/cart/reviewComponent/reviewCart";
import DeliveryAddress from "./components/cart/orderDelivery/subcomponent/deliveryAddress";
import BookingDetails from "./components/myBooking/screens/bookingDetails/bookingDetails";
import MyItinerary from "./components/myItinerary/myItinerary";
import MyItineraryComplete from "./components/myItinerary/subcomponent/myItineraryComplete";
import Checklist from "./components/checklist/checklist";
import MoreInfo from "./components/cart/moreInfo/moreInfo";
// const flag=window.location.href.indexOf('flag')>-1;
// const newHomePage=flag?PaymentFail:Stores;

export default function App(props) {
  return (
    <div className="primary-theme">
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <MainProvider>
          <HashRouter>
            <GlobalFonts />
            <Switch>
              <Route exact path="/homepage" component={Homepage} />
              <Route
                exact
                path="/shoppingDetails"
                component={ShoppingDetails}
              />
              <Route exact path="/notifications" component={Notifications} />
              <Route
                exact
                path="/premiumServices"
                component={PremiumServices}
              />
              <Route exact path="/flightListing" component={FlightListing} />
              <Route exact path="/addNewFlight" component={AddNewFlight} />
              <Route exact path="/myFlights" component={MyFlights} />
              <Route exact path="/myItinerary" component={MyItinerary} />
              <Route
                exact
                path="/myItineraryComplete"
                component={MyItineraryComplete}
              />
              <Route exact path="/checklist" component={Checklist} />
              <Route exact path="/myBookings" component={MyBookings} />
              <Route
                exact
                path="/myBookings/:orderId"
                component={BookingDetails}
              />
              <Route
                exact
                path="/premiumServices/serviceDetail/:serviceId"
                render={(props) => <ServiceDetail {...props} />}
              />
              <Route
                exact
                path="/premiumServices/packageDetail/:packageId"
                render={(props) => <PackageDetail {...props} />}
              />
              <Route
                exact
                path="/userProfile"
                render={(props) => <UserProfile {...props} />}
              />
              <Route
                exact
                path="/userProfile/passport"
                render={(props) => <Passport {...props} />}
              />
              <Route
                exact
                path="/userProfile/contact"
                render={(props) => <Contact {...props} />}
              />
              <Route
                exact
                path="/userProfile/contact/moreAboutYou"
                render={(props) => <MoreAboutYou {...props} />}
              />
              <Route
                exact
                path="/userProfile/address"
                render={(props) => <Address {...props} />}
              />
              <Route
                exact
                path="/userProfile/socialMediaConnect"
                render={(props) => <SocialMediaConnect {...props} />}
              />
              <Route
                exact
                path="/userProfile/paymentInfo"
                render={(props) => <PaymentInfo {...props} />}
              />
              <Route
                exact
                path="/airportGuide"
                render={(props) => <AirportGuide {...props} />}
              />
              <Route
                exact
                path="/partners"
                render={(props) => <Partners {...props} />}
              />
              <Route
                exact
                path="/myOffers"
                render={(props) => <MyOffers {...props} />}
              />
              <Route
                exact
                path="/myFavorites"
                render={(props) => <MyFavorites {...props} />}
              />
              <Route
                exact
                path="/success/:orderid"
                render={(props) => <PaymentSuccess {...props} />}
              />
              <Route
                exact
                path="/fail/:orderid"
                render={(props) => <PaymentFail {...props} />}
              />
              <Route
                exact
                path="/cart"
                render={(props) => <Cart {...props} />}
              />
              <Route
                exact
                path="/review"
                render={(props) => <ReviewCart {...props} />}
              />
              <Route exact path="/orderDelivery" component={OrderDelivery} />
              <Route exact path="/moreInfo" component={MoreInfo} />
              <Route
                exact
                path="/deliveryAddress"
                component={DeliveryAddress}
              />
              <Route
                exact
                path="/payment"
                render={(props) => <Payment {...props} />}
              />
              <Route exact path="/notfound" render={(props) => <NotFound />} />
              <Route path="/:storecode" component={Home} />
              <Route exact path="/" component={Stores} />
              {/* <Route path="*" component={NotFound} /> */}
            </Switch>
            <Route exact path="/" component={SwitchToApp} />
          </HashRouter>
        </MainProvider>
      </MuiPickersUtilsProvider>
    </div>
  );
}

/**
 const profilerLog = (
    id, // the "id" prop of the Profiler tree that has just committed
    phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration, // time spent rendering the committed update
    baseDuration, // estimated time to render the entire subtree without memoization
    startTime, // when React began rendering this update
    commitTime, // when React committed this update
    interactions
  ) => {
    console.log('================================================================');
    console.log('id =>', id);
    console.log('phase =>', phase);
    console.log('actualDuration =>', actualDuration);
    console.log('baseDuration =>', baseDuration);
    console.log('startTime =>', startTime);
    console.log('commitTime =>', commitTime);
    console.log('interactions =>', interactions);
    console.log('================================================================');
  }

 <Profiler id='app' onRender={profilerLog}></Profiler>
 */
