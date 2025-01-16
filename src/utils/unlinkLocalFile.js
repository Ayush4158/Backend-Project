import fs from "fs"

const removeLocalFile = (localpath) => {
  fs.unlink(localpath, (err => {
    if(err){
      console.log("Error while deleting from local storage: ", err)
    }else{
      console.log("\n file deleted")
    }
  }))
}

export {removeLocalFile}