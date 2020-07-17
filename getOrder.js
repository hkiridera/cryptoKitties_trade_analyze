const Web3 = require('web3')
const { OpenSeaPort, Network } = require('opensea-js')
const OrderSide = require('opensea-js/lib/types')
const Json2csvParser = require('json2csv').Parser;
const fs = require("fs");


// This example provider won't let you make transactions, only read-only calls:
const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main
})


const asset = {
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d", // CryptoKitties
}


const main = async () =>{

  // 1ページ分のcsv出力用データ格納
  let result = []
  
  // 10ページ分のデータを取得する
  for (let k=0;k<100;k++){

    try {
      // Get page 2 of all auctions, a.k.a. orders where `side == 1`
      const { orders, count } = await seaport.api.getOrders({
        asset_contract_address: asset.tokenAddress,
        side: OrderSide.Sell
      }, k)
      for(let i=0;i<orders.length;i++){
        console.log("------------")
        // tokenId
        let tokenId = orders[i].asset.tokenId
        console.log("tokenId", orders[i].asset.tokenId)
  
        // metadata取得用
        const as = await seaport.api.getAsset({
          tokenAddress: asset.tokenAddress,
          tokenId: orders[i].asset.tokenId
        })
  
  
        let tmp = {}

        // tokenID記録
        tmp["tokenId"] = orders[i].asset.tokenId
        // 最終販売価格があれば表示
        if (as.lastSale && as.lastSale.totalPrice){
          //console.log(as.lastSale.totalPrice)
          tmp["lastSalePrice"] = as.lastSale.totalPrice
        }
        
        // metadata表示
        for (let l=0;l<as.traits.length;l++){
          tmp[as.traits[l].trait_type] = as.traits[l].value
        }
        console.log(tmp)
        result.push(tmp)
      }
        
    } catch (error) {
      continue      
    }

  }
  // csv化
  const fields = ['tokenId', 'lastSalePrice', 'pattern', 'mouth', 'generation', 'virginity', 'highlight_colour', 'accent_colour', 'cooldown_timer', 'eye_shape', 'eye_colour', 'base_colour', 'fur', 'wild_element'];
  const json2csvParser = new Json2csvParser({ fields, header: false });
  const csv = json2csvParser.parse(result);

  console.log(csv);

  // 書き込み
  fs.appendFile("data/tradeData.csv", csv, (err) => {
    if (err) throw err;
    console.log('正常に書き込みが完了しました');
  });

  
}




main()