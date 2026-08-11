import { Type } from "typebox";

/**
 * Parameters for the local_image_reader tool.
 */
export const LOCAL_IMAGE_READER_PARAMS = Type.Object({
	imagePath: Type.String({
		description:
			"Path to a local image file (png, jpeg, webp, gif, bmp). The file must exist.",
	}),
	query: Type.String({
		description:
			"The user query to send to the multimodal model (e.g., 'Describe this image').",
	}),
});
