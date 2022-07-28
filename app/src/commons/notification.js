import Noty from 'noty';
import 'noty/lib/noty.css';
import 'noty/lib/themes/bootstrap-v4.css';
import '../assets/css/animate.css';

const notifConfig = {
  layout: 'topRight',
  theme: 'bootstrap-v4',
  timeout: 3000,
  closeWith: ['click', 'timeout'],
  animation: {
    open: 'animated bounceInRight',
    close: 'animated bounceOutRight',
    easing: 'swing',
    speed: 500,
  },
};

class PushAlert {
  static success(text) {
    new Noty({
      type: 'success',
      text,
      ...notifConfig,
    }).show();
  }

  static warning(text) {
    new Noty({
      type: 'warning',
      text,
      ...notifConfig,
    }).show();
  }

  static error(text) {
    new Noty({
      type: 'error',
      text,
      ...notifConfig,
    }).show();
  }

  static info(text) {
    new Noty({
      type: 'info',
      text,
      ...notifConfig,
    }).show();
  }
}

export default PushAlert;
