import { prisma } from "../config/db.js";
import { sanitizeHTML, sanitizeText } from "../utils/sanitize.js";
import { getUploadedImage } from "../utils/uploads.js";

export const createPostController = async (request, response) => {
  //if there is no data with request
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Please provide the required data to create a post",
    });
  }
  // if there is no image with request
  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Please select an image for the post",
    });
  }
  const file = request.file;
  const uploadImage = getUploadedImage(file);
  if (!uploadImage) {
    return response.status(400).json({
      success: false,
      message: "Uploading falied",
    });
  }
  const fullpath = process.env.BASEURL + uploadImage.path;
  // get other details from request body
  const { title, content, communityId } = request.body;
  if (!title) {
    return response.status(400).json({
      success: false,
      message: "Please the title of the post",
    });
  }
  if (!content) {
    return response.status(400).json({
      success: false,
      message: "Please write the content of the post",
    });
  }
  // if there is no community id
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Please specifiy the community of your post",
    });
  }
  //get author id from save cookie
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Unauthorised access.",
    });
  }
  const postTitle = sanitizeHTML(sanitizeText(title));
  const postContent = sanitizeHTML(sanitizeText(content));

  try {
    //check if there is post with same title and same community
    const isPostExist = await prisma.post.findFirst({
      where: {
        title: postTitle,
        communityId: communityId,
      },
    });
    if (isPostExist) {
      return response.status(400).json({
        success: false,
        message: "We have already a post in same comunity with same title",
      });
    }
    const posted = await prisma.post.create({
      data: {
        title: postTitle,
        content: postContent,
        imageUrl: fullpath,
        authorId: id,
        communityId: communityId,
      },
    });
    if (!posted) {
      return response.status(400).json({
        success: false,
        message: "Post not saved!. Try again",
      });
    }
    return response.json({
      success: true,
      post: {
        id: posted.id,
        title: posted.title,
        content: posted.content,
        author: posted.communityId,
        community: posted.communityId,
        imageUrl: posted.imageUrl,
      },
      message: "Post save successfully",
    });
  } catch (error) {
    console.error("Error occured while saving the post", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updatePostImage = async (request, response) => {
  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Please select an image to update the poster of the post",
    });
  }
  const { postId } = request.body;
  if (!postId) {
    return response.status(400).json({
      success: false,
      message: "Poster key is missing",
    });
  }
  const { id } = request.user;
  const file = request.file;
  const uploadImage = getUploadedImage(file);
  if (!uploadImage) {
    return response.status(400).json({
      success: false,
      message: "Uploading falied",
    });
  }
  const fullpath = process.env.BASEURL + uploadImage.path;

  try {
    //check user is the author of post
    const isAuthor = await prisma.post.findUnique({
      where: {
        id: postId,
        authorId: id,
      },
    });
    if (!isAuthor) {
      return response.status(401).json({
        success: false,
        message: "Unauthorised access!",
      });
    }

    //update image of post
    const updatePost = await prisma.post.update({
      where: { id: postId },
      data: {
        imageUrl: fullpath,
      },
    });

    return response.json({
      success: true,
      message: "Poster update successfully",
      post: {
        id: updatePost.id,
        title: updatePost.title,
        content: updatePost.content,
        author: updatePost.communityId,
        community: updatePost.communityId,
        imageUrl: updatePost.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error occured while updating the post", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updatePostDetails = async (request, response) => {
  //if there is no data with request
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Please provide the required data to update post",
    });
  }
  const { title, content, postId } = request.body;
  if (!postId) {
    return response.status(400).json({
      success: false,
      message: "Post key is missing",
    });
  }
  if (!title) {
    return response.status(400).json({
      success: false,
      message: "Please the title of the post",
    });
  }
  if (!content) {
    return response.status(400).json({
      success: false,
      message: "Please write the content of the post",
    });
  }

  const { id } = request.user;
  try {
    //check user is the author of post
    const isAuthor = await prisma.post.findUnique({
      where: {
        id: postId,
        authorId: id,
      },
    });
    if (!isAuthor) {
      return response.status(401).json({
        success: false,
        message: "Unauthorised access!",
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
      },
    });

    if (!updatedPost) {
      return response.status(404).json({
        success: false,
        message: "Not found! Post updation failed.",
      });
    }
    return response.json({
      success: true,
      message: "Poster update successfully",
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        author: updatedPost.communityId,
        community: updatedPost.communityId,
        imageUrl: updatedPost.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error occured while updating the post", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const deletePost = async (request, response) => {
  const { postId } = request.params;
  if (!postId) {
    return response.status(400).json({
      success: false,
      message: "Poster key is missing",
    });
  }
  const { id } = request.user;
  try {
    //check user is the author of post
    const isAuthor = await prisma.post.findUnique({
      where: {
        id: postId,
        authorId: id,
      },
    });
    if (!isAuthor) {
      return response.status(401).json({
        success: false,
        message: "Unauthorised access! You cannot delete this post",
      });
    }
    const deletePost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    if (!deletePost) {
      return response.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    return response.json({
      success: true,
      message: "Post deleted successfully",
      post: { id: postId },
    });
  } catch (error) {
    console.error("Error occured while deleting the post", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllPost = async (request, response) => {
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Please login to access the contents",
    });
  }
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!posts) {
      return response.json({
        success: true,
        message: "No post found!",
      });
    }
    posts.forEach((post) => {
      delete post.updateAt;
    });
    return response.json({
      success: true,
      message: "Post List",
      posts,
    });
  } catch (error) {
    console.error("Error occured while getting posts", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getPOst = async (request, response) => {
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Please login to access the contents",
    });
  }
  const { postId } = request.params;
  if (!postId) {
    return response.status(400).json({
      success: false,
      message: "Post key is missing",
    });
  }

  try {
    const postDetails = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!postDetails) {
      return response.json({
        success: true,
        message: "No post found!",
      });
    }
    delete postDetails.updateAt;

    return response.json({
      success: true,
      message: "Single Post",
      postDetails,
    });
  } catch (error) {
    console.error("Error occured while getting post", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
