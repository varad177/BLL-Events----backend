import express from "express";
import mongoose from "mongoose";
import path from "path";
import { v2 } from "cloudinary";
import cloudinary from "cloudinary";
import fs from "fs/promises";

import multer from "multer";
import "dotenv/config";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import User from "./schema/User.js";
import PassUser from "./schema/PassUser.js";
import sendEmail from "./mail/sendMail.js";
import PassModel from "./schema/pass.js";
import { log } from "util";
import { error } from "console";
import sendEmailForPassword from "./mail/sendMailForPassword.js";

const server = express();

// let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
// let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

let PORT = 5000;

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const formatDataToSend = (user) => {
  const access_token = jwt.sign(
    {
      id: user._id,
    },
    process.env.SECRETE_KEY
  );

  return {
    access_token,
    email: user.email,
    fullname: user.fullname,
    role: user.role,
    mobno: user.mobno,
    _id: user._id,
    tasks: user.tasks,
  };
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({
      error: "no access token",
    });
  }

  jwt.verify(token, process.env.SECRETE_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "access token invalid",
      });
    }

    req.user = user.id;
    next();
  });
};

// config cloudinary
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: "DX5PLGdpT-OBOxYhTlq6l5vCNxY",
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (_req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4"
    ) {
      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }

    cb(null, true);
  },
});

//date function
function getYearMonthDay(inputDate) {
  // Parse the input date string into a Date object
  const dateObject = new Date(inputDate);
  const monthAbbreviations = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Extract year, month, and day
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth(); // Adding 1 because months are zero-based
  const day = dateObject.getDate();

  // Return the result as a string in the format "YYYY-MM-DD"
  const result = `${day}-${monthAbbreviations[month]}-${year}`;
  return result;
}

function generateShortNumericId() {
  // Generate a random number between 10000 and 99999
  const randomNum = Math.floor(Math.random() * 90000) + 10000;

  // Convert the random number to a string
  const randomString = randomNum.toString();

  return randomString;
}

//server creates above

//all routes come below

server.post("/add-user", verifyJWT, async (req, res) => {
  const { _id } = req.body;
  const { fullname, email, password, mobno, role } = req.body.user;

  if (!fullname || !email || !password || !mobno || !role) {
    return res.status(400).json({
      message: "Please provide all the details",
    });
  }

  if (_id) {
    bcrypt.hash(password, 10, async (err, hashpassword) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      let user = User.findByIdAndUpdate(
        { _id },
        {
          fullname,
          email,
          password: hashpassword,
          mobno,
          role,
        }
      ).exec();

      return user
        .then((u) => {
          return res.status(200).json(formatDataToSend(u));
        })
        .catch((err) => {
          return res.status(400).json({
            error: err.message,
          });
        });
    });
  } else {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    bcrypt.hash(password, 10, async (err, hashpassword) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      let user = new User({
        fullname,
        email,
        password: hashpassword,
        mobno,
        role,
      });

      return user
        .save()
        .then((u) => {
          return res.status(200).json(formatDataToSend(u));
        })
        .catch((err) => {
          if (err.code == 11000) {
            return res.status(409).json({ error: "Email already exists" });
          }
          return res.status(400).json({
            error: err.message,
          });
        });
    });
  }
});

server.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email.length) {
    return res.status(400).json({
      error: "Please provide the email",
    });
  }
  if (!password.length) {
    return res.status(400).json({
      error: "Please provide the password",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      return res.status(403).json({
        error: "Incorrect password",
      });
    } else {
      return res.status(200).json(formatDataToSend(user));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

server.get("/get-all-users", (req, res) => {
  User.find({})
    .then((users) => {
      return res.status(200).json(users);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "unable to fetch the users, pleased try later",
      });
    });
});

server.post("/add-task", verifyJWT, async (req, res) => {
  const { _id, tasks } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      { $set: { tasks: tasks } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return res.status(200).json({
      message: `Task added successfully to that user`,
    });
  } catch (error) {
    return res.status(400).json({
      error: err.message,
    });
  }
});

server.post("/get-user", (req, res) => {
  let { _id } = req.body;

  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "pleased login first",
        });
      }
      return res.status(200).json({
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        mobno: user.mobno,
        _id: user._id,
        tasks: user.tasks,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: err.message,
      });
    });
});

// ------------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------

//Entry pass routes

