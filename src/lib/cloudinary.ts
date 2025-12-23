import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: string) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: 'rental_properties_pictures',
            upload_preset: 'rent_on_map_uploads',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Image upload failed');
    }
};

export const deleteImage = async (imageUrl: string) => {
    try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');

        if (uploadIndex === -1) {
            console.error('Invalid Cloudinary URL format');
            return;
        }

        // Get everything after 'upload/v{version}/'
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image: ${publicId}`);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        // Don't throw error - we still want to delete the property even if image deletion fails
    }
};

export default cloudinary;
