jest.mock('got');

const got = require('got');

const EngineService = require('../../lib/__internal/EngineService');

describe('EngineService', () => {
  let engineService, postSpy;
  beforeEach(() => {
    engineService = new EngineService({ workerId: 'someWorker', baseUrl: 'some/baseUrl' });
    postSpy = jest.spyOn(engineService, 'post');
  });

  test('post', () => {
    //given
    const expectedUrl = 'some/url';
    const expectedPayload = { key: 'some value' };

    //when
    engineService.post(expectedUrl, expectedPayload);

    //then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);
  });

  test('fetchAndLock', () => {
    //given
    const expectedUrl = '/fetchAndLock';
    const expectedReqBody = { someKey: 'some value' };
    const expectedPayload = {
      json: true,
      body: { ...expectedReqBody, workerId: engineService.workerId }
    };

    // when
    engineService.fetchAndLock(expectedReqBody);

    // then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);
  });

  test('complete', () => {
    // given
    const expectedTaskId = 'foo';
    const expectedUrl = `/${expectedTaskId}/complete`;
    const expectedPayload = {
      json: true,
      body: { workerId: engineService.workerId }
    };

    // when
    engineService.complete(expectedTaskId);

    // then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);

  });

  test('handleFailure', () => {
    // given
    const expectedTaskId = 'foo';
    const expectedUrl = `/${expectedTaskId}/failure`;
    const expectedRequestBody = { errorMessage: 'some error message' };
    const expectedPayload = {
      json: true,
      body: { ...expectedRequestBody, workerId: engineService.workerId }
    };

    // when
    engineService.handleFailure(expectedTaskId, expectedRequestBody);

    // then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);

  });

  test('handleBpmnError', () => {
    // given
    const expectedTaskId = 'foo';
    const expectedUrl = `/${expectedTaskId}/bpmnError`;
    const expectedErrorCode =  'some error code';
    const expectedPayload = {
      json: true,
      body: { errorCode: expectedErrorCode, workerId: engineService.workerId }
    };

    // when
    engineService.handleBpmnError(expectedTaskId, expectedErrorCode);

    // then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);

  });

  test('extendLock', () => {
    // given
    const expectedTaskId = 'foo';
    const expectedUrl = `/${expectedTaskId}/extendLock`;
    const expectedNewDuration = 100 ;
    const expectedPayload = { json: true, body: { newDuration: expectedNewDuration, workerId: engineService.workerId } };

    // when
    engineService.extendLock(expectedTaskId, expectedNewDuration);

    // then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);

  });

  test('unlock', () => {
    // given
    const expectedTaskId = 'foo';
    const expectedUrl = `/${expectedTaskId}/unlock`;
    const expectedPayload = { json: true };

    // when
    engineService.unlock(expectedTaskId);

    // then
    expect(postSpy).toBeCalledWith(expectedUrl, expectedPayload);

  });


  describe('request', () => {
    jest.mock('got', () => jest.fn());
    it('should send request with given options', () => {
      //given

      const method = 'POST';
      const path = '/some/url';
      const expectedUrl = `${engineService.baseUrl}${path}`;
      const expectedPayload = { method, key: 'some value' };

      //when
      engineService.request(method, path, expectedPayload);

      //then
      expect(got).toBeCalledWith(expectedUrl, expectedPayload);
    });

    it('should get request options from interceptors', () => {
      //given
      const method = 'POST';
      const path = '/some/url';
      const expectedUrl = `${engineService.baseUrl}${path}`;
      const expectedInitialPayload = { key: 'some value' };
      const someExpectedAddedPayload = { someNewKey: 'some new value' };
      const anotherExpectedAddedPayload = { anotherNewKey: 'another new value' };
      const someInterceptor = (config) => ({ ...config, ...someExpectedAddedPayload });
      const anotherInterceptor = (config) => ({ ...config, ...anotherExpectedAddedPayload });
      engineService.interceptors = [someInterceptor, anotherInterceptor];
      const expectedPayload = {
        method,
        ...expectedInitialPayload,
        ...someExpectedAddedPayload,
        ...anotherExpectedAddedPayload
      };

      //when
      engineService.request(method, path, expectedPayload);

      //then
      expect(got).toBeCalledWith(expectedUrl, expectedPayload);

    });
  });
});