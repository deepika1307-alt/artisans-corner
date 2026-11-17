const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image to upload."
            });
        }

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'artisans-corner/products',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(req.file.buffer);
        });

        res.status(200).json({
            message: "Image uploaded successfully!",
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        console.error("Image Upload Error:", error);

        res.status(500).json({
            message: "Image upload failed."
        });
    }
};

module.exports = { uploadImage };