const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const HttpError = require("../model/errorModel");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
//###########Register User##########
//Post:api/users/register
//Unprotected
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password) {
      return next(new HttpError("Fill in all fields", 422));
    }
    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exist", 422));
    }
    if (password.trim().length < 6) {
      return next(
        new HttpError("password should be at least 8 characters", 422)
      );
    }
    if (password != password2) {
      return next(new HttpError("passwords do not match", 422));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPswd = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashedPswd,
    });
    res.status(201).json(newUser);
  } catch (error) {
    return next(new HttpError("User registration failed", 422));
  }
};
//###########Login a Registered User##########
//Post:api/users/login
//Unprotected
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email | !password) {
      return next(new HttpError("Fill in all fields", 422));
    }
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return next(new HttpError("Invalid credentials", 422));
    }
    const { _id: id, name } = user;

    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login failed.please check your credentials", 422)
    );
  }
};
//########### User Profile##########
//Post:api/users/:id
//Unprotected
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error));
  }
};
//########### Edit User##########
//Post:api/users/edit-user
//Unprotected
const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, newConfirmedPassword } =
      req.body;
    if (!name || !email || !currentPassword || !newPassword) {
      return next(new HttpError("Fill in all fields", 422));
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 403));
    }
    const emailExist = await User.findOne({ email });
    if (emailExist && (emailExist._id = req.user.id)) {
      return next(new HttpError("Email already exists", 422));
    }
    const validateUserPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validateUserPassword) {
      return next(new HttpError("invalid current passord", 422));
    }
    if (newPassword !== newConfirmedPassword) {
      return next(new HttpError("New passwords do not match", 422));
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, password: hash },
      { new: true }
    );
    res.status(200).json(newInfo);
  } catch {}
};
//########### User Profile##########
//Post:api/users/change-avator
//Unprotected
const changeAvator = async (req, res, next) => {
  try {
    if (!req.files.avator) {
      return next(new HttpError("please choose an image", 422));
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(new HttpError("user not found", 404));
    }
    if (user.avator) {
      fs.unlink(path.join(__dirname, "..", "uploads", user.avator), (err) => {
        if (err) {
          return next(new HttpError(err));
        }
      });
    }
    const { avator } = req.files;
    if (avator.size > 500000) {
      return next(
        new HttpError(
          "profile picture is too big,should be less than 500kb",
          422
        )
      );
    }
    let fileName = avator.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
      splittedFileName[0] +
      uuid() +
      "." +
      splittedFileName[splittedFileName.length - 1];
    avator.mv(
      path.join(__dirname, "..", "uploads", newFileName),
      async (err) => {
        if (err) {
          return next(new HttpError("an error", err));
        }
        const updatedAvator = await User.findByIdAndUpdate(
          req.user.id,
          { avator: newFileName },
          { new: true }
        );
        if (!updatedAvator) {
          return next(new HttpError("Avator couldn't be changd", 422));
        }
        res.status(200).json(updatedAvator);
      }
    );
    res.json(req.user);
  } catch (error) {
    return next(new HttpError(error));
  }
};
//########### User Profile##########
//Post:api/users/authors
//Unprotected
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
};
module.exports = {
  registerUser,
  getUser,
  editUser,
  loginUser,
  changeAvator,
  getAuthors,
};
