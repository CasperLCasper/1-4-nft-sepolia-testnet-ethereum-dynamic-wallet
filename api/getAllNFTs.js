export default async function handler(req, res) {
  const { account } = req.query;

  if (!account) {
    return res.status(400).json({ error: "Missing account parameter" });
  }

  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
    
    if (!ALCHEMY_API_KEY) {
      console.error("ALCHEMY_API_KEY not set");
      return res.json({ result: { nfts: [] } });
    }
    
    const url = `https://eth-sepolia.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${account}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();

    const formattedNFTs = (data.ownedNfts || []).map(nft => ({
      contract: {
        address: nft.contract.address,
        symbol: nft.contract.symbol || "NFT"
      },
      id: { tokenId: nft.id.tokenId },
      balance: 1
    }));

    return res.status(200).json({ 
      result: { nfts: formattedNFTs } 
    });
    
  } catch (error) {
    console.error("getAllNFTs error:", error);
    return res.json({ result: { nfts: [] } });
  }
}
