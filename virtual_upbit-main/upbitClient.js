const request = require("request");
const { v4: uuidv4 } = require("uuid"); //npm install uuidv4 --save
const sign = require("jsonwebtoken").sign;
const crypto = require("crypto");
const queryEncode = require("querystring").encode;

const access_key = "chocochipcook2";
const secret_key = "0lVBhWOit9Sk4nrJ8b1jdR082NFGOCl4Nchj8q9YTQ0=";
const server_url = "http://ubuntu.securekim.com";

async function getBalance() {
  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "GET",
    url: server_url + "/v1/accounts",
    headers: { Authorization: `Bearer ${token}` },
  };
  return new Promise(function (resolve, reject) {
    request(options, (error, response, body) => {
      if (error) reject();
      console.log(response.statusCode);
      resolve(body);
    });
  });
}

//얼마너치살건지
async function API_buyImmediate(market, price) {
  const body = {
    market: market,
    side: "bid",
    volume: null,
    price: price.toString(),
    ord_type: "price",
  };
  const query = queryEncode(body);
  const hash = crypto.createHash("sha512");
  const queryHash = hash.update(query, "utf-8").digest("hex");
  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: "SHA512",
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: { Authorization: `Bearer ${token}` },
    json: body,
  };
  return new Promise(function (resolve, reject) {
    request(options, (error, response, body) => {
      if (error) reject();
      console.log(response.statusCode);
      resolve(body);
    });
  });
}

