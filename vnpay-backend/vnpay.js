import qs from "qs";
import crypto from "crypto";

function formatDate(date) {
  const pad = (x) => (x < 10 ? "0" + x : x);

  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (let key of keys) {
    sorted[key] = obj[key];
  }

  return sorted;
}

export const createPayment = (req, res) => {
  const { amount, orderInfo, orderId, ipAddr } = req.body;

  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_SECRETKEY;
  const returnUrl = process.env.VNP_RETURNURL;
  const vnpUrl = process.env.VNP_SANDBOX;

  const date = new Date();
  const expireDate = new Date(date.getTime() + 15 * 60 * 1000);

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100,
    vnp_CreateDate: formatDate(date),
    vnp_ExpireDate: formatDate(expireDate),
    vnp_CurrCode: "VND",
    vnp_IpAddr: ipAddr,
    vnp_Locale: "vn",
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: orderId,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: true });

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(signData).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: true });

  res.json({ paymentUrl });
};