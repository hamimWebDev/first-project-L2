import { Schema, model } from "mongoose";
import validator from "validator";
import {
  TGuardian,
  TLocalGuardian,
  TStudent,
  TUserName,
  studentModel,
} from "./student.interface";
import bcrypt from "bcrypt";
import config from "../../config";

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    maxlength: 10,
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: "{VALUE} is not valid",
    },
  },
});

const guardianSchema = new Schema<TGuardian>({
  fatherName: {
    type: String,
    required: [true, "Father's name is required"],
    trim: true,
  },
  fatherOccupation: {
    type: String,
    required: [true, "Father's occupation is required"],
    trim: true,
  },
  fatherContactNo: {
    type: String,
    required: [true, "Father's contact number is required"],
    trim: true,
  },
  motherName: {
    type: String,
    required: [true, "Mother's name is required"],
    trim: true,
  },
  motherOccupation: {
    type: String,
    required: [true, "Mother's occupation is required"],
    trim: true,
  },
  motherContactNo: {
    type: String,
    required: [true, "Mother's contact number is required"],
    trim: true,
  },
});

const localGuardianSchema = new Schema<TLocalGuardian>({
  name: {
    type: String,
    required: [true, "Local guardian's name is required"],
    trim: true,
  },
  occupation: {
    type: String,
    required: [true, "Local guardian's occupation is required"],
    trim: true,
  },
  contactNo: {
    type: String,
    required: [true, "Local guardian's contact number is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Local guardian's address is required"],
    trim: true,
  },
});

const studentSchema = new Schema<TStudent, studentModel>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "User id is required"],
      unique: true,
      ref: "User"
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    name: {
      type: userNameSchema,
      required: [true, "Student name is required"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender",
      },
      required: [true, "Gender is required"],
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    contactNo: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    emergencyContactNo: {
      type: String,
      required: [true, "Emergency contact number is required"],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message: "{VALUE} is not a valid blood group",
      },
      required: [true, "Blood group is required"],
      trim: true,
    },
    presentAddress: {
      type: String,
      required: [true, "Present address is required"],
      trim: true,
    },
    permanentAddress: {
      type: String,
      required: [true, "Permanent address is required"],
      trim: true,
    },
    guardian: {
      type: guardianSchema,
      required: [true, "Guardian information is required"],
    },
    localGuardian: {
      type: localGuardianSchema,
      required: [true, "Local guardian information is required"],
    },
    profileImg: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// for creating static
studentSchema.statics.isUserExist = async function (id: string) {
  const existingUser = await Student.findOne({ userId: id });
  return existingUser;
};

//  custom instance method
// studentSchema.methods.isUserExits = async function (id: string) {
//   const existingUser = Student.findOne({ id });
//   return existingUser;
// };

// virtual
studentSchema.virtual("fullName").get(function () {
  return `${this.name.firstName} ${this.name.middleName} ${this.name.lastName}`;
});

// middleware "per"
studentSchema.pre("save", async function (next) {
  // console.log(this, "pre");
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_routs)
  );
  next();
});

// middleware "post"
studentSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

// quarry middleware "find"
studentSchema.pre("find", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

studentSchema.pre("findOne", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
studentSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Student = model<TStudent, studentModel>("Student", studentSchema);
