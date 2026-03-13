const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const ErrorHandler = require('../utils/errorHandler');
const { orderValidationSchema } = require('../validators/orderValidation');

//////////////////////////////////////////// USER SIDE ////////////////////////////////////////////

exports.createOrder = async (req, res, next) => {
    try {
        const { error } = orderValidationSchema.validate(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        let { items } = req.body
        const { shippingAddress, paymentInfo } = req.body;
       

        // Calculate total and verify stock
        let totalAmount = 0;
        const orderItems = [];

        // set item.quantity
        items = items.map(item => ({ ...item, quantity: item.quantity || 1 }));

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return next(new ErrorHandler(`Product not found: ${item.product}`, 404));
            }
            if (product.stock < item.quantity) {
                return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
            }

            totalAmount += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });

            // Update stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            paymentInfo,
            paidAt: Date.now()
        });

        // Clear cart after successful order
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json({
            success: true,
            order
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
};

exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');

        if (!order) {
            return next(new ErrorHandler('Order not found', 404));
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
};

//////////////////////////////////////////// ADMIN SIDE ////////////////////////////////////////////

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt');

        const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return next(new ErrorHandler('Order not found', 404));
        }

        if (order.status === 'delivered') {
            return next(new ErrorHandler('Order has already been delivered', 400));
        }

        order.status = req.body.status;

        if (req.body.status === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
};
