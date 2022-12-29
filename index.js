const { default: axios } = require("axios");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const URL =
  "https://api.zettablock.com/api/v1/dataset/sq_f3457e8e412b486284187c17e6ffedc3/graphql";

async function getRespose(query) {
  try {
    let resp = await axios.post(
      URL,
      { query },
      {
        headers: {
          accept: "application/json",
          "X-API-KEY": `${process.env.TOKEN_ZETTA}`,
          "content-type": "application/json",
        },
      }
    );
    return resp.data.data.records;
  } catch (e) {
    console.log(e);
  }
}

function generateBotResponse1(data) {
  let resp = "Coins:\n";
  data.forEach((element) => {
    resp = resp + `${element.symbol}, `;
  });
  return resp;
}

function generateBotResponse2(data) {
  let resp = "";
  data.forEach((element) => {
    resp =
      resp +
      `Coin: ${element.symbol}\nDeposit APY: ${
        parseFloat(element.deposit_apy).toFixed(5) * 100
      }%\nStable borrow APY: ${
        parseFloat(element.stable_borrow_apy).toFixed(5) * 100
      }%\nVariable borrow APY: ${
        parseFloat(element.variable_borrow_apy).toFixed(5) * 100
      }%\n`;
  });
  return resp;
}

const bot = new TelegramBot(process.env.TOKEN_BOT, { polling: true });

bot.onText(/\/allcoins/, async (msg, match) => {
  const chatId = msg.chat.id;
  let query = `{
    records {
      symbol
    }
  }`;

  let rmsg = await bot.sendMessage(chatId, "Fetching response...");
  let resp = generateBotResponse1(await getRespose(query));
  bot.editMessageText(resp, {
    chat_id: chatId,
    message_id: rmsg.message_id,
  });
});

bot.onText(/\/coinapy (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const sym = match[1];

  let query = `{
    records(filter: { symbol: {
      eq: "${sym.trim()}"
    }}) {
      symbol,
      deposit_apy,
      stable_borrow_apy,
      variable_borrow_apy
    }
  }`;
  let rmsg = await bot.sendMessage(chatId, "Fetching response...");
  let resp = generateBotResponse2(await getRespose(query));
  bot.editMessageText(resp, {
    chat_id: chatId,
    message_id: rmsg.message_id,
  });
});
