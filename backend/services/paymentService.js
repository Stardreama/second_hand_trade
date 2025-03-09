const wxpay = require("wxpay");
const paymentConfig = require("../config/paymentConfig");

// const pay = new wxpay({
//   appid: paymentConfig.appid,
//   mch_id: paymentConfig.mch_id,
//   key: paymentConfig.key,
// });

// const createOrder = (order) => {
//   return new Promise((resolve, reject) => {
//     pay
//       .unifiedOrder({
//         body: "校园二手交易", // 商品描述
//         out_trade_no: order.order_id, // 订单号
//         total_fee: order.total_fee * 100, // 总金额 (单位为分)
//         spbill_create_ip: "127.0.0.1", // 终端IP
//         notify_url: paymentConfig.notify_url, // 回调通知URL
//         trade_type: "JSAPI", // 交易类型：JSAPI表示公众号支付
//         openid: order.openid, // 用户的OpenID
//       })
//       .then((result) => {
//         // 返回支付参数
//         resolve({
//           appId: paymentConfig.appid,
//           timeStamp: Math.floor(Date.now() / 1000),
//           nonceStr: Math.random().toString(36).substring(2),
//           package: `prepay_id=${result.prepay_id}`,
//           signType: "MD5",
//           paySign: result.paySign,
//         });
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

const createOrder = (order) => {
  return {
    appId: paymentConfig.appid,
    timeStamp: Math.floor(Date.now() / 1000),
    nonceStr: Math.random().toString(36).substring(2),
    package: `prepay_id=${result.prepay_id}`,
    signType: "MD5",
    paySign: result.paySign,
  };
};

module.exports = {
  createOrder,
};
