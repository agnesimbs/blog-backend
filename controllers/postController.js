const Post = require("../model/postModel");
const User = require("../model/userModel");

const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../model/errorModel");
const { error } = require("console");
const { isAsyncFunction } = require("util/types");

const createPost = async (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    if (!title) {
      return next(new HttpError("fill in all fields and choose "));
    }
    if (!title || !category || !description || !req.files) {
      return next(new HttpError("fill in all fields and choose thumbnail"));
    }

    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(new HttpError("error:file greator than 2mb"));
    }
    let fileName = thumbnail.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
      splittedFileName[0] +
      uuid() +
      "." +
      splittedFileName[splittedFileName.length - 1];
    thumbnail.mv(
      path.join(__dirname, "..", "/uploads", newFileName),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        } else {
          const newPost = await Post.create({
            title,
            category,
            description,
            thumbnail: newFileName,
            creator: req.user.id,
          });
          if (!newPost) {
            return next(new HttpError("post couldn't be created", 422));
          }
          const currentUser = await User.findById(req.user.id);
          const userPostCount = currentUser.posts + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          res.status(201).json(newPost);
        }
      }
    );
  } catch (error) {
    return next(new HttpError("error"));
  }
};
const editPost = async (req, res, next) => {
  try {
    let fileName, newFilename, updatedPost;
    const postId = req.params.id;
    let { title, category, description } = req.body;
    if (!title || !category || description.length < 3) {
      return next(new HttpError("fill in all fields", 422));
    }
    if (req.user.d == oldPost.creator) {
      if (!req.files) {
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description },
          { new: true }
        );
      } else {
        const oldPost = await Post.findById(postId);
        fs.unlink(
          path.join(__dirname, "..", "uploads", oldPost.thumbnail),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
          return next(new HttpError("Thumbnail too big"));
        }
        fileName = thumbnail.name;
        let splittedFileName = fileName.split(".");
        newFilename =
          splittedFileName[0] +
          uuid() +
          splittedFileName[splittedFileName.length - 1];
        thumbnail.mv(
          path.join(__dirname, "..", "uploads", newFilename, async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          })
        );
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          {
            title,
            category,
            description,
            thumbnail: newFilename,
          },
          { new: true }
        );
      }
      if (!updatedPost) {
        return next(new HttpError("Couldn't update post"), 400);
      }
      res.status(200).json(updatedPost);
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};
const getSinglePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    } else {
      res.status(200).json(post);
    }
  } catch {
    return next(new HttpError(error));
  }
};
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updateAt: -1 });
    res.status(200).json(posts);
  } catch {
    return next(new HttpError(error));
  }
};
const getCategoryPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const categoryPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(categoryPosts);
  } catch {
    return next(new HttpError(error));
  }
};
const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(Posts);
  } catch {
    return next(new HttpError(error));
  }
};
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("post unavailable"), 400);
    }
    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;
    if (req.user.id == post.creator) {
      fs.unlink(
        path.join(__dirname, "..", "uploads", fileName),
        async (err) => {
          if (err) {
            return next(new HttpError(err));
          } else {
            await Post.findByIdAndDelete(postId);
            //reduce
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          }
        }
      );
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};
module.exports = {
  createPost,
  editPost,
  getSinglePost,
  getAllPosts,
  getCategoryPosts,
  getUserPosts,
  deletePost,
};
