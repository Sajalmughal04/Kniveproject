// ✅ /src/Knive/ReviewPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ReviewPage = () => {
  const { id } = useParams(); // product id
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reviewText.trim()) return alert("Please write a review first!");

    const newReview = {
      id: Date.now(),
      text: reviewText,
      rating,
    };

    setReviews([newReview, ...reviews]);
    setReviewText("");
    setRating(5);
    alert("✅ Your review has been submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
          Write a Review
        </h1>

        {/* ✅ Review Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            className="w-full border dark:border-gray-700 rounded-lg p-3 h-32 dark:bg-gray-900 dark:text-white"
          />

          <div className="flex items-center gap-3">
            <label className="font-medium dark:text-gray-200">Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-900 dark:text-white"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-all"
          >
            Submit Review
          </button>
        </form>

        {/* ✅ Show Submitted Reviews */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Reviews:</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="border-b dark:border-gray-700 pb-3 dark:text-gray-200"
                >
                  <p className="font-medium">{r.rating} ⭐</p>
                  <p>{r.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
