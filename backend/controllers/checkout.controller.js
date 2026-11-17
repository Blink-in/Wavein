import crypto from "crypto";
import Cart from "../models/cartModel.js";
import Store from "../models/storeModel.js";
import DeliverySettings from "../models/deliverySettingsModel.js";
import Order from "../models/orderModel.js";

const GUEST_COOKIE_NAME = "wavebuy_guest_cart";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createTrackingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const createOrderNumber = () => {
  return `WB-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

const normalize = (value) => value.trim().toLowerCase();

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const createCheckout = async (req, res) => {
  try {
    const { customer, shippingAddress, deliveryZoneId } = req.body;

    if (!customer || typeof customer !== "object") {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
      });
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredCustomerFields = ["name", "email", "phone"];

    for (const field of requiredCustomerFields) {
      if (
        typeof customer[field] !== "string" ||
        !customer[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Customer ${field} is required`,
        });
      }
    }

    if (!isValidEmail(customer.email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid customer email",
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "country",
    ];

    for (const field of requiredAddressFields) {
      if (
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Shipping address ${field} is required`,
        });
      }
    }

    if (
      typeof deliveryZoneId !== "string" ||
      !/^[a-f\d]{24}$/i.test(deliveryZoneId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid delivery zone ID is required",
      });
    }

    const store = await Store.findOne({
      slug: req.params.slug.toLowerCase(),
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    let cartFilter;

    if (req.user) {
      cartFilter = {
        store: store._id,
        user: req.user._id,
      };
    } else {
      const guestToken = req.cookies?.[GUEST_COOKIE_NAME];

      if (!guestToken || !/^[a-f0-9]{64}$/i.test(guestToken)) {
        return res.status(400).json({
          success: false,
          message: "Your guest cart could not be identified. Please refresh your cart.",
        });
      }

      cartFilter = {
        store: store._id,
        guestTokenHash: hashToken(guestToken),
      };
    }

    const cart = await Cart.findOne(cartFilter).populate({
      path: "items.product",
      select: "name slug price images sku stockQuantity status store",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const settings = await DeliverySettings.findOne({
      store: store._id,
    });

    if (!settings || !settings.isDeliveryEnabled) {
      return res.status(400).json({
        success: false,
        message: "Delivery is currently unavailable for this store",
      });
    }

    const deliveryZone = settings.zones.id(deliveryZoneId);

    if (!deliveryZone || !deliveryZone.isActive) {
      return res.status(400).json({
        success: false,
        message: "Selected delivery zone is unavailable",
      });
    }

    const addressState = normalize(shippingAddress.state);
    const addressCity = normalize(shippingAddress.city);

    const stateMatches = deliveryZone.states.some(
      (state) => normalize(state) === addressState
    );

    const cityMatches =
      deliveryZone.cities.length === 0 ||
      deliveryZone.cities.some(
        (city) => normalize(city) === addressCity
      );

    if (!stateMatches || !cityMatches) {
      return res.status(400).json({
        success: false,
        message: "This delivery zone does not cover your shipping address",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (
        !product ||
        product.store.toString() !== store._id.toString() ||
        product.status !== "published"
      ) {
        return res.status(409).json({
          success: false,
          message: "One or more products in your cart are no longer available",
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(409).json({
          success: false,
          message: `${product.name} does not have enough stock for your requested quantity`,
        });
      }

      const lineTotal = product.price * item.quantity;

      subtotal += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku || "",
        image: product.images?.[0] || "",
        price: product.price,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const deliveryFee = deliveryZone.fee;
    const total = subtotal + deliveryFee;

    const trackingToken = createTrackingToken();

    const order = await Order.create({
      orderNumber: createOrderNumber(),
      store: store._id,
      customer: {
        user: req.user?._id || null,
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
      },
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2?.trim() || "",
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        country: shippingAddress.country.trim(),
        postalCode: shippingAddress.postalCode?.trim() || "",
      },
      delivery: {
        zoneName: deliveryZone.name,
        fee: deliveryFee,
        status: "pending",
      },
      subtotal,
      deliveryFee,
      total,
      currency: store.currency || "NGN",
      paymentStatus: "pending",
      orderStatus: "pending",
      trackingTokenHash: hashToken(trackingToken),
      timeline: [
        {
          status: "pending",
          note: "Order placed successfully",
          actor: req.user?._id || null,
        },
      ],
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order.toJSON(),
      trackingToken,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create your order",
    });
  }
};