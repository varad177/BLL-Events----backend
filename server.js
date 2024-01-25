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

  console.log(token);

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
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract year, month, and day
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth(); // Adding 1 because months are zero-based
  const day = dateObject.getDate();

  // Return the result as a string in the format "YYYY-MM-DD"
  const result = `${year}-${monthAbbreviations[month]}-${day}`;
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

  console.log("the id is ", _id);

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

  console.log(email, password);

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
      console.log(user);
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
    console.log(id);
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
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((updateError) => {
          return res.status(400).json({
            error: updateError.message,
          });
        });
    }
  } catch (error) {
    console.log(error.message);
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

// server.post("/create-pass", upload.single("avatar"), async (req, res) => {
//   const { heading, address, location, time, details, mobno1, mobno2, editor } =
//     req.body;

//   if (!address || !location || !time || !details || !mobno1 || !mobno2) {
//     return res.status(400).json({ message: "Please fill all fields" });
//   }

//   const pass = await PassModel.create({
//     heading,
//     address,
//     location,
//     time,
//     details,
//     mobno1,
//     mobno2,
//     editor,
//   });

//   console.log(req.file);

//   if (req.file) {
//     try {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: "bll",
//         crop: "fill",
//         width: 450,
//         height: 250,
//       });

//       if (result) {
//         console.log("the url is isi ", result.secure_url);
//         pass.public_url = result.public_id;
//         pass.url = result.secure_url;

//         //removed the file from the local system
//         fs.rm(`uploads/${req.file.filename}`);
//       } else {
//         console.log("result not getted");
//       }
//     } catch (error) {
//       return res.status(500).json({ message: "file not found" });
//     }
//   } else {
//     return res.status(400).json({ message: "file not found" });
//   }

//   // console.log("thygg",post);

//   await pass.save();
//   return res.status(200).json({ message: "post saved successfully" });
// });

// server.post("/create-pass", upload.single("avatar"), async (req, res) => {
//   try {
//     const {
//       heading,
//       address,
//       location,
//       time,
//       details,
//       mobno1,
//       mobno2,
//       editor,
//       date,
//     } = req.body.formData;

//     let { passId } = req.body;

//     if (!address || !location || !time || !details || !mobno1 || !date) {
//       return res.status(400).json({ message: "Please fill all fields" });
//     }

//     const pass = await PassModel.create({
//       heading,
//       address,
//       location,
//       time,
//       details,
//       mobno1,
//       mobno2,
//       editor,
//       date: getYearMonthDay(date),
//     });

//     console.log(req.file);

//     if (req.file) {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: "bll",
//         crop: "fill",
//       });

//       if (result) {
//         console.log("the url is", result.secure_url);
//         pass.public_url = result.public_id;
//         pass.logourl = result.secure_url;

//         // Remove the file from the local system
//         fs.rm(`uploads/${req.file.filename}`); // Note: Changed to fs.rmSync for synchronous removal
//       } else {
//         console.log("result not obtained");
//       }
//     } else {
//       return res.status(400).json({ message: "File not found" });
//     }

//     await pass.save();
//     return res.status(200).json({ message: "Post saved successfully" });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

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

  



    if (!address || !location || !time || !details || !mobno1 || !date) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    let pass;

    // Check if passId is provided
    if (passId) {
      // If passId is provided, update the existing pass
      pass = await PassModel.findOneAndUpdate(
        { _id: passId },
        {
          heading,
          address,
          location,
          time,
          details,
          mobno1,
          mobno2,
          editor,
          date: getYearMonthDay(date),
        },
        { new: true } // This option returns the modified document instead of the original
      );
    } else {
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
    }

    console.log(req.file);

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "bll",
        crop: "fill",
      });

      if (result) {
        console.log("the url is", result.secure_url);
        pass.public_url = result.public_id;
        pass.logourl = result.secure_url;

        // Remove the file from the local system
        fs.rm(`uploads/${req.file.filename}`); // Note: Changed to fs.rmSync for synchronous removal
      } else {
        console.log("result not obtained");
      }
    } else {
      return res.status(400).json({ message: "File not found" });
    }

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
  console.log(search);

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
      console.error(error);
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
      console.error(error);
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

server.get("/get-entries-count", async (req, res) => {
  const { status } = req.body;

  const query = status ? { status: true } : {};

  try {
    const count = await PassUser.find(query).count();
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

server.post("/delete-user", (req, res) => {
  let { userId } = req.body;

  try {
    PassUser.findByIdAndDelete(userId)
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
    console.log(error.message);

    return res.status(500).json({
      error: error.message,
    });
  }
});

server.post("/delete-event", (req, res) => {
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
    console.log(error.message);

    return res.status(500).json({
      error: error.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`listing on ${PORT}`);
});
