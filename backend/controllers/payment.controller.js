
import crypto from "crypto";
import mongoose from "mongoose";

import Store from "../models/storeModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Product from "../models/productModel.js";
import StorePaymentConfig from "../models/storePaymentConfigModel.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackRequest = async (endpoint, options = {}) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack secret key is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const result = await response.json();

  if (!response.ok || !result.status) {
    throw new Error(result.message || "Paystack request failed");
  }

  return result.data;
};

const getMerchantStore = async (userId) => {
  return Store.findOne({ owner: userId });
};

const createPaymentReference = () => {
  return `WB-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const canAccessOrder = (order, req, trackingToken) => {
  if (
    req.user &&
    order.customer.user?.toString() === req.user._id.toString()
  ) {
    return true;
  }

  if (
    trackingToken &&
    /^[a-f0-9]{64}$/i.test(trackingToken) &&
    order.trackingTokenHash &&
    hashToken(trackingToken) === order.trackingTokenHash
  ) {
    return true;
  }

  return false;
};

const getPlatformCommission = () => {
  const commission = Number(
    process.env.PAYSTACK_PLATFORM_COMMISSION_PERCENT ?? 0
  );

  if (!Number.isFinite(commission) || commission < 0 || commission > 100) {
    throw new Error("Invalid Paystack platform commission configuration");
  }

  return commission;
};

export const getPaystackBanks = async (req, res) => {
  try {
    const banks = await paystackRequest(
      "/bank?country=nigeria&perPage=100"
    );

    return res.status(200).json({
      success: true,
      banks: banks.map((bank) => ({
        name: bank.name,
        code: bank.code,
        slug: bank.slug,
      })),
    });
  } catch (error) {
    console.error("Get Paystack banks error:", error);

    return res.status(502).json({
      success: false,
      message: "Failed to retrieve banks from Paystack",
    });
  }
};

export const getMyPaymentConfig = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You need to create a store first",
      });
    }

    const config = await StorePaymentConfig.findOne({
      store: store._id,
      provider: "paystack",
    }).select("-__v");

    return res.status(200).json({
      success: true,
      connected: Boolean(config?.isActive),
      config,
    });
  } catch (error) {
    console.error("Get payment config error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment configuration",
    });
  }
};

export const connectPaystackAccount = async (req, res) => {
  try {
    const {
      businessName,
      settlementBank,
      accountNumber,
      contactName,
      contactEmail,
      contactPhone,
    } = req.body;

    if (
      typeof businessName !== "string" ||
      !businessName.trim() ||
      businessName.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid business name is required",
      });
    }

    if (
      typeof settlementBank !== "string" ||
      !/^[a-zA-Z0-9_-]{2,20}$/.test(settlementBank)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid Paystack bank code is required",
      });
    }

    if (
      typeof accountNumber !== "string" ||
      !/^\d{10}$/.test(accountNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit Nigerian bank account number is required",
      });
    }

    if (
      contactName !== undefined &&
      (typeof contactName !== "string" || contactName.length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact name",
      });
    }

    if (
      contactEmail !== undefined &&
      (typeof contactEmail !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact email",
      });
    }

    if (
      contactPhone !== undefined &&
      (typeof contactPhone !== "string" || contactPhone.length > 30)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact phone number",
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You need to create a store first",
      });
    }

    const existingConfig = await StorePaymentConfig.findOne({
      store: store._id,
    });

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: "A Paystack account is already connected to this store",
      });
    }

    const percentageCharge = getPlatformCommission();

    const paystackData = await paystackRequest("/subaccount", {
      method: "POST",
      body: {
        business_name: businessName.trim(),
        settlement_bank: settlementBank,
        account_number: accountNumber,
        percentage_charge: percentageCharge,
        description: `Wavebuy store: ${store.name}`,
        primary_contact_name: contactName?.trim() || undefined,
        primary_contact_email: contactEmail?.trim().toLowerCase() || undefined,
        primary_contact_phone: contactPhone?.trim() || undefined,
      },
    });

    if (!paystackData.subaccount_code) {
      throw new Error("Paystack did not return a subaccount code");
    }

    const config = await StorePaymentConfig.create({
      store: store._id,
      provider: "paystack",
      subaccountCode: paystackData.subaccount_code,
      businessName: paystackData.business_name || businessName.trim(),
      accountName: paystackData.account_name || "",
      settlementBank: paystackData.settlement_bank || "",
      currency: paystackData.currency || "NGN",
      percentageCharge,
      isActive: paystackData.active !== false,
    });

    return res.status(201).json({
      success: true,
      message: "Paystack account connected successfully",
      config,
    });
  } catch (error) {
    console.error("Connect Paystack account error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This Paystack subaccount is already connected",
      });
    }

    return res.status(502).json({
      success: false,
      message: error.message || "Failed to connect Paystack account",
    });
  }
};

export const initializePaystackPayment = async (req, res) => {
  try {
    const { orderId, trackingToken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required",
      });
    }

    const order = await Order.findById(orderId).select(
      "+trackingTokenHash"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!canAccessOrder(order, req, trackingToken)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(409).json({
        success: false,
        message: "Payment is unavailable for a cancelled order",
      });
    }

    if (order.currency !== "NGN") {
      return res.status(400).json({
        success: false,
        message: "Only NGN payments are currently supported",
      });
    }

    const config = await StorePaymentConfig.findOne({
      store: order.store,
      provider: "paystack",
      isActive: true,
    });

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "This store has not connected an active Paystack account",
      });
    }

    const amountMinor = Math.round(order.total * 100);

    if (
      !Number.isSafeInteger(amountMinor) ||
      amountMinor < 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "The order total must be at least NGN 50",
      });
    }

    const reference = createPaymentReference();

    const payment = await Payment.create({
      store: order.store,
      order: order._id,
      provider: "paystack",
      reference,
      amountMinor,
      currency: "NGN",
      customerEmail: order.customer.email,
      status: "pending",
    });

    try {
      const paystackData = await paystackRequest(
        "/transaction/initialize",
        {
          method: "POST",
          body: {
            email: order.customer.email,
            amount: String(amountMinor),
            currency: "NGN",
            reference,
            callback_url: process.env.PAYSTACK_CALLBACK_URL,
            subaccount: config.subaccountCode,
            bearer: process.env.PAYSTACK_FEE_BEARER || "account",
            metadata: JSON.stringify({
              orderId: order._id.toString(),
              orderNumber: order.orderNumber,
              storeId: order.store.toString(),
              paymentId: payment._id.toString(),
            }),
          },
        }
      );

      payment.authorizationUrl = paystackData.authorization_url;
      payment.accessCode = paystackData.access_code;
      await payment.save();

      return res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        payment: {
          reference: payment.reference,
          authorizationUrl: payment.authorizationUrl,
          accessCode: payment.accessCode,
          amount: order.total,
          currency: order.currency,
        },
      });
    } catch (error) {
      payment.status = "failed";
      payment.failureMessage = error.message;
      await payment.save();

      throw error;
    }
  } catch (error) {
    console.error("Initialize Paystack payment error:", error);

    return res.status(502).json({
      success: false,
      message: error.message || "Failed to initialize payment",
    });
  }
};

const updateFailedPayment = async (payment, gatewayData) => {
  const statusMap = {
    failed: "failed",
    abandoned: "abandoned",
    reversed: "reversed",
  };

  const newStatus = statusMap[gatewayData.status];

  if (newStatus) {
    payment.status = newStatus;
    payment.gatewayStatus = gatewayData.status;
    payment.failureMessage = gatewayData.gateway_response || "";
    await payment.save();
  }
};

const applySuccessfulPayment = async (reference, gatewayData) => {
  const session = await mongoose.startSession();

  const paidAt = gatewayData.paid_at
    ? new Date(gatewayData.paid_at)
    : new Date();

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ reference }).session(session);

      if (!payment) {
        throw new Error("Payment record not found");
      }

      const order = await Order.findById(payment.order).session(session);

      if (!order) {
        throw new Error("Order record not found");
      }

      if (order.paymentStatus === "paid") {
        payment.status = "success";
        payment.gatewayStatus = "success";
        payment.gatewayTransactionId = String(gatewayData.id || "");
        payment.paidAt = paidAt;

        if (order.paymentReference !== reference) {
          payment.requiresRefund = true;
        }

        await payment.save({ session });
        return;
      }

      for (const item of order.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            store: order.store,
            stockQuantity: { $gte: item.quantity },
          },
          {
            $inc: { stockQuantity: -item.quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          throw new Error("INVENTORY_SHORTAGE");
        }
      }

      payment.status = "success";
      payment.gatewayStatus = "success";
      payment.gatewayTransactionId = String(gatewayData.id || "");
      payment.paidAt = paidAt;
      payment.requiresRefund = false;

      order.paymentStatus = "paid";
      order.paymentReference = reference;
      order.paidAt = paidAt;
      order.inventoryStatus = "deducted";

      order.timeline.push({
        status: "paid",
        note: "Paystack payment verified successfully. Product stock deducted.",
      });

      await payment.save({ session });
      await order.save({ session });
    });

  } catch (error) {
    if (error.message !== "INVENTORY_SHORTAGE") {
      throw error;
    }

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    const order = await Order.findById(payment.order);

    if (!order) {
      throw new Error("Order record not found");
    }

    payment.status = "success";
    payment.gatewayStatus = "success";
    payment.gatewayTransactionId = String(gatewayData.id || "");
    payment.paidAt = paidAt;

    if (order.paymentStatus === "paid") {
      payment.requiresRefund = order.paymentReference !== reference;
      await payment.save();

      return {
        inventoryStatus: order.inventoryStatus,
        requiresRefund: payment.requiresRefund,
      };
    }

    order.paymentStatus = "paid";
    order.paymentReference = reference;
    order.paidAt = paidAt;
    order.inventoryStatus = "insufficient";

    order.timeline.push({
      status: "paid",
      note: "Payment succeeded, but available stock was insufficient. Merchant review is required.",
    });

    await payment.save();
    await order.save();

    return {
      inventoryStatus: "insufficient",
      requiresRefund: false,
    };
  } finally {
    await session.endSession();
  }

  const payment = await Payment.findOne({ reference });
  const order = await Order.findById(payment.order);

  return {
    inventoryStatus: order.inventoryStatus,
    requiresRefund: payment.requiresRefund,
  };
};

const verifyPaystackTransaction = async (reference) => {
  return paystackRequest(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
};

const validateSuccessfulTransaction = (
  gatewayData,
  payment
) => {
  if (gatewayData.status !== "success") {
    return false;
  }

  if (gatewayData.reference !== payment.reference) {
    return false;
  }

  if (Number(gatewayData.amount) !== payment.amountMinor) {
    return false;
  }

  if (
    String(gatewayData.currency).toUpperCase() !==
    payment.currency.toUpperCase()
  ) {
    return false;
  }

  if (
    gatewayData.customer?.email &&
    gatewayData.customer.email.toLowerCase() !==
      payment.customerEmail.toLowerCase()
  ) {
    return false;
  }

  return true;
};

export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const { trackingToken } = req.query;

    if (
      typeof reference !== "string" ||
      !/^[a-zA-Z0-9.=_-]{1,100}$/.test(reference)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment reference",
      });
    }

    const payment = await Payment.findOne({
      reference,
      provider: "paystack",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const order = await Order.findById(payment.order).select(
      "+trackingTokenHash"
    );

    if (!order || !canAccessOrder(order, req, trackingToken)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment",
      });
    }

    if (payment.status === "success") {
      return res.status(200).json({
        success: true,
        message: "Payment has already been verified",
        paymentStatus: "success",
        requiresRefund: payment.requiresRefund,
        inventoryStatus: order.inventoryStatus,
        order,
      });
    }

    const gatewayData = await verifyPaystackTransaction(reference);

    if (gatewayData.status !== "success") {
      await updateFailedPayment(payment, gatewayData);

      return res.status(200).json({
        success: true,
        message: "Payment has not been completed",
        paymentStatus: gatewayData.status,
      });
    }

    if (!validateSuccessfulTransaction(gatewayData, payment)) {
      payment.status = "failed";
      payment.failureMessage = "Paystack verification details did not match the expected payment";
      await payment.save();

      return res.status(409).json({
        success: false,
        message: "Payment verification failed because transaction details did not match",
      });
    }

    const result = await applySuccessfulPayment(reference, gatewayData);

    const updatedOrder = await Order.findById(payment.order);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentStatus: "success",
      inventoryStatus: result.inventoryStatus,
      requiresRefund: result.requiresRefund,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Verify Paystack payment error:", error);

    return res.status(502).json({
      success: false,
      message: "Failed to verify payment with Paystack",
    });
  }
};

const safeCompareHex = (first, second) => {
  if (
    typeof first !== "string" ||
    typeof second !== "string" ||
    !/^[a-f0-9]{128}$/i.test(first) ||
    !/^[a-f0-9]{128}$/i.test(second)
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(first, "hex"),
    Buffer.from(second, "hex")
  );
};

const verifyWebhookSignature = (req) => {
  if (!Buffer.isBuffer(req.body)) {
    return false;
  }

  const rawBody = req.body;

  const paystackSignature = req.headers["paystack-signature"];
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (paystackSignature && webhookSecret) {
    const parts = paystackSignature.split(",");
    let timestamp = null;
    const signatures = [];

    for (const part of parts) {
      const [key, ...valueParts] = part.trim().split("=");
      const value = valueParts.join("=");

      if (key === "t") {
        timestamp = value;
      }

      if (key === "v1") {
        const separator = value.indexOf(":");

        if (separator !== -1) {
          signatures.push(value.slice(separator + 1));
        }
      }
    }

    const timestampNumber = Number(timestamp);

    if (
      !Number.isFinite(timestampNumber) ||
      Math.abs(Date.now() / 1000 - timestampNumber) > 300
    ) {
      return false;
    }

    const expected = crypto
      .createHmac("sha512", webhookSecret)
      .update(`${timestamp}.${rawBody.toString("utf8")}`)
      .digest("hex");

    return signatures.some((signature) =>
      safeCompareHex(signature, expected)
    );
  }

  const legacySignature = req.headers["x-paystack-signature"];
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!legacySignature || !secretKey) {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  return safeCompareHex(legacySignature, expected);
};

export const handlePaystackWebhook = async (req, res) => {
  try {
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Paystack webhook signature",
      });
    }

    let event;

    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    if (event.event !== "charge.success") {
      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    const reference = event.data?.reference;

    if (!reference) {
      return res.status(200).json({
        success: true,
        message: "Webhook received without a payment reference",
      });
    }

    const payment = await Payment.findOne({
      reference,
      provider: "paystack",
    });

    if (!payment) {
      return res.status(200).json({
        success: true,
        message: "No matching Wavebuy payment found",
      });
    }

    const gatewayData = await verifyPaystackTransaction(reference);

    if (!validateSuccessfulTransaction(gatewayData, payment)) {
      console.error("Paystack webhook verification mismatch:", reference);

      return res.status(200).json({
        success: true,
        message: "Webhook received but transaction verification did not match",
      });
    }

    await applySuccessfulPayment(reference, gatewayData);

    return res.status(200).json({
      success: true,
      message: "Paystack payment webhook processed",
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
