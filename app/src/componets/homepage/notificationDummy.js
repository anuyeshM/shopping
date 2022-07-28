const data = {
  eventname: 'feedback',
  data: {
    referenceId: 385,
    user: {
      activeDeviceId: 'R_XiG3H9Pj0XwPF9iAT0WU',
      activeDevices: ['R_XiG3H9Pj0XwPF9iAT0WU'],
      id: '60b8dcdb865f207b4fb823c7',
    },
  },
  metadata: {
    params: [
      {
        itemId: '2fb60b1880f0251af4340af014',
        orderId: '61a9b22403435e7385b9b4bd',
      },
    ],
    notification: {
      message:
        "We're all ears to hear about your recent purchase of 1-item(s)!",
      retry: {
        algorithm: 'linear',
        count: 3,
        interval: 3,
      },
      title: 'Rate your Purchased Product/Service Experience!',
      type: {
        code: 'item',
        id: 3,
        name: 'Rate your Purchased Product/Service Experience!',
        template_fk_id: 2,
      },
    },
  },
};

export default data;
