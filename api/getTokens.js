export default async function handler(req, res) {
  const account = req.query.account;
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!account || !apiKey) {
    return res.status(400).json({ error: 'Missing account or API key' });
  }

  const NETWORK = 'eth-sepolia';
  const alchemyUrl = `https://${NETWORK}.g.alchemy.com/v2/${apiKey}`;

  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_getTokenBalances",
    params: [account, "erc20"]
  };

  try {
    const response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
}
