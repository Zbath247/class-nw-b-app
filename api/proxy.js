import https from 'https';

export default function handler(req, res) {
  // កំណត់ CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL Google Apps Script របស់អ្នក
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYih92lIL48oKQad6zsD8PZQcQt2_H2Z8MfYOZcLbv9crfhfDwuVR41SDC7BE2BcRt/exec";

  // បង្កើត Query String
  const queryParams = new URLSearchParams(req.query).toString();
  const targetUrl = queryParams ? `${GOOGLE_SCRIPT_URL}?${queryParams}` : GOOGLE_SCRIPT_URL;

  // Function សម្រាប់ Handle Redirection របស់ Google (302 Found)
  const makeRequest = (url) => {
    https.get(url, (response) => {
      // ប្រសិនបើ Google បញ្ជូន 301 ឬ 302 Redirection
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          return makeRequest(response.headers.location);
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
    }).on('error', (err) => {
      return res.status(500).json({ error: err.message });
    });
  };

  makeRequest(targetUrl);
}
