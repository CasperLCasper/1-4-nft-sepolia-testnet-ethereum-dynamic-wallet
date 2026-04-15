import fetch from "node-fetch";

export default async function handler(req, res) {
  const { account } = req.query;
  if (!account) return res.status(400).json({ error: "Missing account" });

  const CONTRACT = "0x1EF02c3Ed33a98c10F0bf1fd71e4D226e8e408A5";
  const API_KEY = process.env.ALCHEMY_API_KEY;

  const url = `https://eth-sepolia.g.alchemy.com/nft/v2/${API_KEY}/getNFTs/?owner=${account}&contractAddresses[]=${CONTRACT}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const ownsNFT = data.ownedNfts && data.ownedNfts.length > 0;
    res.status(200).json({ ownsNFT, nfts: data.ownedNfts || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch NFTs" });
  }
}
