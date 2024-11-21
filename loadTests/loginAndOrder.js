import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
    Imported_HAR: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },
        { target: 20, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'imported_HAR',
    },
  },
}

// Scenario: Scenario_1 (executor: ramping-vus)

export function scenario_1() {
  let response

  // Automatically added sleep
  sleep(1)
}

// Scenario: Imported_HAR (executor: ramping-vus)

export function imported_HAR() {
  let response

  group('Login and order - https://pizza.windypit.com/', function () {
    response = http.get('https://pizza.windypit.com/', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        dnt: '1',
        'if-modified-since': 'Thu, 31 Oct 2024 19:24:49 GMT',
        'if-none-match': '"fd2dca4cf1f24227eeffc4d99b8642ca"',
        priority: 'u=0, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'sec-gpc': '1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(10)

    const vars = {};

    response = http.put(
      'https://pizza-service.windypit.com/api/auth',
      '{"email":"asdf@jwt.com","password":"admin"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          dnt: '1',
          origin: 'https://pizza.windypit.com',
          priority: 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'sec-gpc': '1',
        },
      }
    )
    if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
    console.log(response.body);
    fail('Login was *not* 200');
    }

    vars['token1'] = jsonpath.query(response.json(), '$.token')[0]

    sleep(10)

    response = http.get('https://pizza-service.windypit.com/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        dnt: '1',
        'if-none-match': 'W/"258-5KNbVmjPQp03XMJrr2BJn6wKvI0"',
        authorization: `Bearer ${vars['token1']}`,
        origin: 'https://pizza.windypit.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
    })

    response = http.get('https://pizza-service.windypit.com/api/franchise', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        dnt: '1',
        'if-none-match': 'W/"97-pmc0rvu1OqaVdTL0uJqnAURWOWM"',
        authorization: `Bearer ${vars['token1']}`,
        origin: 'https://pizza.windypit.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
    })
    sleep(10)

    response = http.post(
      'https://pizza-service.windypit.com/api/order',
      '{"items":[{"menuId":2,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          dnt: '1',
          origin: 'https://pizza.windypit.com',
          authorization: `Bearer ${vars['token1']}`,
          priority: 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'sec-gpc': '1',
        },
      }
    )
    sleep(10)

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      '{"jwt":"eyJpYXQiOjE3MzIxNTU4NjgsImV4cCI6MTczMjI0MjI2OCwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJlbDI3MyIsIm5hbWUiOiJFcmljIExlZWNoIn0sImRpbmVyIjp7ImlkIjoxLCJuYW1lIjoiQ2hhbmd5b25nIE1pbmd6aSIsImVtYWlsIjoiYXNkZkBqd3QuY29tIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjIsImRlc2NyaXB0aW9uIjoiVmVnZ2llIiwicHJpY2UiOjAuMDAzOH1dLCJzdG9yZUlkIjoiMSIsImZyYW5jaGlzZUlkIjoxLCJpZCI6M319.tm382iY1lA5ZXYxR1xg0FoytOyCpxFXDrha_OeN_Xw9ADTAzVwNglxqGhNUlaAOizuSRhHEnoC2nBRXsgbqXBB6ymQrErcq4SwSii7Jby0BprNv4qPo2xzAWj4ADHtgIixPD1VIPgeDop8_rGElGe7G0kuqYpIKXhy5nWXmPOfVZx-f9artJuU-nP23q1TWpzsPJFErrMnSJQ10FSbvKvA6PF0pDhlYDuZuL6o1Ct2fBcmp6jghHNBINCRAYU6HNXAfOHgapFaMIS5PkkvfbfCycUOu37-ENRlU6l1-D_XxlzLzqyRa0hFSUDnKIWzyp-6M3FS-Y-_unSeWfbPcnjt9OcwntV7gKuYDTs1aaC_fFtlMC7FUawXVGtNLsyO3z5YpGl3wRer7mpRlAKvHbaSbQjdeicWclhdVMu2pZeZTXahpX-Ln0NskKvT1tuBzeKpf3RPTS1AfFVD0mbeMI6zKE31tNnEvyRM8uSR3u1aXtvEmJx9OybFkS1mBFf3_Oi_5-HsAVzqT6IhZ08CK_L1QpY8LXaczm3aR266HLwMiYwCLNdAghCaErCTKrD33bJgn8fsXoUq5TYJmIXJ6S09g8_3ra9FJCszDyiotgHksvPFcVjEPsURVguLMT4PjYzgcgOXe1sMJN1hWQQ7ZfgZivFCabenlQ6txLNJ7SbZ4"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          dnt: '1',
          authorization: `Bearer ${vars['token1']}`,
          origin: 'https://pizza.windypit.com',
          priority: 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-gpc': '1',
        },
      }
    )
    sleep(10)

    response = http.del('https://pizza-service.windypit.com/api/auth', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        dnt: '1',
        authorization: `Bearer ${vars['token1']}`,
        origin: 'https://pizza.windypit.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
    })
  })
}