//몇개팔건지
async function API_sellImmediate(market, volume) {
  const body = {
    market: market,
    side: "ask",
    volume: volume.toString(),
    price: null,
    ord_type: "market",
  };
  const query = queryEncode(body);
  const hash = crypto.createHash("sha512");
  const queryHash = hash.update(query, "utf-8").digest("hex");
  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: "SHA512",
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: { Authorization: `Bearer ${token}` },
    json: body,
  };
  return new Promise(function (resolve, reject) {
    request(options, (error, response, body) => {
      if (error) reject();
      console.log(response.statusCode);
      resolve(body);
    });
  });
}
// krwbtc{
//     rsiSignal: 'DEFAULT',
//     rsiSignal_target: 'DEFAULT',
//     position: 2,
//     position_target: 1,
//     smaSignal: 1,
//     timeStamp: '6/28/2021, 10:21:01 AM',
//     cma: 0.0035172530027546647,
//     cma_target: 0.006869358322456239,
//     realTimePrice: '-1',
//     ask_price: 39895000,
//     ask_volume: 0.075002,
//     bid_price: 39878000,
//     bid_volume: 0.78819273,
//     realTimeStamp: '6/28/2021, 10:20:07 AM',
//     bid_power: 33585425.999689996,
//     ask_power: 26713429.71886,
//     rsiSignalChanged: 0,
//     price: 39880000
//   }
async function rsiBasedTrade() {
  console.log("market checking");

  retS = await get("http://kali.securekim.com:3082/signals");
  retSJSON = JSON.parse(retS);
  KRWBTC = retSJSON["KRW-BTC"];

  ret = await get("http://kali.securekim.com:3082/view");
  //console.log(ret);
  retJSON = JSON.parse(ret);

  balance = await getBalance();
  pbalance = JSON.parse(balance);
  krw = pbalance[0].balance;
  console.log(krw);
  //console.log(krw/100);
  for (var i in retJSON) {
    //console.log(i+" : "+retJSON[i].rsiSignal);
    market = i;
    rsiSignal = retJSON[i].rsiSignal;
    rsiSignal_target = retJSON[i].rsiSignal_target;
    if (rsiSignal == "LONG" || rsiSignal == "BIGLONG") {
      if (rsiSignal_target == "LONG" || rsiSignal_target == "BIGLONG") {
        body = await API_buyImmediate(market, krw / 10);
      } else if (KRWBTC.rsiSignal == "LONG" || KRWBTC.rsiSignal == "BIGLONG") {
        body = await API_buyImmediate(market, krw / 100);
      }
      console.log("check" + market);

      //console.log(body);
      //volume[market]=JSON.parse(body).volume;
    } else if (rsiSignal == "SHORT" || rsiSignal == "BIGSHORT") {
      let volume = {};
      for (var j in balance) {
        if ("KRW-" + balance[j].currency == market) {
          volume = balance[j].balance;
          await API_sellImmediate(market, volume);
        }
      }
    } else if (KRWBTC.rsiSignal == "SHORT") {
      sellAll();
    }
  }
}
async function sellAll() {
  _balance = await getBalance();
  _balance = JSON.parse(_balance);
  for (let i in _balance) {
    market = "KRW-" + _balance[i].currency;
    balance = _balance[i].balance;
    if (market != "KRW-KRW" && balance > 0) {
      API_sellImmediate(market, balance);
    }
  }
}
async function targetSell(market) {
    _balance = await getBalance();
    balance = JSON.parse(_balance);
  let volume = {};
  for (var i in balance) {
    if ("KRW-" + balance[i].currency == market) {
      volume = balance[i].balance;
      body = await API_sellImmediate(market, volume);
    }
  }
  
  console.log(body);
}
async function onePerTrade() {
  retS = await get("http://kali.securekim.com:3082/signals");
  retSJSON = JSON.parse(retS);
  for (var i in retSJSON) {
  }
}
async function shortTermTrade(){
    console.log("market checking");
    ret = await get("http://kali.securekim.com:3082/view");
    //console.log(ret);
    retJSON = JSON.parse(ret);
    _balance = await getBalance();
    balance = JSON.parse(_balance);
    
  krw = balance[0].balance;
  console.log(krw);
    for (var i in retJSON) {
      //console.log(i+" : "+retJSON[i].rsiSignal);
      market = i;
      nzFlag=0;
      rsiSignal = retJSON[i].rsiSignal;
      rsiSignal_target = retJSON[i].rsiSignal_target;
      if (rsiSignal == "LONG" || rsiSignal == "BIGLONG") {
        for (var j in balance) {
            if ("KRW-" + balance[j].currency == market) {
              if(balance[j].balance!=0){
                  nzFlag=1
                }
            }
        }
        if(nzFlag==0&market!="STANDARD_MARKET_SIGN"&market!="BTCUSDT"){
            body = await API_buyImmediate(market, krw/10);
                  console.log("buy" + market);
        }
        
        console.log("check"+market);
        
        //console.log(body);
        //volume[market]=JSON.parse(body).volume;
      } else if (rsiSignal == "SHORT" || rsiSignal == "BIGSHORT") {
        let volume = {};
        for (var j in balance) {
          if ("KRW-" + balance[j].currency == market) {
              if(balance[j].balance!=0){
                volume = balance[j].balance;
                await API_sellImmediate(market, volume);
                console.log("sell"+market);
              }
          }
        }
        console.log(market+" : short");
      }
    }
}
async function catchBeam() {
  ret = await get("http://kali.securekim.com:3082/view");
  //console.log(ret);
  retJSON = JSON.parse(ret);

  balance = await getBalance();
  pbalance = JSON.parse(balance);
  krw = pbalance[0].balance;
  console.log(krw);

  for (var i in retJSON) {
    //console.log(i+" : "+retJSON[i].rsiSignal);
    market = i;
    rsiSignal = retJSON[i].rsiSignal;
    rsiSignal_target = retJSON[i].rsiSignal_target;
    if (rsiSignal == "LONG") {
      body = await API_buyImmediate(market, krw / 10);

      //console.log(body);
      //volume[market]=JSON.parse(body).volume;
    }
    if (rsiSignal == "SHORT") {
      for (j in balance)
        if ("KRW-" + balance[j].currency == market) {
          body = await API_sellImmediate(market, balance[j].balance);
        }
    }
  }
}
async function get(url) {
  return new Promise(function (resolve, reject) {
    request(url, (error, response, body) => {
      if (error) reject();
      console.log(response.statusCode);
      resolve(body);
    });
  });
}
async function main() {
  //// ERROR TEST - BUY ////
  //await API_sellImmediate("KRW-MED",8400.93);
  //sellAll();

//   balance = await getBalance();
//   body = balance;

  //body = await API_buyImmediate("KRW-BTC",15000000);

  //targetSell("KRW-ETH");

  //console.log(body);

  //setInterval(catchBeam,7000);
  //setInterval(rsiBasedTrade,30000);
  
  setInterval(shortTermTrade, 7000);
  //while(true){
  //  }

// retS=await get('http://kali.securekim.com:3082/signals');
  // retSJSON=JSON.parse(retS);
  // KRWBTC=retSJSON["KRW-BTC"];
  // console.log(KRWBTC.rsiSignal);

  //"KRW-OMG":{"rsiSignal":"DEFAULT","rsiSignal_target":"DEFAULT"
  //,"position":1,"position_target":2,
  //"smaSignal":-1,"timeStamp":"6/27/2021,6:23:16 PM"
  // ,"cma":0,"cma_target":0.01315538920922199,
  //"realTimePrice":"-1","ask_price":4125,
  //"ask_volume":13.14710927,"bid_price":4120,
  //"bid_volume":1724.3285821,"realTimeStamp":"6/27/2021,6:22:16 PM"
  // ,"bid_power":14724248.50460675,"ask_power":3103960.82706605,
  //"rsiSignalChanged":0,"price":4120},
}

main();
