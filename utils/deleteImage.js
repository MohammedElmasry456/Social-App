const cloudinary = require("./cloudinary");

exports.deleteImage = async (document, req) => {
  let imageId;
  if (req.body.img && document.img && document.img.length !== 0) {
    await Promise.all(
      document.img.map(async (e) => {
        await deleteProcess(e.split("/").slice(-3).join("/").split(".")[0]);
      })
    );
  } else {
    if (req.body.profilePic && document.profilePic !== "") {
      imageId = document.profilePic
        .split("/")
        .slice(-4)
        .join("/")
        .split(".")[0];
      await deleteProcess(imageId);
    }
    if (req.body.groupPic && document.groupPic !== "") {
      imageId = document.groupPic.split("/").slice(-4).join("/").split(".")[0];
      await deleteProcess(imageId);
    }
    if (req.body.coverPic && document.coverPic !== "") {
      imageId = document.coverPic.split("/").slice(-4).join("/").split(".")[0];
      await deleteProcess(imageId);
    }
  }
};

const deleteProcess = async (imageId) => {
  await cloudinary.uploader.destroy(imageId);
};