server.post("/send-pass", verifyJWT, async (req, res) => {
  try {
    const { id } = req.body;

    const { fname, lname, mobno, email, category, event } = req.body.passUser;

    if (!fname) {
      return res.status(400).json({
        message: "Please provide your First name",
      });
    }
    if (!event) {
      return res.status(400).json({
        message: "Please select the event",
      });
    }

    if (!mobno) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "category is required",
      });
    }

    if (!id) {
      // If no id is provided, it means you want to create a new entry pass
      const user = new PassUser({
        id: generateShortNumericId(),
        fname,
        lname,
        mobno,
        email,
        category,
        passID: event,
      });

      PassModel.findById(event)
        .then((data) => {
          sendEmail(data, { email, id: user.id, name: fname + " " + lname })
            .then((_emailResponse) => {
              user
                .save()
                .then((saveResponse) => {
                  return res.status(200).json({
                    message: "Entry Pass saved and sent successfully",
                  });
                })
                .catch((saveError) => {
                  return res.status(400).json({
                    error: saveError.message,
                  });
                });
            })
            .catch((emailError) => {
              return res.status(400).json({
                error: emailError.message,
              });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // If id is provided, it means you want to update an existing entry pass
      PassUser.findByIdAndUpdate(
        id,
        {
          fname,
          lname,
          mobno,
          email,
          category,
          passID: event,
        },
        { new: true } // This option ensures that the updated document is returned
      )
        .then((updatedUser) => {
          // Send email after updating the document
          PassModel.findById(event)
            .then((data) => {
              sendEmail(data, {
                email,
                id: updatedUser.id,
                name: fname + " " + lname,
              })
                .then((_emailResponse) => {
                  return res.status(200).json({
                    message: "Entry Pass updated successfully and email sent",
                    updatedUser,
                  });
                })
                .catch((emailError) => {
                  return res.status(400).json({
                    error: emailError.message,
                  });
                });
            })
            .catch((err) => {});
        })
        .catch((updateError) => {
          return res.status(400).json({
            error: updateError.message,
          });
        });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

server.post("/create-pass", upload.single("avatar"), async (req, res) => {
  try {
    const {
      heading,
      address,
      location,
      time,
      details,
      mobno1,
      mobno2,
      editor,
      date,
      passId,
    } = req.body;

    console.log(
      heading,
      address,
      location,
      time,
      details,
      mobno1,
      mobno2,
      editor,
      date,
      passId
    );

 


    let pass;

    // Check if passId is provided
    if (passId) {
      const updateData = {
        heading,
        address,
        location,
        time,
        details,
        mobno1,
        mobno2, // Ensure mobno2 is a valid number or null
        editor,
        date: getYearMonthDay(date),
      };

      pass = await PassModel.findOneAndUpdate(
        { _id: passId },
        updateData,
        { new: true } // This option returns the modified document instead of the original
      );

      // Check if the existing pass was not found
      if (!pass) {
        return res
          .status(404)
          .json({ error: "Pass not found for the given passId" });
      }

      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "bll",
          crop: "fill",
        });

        if (result) {
          pass.public_url = result.public_id;
          pass.logourl = result.secure_url;

          // Remove the file from the local system
          fs.rm(`uploads/${req.file.filename}`);
        } else {
          console.log("Result not obtained");
        }
      }
    } else {
      // Validate required fields
      const requiredFields = [
        "heading",
        "address",
        "location",
        "time",
        "details",
        "mobno1",
        "date",
      ];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res
            .status(400)
            .json({ error: `Please fill the ${field} field` });
        }
      }

      // If passId is not provided, create a new pass
      pass = await PassModel.create({
        heading,
        address,
        location,
        time,
        details,
        mobno1,
        mobno2,
        editor,
        date: getYearMonthDay(date),
      });

      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "bll",
          crop: "fill",
        });

        if (result) {
          pass.public_url = result.public_id;
          pass.logourl = result.secure_url;

          // Remove the file from the local system
          fs.rm(`uploads/${req.file.filename}`);
        } else {
          console.log("Result not obtained");
        }
      } else {
        return res.status(400).json({ message: "File not found" });
      }
    }

    // Handle file upload

    // Save the pass
    await pass.save();
    return res.status(200).json({ message: "Pass saved successfully", pass });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

server.get("/get-all-events", (req, res) => {
  try {
    PassModel.find({})
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(400).json({
          error: "you are unable to fill the form now",
        });
      });
  } catch (error) {
    console.log(error.message);
  }
});

