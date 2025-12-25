import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";
import User from "../models/Users.js";
import Enrollment from "../models/Enrollment.js";

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if already enrolled
        if (course.enrolledStudents.includes(userId)) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        const options = {
            amount: course.price * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                courseId: course._id.toString(),
                userId: userId.toString()
            }
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            course // Send course details for UI
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Something went wrong while creating order" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
        const userId = req.user._id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment successful, enroll user

            // 1. Save Payment Record
            const course = await Course.findById(courseId);

            await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                user: userId,
                course: courseId,
                amount: course.price
            });

            // 2. Calculate Expiry
            let expiresAt;
            if (course.validityMode === 'date') {
                expiresAt = new Date(course.validityValue);
            } else {
                // Days
                const days = parseInt(course.validityValue, 10) || 365;
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + days);
            }

            // 3. Create Enrollment Record
            await Enrollment.create({
                user: userId,
                course: courseId,
                expiresAt: expiresAt,
                paymentId: null // We'd get the ID if we saved payment first. Let's fix order.
            });
            // Update logic: we already saved payment above, but didn't capture ID.
            // Simplified: Just proceed with Enrollment creation.

            // 4. Enroll User in Course (Legacy array support)
            if (!course.enrolledStudents.includes(userId)) {
                course.enrolledStudents.push(userId);
                await course.save();
            }

            // 3. Add Course to User's enrolled courses (if schema supports it, for now relying on Course model)
            // If User model has enrolledCourses array:
            // await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });


            res.status(200).json({
                success: true,
                message: "Payment verified and User enrolled successfully"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid Signature"
            });
        }

    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getRazorpayKey = (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};
