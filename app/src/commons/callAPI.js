// dependencies
class callAPI {
  static async formDataPost(url, body, header) {
    let apiResponse = {};
    let authToken = header ? header.Authorization || '' : '';

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          authorization: authToken,
          accountId: header.accountId ? header.accountId : '',
        },
        body: body,
      };

      apiResponse = await fetch(url, requestOptions);
    } catch (e) {
      console.log('ERROR in fetching request => ', e);
      throw Error;
    }

    return apiResponse;
  }
}

export default callAPI;
