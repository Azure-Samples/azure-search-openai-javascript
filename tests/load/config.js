export const thresholdsSettings = {
  'http_req_failed{type:API}': [{ threshold: 'rate<0.01' }], // less than 1% failed requests
  'http_req_failed{type:content}': [{ threshold: 'rate<0.01' }], // less than 1% failed requests
  'http_req_duration{type:API}': ['p(90)<40000'], // 90% of the API requests must complete below 40s
  'http_req_duration{type:content}': ['p(99)<200'], // 99% of the content requests must complete below 200ms
};

// 5.00 iterations/s for 1m0s (maxVUs: 100-200, gracefulStop: 30s)
export const standardWorkload = {
  executor: 'constant-arrival-rate',
  rate: 5,
  timeUnit: '1s',
  duration: '1m',
  preAllocatedVUs: 100,
  maxVUs: 200,
};
