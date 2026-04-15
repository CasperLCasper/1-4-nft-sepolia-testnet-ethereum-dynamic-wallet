import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    
    await new Promise((resolve) => {
      req.on('end', () => resolve());
    });
    
    const buffer = Buffer.concat(chunks);
    
    const boundary = req.headers['content-type'].split('boundary=')[1];
    if (!boundary) throw new Error('No boundary found');
    
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    let fileBuffer = null;
    let filename = null;
    let contentType = 'image/jpeg';
    
    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data; name="file"')) {
        const match = part.match(/filename="(.+)"/);
        if (match) filename = match[1];
        
        const ctMatch = part.match(/Content-Type: (.+)/);
        if (ctMatch) contentType = ctMatch[1];
        
        const start = part.indexOf('\r\n\r\n') + 4;
        let end = part.lastIndexOf('\r\n--');
        if (end === -1) end = part.length;
        
        const binaryData = part.substring(start, end);
        fileBuffer = Buffer.from(binaryData, 'binary');
        break;
      }
    }
    
    if (!fileBuffer) throw new Error('No file found');
    
    const file = new File([fileBuffer], filename || 'file.jpg', { type: contentType });
    const result = await pinata.upload.public.file(file);
    
    res.json({
      ipfs: `ipfs://${result.cid}`,
      http: `https://gateway.pinata.cloud/ipfs/${result.cid}`,
      cid: result.cid
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
