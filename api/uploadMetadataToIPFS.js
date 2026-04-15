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
    const { metadata } = req.body;
    
    if (!metadata) {
      return res.status(400).json({ error: 'Metadata required' });
    }
    
    const result = await pinata.upload.public.json(metadata);
    
    res.json({
      ipfs: `ipfs://${result.cid}`,
      http: `https://gateway.pinata.cloud/ipfs/${result.cid}`,
      cid: result.cid
    });
  } catch (error) {
    console.error('Metadata upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
