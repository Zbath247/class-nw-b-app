export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // កំណត់ CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // ប្រសិនបើជា Preflight Option Request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL Google Apps Script Web App
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzXlSgtgz2zwbjOa3-bQAS6jkYn5sKgnPIty_JcoesrTPbZqny4pRPNYGXCqFP_DO-h/exec";

  try {
    if (req.method === 'POST') {
      let postData;
      
      // ផ្ទៀងផ្ទាត់ និងរៀបចំ Payload ឲ្យបានត្រឹមត្រូវ
      if (typeof req.body === 'object') {
        postData = JSON.stringify(req.body);
      } else if (typeof req.body === 'string') {
        postData = req.body;
      } else {
        postData = JSON.stringify({});
      }

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
        redirect: 'follow'
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { status: "raw", result: responseText };
      }

      return res.status(response.status || 200).json(data);

    } else if (req.method === 'GET') {
      const queryParams = new URLSearchParams(req.query).toString();
      const targetUrl = queryParams ? `${GOOGLE_SCRIPT_URL}?${queryParams}` : GOOGLE_SCRIPT_URL;

      const response = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow'
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { status: "raw", result: responseText };
      }

      return res.status(response.status || 200).json(data);
    } else {
      return res.status(405).json({ status: "error", message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ 
      status: "error", 
      message: error.message || "Internal Proxy Error" 
    });
  }
}
