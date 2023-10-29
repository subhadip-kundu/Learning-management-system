import Payment from "../Models/payment.model.js";
import User from "../Models/user.model.js";
import { razorpay } from "../Server.js";
import AppError from "../Utils/error.util.js";


const getRazorpayApiKey = async (req, res, next) => {
    res.status(200).json(
        {
            success: true,
            message: 'Razorpay API key',
            key: process.env.RAZORPAY_KEY_ID
        }
    );
}
const buySubscription = async (req, res, next) => {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
        return next(
            new AppError('Please ensure you are a holding a verified email', 500)
        )
    }

    if (user.role === 'ADMIN') {
        return next(
            new AppError("Admin can't purchase course", 403)
        )
    }

    const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1
    })

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Subscribed successfully',
        subscription_id: subscription.id
    })
}
const verifySubscription = async (req, res, next) => {

    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return next(
                new AppError('Unauthorized please login', 500)
            )
        }

        const subscriptionId = user.subscription.id;

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id} | ${subscriptionId}`)
            .digit('hex');


        if (generatedSignature !== razorpay_signature) {
            return next(
                new AppError('Payment not verified, please try again', 500)
            )
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        });

        user.subscription.status = 'active';

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully!'
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}


// Logic for cancel subscription


const cancelSubscription = async (req, res, next) => {

    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if (!user) {
            return next(
                new AppError('Please ensure you are a holding a verified email', 500)
            )
        }

        if (user.role === 'ADMIN') {
            return next(
                new AppError("Admin can't cancel course", 403)
            )
        }

        const subscriptionId = user.subscription.id;

        const subscription = await razorpay.subscriptions.cancel(
            subscriptionId
        )


        user.subscription.status = subscription.status;

        await user.save();
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}


//Logic for show all payment details


const allPayments = async (req, res, next) => {

    try {
        const { count } = req.query;

        const subscription = await razorpay.subscriptions.all({
            count: count || 10,
        });

        // const payment

        res.status(200).json(
            {
                success: true,
                message: "done",
                subscription
            }
        );
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}



export {
    getRazorpayApiKey,
    allPayments,
    cancelSubscription,
    verifySubscription,
    buySubscription
}

