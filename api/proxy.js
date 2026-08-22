export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // កំណត់ CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbza7fEBkq3WejAnCCkc1UqUIo11CUbT5_j1UWM36S2A9OOdogQZfN57NXPQtcuRBI5q/exec";

  try {
    if (req.method === 'POST') {
      const postData = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
        redirect: 'follow'
      });

      const data = await response.json();
      return res.status(200).json(data);

    } else {
      const queryParams = new URLSearchParams(req.query).toString();
      const targetUrl = queryParams ? `${GOOGLE_SCRIPT_URL}?${queryParams}` : GOOGLE_SCRIPT_URL;

      const response = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow'
      });

      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal Proxy Error" });
  }
}
