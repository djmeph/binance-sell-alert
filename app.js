process.env["NTBA_FIX_319"] = 1;
const config = require('./config.json');
const api = require('binance');
const TelegramBot = require('node-telegram-bot-api');
const binance = new api.BinanceRest(config.binance);
const socket = new api.BinanceWS(true);
const bot = new TelegramBot(config.telegram.token, { polling: false });

// Socket listens for new Binance activity and sends alerts for new buy orders via Telegram
socket.onUserData(binance, (res) => {
  if (res.eventType &&
    res.side &&
    res.orderStatus &&
    res.eventType == 'executionReport' &&
    res.side == 'BUY' &&
    res.orderStatus == 'FILLED'
  ) {
    var lastTradePrice = res.lastTradePrice && parseFloat(res.lastTradePrice);
    var accumulatedQuantity = res.accumulatedQuantity && parseFloat(res.accumulatedQuantity);
    if (lastTradePrice && accumulatedQuantity) {
      var cost = lastTradePrice * accumulatedQuantity;
      var resp  = "BINANCE\n";
      resp     += "Just bought: " + res.symbol + "\n";
      resp     += "Rate: " + res.lastTradePrice + "\n";
      resp     += "Amount: " + res.accumulatedQuantity + "\n";
      resp     += "Cost: " + cost.toFixed(8);
      bot.sendMessage(config.telegram.chatId, resp);
    }
  }
}).catch(e => {
  console.error(e);
});
