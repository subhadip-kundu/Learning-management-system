import { Router } from 'express';
import { allPayments, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from '../Controllers/payment.controller.js';
import { authorizedRoles, isLoggedIn } from '../Middleware/auth.middleware.js';

const paymentsRoute = Router();

paymentsRoute
    .route('/razorpay-key')
    .get(
        isLoggedIn,
        getRazorpayApiKey
    )

paymentsRoute
    .route('/subscribe')
    .post(
        isLoggedIn,
        buySubscription
    )

paymentsRoute
    .route('/verify')
    .post(
        isLoggedIn,
        verifySubscription
    )

paymentsRoute
    .route('/unsubscribe')
    .post(
        isLoggedIn,
        cancelSubscription
    )

paymentsRoute
    .route('/')
    .get(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        allPayments
    );


export default paymentsRoute;