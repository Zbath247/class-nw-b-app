export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // គាំទ្រការ Upload ឯកសារទំហំធំរហូតដល់ 10MB
    },
  },
};

export default async function handler(req, res) {
  // កំណត់ CORS Headers ឱ្យគ្រប់ជ្រុងជ្រោយ
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  // បិទ Cache ដើម្បីឱ្យទិន្នន័យពី Google Sheet ធ្វើបច្ចុប្បន្នភាព Real-time
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // ប្រសិនបើជា Preflight Request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL Google Apps Script Web App
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzz3Me1bxzEX3QBcCQSwMuZ7b2-nxA3Hi-N1z-TM99D54ha9tBGr8QiYGY6zvf34GB7/exec";

  try {
    let fetchOptions = {
      redirect: 'follow',
    };

    let targetUrl = GOOGLE_SCRIPT_URL;

    if (req.method === 'POST') {
      let postData;
      
      // ផ្ទៀងផ្ទាត់ និងរៀបចំ Payload ឱ្យបានត្រឹមត្រូវ
      if (typeof req.body === 'object') {
        postData = JSON.stringify(req.body);
      } else if (typeof req.body === 'string') {
        postData = req.body;
      } else {
        postData = JSON.stringify({});
      }

      fetchOptions.method = 'POST';
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body = postData;

    } else if (req.method === 'GET') {
      fetchOptions.method = 'GET';
      const queryParams = new URLSearchParams(req.query).toString();
      if (queryParams) {
        targetUrl = `${GOOGLE_SCRIPT_URL}?${queryParams}`;
      }
    } else {
      return res.status(405).json({ status: "error", message: "Method Not Allowed" });
    }

    // ផ្ញើ Request ទៅកាន់ Google Apps Script
    const response = await fetch(targetUrl, fetchOptions);

    // ទទួលយក Response ជា Text រួច Parse ជា JSON
    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // ករណី Google Script ឆ្លើយតបមកជា HTML Error (ឧ. Authorization Request / Syntax Error)
      data = { 
        status: "error", 
        message: "បរាជ័យក្នុងការ Parse ទិន្នន័យពី Google Script",
        rawResult: responseText 
      };
    }

    return res.status(response.status || 200).json(data);

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ 
      status: "error", 
      message: error.message || "Internal Proxy Error" 
    });
  }
}
