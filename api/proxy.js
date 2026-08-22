import https from 'https';
import { URL } from 'url';

export default function handler(req, res) {
  // កំណត់ CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL Google Apps Script របស់អ្នក
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmQZ9QlBPH6RM_Vjs_lWKiGBL7jTPguUhzjwGt-gMe6Qsp329rPiqdPVsZrxF3QUXS/exec";

  // បង្កើត Query String សម្រាប់ GET Request
  const queryParams = new URLSearchParams(req.query).toString();
  const targetUrl = queryParams ? `${GOOGLE_SCRIPT_URL}?${queryParams}` : GOOGLE_SCRIPT_URL;

  // Function សម្រាប់ធ្វើ Request និង Handle Google Redirection (301/302)
  const makeRequest = (currentUrl, method, postBody = null) => {
    const parsedUrl = new URL(currentUrl);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {}
    };

    if (method === 'POST' && postBody) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postBody);
    }

    const proxyReq = https.request(options, (response) => {
      // ប្រសិនបើ Google បញ្ជូន 301, 302, 303, ឬ 307 Redirection
      if ([301, 302, 303, 307].includes(response.statusCode)) {
        if (response.headers.location) {
          // ពេល Redirect រួច Google នឹងផ្លាស់ប្តូរ Method ទៅ GET
          return makeRequest(response.headers.location, 'GET');
        }
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          return res.status(200).json(jsonData);
        } catch (e) {
          return res.status(500).json({ error: "Failed to parse JSON", raw: data });
        }
      });
    });

    proxyReq.on('error', (err) => {
      return res.status(500).json({ error: err.message });
    });

    if (method === 'POST' && postBody) {
      proxyReq.write(postBody);
    }

    proxyReq.end();
  };

  // ពិនិត្យ Method ដើម្បីដំណើរការ
  if (req.method === 'POST') {
    const postData = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    makeRequest(GOOGLE_SCRIPT_URL, 'POST', postData);
  } else {
    makeRequest(targetUrl, 'GET');
  }
}
