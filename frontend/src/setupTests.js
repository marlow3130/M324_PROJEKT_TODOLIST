import '@testing-library/jest-dom';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

beforeEach(() => {
  fetch.resetMocks();
  fetch.mockResponse(JSON.stringify([]));
  localStorage.clear();
});
