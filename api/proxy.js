export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL Web App របស់ Apps Script
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw54cEpJFju9PZhA1G5cuaenmx8r8EfX3Mcdq2L9mVSIVLL6bn8aT7aeyldGTbDaohJ/exec";

  try {
    // រៀបចំ URL Parameters
    const url = new URL(GOOGLE_SCRIPT_URL);
    Object.keys(req.query).forEach(key => url.searchParams.append(key, req.query[key]));

    const fetchOptions = {
      method: req.method,
      redirect: 'follow', // ដើរតាម Google Redirects (302)
    };

    if (req.method === 'POST') {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      fetchOptions.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    }

    const response = await fetch(url.toString(), fetchOptions);
    const textData = await response.text();

    try {
      const jsonData = JSON.parse(textData);
      return res.status(200).json(jsonData);
    } catch (e) {
      // បើ Google ឆ្លើយតបជា HTML Error ជំនួសឱ្យ JSON
      return res.status(500).json({ status: "error", message: "Google Apps Script Response Error", raw: textData });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
}
