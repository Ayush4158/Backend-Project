import {Router} from 'express'

import {verifyJWT} from '../middlewares/auth.middleware.js'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.js'
const router = Router()

router.unsubscribe(verifyJWT)
router.route("/").post(createPlaylist)
router.route("/p/:userId").get(getUserPlaylist)
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)
router.route("/:playlistId").get(getPlaylistById).patch(updatePlaylist).delete(deletePlaylist)


export default router