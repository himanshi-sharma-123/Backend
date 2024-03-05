import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkOwner = async (tweetId, id) => {
  const tweet = await Tweet.findById(tweetId);

  if (tweet?.owner !== id) {
    return false;
  }
  return true;
};

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(404, "Content is required");
  }

  const tweet = await Tweet.create({
    content: content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Server is not able to create a tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  if (!userId) {
    throw new ApiError(400, "UserId is missing!");
  }
  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!tweet.length) {
    throw new ApiError(404, "No tweets found for this user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "all tweets retrieved!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }

  if (!tweetId) {
    throw new ApiError(400, "Invalid tweet Id");
  }

  if (!checkOwner(tweetId, req.user?._id)) {
    throw new ApiError(404, "Unauthorized access");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,

    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "TweetId is required!");
  }
  if (!checkOwner(tweetId, req.user?._id)) {
    throw new ApiError(404, "Unauthorised Access");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
