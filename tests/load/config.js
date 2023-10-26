export const thresholdsSettings = {
  'http_req_failed{type:API}': [{ threshold: 'rate<0.01' }], // less than 1% failed requests
  'http_req_failed{type:content}': [{ threshold: 'rate<0.01' }], // less than 1% failed requests
  'http_req_duration{type:API}': ['p(95)<30000'], // 95% of the API requests must complete below 30s
  'http_req_duration{type:content}': ['p(99)<500'], // 99% of the content requests must complete below 500ms
};

export const stagedWorkload = {
  executor: 'ramping-vus',
  stages: [
    { duration: '10s', target: 20 },
    { duration: '50s', target: 20 },
    { duration: '50s', target: 40 },
    { duration: '50s', target: 60 },
    { duration: '50s', target: 80 },
    { duration: '50s', target: 100 },
    { duration: '50s', target: 120 },
    { duration: '50s', target: 140 },
  ],
};
