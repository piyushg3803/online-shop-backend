const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    points: [{ type: String, required: true, trim: true }]
});

const faqAnswerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    points: [{ type: String, required: true }]
});

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: [faqAnswerSchema]
});

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, index: true },
    price: { 
        type: Number, 
        required: true,
        min: [0, 'Price cannot be negative']
    },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    download_url:{
        type: String, required: true, 
    },
    stock: { 
        type: Number, 
        required: true,
        min: [0, 'Stock cannot be negative']
    },
    description: [descriptionSchema],
    faqs: [faqSchema],
    productImages: [{
        url: { type: String, required: true, trim: true },
        public_id: { type: String, required: true, trim: true }
    }],
    ratings: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5
    },
    status:{
        type:String,
        default:"Active",
        enum:["Active","Inactive"]
    },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    createdUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add compound index for better search performance
productSchema.index(
    { 
        name: 'text',
        category: 1,
        brand: 1
    },
    {
        weights: {
            name: 10,
            category: 5,
            brand: 3
        }
    }
);

// Add method to calculate average rating+9
productSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
};

// Update ratings field before save
productSchema.pre('save', function(next) {
    if (this.isModified('reviews')) {
        this.ratings = this.calculateAverageRating();
        this.numReviews = this.reviews.length;
    }
    next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
