import mongoose from "mongoose";


const  TweetSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner"
    },
  },
  {
    timestamps: true
  }
)



export const Tweet = mongoose.model("Tweet", TweetSchema)