server.post("/get-all-passUser", async (req, res) => {
  let { search, page, limit, status } = req.body;

  let maxLimit = limit ? limit : 10;

  const query = status ? { status: true } : {};
  if (!search) {
    try {
      PassUser.find(query)
        .sort({ sendedAt: -1 })
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then((passUsers) => {
          return res.status(200).json(passUsers);
        });
    } catch (error) {
      return res.status(500).json({
        error: "An error has occurred trying to fetch data",
      });
    }
  } else {
    try {
      // Convert the search variable to a string
      const searchString = String(search);

      // Use a regular expression to perform a case-insensitive search on relevant fields
      const results = await PassUser.find({
        $or: [
          { fname: { $regex: new RegExp(searchString, "i") } },
          { lname: { $regex: new RegExp(searchString, "i") } },
          // { mobno: { $regex: new RegExp(searchString, "i") } },
          { email: { $regex: new RegExp(searchString, "i") } },
          { category: { $regex: new RegExp(searchString, "i") } },
          { id: { $regex: new RegExp(searchString, "i") } },
        ],
      });

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

server.post("/change-status", async (req, res) => {
  try {
    let { id, status } = req.body;

    const passUser = await PassUser.findOne({ id });

    if (!passUser) {
      return res.status(404).json({
        error: "PassUser not found with the given ID",
      });
    }

    passUser.status = status;

    await passUser.save();

    return res.status(200).json({
      status: passUser.status,
    });
  } catch (error) {
    return res.status(403).json({
      error: error.message,
    });
  }
});

server.post("/get-pass-by-id", (req, res) => {
  const { userId } = req.body;

  PassUser.findOne({ id: userId })
    .populate(
      "passID",
      "logourl heading address location time details mobno1 mobno2 editor date"
    )
    .then((response) => {
      return res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err.message,
      });
    });
});

server.post("/get-pass-by-passId", (req, res) => {
  let { passId } = req.body;

  PassModel.findById(passId)
    .then((pass) => {
      return res.status(200).json(pass);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Pass not found!",
      });
    });
});

server.post("/get-passUser-by-id", (req, res) => {
  const { userId } = req.body;

  PassUser.findById(userId)
    .then((passUser) => {
      return res.status(200).json(passUser);
    })
    .catch((err) => {
      return res.status(400).json({
        error: err.message,
      });
    });
});

server.post("/get-entries-count", async (req, res) => {
  const { status } = req.body;
  console.log(status);

  const query = status ? { status: true } : {};

  try {
    const count = await PassUser.find(query).count();
    console.log(count);
    return res.status(200).json(count);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  try {
    const count = await PassUser.find({}).count();
    return res.status(200).json(count);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

server.post("/delete-user", verifyJWT, (req, res) => {
  let { userId } = req.body;

  try {
    User.findByIdAndDelete(userId)
      .then((deletedUser) => {
        if (!deletedUser) {
          return res.status(404).json({
            error: "User not found",
          });
        }
        return res.status(200).json({
          message: "Deleted Successfully",
        });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(400).json({
          error: "Error occurred while deleting",
        });
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
});

server.post("/delete-event", verifyJWT, (req, res) => {
  let { eventId } = req.body;

  try {
    PassModel.findByIdAndDelete(eventId)
      .then(() => {
        return res.status(200).json({
          message: "Deleted Successfully",
        });
      })
      .catch((err) => {
        return res.status(400).json({
          error: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

server.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword } = req.body;

  User.findOne({ _id: req.user })
    .then((user) => {
      bcrypt.compare(currentPassword, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error:
              "some error while changing the password, pleased try again later",
          });
        }

        if (!result) {
          return res.status(403).json({
            error: "Current Password is incorrect!",
          });
        }

        bcrypt.hash(newPassword, 10, (err, hased_Password) => {
          User.findOneAndUpdate({ _id: req.user }, { password: hased_Password })
            .then((u) => {
              return res.status(200).json({
                message: "password change sucessfully",
              });
            })
            .catch((err) => {
              return res.status(500).json({
                error: "error while saving new password pleased try later",
              });
            });
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: "user not found",
      });
    });
});

//forgot password implimentation

server.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        error: "User not found with the provided email.",
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRETE_KEY, {
      expiresIn: "1h",
    });

    // Construct the reset password URL with the reset token
    const resetUrl = `${process.env.FRONTENDURL}/reset-your-password?token=${resetToken}`;
    console.log(resetUrl);

    // Send an email to the user with the reset URL
    await sendEmailForPassword(user.email, "Password Reset", resetUrl);

    return res.status(200).json({
      message:
        "Email is sent to your entered email address with the password reset instructions.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

server.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and newPassword are required." });
    }

    try {
      // Verify the reset token
      const decodedToken = jwt.verify(token, process.env.SECRETE_KEY);

      // Find the user associated with the reset token
      const user = await User.findById(decodedToken.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Update the user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Token has expired." });
      }

      throw error; // Re-throw other JWT verification errors
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`listing on ${PORT}`);
});
