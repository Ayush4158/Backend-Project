import mongoose from "mongoose";


const  playlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    video: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vidoe"
    }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner"
    },
  },
  {
    timestamps: true
  }
)



export const Playlist = mongoose.model("Playlist", playlistSchema)