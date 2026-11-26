import Store from "../models/storeModel.js";
import Order from "../models/orderModel.js";

const getMerchantStore = async (userId) => {
  return Store.findOne({ owner: userId });
};

const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getMerchantCustomers = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const search = String(req.query.search || "").trim();

    const match = { store: store._id };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      match.$or = [
        { "customer.name": searchRegex },
        { "customer.email": searchRegex },
        { "customer.phone": searchRegex },
      ];
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $toLower: "$customer.email" },
          name: { $first: "$customer.name" },
          email: { $first: "$customer.email" },
          phone: { $first: "$customer.phone" },
          user: { $first: "$customer.user" },
          ordersCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "paid"] },
                "$total",
                0,
              ],
            },
          },
          lastOrderAt: { $first: "$createdAt" },
          lastOrderStatus: { $first: "$orderStatus" },
        },
      },
      { $sort: { lastOrderAt: -1 } },
      {
        $facet: {
          customers: [{ $skip: skip }, { $limit: limit }],
          metadata: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await Order.aggregate(pipeline);

    const customers = result?.customers || [];
    const total = result?.metadata?.[0]?.total || 0;

    return res.status(200).json({
      success: true,
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get merchant customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customers",
    });
  }
};

export const getMerchantCustomer = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const email = String(req.params.email || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid customer email is required",
      });
    }

    const customerOrders = await Order.find({
      store: store._id,
      "customer.email": new RegExp(`^${escapeRegex(email)}$`, "i"),
    }).sort({ createdAt: -1 });

    if (!customerOrders.length) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const firstOrder = customerOrders[0];
    const paidOrders = customerOrders.filter(
      (order) => order.paymentStatus === "paid"
    );

    const totalSpent = paidOrders.reduce(
      (total, order) => total + order.total,
      0
    );

    return res.status(200).json({
      success: true,
      customer: {
        user: firstOrder.customer.user,
        name: firstOrder.customer.name,
        email: firstOrder.customer.email,
        phone: firstOrder.customer.phone,
        ordersCount: customerOrders.length,
        paidOrdersCount: paidOrders.length,
        totalSpent,
        lastOrderAt: firstOrder.createdAt,
      },
      orders: customerOrders,
    });
  } catch (error) {
    console.error("Get merchant customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customer details",
    });
  }
};
